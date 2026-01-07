/**
 * Cash Ledger Service Example
 * Example: Cash transaction with auto-linking and idempotency
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { CashTransaction, TransactionType, TransactionStatus } from '../entities/CashTransaction.entity';
import { CashCategory } from '../entities/CashCategory.entity';
import { CreateCashTransactionDto } from '../dto/CreateCashTransactionDto';

@Injectable()
export class CashLedgerService {
  constructor(
    @InjectRepository(CashTransaction)
    private cashTransactionRepo: Repository<CashTransaction>,
    @InjectRepository(CashCategory)
    private cashCategoryRepo: Repository<CashCategory>,
    private dataSource: DataSource,
  ) {}

  /**
   * Create cash transaction from invoice (auto-linking)
   * ⭐ CRITICAL: Must be idempotent
   * ⭐ CRITICAL: Must be called within a transaction
   */
  async createFromInvoice(
    queryRunner: QueryRunner,
    data: {
      invoice_id: number;
      amount: number;
      txn_date: Date;
      payment_method: string;
      branch_id: number;
      created_by: number;
    },
  ) {
    // ⭐ Idempotency check: Don't create duplicate
    const existing = await queryRunner.manager.findOne(CashTransaction, {
      where: {
        ref_type: 'POS',
        ref_id: data.invoice_id,
        status: TransactionStatus.CONFIRMED,
      },
    });

    if (existing) {
      // ⭐ Already exists, return existing
      return existing;
    }

    // ⭐ Get category for POS sales
    const category = await queryRunner.manager.findOne(CashCategory, {
      where: { name: 'ขายหน้าร้าน', type: 'IN' },
    });

    if (!category) {
      throw new NotFoundException('Cash category "ขายหน้าร้าน" not found');
    }

    // ⭐ Create cash transaction
    const cashTransaction = queryRunner.manager.create(CashTransaction, {
      txn_date: data.txn_date,
      txn_type: TransactionType.IN,
      amount: data.amount,
      category_id: category.id,
      description: `ขายหน้าร้าน - Invoice #${data.invoice_id}`,
      branch_id: data.branch_id,
      ref_type: 'POS', // ⭐ Auto-set by BE
      ref_id: data.invoice_id, // ⭐ Auto-set by BE
      payment_method: data.payment_method,
      status: TransactionStatus.CONFIRMED,
      created_by: data.created_by,
    });

    await queryRunner.manager.save(cashTransaction);
    return cashTransaction;
  }

  /**
   * Create manual cash transaction
   * ⭐ CRITICAL: ref_type and ref_id must be null for manual entry
   */
  async createManual(dto: CreateCashTransactionDto, userId: number) {
    // ⭐ Verify category exists
    const category = await this.cashCategoryRepo.findOne({
      where: { id: dto.category_id },
    });

    if (!category) {
      throw new NotFoundException('Cash category not found');
    }

    // ⭐ Verify category type matches transaction type
    if (category.type !== 'BOTH' && category.type !== dto.txn_type) {
      throw new BadRequestException(
        `Category "${category.name}" is for ${category.type} transactions, not ${dto.txn_type}`,
      );
    }

    // ⭐ Create cash transaction (manual entry = no ref)
    const cashTransaction = this.cashTransactionRepo.create({
      txn_date: dto.txn_date,
      txn_type: dto.txn_type,
      amount: dto.amount,
      category_id: dto.category_id,
      description: dto.description,
      branch_id: dto.branch_id,
      ref_type: null, // ⭐ Manual entry = null
      ref_id: null, // ⭐ Manual entry = null
      payment_method: dto.payment_method,
      status: TransactionStatus.CONFIRMED,
      created_by: userId,
    });

    await this.cashTransactionRepo.save(cashTransaction);

    // ⭐ Log audit
    // await this.auditLogService.log(...);

    return cashTransaction;
  }

  /**
   * Void cash transaction
   * ⭐ CRITICAL: Don't delete, just mark as void
   */
  async voidTransaction(transactionId: number, reason: string, userId: number) {
    const transaction = await this.cashTransactionRepo.findOne({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status === TransactionStatus.VOID) {
      throw new BadRequestException('Transaction already voided');
    }

    // ⭐ Don't delete, just mark as void
    transaction.status = TransactionStatus.VOID;
    await this.cashTransactionRepo.save(transaction);

    // ⭐ Log audit
    // await this.auditLogService.log(...);

    return transaction;
  }
}

