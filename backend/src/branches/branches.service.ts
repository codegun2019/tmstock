/**
 * Branches Service
 */

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from '../entities/Branch.entity';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch)
    private branchRepository: Repository<Branch>,
  ) {}

  async create(data: {
    code: string;
    name: string;
    address?: string;
    phone?: string;
    invoice_prefix?: string;
    active?: number;
  }): Promise<Branch> {
    // Check if code already exists
    const existing = await this.branchRepository.findOne({
      where: { code: data.code },
    });

    if (existing) {
      throw new BadRequestException(`Branch with code ${data.code} already exists`);
    }

    const branch = this.branchRepository.create(data);
    return await this.branchRepository.save(branch);
  }

  async findAll(activeOnly: boolean = false): Promise<Branch[]> {
    const where = activeOnly ? { active: 1 } : {};
    return await this.branchRepository.find({
      where,
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Branch> {
    const branch = await this.branchRepository.findOne({ where: { id } });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }
    return branch;
  }

  async update(id: number, data: {
    code?: string;
    name?: string;
    address?: string;
    phone?: string;
    invoice_prefix?: string;
    active?: number;
  }): Promise<Branch> {
    const branch = await this.findOne(id);

    // Check if code is being changed and already exists
    if (data.code && data.code !== branch.code) {
      const existing = await this.branchRepository.findOne({
        where: { code: data.code },
      });

      if (existing) {
        throw new BadRequestException(`Branch with code ${data.code} already exists`);
      }
    }

    Object.assign(branch, data);
    return await this.branchRepository.save(branch);
  }

  async remove(id: number): Promise<void> {
    const branch = await this.findOne(id);
    await this.branchRepository.remove(branch);
  }

  async deactivate(id: number): Promise<Branch> {
    const branch = await this.findOne(id);
    branch.active = 0;
    return await this.branchRepository.save(branch);
  }

  async activate(id: number): Promise<Branch> {
    const branch = await this.findOne(id);
    branch.active = 1;
    return await this.branchRepository.save(branch);
  }
}

