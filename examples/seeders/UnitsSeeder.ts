/**
 * Units Seeder
 * Example: Seeder for product units
 */

import { DataSource } from 'typeorm';
import { Unit } from '../entities/Unit.entity';

export class UnitsSeeder {
  constructor(private dataSource: DataSource) {}

  async run() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const units = [
        { name: 'ชิ้น', symbol: 'ชิ้น', active: 1 },
        { name: 'กล่อง', symbol: 'กล่อง', active: 1 },
        { name: 'แพ็ค', symbol: 'แพ็ค', active: 1 },
        { name: 'ลัง', symbol: 'ลัง', active: 1 },
        { name: 'ขวด', symbol: 'ขวด', active: 1 },
        { name: 'กระป๋อง', symbol: 'กระป๋อง', active: 1 },
        { name: 'กิโลกรัม', symbol: 'กก.', active: 1 },
        { name: 'กรัม', symbol: 'กรัม', active: 1 },
        { name: 'ลิตร', symbol: 'ล.', active: 1 },
        { name: 'มิลลิลิตร', symbol: 'มล.', active: 1 },
      ];

      for (const unitData of units) {
        const existing = await queryRunner.manager.findOne(Unit, {
          where: { name: unitData.name },
        });

        if (!existing) {
          await queryRunner.manager.save(Unit, unitData);
        }
      }

      await queryRunner.commitTransaction();
      console.log('✅ Units seeded successfully');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

