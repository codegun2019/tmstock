/**
 * Invoices Controller Example
 * Example: Controller with guards, validation, and error handling
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InvoiceService } from '../services/InvoiceService';
import { CreateInvoiceDto } from '../dto/CreateInvoiceDto';
import { JwtAuthGuard } from '../guards/JwtAuthGuard';
import { PermissionGuard, RequirePermission } from '../guards/PermissionGuard';
import { BranchScopeGuard } from '../guards/BranchScopeGuard';
import { CurrentUser } from '../decorators/CurrentUser';
import { User } from '../entities/User.entity';

@Controller('api/invoices')
@UseGuards(JwtAuthGuard) // ⭐ All endpoints require authentication
export class InvoicesController {
  constructor(private invoiceService: InvoiceService) {}

  /**
   * Create invoice
   * ⭐ CRITICAL: Must deduct stock if paid
   * ⭐ CRITICAL: Must create cash transaction if paid
   */
  @Post()
  @UseGuards(PermissionGuard, BranchScopeGuard)
  @RequirePermission('pos.sale')
  @HttpCode(HttpStatus.CREATED)
  async createInvoice(
    @Body() dto: CreateInvoiceDto,
    @CurrentUser() user: User,
  ) {
    // ⭐ Use user's branch_id
    const branchId = user.branch_id;

    return await this.invoiceService.createInvoice(dto, user.id, branchId);
  }

  /**
   * Pay invoice (idempotent)
   * ⭐ CRITICAL: Must be idempotent
   */
  @Post(':id/pay')
  @UseGuards(PermissionGuard)
  @RequirePermission('pos.sale')
  @HttpCode(HttpStatus.OK)
  async payInvoice(
    @Param('id') invoiceId: number,
    @CurrentUser() user: User,
  ) {
    return await this.invoiceService.payInvoice(invoiceId, user.id);
  }

  /**
   * Get invoice detail
   */
  @Get(':id')
  @UseGuards(PermissionGuard)
  @RequirePermission('pos.read')
  async getInvoice(@Param('id') id: number) {
    return await this.invoiceService.findOne(id);
  }

  /**
   * Get invoice detail with stock movements
   * ⭐ For UX integration
   */
  @Get(':id/detail')
  @UseGuards(PermissionGuard)
  @RequirePermission('pos.read')
  async getInvoiceDetail(@Param('id') id: number) {
    const invoice = await this.invoiceService.findOne(id);

    // ⭐ Get stock movements related to this invoice
    const stockMovements = await this.invoiceService.getStockMovements(id);

    // ⭐ Get cash transaction related to this invoice
    const cashTransaction = await this.invoiceService.getCashTransaction(id);

    return {
      success: true,
      data: {
        invoice,
        items: invoice.items,
        stock_movements: stockMovements,
        cash_transaction: cashTransaction,
      },
    };
  }
}

