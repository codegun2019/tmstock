/**
 * Branches Seeder
 */

import { DataSource } from 'typeorm';
import { Branch } from '../entities/Branch.entity';

export async function seedBranches(dataSource: DataSource) {
  const branchRepository = dataSource.getRepository(Branch);

  const branches = [
    {
      code: 'BKK',
      name: 'สาขากรุงเทพ',
      address: 'กรุงเทพมหานคร',
      phone: '02-123-4567',
      invoice_prefix: 'BKK',
      active: 1,
    },
    {
      code: 'CMK',
      name: 'สาขาเชียงใหม่',
      address: 'เชียงใหม่',
      phone: '053-123-4567',
      invoice_prefix: 'CMK',
      active: 1,
    },
  ];

  for (const branchData of branches) {
    const existingBranch = await branchRepository.findOne({
      where: { code: branchData.code },
    });

    if (!existingBranch) {
      const branch = branchRepository.create(branchData);
      await branchRepository.save(branch);
      console.log(`✅ Created branch: ${branchData.code} - ${branchData.name}`);
    } else {
      console.log(`⏭️  Branch already exists: ${branchData.code}`);
    }
  }
}

