/**
 * Stock Controller
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
import { StockService } from './stock.service';
import { DeductStockDto } from './dto/deduct-stock.dto';
import { AddStockDto } from './dto/add-stock.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';

@ApiTags('stock')
@ApiBearerAuth('JWT-auth')
@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get('balance')
  @ApiOperation({ summary: 'Get stock balance by product and branch' })
  getStockBalance(
    @Query('product_id', ParseIntPipe) productId: number,
    @Query('branch_id', ParseIntPipe) branchId: number,
  ) {
    return this.stockService.getStockBalance(productId, branchId);
  }

  @Get('balance/:productId/:branchId')
  @ApiOperation({ summary: 'Get stock balance (path parameters)' })
  getStockBalancePath(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('branchId', ParseIntPipe) branchId: number,
  ) {
    return this.stockService.getStockBalance(productId, branchId);
  }

  @Post('deduct')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Deduct stock (OUT) with row-level locking' })
  @ApiResponse({ status: 201, description: 'Stock deducted successfully' })
  @ApiResponse({ status: 400, description: 'Insufficient stock' })
  deductStock(@Body() deductDto: DeductStockDto, @Request() req) {
    return this.stockService.deductStock(deductDto, req.user.id);
  }

  @Post('add')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add stock (IN)' })
  @ApiResponse({ status: 201, description: 'Stock added successfully' })
  addStock(@Body() addDto: AddStockDto, @Request() req) {
    return this.stockService.addStock(addDto, req.user.id);
  }

  @Post('adjust')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Adjust stock (correction)' })
  @ApiResponse({ status: 201, description: 'Stock adjusted successfully' })
  adjustStock(@Body() adjustDto: AdjustStockDto, @Request() req) {
    return this.stockService.adjustStock(adjustDto, req.user.id);
  }

  @Get('movements/:productId/:branchId')
  @ApiOperation({ summary: 'Get stock movements by product and branch' })
  getStockMovements(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('branchId', ParseIntPipe) branchId: number,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.stockService.getStockMovements(productId, branchId, limitNum);
  }

  @Get('movements/reference/:referenceType/:referenceId')
  @ApiOperation({ summary: 'Get stock movements by reference (UX Integration)' })
  getMovementsByReference(
    @Param('referenceType') referenceType: string,
    @Param('referenceId', ParseIntPipe) referenceId: number,
  ) {
    return this.stockService.getMovementsByReference(referenceType, referenceId);
  }

  @Get('movements')
  @ApiOperation({ summary: 'Get stock movements with filters (UX Integration)' })
  getMovements(
    @Query('refType') refType?: string,
    @Query('refId') refId?: string,
    @Query('productId') productId?: string,
    @Query('branchId') branchId?: string,
    @Query('limit') limit?: string,
  ) {
    // ⭐ UX Integration: Get movements with filters
    if (refType && refId) {
      return this.stockService.getMovementsByReference(
        refType,
        parseInt(refId, 10),
      );
    }

    if (productId && branchId) {
      const limitNum = limit ? parseInt(limit, 10) : 50;
      return this.stockService.getStockMovements(
        parseInt(productId, 10),
        parseInt(branchId, 10),
        limitNum,
      );
    }

    // Return all movements (with limit)
    const limitNum = limit ? parseInt(limit, 10) : 100;
    return this.stockService.getAllMovements(limitNum);
  }
}

