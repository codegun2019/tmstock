/**
 * Branches Seeder
 * Example: Seeder for branches
 */

import { DataSource } from 'typeorm';
import { Branch } from '../entities/Branch.entity';

export class BranchesSeeder {
  constructor(private dataSource: DataSource) {}

  async run() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const branches = [
        {
          code: 'BKK',
          name: 'สาขากรุงเทพ',
          address: '123 ถนนสุขุมวิท กรุงเทพฯ 10110',
          phone: '02-123-4567',
          invoice_prefix: 'BKK',
          active: 1,
        },
        {
          code: 'CM',
          name: 'สาขาเชียงใหม่',
          address: '456 ถนนนิมมานเหมินทร์ เชียงใหม่ 50200',
          phone: '053-123-4567',
          invoice_prefix: 'CM',
          active: 1,
        },
      ];

      for (const branchData of branches) {
        const existing = await queryRunner.manager.findOne(Branch, {
          where: { code: branchData.code },
        });

        if (!existing) {
          await queryRunner.manager.save(Branch, branchData);
        }
      }

      await queryRunner.commitTransaction();
      console.log('✅ Branches seeded successfully');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

