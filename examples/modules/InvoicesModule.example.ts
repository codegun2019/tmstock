/**
 * Invoices Module Example
 * Example: NestJS module with dependencies
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoicesController } from '../controllers/InvoicesController';
import { InvoiceService } from '../services/InvoiceService';
import { Invoice } from '../entities/Invoice.entity';
import { InvoiceItem } from '../entities/InvoiceItem.entity';
import { InventoryModule } from './InventoryModule';
import { InvoiceSequenceModule } from './InvoiceSequenceModule';
import { CashLedgerModule } from './CashLedgerModule';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, InvoiceItem]),
    InventoryModule, // ⭐ Import for stock deduction
    InvoiceSequenceModule, // ⭐ Import for invoice number generation
    CashLedgerModule, // ⭐ Import for cash transaction creation
  ],
  controllers: [InvoicesController],
  providers: [InvoiceService],
  exports: [InvoiceService], // ⭐ Export for other modules
})
export class InvoicesModule {}

