/**
 * Cash Controller
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
import { CashService } from './cash.service';
import { CreateCashTransactionDto } from './dto/create-cash-transaction.dto';
import { VoidCashTransactionDto } from './dto/void-cash-transaction.dto';

@Controller('cash')
export class CashController {
  constructor(private readonly cashService: CashService) {}

  @Post('transactions')
  @HttpCode(HttpStatus.CREATED)
  createManual(@Body() createDto: CreateCashTransactionDto, @Request() req) {
    return this.cashService.createManual(createDto, req.user.id);
  }

  @Get('transactions')
  findAll(
    @Query('branch_id') branchId?: string,
    @Query('txn_type') txnType?: string,
    @Query('category_id') categoryId?: string,
    @Query('ref_type') refType?: string,
    @Query('ref_id') refId?: string,
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
  ) {
    return this.cashService.findAll({
      branchId: branchId ? parseInt(branchId, 10) : undefined,
      txnType,
      categoryId: categoryId ? parseInt(categoryId, 10) : undefined,
      refType,
      refId: refId ? parseInt(refId, 10) : undefined,
      dateFrom,
      dateTo,
    });
  }

  @Get('transactions/reference/:refType/:refId')
  getByReference(
    @Param('refType') refType: string,
    @Param('refId', ParseIntPipe) refId: number,
  ) {
    return this.cashService.getByReference(refType, refId);
  }

  @Get('transactions/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cashService.findOne(id);
  }

  @Post('transactions/:id/void')
  @HttpCode(HttpStatus.OK)
  voidTransaction(
    @Param('id', ParseIntPipe) id: number,
    @Body() voidDto: VoidCashTransactionDto,
    @Request() req,
  ) {
    return this.cashService.voidTransaction(id, voidDto, req.user.id);
  }
}

