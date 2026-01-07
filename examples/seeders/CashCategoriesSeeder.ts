/**
 * Cash Categories Seeder
 * Example: Seeder for cash categories (รายรับ-รายจ่าย)
 */

import { DataSource } from 'typeorm';
import { CashCategory } from '../entities/CashCategory.entity';

export class CashCategoriesSeeder {
  constructor(private dataSource: DataSource) {}

  async run() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const categories = [
        // รายรับ (IN)
        { name: 'ขายหน้าร้าน', type: 'IN', parent_id: null, active: 1 },
        { name: 'ค่าซ่อม', type: 'IN', parent_id: null, active: 1 },
        { name: 'รายได้อื่น', type: 'IN', parent_id: null, active: 1 },

        // รายจ่าย (OUT)
        { name: 'เงินเดือน', type: 'OUT', parent_id: null, active: 1 },
        { name: 'ค่าไฟ', type: 'OUT', parent_id: null, active: 1 },
        { name: 'ค่าน้ำ', type: 'OUT', parent_id: null, active: 1 },
        { name: 'ค่าเช่า', type: 'OUT', parent_id: null, active: 1 },
        { name: 'ค่าอะไหล่', type: 'OUT', parent_id: null, active: 1 },
        { name: 'ค่าบริการ', type: 'OUT', parent_id: null, active: 1 },
        { name: 'ค่าโฆษณา', type: 'OUT', parent_id: null, active: 1 },
        { name: 'ค่าใช้จ่ายอื่น', type: 'OUT', parent_id: null, active: 1 },

        // ทั้งสอง (BOTH)
        { name: 'โอนเงินระหว่างบัญชี', type: 'BOTH', parent_id: null, active: 1 },
      ];

      for (const categoryData of categories) {
        const existing = await queryRunner.manager.findOne(CashCategory, {
          where: { name: categoryData.name },
        });

        if (!existing) {
          await queryRunner.manager.save(CashCategory, categoryData);
        }
      }

      await queryRunner.commitTransaction();
      console.log('✅ Cash Categories seeded successfully');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

