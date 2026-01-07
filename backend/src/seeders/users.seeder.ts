/**
 * Users Seeder
 */

import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/User.entity';
import { Branch } from '../entities/Branch.entity';
import { Role } from '../entities/Role.entity';
import { UserRole } from '../entities/UserRole.entity';

export async function seedUsers(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);
  const branchRepository = dataSource.getRepository(Branch);
  const roleRepository = dataSource.getRepository(Role);
  const userRoleRepository = dataSource.getRepository(UserRole);

  // Get branches
  const branchBKK = await branchRepository.findOne({ where: { code: 'BKK' } });
  if (!branchBKK) {
    console.log('⚠️  Branch BKK not found. Please run branches seeder first.');
    return;
  }

  // Get roles
  const adminRole = await roleRepository.findOne({ where: { name: 'admin' } });
  const managerRole = await roleRepository.findOne({ where: { name: 'manager' } });
  const cashierRole = await roleRepository.findOne({ where: { name: 'cashier' } });

  if (!adminRole || !managerRole || !cashierRole) {
    console.log('⚠️  Roles not found. Please run roles-permissions seeder first.');
    return;
  }

  const users = [
    {
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      full_name: 'ผู้ดูแลระบบ',
      branch_id: branchBKK.id,
      role: adminRole,
    },
    {
      username: 'manager',
      email: 'manager@example.com',
      password: 'manager123',
      full_name: 'ผู้จัดการ',
      branch_id: branchBKK.id,
      role: managerRole,
    },
    {
      username: 'cashier',
      email: 'cashier@example.com',
      password: 'cashier123',
      full_name: 'แคชเชียร์',
      branch_id: branchBKK.id,
      role: cashierRole,
    },
  ];

  for (const userData of users) {
    const existingUser = await userRepository.findOne({
      where: { username: userData.username },
    });

    if (!existingUser) {
      const password_hash = await bcrypt.hash(userData.password, 10);
      const user = userRepository.create({
        username: userData.username,
        email: userData.email,
        password_hash,
        full_name: userData.full_name,
        branch_id: userData.branch_id,
        active: 1,
        is_admin: userData.role.name === 'admin' ? 1 : 0,
      });
      const savedUser = await userRepository.save(user);

      // Assign role
      const userRole = userRoleRepository.create({
        user_id: savedUser.id,
        role_id: userData.role.id,
      });
      await userRoleRepository.save(userRole);

      console.log(`✅ Created user: ${userData.username} (${userData.full_name})`);
      console.log(`   Password: ${userData.password}`);
    } else {
      console.log(`⏭️  User already exists: ${userData.username}`);
    }
  }
}

