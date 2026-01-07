/**
 * Invoices Service
 * ⭐ CRITICAL: Handles invoice creation, payment, void, and refund with stock operations
 */

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Invoice } from '../entities/Invoice.entity';
import { InvoiceItem } from '../entities/InvoiceItem.entity';
import { Product } from '../entities/Product.entity';
import { StockService } from '../stock/stock.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { PayInvoiceDto } from './dto/pay-invoice.dto';
import { VoidInvoiceDto } from './dto/void-invoice.dto';
import { RefundInvoiceDto } from './dto/refund-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private invoiceItemRepository: Repository<InvoiceItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private stockService: StockService,
    private dataSource: DataSource,
  ) {}

  /**
   * Create invoice (DRAFT status - no stock deduction)
   */
  async create(createInvoiceDto: CreateInvoiceDto, userId: number): Promise<Invoice> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Calculate totals
      let subtotal = 0;
      const items: InvoiceItem[] = [];

      for (const itemDto of createInvoiceDto.items) {
        // Get product for snapshot
        const product = await this.productRepository.findOne({
          where: { id: itemDto.product_id },
        });

        if (!product) {
          throw new NotFoundException(`Product with ID ${itemDto.product_id} not found`);
        }

        if (!product.active) {
          throw new BadRequestException(`Product ${product.name} is not active`);
        }

        const itemSubtotal =
          itemDto.quantity * itemDto.unit_price - (itemDto.discount_amount || 0);
        subtotal += itemSubtotal;

        const item = queryRunner.manager.create(InvoiceItem, {
          product_id: itemDto.product_id,
          product_name: product.name, // ⭐ Snapshot
          barcode: product.barcode, // ⭐ Snapshot
          quantity: itemDto.quantity,
          unit_price: itemDto.unit_price,
          discount_amount: itemDto.discount_amount || 0,
          subtotal: itemSubtotal,
        });

        items.push(item);
      }

      // Apply discount
      const discountAmount =
        createInvoiceDto.discount_amount ||
        (createInvoiceDto.discount_percent
          ? (subtotal * createInvoiceDto.discount_percent) / 100
          : 0);
      const taxAmount = 0; // ⭐ Can be calculated if needed
      const totalAmount = subtotal - discountAmount + taxAmount;

      // Create invoice
      const invoice = queryRunner.manager.create(Invoice, {
        branch_id: createInvoiceDto.branch_id,
        user_id: userId,
        ref_employee_id: createInvoiceDto.ref_employee_id,
        customer_name: createInvoiceDto.customer_name,
        customer_phone: createInvoiceDto.customer_phone,
        subtotal,
        discount_amount: discountAmount,
        discount_percent: createInvoiceDto.discount_percent,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        paid_amount: 0,
        change_amount: 0,
        payment_method: createInvoiceDto.payment_method || 'cash',
        status: 'draft', // ⭐ DRAFT - no stock deduction yet
        notes: createInvoiceDto.notes,
      });

      const savedInvoice = (await queryRunner.manager.save(Invoice, invoice)) as Invoice;

      // Create invoice items
      for (const item of items) {
        item.invoice_id = savedInvoice.id;
        await queryRunner.manager.save(InvoiceItem, item);
      }

      await queryRunner.commitTransaction();

      // Load with relations
      return await this.findOne(savedInvoice.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to create invoice: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Pay invoice - ⭐ CRITICAL: Deducts stock when payment is made
   */
  async payInvoice(
    invoiceId: number,
    payInvoiceDto: PayInvoiceDto,
    userId: number,
  ): Promise<Invoice> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get invoice with items
      const invoice = await this.invoiceRepository.findOne({
        where: { id: invoiceId },
        relations: ['items', 'items.product'],
      });

      if (!invoice) {
        throw new NotFoundException(`Invoice with ID ${invoiceId} not found`);
      }

      // ⭐ Check payment status - prevent duplicate payment
      if (invoice.status === 'completed') {
        // Idempotent: already paid, return invoice
        return invoice;
      }

      if (invoice.status !== 'draft' && invoice.status !== 'hold') {
        throw new BadRequestException(
          `Cannot pay invoice with status: ${invoice.status}`,
        );
      }

      // ⭐ Check payment amount
      if (payInvoiceDto.paid_amount < invoice.total_amount) {
        throw new BadRequestException(
          `Paid amount (${payInvoiceDto.paid_amount}) is less than total amount (${invoice.total_amount})`,
        );
      }

      const changeAmount = payInvoiceDto.paid_amount - invoice.total_amount;

      // ⭐ Deduct stock for each item (with row-level locking)
      for (const item of invoice.items) {
        await this.stockService.deductStock(
          {
            product_id: item.product_id,
            branch_id: invoice.branch_id,
            quantity: item.quantity,
            reference_type: 'invoice',
            reference_id: invoice.id,
            reason: `Sale - Invoice #${invoice.id}`,
          },
          userId,
        );
      }

      // Update invoice status to completed
      invoice.status = 'completed';
      invoice.paid_amount = payInvoiceDto.paid_amount;
      invoice.change_amount = changeAmount;
      invoice.payment_method = payInvoiceDto.payment_method || invoice.payment_method;
      invoice.payment_details = payInvoiceDto.payment_method
        ? { method: payInvoiceDto.payment_method }
        : null;
      invoice.notes = payInvoiceDto.notes || invoice.notes;

      const savedInvoice = await queryRunner.manager.save(Invoice, invoice) as Invoice;

      await queryRunner.commitTransaction();

      return await this.findOne(savedInvoice.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to pay invoice: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Void invoice - Returns stock if already paid
   */
  async voidInvoice(
    invoiceId: number,
    voidInvoiceDto: VoidInvoiceDto,
    userId: number,
  ): Promise<Invoice> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const invoice = await this.invoiceRepository.findOne({
        where: { id: invoiceId },
        relations: ['items'],
      });

      if (!invoice) {
        throw new NotFoundException(`Invoice with ID ${invoiceId} not found`);
      }

      if (invoice.status === 'void') {
        // Idempotent: already voided
        return invoice;
      }

      if (invoice.status === 'refunded') {
        throw new BadRequestException('Cannot void a refunded invoice');
      }

      // ⭐ If invoice was paid, return stock
      if (invoice.status === 'completed') {
        for (const item of invoice.items) {
          await this.stockService.addStock(
            {
              product_id: item.product_id,
              branch_id: invoice.branch_id,
              quantity: item.quantity,
              reference_type: 'invoice_void',
              reference_id: invoice.id,
              reason: `Void - Invoice #${invoice.id}`,
            },
            userId,
          );
        }
      }

      invoice.status = 'void';
      invoice.void_reason = voidInvoiceDto.reason;
      invoice.voided_by = userId;
      invoice.voided_at = new Date();

      const savedInvoice = await queryRunner.manager.save(Invoice, invoice) as Invoice;

      await queryRunner.commitTransaction();

      return await this.findOne(savedInvoice.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to void invoice: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Refund invoice - Returns stock
   */
  async refundInvoice(
    invoiceId: number,
    refundInvoiceDto: RefundInvoiceDto,
    userId: number,
  ): Promise<Invoice> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const invoice = await this.invoiceRepository.findOne({
        where: { id: invoiceId },
        relations: ['items'],
      });

      if (!invoice) {
        throw new NotFoundException(`Invoice with ID ${invoiceId} not found`);
      }

      // ⭐ Check status
      if (invoice.status === 'refunded') {
        // Idempotent: already refunded
        return invoice;
      }

      if (invoice.status !== 'completed') {
        throw new BadRequestException(
          `Cannot refund invoice with status: ${invoice.status}. Only completed invoices can be refunded.`,
        );
      }

      // ⭐ Return stock for each item
      for (const item of invoice.items) {
        await this.stockService.addStock(
          {
            product_id: item.product_id,
            branch_id: invoice.branch_id,
            quantity: item.quantity,
            reference_type: 'invoice_refund',
            reference_id: invoice.id,
            reason: `Refund - Invoice #${invoice.id}`,
          },
          userId,
        );
      }

      invoice.status = 'refunded';
      invoice.refund_reason = refundInvoiceDto.reason;
      invoice.refunded_by = userId;
      invoice.refunded_at = new Date();

      const savedInvoice = await queryRunner.manager.save(Invoice, invoice) as Invoice;

      await queryRunner.commitTransaction();

      return await this.findOne(savedInvoice.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to refund invoice: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Find all invoices
   */
  async findAll(branchId?: number, status?: string): Promise<Invoice[]> {
    const where: any = {};
    if (branchId) where.branch_id = branchId;
    if (status) where.status = status;

    return await this.invoiceRepository.find({
      where,
      relations: ['items', 'items.product', 'user', 'branch'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Find one invoice by ID
   */
  async findOne(id: number): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: ['items', 'items.product', 'user', 'branch'],
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    return invoice;
  }
}

