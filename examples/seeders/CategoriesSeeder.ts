/**
 * Product Categories Seeder
 * Example: Seeder for product categories
 */

import { DataSource } from 'typeorm';
import { Category } from '../entities/Category.entity';

export class CategoriesSeeder {
  constructor(private dataSource: DataSource) {}

  async run() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const categories = [
        {
          name: 'อิเล็กทรอนิกส์',
          slug: 'electronics',
          description: 'สินค้าอิเล็กทรอนิกส์',
          active: 1,
        },
        {
          name: 'เสื้อผ้า',
          slug: 'clothing',
          description: 'เสื้อผ้าและแฟชั่น',
          active: 1,
        },
        {
          name: 'อาหารและเครื่องดื่ม',
          slug: 'food-drinks',
          description: 'อาหารและเครื่องดื่ม',
          active: 1,
        },
        {
          name: 'ของใช้ในบ้าน',
          slug: 'home-goods',
          description: 'ของใช้ในบ้าน',
          active: 1,
        },
      ];

      for (const categoryData of categories) {
        const existing = await queryRunner.manager.findOne(Category, {
          where: { slug: categoryData.slug },
        });

        if (!existing) {
          await queryRunner.manager.save(Category, categoryData);
        }
      }

      await queryRunner.commitTransaction();
      console.log('✅ Product Categories seeded successfully');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

