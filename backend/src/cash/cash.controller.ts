/**
 * Cash Controller
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  Query,
  ParseIntPipe,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CashService } from './cash.service';
import { CreateCashTransactionDto } from './dto/create-cash-transaction.dto';
import { VoidCashTransactionDto } from './dto/void-cash-transaction.dto';

@ApiTags('cash')
@ApiBearerAuth('JWT-auth')

@Controller('cash')
export class CashController {
  constructor(private readonly cashService: CashService) {}

  @Post('transactions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create manual cash transaction' })
  @ApiResponse({ status: 201, description: 'Cash transaction created successfully' })
  createManual(@Body() createDto: CreateCashTransactionDto, @Request() req) {
    return this.cashService.createManual(createDto, req.user.id);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'List cash transactions with filters' })
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
  @ApiOperation({ summary: 'Get cash transactions by reference (UX Integration)' })
  getByReference(
    @Param('refType') refType: string,
    @Param('refId', ParseIntPipe) refId: number,
  ) {
    return this.cashService.getByReference(refType, refId);
  }

  @Get('transactions/:id')
  @ApiOperation({ summary: 'Get cash transaction by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cashService.findOne(id);
  }

  @Post('transactions/:id/void')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Void cash transaction' })
  @ApiResponse({ status: 200, description: 'Transaction voided successfully' })
  voidTransaction(
    @Param('id', ParseIntPipe) id: number,
    @Body() voidDto: VoidCashTransactionDto,
    @Request() req,
  ) {
    return this.cashService.voidTransaction(id, voidDto, req.user.id);
  }

  // Cash Categories CRUD
  @Post('categories')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create cash category' })
  createCategory(@Body() createDto: any, @Request() req) {
    return this.cashService.createCategory(createDto);
  }

  @Get('categories')
  @ApiOperation({ summary: 'List cash categories' })
  getCategories(@Query('type') type?: string) {
    return this.cashService.findAllCategories(type);
  }

  @Get('categories/:id')
  @ApiOperation({ summary: 'Get cash category by ID' })
  getCategory(@Param('id', ParseIntPipe) id: number) {
    return this.cashService.findCategoryById(id);
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Update cash category' })
  updateCategory(@Param('id', ParseIntPipe) id: number, @Body() updateDto: any) {
    return this.cashService.updateCategory(id, updateDto);
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete cash category' })
  deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.cashService.deleteCategory(id);
  }
}

