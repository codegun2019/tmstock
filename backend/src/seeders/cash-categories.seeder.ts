/**
 * Cash Categories Seeder
 */

import { DataSource } from 'typeorm';
import { CashCategory } from '../entities/CashCategory.entity';

export async function seedCashCategories(dataSource: DataSource) {
  const categoryRepository = dataSource.getRepository(CashCategory);

  // Check if categories already exist
  const existing = await categoryRepository.count();
  if (existing > 0) {
    console.log('Cash categories already seeded, skipping...');
    return;
  }

  const categories = [
    // ⭐ รายรับ (IN)
    { name: 'ขายหน้าร้าน', type: 'IN', description: 'รายได้จากการขายหน้าร้าน (POS)' },
    { name: 'ค่าซ่อม', type: 'IN', description: 'รายได้จากงานซ่อม' },
    { name: 'รายได้อื่น', type: 'IN', description: 'รายได้อื่นๆ' },

    // ⭐ รายจ่าย (OUT)
    { name: 'เงินเดือน', type: 'OUT', description: 'ค่าใช้จ่ายเงินเดือนพนักงาน' },
    { name: 'ค่าไฟ', type: 'OUT', description: 'ค่าใช้จ่ายค่าไฟฟ้า' },
    { name: 'ค่าเช่า', type: 'OUT', description: 'ค่าใช้จ่ายค่าเช่า' },
    { name: 'ค่าอะไหล่', type: 'OUT', description: 'ค่าใช้จ่ายค่าอะไหล่/สินค้า' },
    { name: 'ค่าบริการ', type: 'OUT', description: 'ค่าใช้จ่ายค่าบริการ' },
    { name: 'ค่าใช้จ่ายอื่น', type: 'OUT', description: 'ค่าใช้จ่ายอื่นๆ' },

    // ⭐ ทั้งสอง (BOTH)
    { name: 'โอนเงินระหว่างบัญชี', type: 'BOTH', description: 'โอนเงินระหว่างบัญชี' },
  ];

  for (const categoryData of categories) {
    const category = categoryRepository.create(categoryData);
    await categoryRepository.save(category);
  }

  console.log(`✅ Seeded ${categories.length} cash categories`);
}

