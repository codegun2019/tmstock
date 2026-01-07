/**
 * Cash Service
 * ⭐ CRITICAL: Handles cash transactions with auto-linking from invoices, payroll, etc.
 */

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CashTransaction } from '../entities/CashTransaction.entity';
import { CashCategory } from '../entities/CashCategory.entity';
import { CreateCashTransactionDto } from './dto/create-cash-transaction.dto';
import { VoidCashTransactionDto } from './dto/void-cash-transaction.dto';

@Injectable()
export class CashService {
  constructor(
    @InjectRepository(CashTransaction)
    private cashTransactionRepository: Repository<CashTransaction>,
    @InjectRepository(CashCategory)
    private cashCategoryRepository: Repository<CashCategory>,
    private dataSource: DataSource,
  ) {}

  /**
   * Auto-create cash transaction from invoice (when paid)
   * ⭐ CRITICAL: Must be called within a transaction
   */
  async createFromInvoice(
    queryRunner: any,
    invoiceId: number,
    amount: number,
    branchId: number,
    paymentMethod: string,
    userId: number,
  ): Promise<CashTransaction> {
    // ⭐ Idempotency check: Don't create duplicate
    const existing = await queryRunner.manager.findOne(CashTransaction, {
      where: {
        reference_type: 'POS',
        reference_id: invoiceId,
        status: 'confirmed',
      },
    });

    if (existing) {
      return existing; // ⭐ Already created, return existing
    }

    // Get default category for sales (use queryRunner for consistency)
    const salesCategory = await queryRunner.manager.findOne(CashCategory, {
      where: { name: 'ขายหน้าร้าน', type: 'IN' },
    });

    const transaction = queryRunner.manager.create(CashTransaction, {
      txn_date: new Date(),
      txn_type: 'IN',
      amount: amount,
      category_id: salesCategory?.id || null,
      description: `ขายหน้าร้าน - Invoice #${invoiceId}`,
      branch_id: branchId,
      reference_type: 'POS',
      reference_id: invoiceId,
      payment_method: paymentMethod,
      status: 'confirmed',
      created_by: userId,
    });

    return await queryRunner.manager.save(CashTransaction, transaction);
  }

  /**
   * Create manual cash transaction
   */
  async createManual(
    createDto: CreateCashTransactionDto,
    userId: number,
  ): Promise<CashTransaction> {
    // Validate category exists (if provided)
    if (createDto.category_id) {
      const category = await this.cashCategoryRepository.findOne({
        where: { id: createDto.category_id },
      });

      if (!category) {
        throw new NotFoundException(
          `Cash category with ID ${createDto.category_id} not found`,
        );
      }

      // Validate category type matches transaction type
      if (
        category.type !== 'BOTH' &&
        category.type !== createDto.txn_type
      ) {
        throw new BadRequestException(
          `Category type (${category.type}) does not match transaction type (${createDto.txn_type})`,
        );
      }
    }

    const transaction = this.cashTransactionRepository.create({
      ...createDto,
      txn_date: new Date(createDto.txn_date),
      status: 'confirmed',
      created_by: userId,
      // ⭐ ref_type and ref_id are NOT set for manual entries
    });

    return await this.cashTransactionRepository.save(transaction);
  }

  /**
   * Find all cash transactions
   */
  async findAll(filters: {
    branchId?: number;
    txnType?: string;
    categoryId?: number;
    refType?: string;
    refId?: number;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<CashTransaction[]> {
    const queryBuilder = this.cashTransactionRepository
      .createQueryBuilder('txn')
      .leftJoinAndSelect('txn.category', 'category')
      .leftJoinAndSelect('txn.branch', 'branch')
      .leftJoinAndSelect('txn.creator', 'creator');

    if (filters.branchId) {
      queryBuilder.andWhere('txn.branch_id = :branchId', {
        branchId: filters.branchId,
      });
    }

    if (filters.txnType) {
      queryBuilder.andWhere('txn.txn_type = :txnType', {
        txnType: filters.txnType,
      });
    }

    if (filters.categoryId) {
      queryBuilder.andWhere('txn.category_id = :categoryId', {
        categoryId: filters.categoryId,
      });
    }

    if (filters.refType && filters.refId) {
      queryBuilder.andWhere('txn.reference_type = :refType', {
        refType: filters.refType,
      });
      queryBuilder.andWhere('txn.reference_id = :refId', {
        refId: filters.refId,
      });
    }

    if (filters.dateFrom) {
      queryBuilder.andWhere('txn.txn_date >= :dateFrom', {
        dateFrom: filters.dateFrom,
      });
    }

    if (filters.dateTo) {
      queryBuilder.andWhere('txn.txn_date <= :dateTo', {
        dateTo: filters.dateTo,
      });
    }

    return await queryBuilder
      .orderBy('txn.txn_date', 'DESC')
      .addOrderBy('txn.created_at', 'DESC')
      .getMany();
  }

  /**
   * Find one cash transaction by ID
   */
  async findOne(id: number): Promise<CashTransaction> {
    const transaction = await this.cashTransactionRepository.findOne({
      where: { id },
      relations: ['category', 'branch', 'creator'],
    });

    if (!transaction) {
      throw new NotFoundException(`Cash transaction with ID ${id} not found`);
    }

    return transaction;
  }

  /**
   * Void cash transaction
   */
  async voidTransaction(
    id: number,
    voidDto: VoidCashTransactionDto,
    userId: number,
  ): Promise<CashTransaction> {
    const transaction = await this.findOne(id);

    if (transaction.status === 'void') {
      // Idempotent: already voided
      return transaction;
    }

    if (transaction.status !== 'confirmed') {
      throw new BadRequestException(
        `Cannot void transaction with status: ${transaction.status}`,
      );
    }

    transaction.status = 'void';
    // ⭐ Note: We don't delete, we just mark as void
    // You can add a void_reason field if needed

    return await this.cashTransactionRepository.save(transaction);
  }

  /**
   * Get cash transactions by reference (for linking)
   */
  async getByReference(
    referenceType: string,
    referenceId: number,
  ): Promise<CashTransaction[]> {
    return await this.cashTransactionRepository.find({
      where: { reference_type: referenceType, reference_id: referenceId },
      relations: ['category', 'branch', 'creator'],
      order: { created_at: 'DESC' },
    });
  }
}

