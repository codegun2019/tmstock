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
import { InvoiceSequence } from '../entities/InvoiceSequence.entity';
import { Branch } from '../entities/Branch.entity';
import { StockModule } from '../stock/stock.module'; // ⭐ Import StockModule to use StockService
import { CashModule } from '../cash/cash.module'; // ⭐ Import CashModule to use CashService
import { InvoiceSequenceService } from './invoice-sequence.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, InvoiceItem, Product, InvoiceSequence, Branch]),
    StockModule, // ⭐ Import StockModule to access StockService
    CashModule, // ⭐ Import CashModule to access CashService
  ],
  providers: [InvoicesService, InvoiceSequenceService],
  controllers: [InvoicesController],
  exports: [InvoicesService, InvoiceSequenceService],
})
export class InvoicesModule {}

