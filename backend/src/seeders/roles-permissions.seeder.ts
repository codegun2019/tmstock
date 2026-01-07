/**
 * Roles and Permissions Seeder
 */

import { DataSource } from 'typeorm';
import { Role } from '../entities/Role.entity';
import { Permission } from '../entities/Permission.entity';
import { RolePermission } from '../entities/RolePermission.entity';

export async function seedRolesAndPermissions(dataSource: DataSource) {
  const roleRepository = dataSource.getRepository(Role);
  const permissionRepository = dataSource.getRepository(Permission);
  const rolePermissionRepository = dataSource.getRepository(RolePermission);

  // Create Permissions
  const permissions = [
    // Products
    { key: 'product.read', label: 'ดูสินค้า' },
    { key: 'product.create', label: 'สร้างสินค้า' },
    { key: 'product.update', label: 'แก้ไขสินค้า' },
    { key: 'product.delete', label: 'ลบสินค้า' },
    
    // POS/Sales
    { key: 'pos.sale', label: 'ขายสินค้า' },
    { key: 'pos.void', label: 'ยกเลิกบิล' },
    { key: 'pos.refund', label: 'คืนเงิน' },
    
    // Stock
    { key: 'stock.read', label: 'ดูสต็อค' },
    { key: 'stock.adjust', label: 'ปรับสต็อค' },
    { key: 'stock.transfer', label: 'โอนสต็อค' },
    
    // Reports
    { key: 'report.sales', label: 'รายงานยอดขาย' },
    { key: 'report.stock', label: 'รายงานสต็อค' },
    
    // Users
    { key: 'user.read', label: 'ดูผู้ใช้' },
    { key: 'user.create', label: 'สร้างผู้ใช้' },
    { key: 'user.update', label: 'แก้ไขผู้ใช้' },
    { key: 'user.delete', label: 'ลบผู้ใช้' },
    
    // Admin
    { key: 'admin.all', label: 'สิทธิ์ผู้ดูแลระบบ' },
  ];

  const createdPermissions: Permission[] = [];
  for (const permData of permissions) {
    let permission = await permissionRepository.findOne({
      where: { key: permData.key },
    });

    if (!permission) {
      permission = permissionRepository.create(permData);
      permission = await permissionRepository.save(permission);
      console.log(`✅ Created permission: ${permData.key}`);
    } else {
      console.log(`⏭️  Permission already exists: ${permData.key}`);
    }
    createdPermissions.push(permission);
  }

  // Create Roles
  const roles = [
    {
      name: 'admin',
      description: 'ผู้ดูแลระบบ - มีสิทธิ์ทุกอย่าง',
      permissions: ['admin.all'],
    },
    {
      name: 'manager',
      description: 'ผู้จัดการ - จัดการสินค้า, ดูรายงาน',
      permissions: [
        'product.read',
        'product.create',
        'product.update',
        'product.delete',
        'pos.sale',
        'pos.void',
        'pos.refund',
        'stock.read',
        'stock.adjust',
        'stock.transfer',
        'report.sales',
        'report.stock',
        'user.read',
      ],
    },
    {
      name: 'cashier',
      description: 'แคชเชียร์ - ขายสินค้า, ดูสต็อค',
      permissions: [
        'product.read',
        'pos.sale',
        'pos.void',
        'stock.read',
      ],
    },
  ];

  for (const roleData of roles) {
    let role = await roleRepository.findOne({
      where: { name: roleData.name },
    });

    if (!role) {
      role = roleRepository.create({
        name: roleData.name,
        description: roleData.description,
      });
      role = await roleRepository.save(role);
      console.log(`✅ Created role: ${roleData.name}`);
    } else {
      console.log(`⏭️  Role already exists: ${roleData.name}`);
    }

    // Assign permissions to role
    if (roleData.permissions.includes('admin.all')) {
      // Admin gets all permissions
      for (const permission of createdPermissions) {
        const existing = await rolePermissionRepository.findOne({
          where: {
            role_id: role.id,
            permission_id: permission.id,
          },
        });

        if (!existing) {
          const rolePermission = rolePermissionRepository.create({
            role_id: role.id,
            permission_id: permission.id,
          });
          await rolePermissionRepository.save(rolePermission);
        }
      }
    } else {
      // Assign specific permissions
      for (const permKey of roleData.permissions) {
        const permission = createdPermissions.find((p) => p.key === permKey);
        if (permission) {
          const existing = await rolePermissionRepository.findOne({
            where: {
              role_id: role.id,
              permission_id: permission.id,
            },
          });

          if (!existing) {
            const rolePermission = rolePermissionRepository.create({
              role_id: role.id,
              permission_id: permission.id,
            });
            await rolePermissionRepository.save(rolePermission);
          }
        }
      }
    }
  }
}

