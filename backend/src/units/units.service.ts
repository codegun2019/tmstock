/**
 * Units Service
 */

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unit } from '../entities/Unit.entity';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(Unit)
    private unitRepository: Repository<Unit>,
  ) {}

  async create(createUnitDto: CreateUnitDto): Promise<Unit> {
    // Check if name already exists
    const existingUnit = await this.unitRepository.findOne({
      where: { name: createUnitDto.name },
    });

    if (existingUnit) {
      throw new BadRequestException(
        `Unit with name ${createUnitDto.name} already exists`,
      );
    }

    const unit = this.unitRepository.create(createUnitDto);
    return await this.unitRepository.save(unit);
  }

  async findAll(activeOnly: boolean = false): Promise<Unit[]> {
    const where = activeOnly ? { active: 1 } : {};
    return await this.unitRepository.find({
      where,
      order: { display_order: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Unit> {
    const unit = await this.unitRepository.findOne({
      where: { id },
    });

    if (!unit) {
      throw new NotFoundException(`Unit with ID ${id} not found`);
    }

    return unit;
  }

  async findByName(name: string): Promise<Unit> {
    const unit = await this.unitRepository.findOne({
      where: { name, active: 1 },
    });

    if (!unit) {
      throw new NotFoundException(`Unit with name ${name} not found`);
    }

    return unit;
  }

  async update(id: number, updateUnitDto: UpdateUnitDto): Promise<Unit> {
    const unit = await this.findOne(id);

    // Check if name is being changed and already exists
    if (updateUnitDto.name && updateUnitDto.name !== unit.name) {
      const existingUnit = await this.unitRepository.findOne({
        where: { name: updateUnitDto.name },
      });

      if (existingUnit) {
        throw new BadRequestException(
          `Unit with name ${updateUnitDto.name} already exists`,
        );
      }
    }

    Object.assign(unit, updateUnitDto);
    return await this.unitRepository.save(unit);
  }

  async remove(id: number): Promise<void> {
    const unit = await this.findOne(id);
    await this.unitRepository.remove(unit);
  }

  async deactivate(id: number): Promise<Unit> {
    const unit = await this.findOne(id);
    unit.active = 0;
    return await this.unitRepository.save(unit);
  }

  async activate(id: number): Promise<Unit> {
    const unit = await this.findOne(id);
    unit.active = 1;
    return await this.unitRepository.save(unit);
  }
}

