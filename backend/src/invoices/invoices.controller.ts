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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { PayInvoiceDto } from './dto/pay-invoice.dto';
import { VoidInvoiceDto } from './dto/void-invoice.dto';
import { RefundInvoiceDto } from './dto/refund-invoice.dto';

@ApiTags('invoices')
@ApiBearerAuth('JWT-auth')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createInvoiceDto: CreateInvoiceDto, @Request() req) {
    return this.invoicesService.create(createInvoiceDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List invoices with filters' })
  findAll(
    @Query('branch_id') branchId?: string,
    @Query('status') status?: string,
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
    @Query('customer_name') customerName?: string,
    @Query('limit') limit?: string,
  ) {
    const branchIdNum = branchId ? parseInt(branchId, 10) : undefined;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.invoicesService.findAll(branchIdNum, status, dateFrom, dateTo, customerName, limitNum);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by ID with items' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.invoicesService.findOne(id);
  }

  @Get(':id/stock-movements')
  @ApiOperation({ summary: 'Get stock movements for invoice (UX Integration)' })
  async getInvoiceStockMovements(@Param('id', ParseIntPipe) id: number) {
    return this.invoicesService.getStockMovements(id);
  }

  @Post(':id/pay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pay invoice (deducts stock and creates cash transaction)' })
  @ApiResponse({ status: 200, description: 'Invoice paid successfully' })
  @ApiResponse({ status: 400, description: 'Invalid payment or insufficient stock' })
  payInvoice(
    @Param('id', ParseIntPipe) id: number,
    @Body() payInvoiceDto: PayInvoiceDto,
    @Request() req,
  ) {
    return this.invoicesService.payInvoice(id, payInvoiceDto, req.user.id);
  }

  @Post(':id/void')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Void invoice (unpaid invoices only)' })
  @ApiResponse({ status: 200, description: 'Invoice voided successfully' })
  voidInvoice(
    @Param('id', ParseIntPipe) id: number,
    @Body() voidInvoiceDto: VoidInvoiceDto,
    @Request() req,
  ) {
    return this.invoicesService.voidInvoice(id, voidInvoiceDto, req.user.id);
  }

  @Post(':id/refund')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refund invoice (returns stock and creates cash transaction)' })
  @ApiResponse({ status: 200, description: 'Invoice refunded successfully' })
  refundInvoice(
    @Param('id', ParseIntPipe) id: number,
    @Body() refundInvoiceDto: RefundInvoiceDto,
    @Request() req,
  ) {
    return this.invoicesService.refundInvoice(id, refundInvoiceDto, req.user.id);
  }
}

