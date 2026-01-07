/**
 * Categories Service
 */

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/Category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Check if slug already exists
    const existingSlug = await this.categoryRepository.findOne({
      where: { slug: createCategoryDto.slug },
    });

    if (existingSlug) {
      throw new BadRequestException(
        `Category with slug ${createCategoryDto.slug} already exists`,
      );
    }

    // Validate parent exists (if provided)
    if (createCategoryDto.parent_id) {
      const parent = await this.categoryRepository.findOne({
        where: { id: createCategoryDto.parent_id },
      });

      if (!parent) {
        throw new NotFoundException(
          `Parent category with ID ${createCategoryDto.parent_id} not found`,
        );
      }
    }

    const category = this.categoryRepository.create(createCategoryDto);
    return await this.categoryRepository.save(category);
  }

  async findAll(activeOnly: boolean = false): Promise<Category[]> {
    const where = activeOnly ? { active: 1 } : {};
    return await this.categoryRepository.find({
      where,
      relations: ['parent', 'children'],
      order: { display_order: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { slug, active: 1 },
      relations: ['parent', 'children'],
    });

    if (!category) {
      throw new NotFoundException(`Category with slug ${slug} not found`);
    }

    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);

    // Check if slug is being changed and already exists
    if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
      const existingSlug = await this.categoryRepository.findOne({
        where: { slug: updateCategoryDto.slug },
      });

      if (existingSlug) {
        throw new BadRequestException(
          `Category with slug ${updateCategoryDto.slug} already exists`,
        );
      }
    }

    // Validate parent exists (if provided)
    if (updateCategoryDto.parent_id !== undefined) {
      if (updateCategoryDto.parent_id === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }

      if (updateCategoryDto.parent_id !== null) {
        const parent = await this.categoryRepository.findOne({
          where: { id: updateCategoryDto.parent_id },
        });

        if (!parent) {
          throw new NotFoundException(
            `Parent category with ID ${updateCategoryDto.parent_id} not found`,
          );
        }
      }
    }

    Object.assign(category, updateCategoryDto);
    return await this.categoryRepository.save(category);
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);

    // Check if category has children
    const children = await this.categoryRepository.find({
      where: { parent_id: id },
    });

    if (children.length > 0) {
      throw new BadRequestException(
        'Cannot delete category with subcategories. Please delete or move subcategories first.',
      );
    }

    await this.categoryRepository.remove(category);
  }

  async deactivate(id: number): Promise<Category> {
    const category = await this.findOne(id);
    category.active = 0;
    return await this.categoryRepository.save(category);
  }

  async activate(id: number): Promise<Category> {
    const category = await this.findOne(id);
    category.active = 1;
    return await this.categoryRepository.save(category);
  }
}

