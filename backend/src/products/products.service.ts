/**
 * Products Service
 */

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/Product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Check if barcode already exists
    const existingBarcode = await this.productRepository.findOne({
      where: { barcode: createProductDto.barcode },
    });

    if (existingBarcode) {
      throw new BadRequestException(
        `Product with barcode ${createProductDto.barcode} already exists`,
      );
    }

    // Check if SKU already exists (if provided)
    if (createProductDto.sku) {
      const existingSku = await this.productRepository.findOne({
        where: { sku: createProductDto.sku },
      });

      if (existingSku) {
        throw new BadRequestException(
          `Product with SKU ${createProductDto.sku} already exists`,
        );
      }
    }

    const product = this.productRepository.create(createProductDto);
    return await this.productRepository.save(product);
  }

  async findAll(activeOnly: boolean = false): Promise<Product[]> {
    const where = activeOnly ? { active: 1 } : {};
    return await this.productRepository.find({
      where,
      relations: ['category', 'unit'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'unit'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async findByBarcode(barcode: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { barcode, active: 1 },
      relations: ['category', 'unit'],
    });

    if (!product) {
      throw new NotFoundException(`Product with barcode ${barcode} not found`);
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    // Check if barcode is being changed and already exists
    if (updateProductDto.barcode && updateProductDto.barcode !== product.barcode) {
      const existingBarcode = await this.productRepository.findOne({
        where: { barcode: updateProductDto.barcode },
      });

      if (existingBarcode) {
        throw new BadRequestException(
          `Product with barcode ${updateProductDto.barcode} already exists`,
        );
      }
    }

    // Check if SKU is being changed and already exists
    if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
      const existingSku = await this.productRepository.findOne({
        where: { sku: updateProductDto.sku },
      });

      if (existingSku) {
        throw new BadRequestException(
          `Product with SKU ${updateProductDto.sku} already exists`,
        );
      }
    }

    Object.assign(product, updateProductDto);
    return await this.productRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  async deactivate(id: number): Promise<Product> {
    const product = await this.findOne(id);
    product.active = 0;
    return await this.productRepository.save(product);
  }

  async activate(id: number): Promise<Product> {
    const product = await this.findOne(id);
    product.active = 1;
    return await this.productRepository.save(product);
  }
}

