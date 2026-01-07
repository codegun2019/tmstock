/**
 * Invoice Service Example
 * Example: Service with transaction safety, idempotency, and stock deduction
 */

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { Invoice, InvoiceStatus } from '../entities/Invoice.entity';
import { InvoiceItem } from '../entities/InvoiceItem.entity';
import { CreateInvoiceDto } from '../dto/CreateInvoiceDto';
import { InventoryService } from './InventoryService';
import { InvoiceSequenceService } from './InvoiceSequenceService';
import { CashLedgerService } from './CashLedgerService';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepo: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private invoiceItemRepo: Repository<InvoiceItem>,
    private dataSource: DataSource,
    private inventoryService: InventoryService,
    private invoiceSequenceService: InvoiceSequenceService,
    private cashLedgerService: CashLedgerService,
  ) {}

  /**
   * Create invoice with stock deduction
   * ⭐ CRITICAL: Must be in transaction with stock deduction
   */
  async createInvoice(dto: CreateInvoiceDto, userId: number, branchId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      // 1. Generate invoice number
      const invoiceNo = await this.invoiceSequenceService.generate(branchId);

      // 2. Calculate totals
      let subtotal = 0;
      for (const item of dto.items) {
        // Validate product exists
        const product = await queryRunner.manager.findOne('Product', {
          where: { id: item.product_id },
        });
        if (!product) {
          throw new NotFoundException(`Product ${item.product_id} not found`);
        }

        // ⭐ Check stock availability (with lock)
        const balance = await queryRunner.manager
          .createQueryBuilder('StockBalance', 'balance')
          .setLock('pessimistic_write') // ⭐ Row-level lock
          .where('balance.product_id = :productId', { productId: item.product_id })
          .andWhere('balance.branch_id = :branchId', { branchId })
          .getOne();

        if (!balance || balance.quantity < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product ${product.name}. Available: ${balance?.quantity || 0}, Required: ${item.quantity}`,
          );
        }

        // Calculate item subtotal
        const itemSubtotal = item.quantity * item.unit_price - (item.discount_amount || 0);
        subtotal += itemSubtotal;
      }

      const totalAmount = subtotal - (dto.discount_amount || 0);
      const paidAmount = dto.paid_amount || totalAmount;
      const changeAmount = paidAmount - totalAmount;

      // 3. Create invoice
      const invoice = queryRunner.manager.create(Invoice, {
        invoice_no: invoiceNo,
        branch_id: branchId,
        user_id: userId,
        customer_name: dto.customer_name,
        customer_phone: dto.customer_phone,
        subtotal,
        discount_amount: dto.discount_amount || 0,
        total_amount: totalAmount,
        paid_amount: paidAmount,
        change_amount: changeAmount,
        payment_method: dto.payment_method || 'cash',
        payment_details: null,
        notes: dto.notes,
        status: dto.payment_status === 'paid' ? InvoiceStatus.PAID : InvoiceStatus.DRAFT,
      });

      await queryRunner.manager.save(invoice);

      // 4. Create invoice items AND deduct stock
      for (const item of dto.items) {
        const product = await queryRunner.manager.findOne('Product', {
          where: { id: item.product_id },
        });

        // Create invoice item
        const invoiceItem = queryRunner.manager.create(InvoiceItem, {
          invoice_id: invoice.id,
          product_id: item.product_id,
          product_name: product.name,
          barcode: product.barcode,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_amount: item.discount_amount || 0,
          subtotal: item.quantity * item.unit_price - (item.discount_amount || 0),
        });

        await queryRunner.manager.save(invoiceItem);

        // ⭐ Deduct stock (only if paid)
        if (dto.payment_status === 'paid') {
          await this.inventoryService.deductStockWithTransaction(
            queryRunner, // ⭐ Pass transaction manager
            item.product_id,
            item.quantity,
            branchId,
            invoice.id,
          );
        }
      }

      // ⭐ 5. Auto-create cash transaction (only if paid)
      if (dto.payment_status === 'paid') {
        await this.cashLedgerService.createFromInvoice(
          queryRunner, // ⭐ Pass transaction manager
          {
            invoice_id: invoice.id,
            amount: totalAmount,
            txn_date: new Date(),
            payment_method: dto.payment_method || 'cash',
            branch_id: branchId,
            created_by: userId,
          },
        );
      }

      // 6. Commit transaction
      await queryRunner.commitTransaction();

      // 7. Return invoice with items
      return await this.findOne(invoice.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Pay invoice (idempotent)
   * ⭐ CRITICAL: Check status before processing
   */
  async payInvoice(invoiceId: number, userId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      // ⭐ Lock invoice row
      const invoice = await queryRunner.manager
        .createQueryBuilder(Invoice, 'invoice')
        .setLock('pessimistic_write')
        .where('invoice.id = :id', { id: invoiceId })
        .getOne();

      if (!invoice) {
        throw new NotFoundException('Invoice not found');
      }

      // ⭐ Idempotency check: If already paid, return success
      if (invoice.status === InvoiceStatus.PAID) {
        await queryRunner.rollbackTransaction();
        return {
          success: true,
          message: 'Invoice already paid',
          invoice: invoice,
          idempotent: true,
        };
      }

      // ⭐ Check allowed status transition
      if (![InvoiceStatus.DRAFT, InvoiceStatus.HOLD].includes(invoice.status)) {
        throw new BadRequestException(
          `Cannot pay invoice with status: ${invoice.status}`,
        );
      }

      // ⭐ Deduct stock for each item
      for (const item of invoice.items) {
        await this.inventoryService.deductStockWithTransaction(
          queryRunner,
          item.product_id,
          item.quantity,
          invoice.branch_id,
          invoice.id,
        );
      }

      // ⭐ Update invoice status
      invoice.status = InvoiceStatus.PAID;
      invoice.paid_at = new Date();
      invoice.paid_by = userId;
      await queryRunner.manager.save(invoice);

      // ⭐ Auto-create cash transaction
      await this.cashLedgerService.createFromInvoice(queryRunner, {
        invoice_id: invoiceId,
        amount: invoice.total_amount,
        txn_date: new Date(),
        payment_method: invoice.payment_method,
        branch_id: invoice.branch_id,
        created_by: userId,
      });

      await queryRunner.commitTransaction();
      return { success: true, invoice };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Find one invoice with items
   */
  async findOne(id: number) {
    return await this.invoiceRepo.findOne({
      where: { id },
      relations: ['items', 'branch', 'user'],
    });
  }
}

