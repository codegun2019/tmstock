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
import { StockService } from './stock.service';
import { DeductStockDto } from './dto/deduct-stock.dto';
import { AddStockDto } from './dto/add-stock.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get('balance/:productId/:branchId')
  getStockBalance(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('branchId', ParseIntPipe) branchId: number,
  ) {
    return this.stockService.getStockBalance(productId, branchId);
  }

  @Post('deduct')
  @HttpCode(HttpStatus.CREATED)
  deductStock(@Body() deductDto: DeductStockDto, @Request() req) {
    return this.stockService.deductStock(deductDto, req.user.id);
  }

  @Post('add')
  @HttpCode(HttpStatus.CREATED)
  addStock(@Body() addDto: AddStockDto, @Request() req) {
    return this.stockService.addStock(addDto, req.user.id);
  }

  @Post('adjust')
  @HttpCode(HttpStatus.CREATED)
  adjustStock(@Body() adjustDto: AdjustStockDto, @Request() req) {
    return this.stockService.adjustStock(adjustDto, req.user.id);
  }

  @Get('movements/:productId/:branchId')
  getStockMovements(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('branchId', ParseIntPipe) branchId: number,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.stockService.getStockMovements(productId, branchId, limitNum);
  }

  @Get('movements/reference/:referenceType/:referenceId')
  getMovementsByReference(
    @Param('referenceType') referenceType: string,
    @Param('referenceId', ParseIntPipe) referenceId: number,
  ) {
    return this.stockService.getMovementsByReference(referenceType, referenceId);
  }

  @Get('movements')
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

