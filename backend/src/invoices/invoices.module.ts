/**
 * Invoices Module
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { Invoice } from '../entities/Invoice.entity';
import { InvoiceItem } from '../entities/InvoiceItem.entity';
import { Product } from '../entities/Product.entity';
import { StockModule } from '../stock/stock.module'; // ⭐ Import StockModule to use StockService

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, InvoiceItem, Product]),
    StockModule, // ⭐ Import StockModule to access StockService
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService],
  exports: [InvoicesService],
})
export class InvoicesModule {}

