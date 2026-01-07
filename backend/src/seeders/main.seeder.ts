/**
 * Main Seeder
 * Run all seeders in order
 */

import { DataSource } from 'typeorm';
import { seedBranches } from './branches.seeder';
import { seedRolesAndPermissions } from './roles-permissions.seeder';
import { seedUsers } from './users.seeder';
import { seedCashCategories } from './cash-categories.seeder';

export async function runSeeders(dataSource: DataSource) {
  console.log('🌱 Starting seeders...\n');

  try {
    // 1. Seed Branches
    console.log('📦 Seeding Branches...');
    await seedBranches(dataSource);
    console.log('✅ Branches seeded\n');

    // 2. Seed Roles and Permissions
    console.log('🔐 Seeding Roles and Permissions...');
    await seedRolesAndPermissions(dataSource);
    console.log('✅ Roles and Permissions seeded\n');

    // 3. Seed Users
    console.log('👤 Seeding Users...');
    await seedUsers(dataSource);
    console.log('✅ Users seeded\n');

    console.log('🎉 All seeders completed successfully!');
  } catch (error) {
    console.error('❌ Error running seeders:', error);
    throw error;
  }
}

