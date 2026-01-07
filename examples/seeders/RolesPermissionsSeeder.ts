/**
 * Roles & Permissions Seeder
 * Example: Seeder for roles and permissions
 */

import { DataSource } from 'typeorm';
import { Role } from '../entities/Role.entity';
import { Permission } from '../entities/Permission.entity';
import { RolePermission } from '../entities/RolePermission.entity';

export class RolesPermissionsSeeder {
  constructor(private dataSource: DataSource) {}

  async run() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Create Permissions
      const permissions = [
        // Users
        { key: 'users.read', label: 'ดูข้อมูลพนักงาน' },
        { key: 'users.create', label: 'เพิ่มพนักงาน' },
        { key: 'users.update', label: 'แก้ไขพนักงาน' },
        { key: 'users.delete', label: 'ลบพนักงาน' },
        { key: 'users.manage', label: 'จัดการพนักงานทั้งหมด' },

        // Products
        { key: 'product.read', label: 'ดูข้อมูลสินค้า' },
        { key: 'product.create', label: 'เพิ่มสินค้า' },
        { key: 'product.update', label: 'แก้ไขสินค้า' },
        { key: 'product.delete', label: 'ลบสินค้า' },
        { key: 'product.quick_create', label: 'เพิ่มสินค้าเร็ว (POS)' },

        // POS
        { key: 'pos.sale', label: 'ขายหน้าร้าน' },
        { key: 'pos.read', label: 'ดูข้อมูลการขาย' },
        { key: 'pos.void', label: 'ยกเลิกบิล' },
        { key: 'pos.refund', label: 'คืนเงิน' },

        // Inventory
        { key: 'inventory.read', label: 'ดูข้อมูลสต็อค' },
        { key: 'inventory.adjust', label: 'ปรับยอดสต็อค' },
        { key: 'inventory.receive', label: 'รับสินค้าเข้า' },
        { key: 'inventory.transfer', label: 'โอนสต็อค' },

        // HR
        { key: 'hr.read', label: 'ดูข้อมูล HR' },
        { key: 'hr.employees', label: 'จัดการพนักงาน' },
        { key: 'hr.attendance', label: 'จัดการเวลาเข้า-ออก' },
        { key: 'hr.payroll', label: 'จัดการเงินเดือน' },
        { key: 'hr.payroll.calculate', label: 'คำนวณเงินเดือน' },
        { key: 'hr.payroll.lock', label: 'ล็อครอบเงินเดือน' },

        // Cash
        { key: 'cash.read', label: 'ดูข้อมูลการเงิน' },
        { key: 'cash.create', label: 'กรอกรายการเงิน' },
        { key: 'cash.void', label: 'ยกเลิกรายการเงิน' },
        { key: 'cash.adjust', label: 'ปรับรายการเงิน' },

        // Reports
        { key: 'reports.read', label: 'ดูรายงาน' },
        { key: 'reports.export', label: 'ส่งออกรายงาน' },
      ];

      const permissionEntities = [];
      for (const perm of permissions) {
        const existing = await queryRunner.manager.findOne(Permission, {
          where: { key: perm.key },
        });

        if (!existing) {
          const permission = queryRunner.manager.create(Permission, perm);
          const saved = await queryRunner.manager.save(permission);
          permissionEntities.push(saved);
        } else {
          permissionEntities.push(existing);
        }
      }

      // 2. Create Roles
      const adminRole = await this.createOrUpdateRole(
        queryRunner,
        'Admin',
        'ผู้ดูแลระบบ (สิทธิ์เต็ม)',
        permissionEntities.map((p) => p.id), // ⭐ Admin has all permissions
      );

      const managerRole = await this.createOrUpdateRole(
        queryRunner,
        'Manager',
        'ผู้จัดการ',
        permissionEntities
          .filter((p) =>
            [
              'users.read',
              'product.read',
              'product.create',
              'product.update',
              'pos.sale',
              'pos.read',
              'inventory.read',
              'inventory.adjust',
              'hr.read',
              'hr.employees',
              'hr.attendance',
              'hr.payroll',
              'cash.read',
              'cash.create',
              'reports.read',
            ].includes(p.key),
          )
          .map((p) => p.id),
      );

      const cashierRole = await this.createOrUpdateRole(
        queryRunner,
        'Cashier',
        'พนักงานขาย',
        permissionEntities
          .filter((p) =>
            [
              'product.read',
              'product.quick_create',
              'pos.sale',
              'pos.read',
              'inventory.read',
            ].includes(p.key),
          )
          .map((p) => p.id),
      );

      await queryRunner.commitTransaction();
      console.log('✅ Roles & Permissions seeded successfully');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async createOrUpdateRole(
    queryRunner: any,
    name: string,
    description: string,
    permissionIds: number[],
  ) {
    let role = await queryRunner.manager.findOne(Role, {
      where: { name },
    });

    if (!role) {
      role = queryRunner.manager.create(Role, { name, description });
      role = await queryRunner.manager.save(role);
    }

    // Assign permissions
    for (const permissionId of permissionIds) {
      const existing = await queryRunner.manager.findOne(RolePermission, {
        where: { role_id: role.id, permission_id: permissionId },
      });

      if (!existing) {
        await queryRunner.manager.save(RolePermission, {
          role_id: role.id,
          permission_id: permissionId,
        });
      }
    }

    return role;
  }
}

