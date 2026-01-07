/**
 * Stock Module
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { StockBalance } from '../entities/StockBalance.entity';
import { StockMovement } from '../entities/StockMovement.entity';
import { Product } from '../entities/Product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([StockBalance, StockMovement, Product]),
  ],
  controllers: [StockController],
  providers: [StockService],
  exports: [StockService], // ⭐ Export for use in other modules (e.g., InvoicesModule)
})
export class StockModule {}

