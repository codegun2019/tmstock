/**
 * Employee Positions Seeder
 * Example: Seeder for employee positions
 */

import { DataSource } from 'typeorm';
import { EmployeePosition } from '../entities/EmployeePosition.entity';

export class EmployeePositionsSeeder {
  constructor(private dataSource: DataSource) {}

  async run() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const positions = [
        {
          name: 'Cashier',
          description: 'พนักงานขาย',
        },
        {
          name: 'Manager',
          description: 'ผู้จัดการ',
        },
        {
          name: 'Stock Keeper',
          description: 'พนักงานสต็อค',
        },
        {
          name: 'Accountant',
          description: 'บัญชี',
        },
        {
          name: 'Technician',
          description: 'ช่างซ่อม',
        },
      ];

      for (const positionData of positions) {
        const existing = await queryRunner.manager.findOne(EmployeePosition, {
          where: { name: positionData.name },
        });

        if (!existing) {
          await queryRunner.manager.save(EmployeePosition, positionData);
        }
      }

      await queryRunner.commitTransaction();
      console.log('✅ Employee Positions seeded successfully');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

