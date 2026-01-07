/**
 * Invoices Controller
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { PayInvoiceDto } from './dto/pay-invoice.dto';
import { VoidInvoiceDto } from './dto/void-invoice.dto';
import { RefundInvoiceDto } from './dto/refund-invoice.dto';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createInvoiceDto: CreateInvoiceDto, @Request() req) {
    return this.invoicesService.create(createInvoiceDto, req.user.id);
  }

  @Get()
  findAll(@Query('branch_id') branchId?: string, @Query('status') status?: string) {
    const branchIdNum = branchId ? parseInt(branchId, 10) : undefined;
    return this.invoicesService.findAll(branchIdNum, status);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.invoicesService.findOne(id);
  }

  @Post(':id/pay')
  @HttpCode(HttpStatus.OK)
  payInvoice(
    @Param('id', ParseIntPipe) id: number,
    @Body() payInvoiceDto: PayInvoiceDto,
    @Request() req,
  ) {
    return this.invoicesService.payInvoice(id, payInvoiceDto, req.user.id);
  }

  @Post(':id/void')
  @HttpCode(HttpStatus.OK)
  voidInvoice(
    @Param('id', ParseIntPipe) id: number,
    @Body() voidInvoiceDto: VoidInvoiceDto,
    @Request() req,
  ) {
    return this.invoicesService.voidInvoice(id, voidInvoiceDto, req.user.id);
  }

  @Post(':id/refund')
  @HttpCode(HttpStatus.OK)
  refundInvoice(
    @Param('id', ParseIntPipe) id: number,
    @Body() refundInvoiceDto: RefundInvoiceDto,
    @Request() req,
  ) {
    return this.invoicesService.refundInvoice(id, refundInvoiceDto, req.user.id);
  }
}

