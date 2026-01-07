/**
 * Main Seeder
 * Example: Main seeder that runs all seeders in order
 */

import { DataSource } from 'typeorm';
import { RolesPermissionsSeeder } from './RolesPermissionsSeeder';
import { BranchesSeeder } from './BranchesSeeder';
import { CashCategoriesSeeder } from './CashCategoriesSeeder';
import { EmployeePositionsSeeder } from './EmployeePositionsSeeder';
import { CategoriesSeeder } from './CategoriesSeeder';
import { UnitsSeeder } from './UnitsSeeder';

export class MainSeeder {
  constructor(private dataSource: DataSource) {}

  async run() {
    console.log('🌱 Starting database seeding...\n');

    try {
      // 1. Roles & Permissions (must be first)
      console.log('1️⃣ Seeding Roles & Permissions...');
      const rolesPermissionsSeeder = new RolesPermissionsSeeder(this.dataSource);
      await rolesPermissionsSeeder.run();

      // 2. Branches
      console.log('2️⃣ Seeding Branches...');
      const branchesSeeder = new BranchesSeeder(this.dataSource);
      await branchesSeeder.run();

      // 3. Cash Categories
      console.log('3️⃣ Seeding Cash Categories...');
      const cashCategoriesSeeder = new CashCategoriesSeeder(this.dataSource);
      await cashCategoriesSeeder.run();

      // 4. Employee Positions
      console.log('4️⃣ Seeding Employee Positions...');
      const employeePositionsSeeder = new EmployeePositionsSeeder(this.dataSource);
      await employeePositionsSeeder.run();

      // 5. Product Categories
      console.log('5️⃣ Seeding Product Categories...');
      const categoriesSeeder = new CategoriesSeeder(this.dataSource);
      await categoriesSeeder.run();

      // 6. Units
      console.log('6️⃣ Seeding Units...');
      const unitsSeeder = new UnitsSeeder(this.dataSource);
      await unitsSeeder.run();

      console.log('\n✅ All seeders completed successfully!');
    } catch (error) {
      console.error('❌ Seeding failed:', error);
      throw error;
    }
  }
}

/**
 * Usage in NestJS:
 * 
 * // In main.ts or a seeder command
 * import { NestFactory } from '@nestjs/core';
 * import { AppModule } from './app.module';
 * import { MainSeeder } from './seeders/MainSeeder';
 * 
 * async function bootstrap() {
 *   const app = await NestFactory.createApplicationContext(AppModule);
 *   const dataSource = app.get(DataSource);
 *   
 *   const seeder = new MainSeeder(dataSource);
 *   await seeder.run();
 *   
 *   await app.close();
 * }
 * 
 * bootstrap();
 */

