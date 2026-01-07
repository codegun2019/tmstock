/**
 * Invoice Sequence Service
 * ⭐ CRITICAL: Generates invoice numbers with row-level locking
 */

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { InvoiceSequence } from '../entities/InvoiceSequence.entity';
import { Branch } from '../entities/Branch.entity';

@Injectable()
export class InvoiceSequenceService {
  constructor(
    @InjectRepository(InvoiceSequence)
    private sequenceRepository: Repository<InvoiceSequence>,
    @InjectRepository(Branch)
    private branchRepository: Repository<Branch>,
    private dataSource: DataSource,
  ) {}

  /**
   * Generate invoice number
   * Format: {PREFIX}-{YYYYMMDD}-{SEQUENCE}
   * Example: BKK-20250115-0001
   */
  async generateInvoiceNumber(branchId: number): Promise<string> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get branch for prefix
      const branch = await this.branchRepository.findOne({
        where: { id: branchId },
      });

      if (!branch) {
        throw new InternalServerErrorException(`Branch with ID ${branchId} not found`);
      }

      const prefix = branch.invoice_prefix || 'INV';
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD

      // ⭐ Row-level lock: Get or create sequence for today
      let sequence = await queryRunner.manager
        .createQueryBuilder(InvoiceSequence, 'seq')
        .setLock('pessimistic_write') // ⭐ SELECT ... FOR UPDATE
        .where('seq.branch_id = :branchId', { branchId })
        .andWhere('seq.date = :date', { date: today.toISOString().split('T')[0] })
        .getOne();

      if (!sequence) {
        // Create new sequence for today
        sequence = queryRunner.manager.create(InvoiceSequence, {
          branch_id: branchId,
          date: today,
          sequence: 0,
        });
      }

      // Increment sequence
      sequence.sequence += 1;
      await queryRunner.manager.save(InvoiceSequence, sequence);

      await queryRunner.commitTransaction();

      // Format: PREFIX-YYYYMMDD-SEQUENCE (4 digits)
      const sequenceStr = sequence.sequence.toString().padStart(4, '0');
      return `${prefix}-${dateStr}-${sequenceStr}`;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        `Failed to generate invoice number: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }
}

