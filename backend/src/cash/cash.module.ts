/**
 * Cash Module
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashService } from './cash.service';
import { CashController } from './cash.controller';
import { CashTransaction } from '../entities/CashTransaction.entity';
import { CashCategory } from '../entities/CashCategory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CashTransaction, CashCategory])],
  controllers: [CashController],
  providers: [CashService],
  exports: [CashService], // ⭐ Export for use in InvoicesModule
})
export class CashModule {}

