/**
 * Stock Service
 * ⭐ CRITICAL: Handles stock operations with row-level locking and transaction safety
 */

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { StockBalance } from '../entities/StockBalance.entity';
import { StockMovement } from '../entities/StockMovement.entity';
import { Product } from '../entities/Product.entity';
import { DeductStockDto } from './dto/deduct-stock.dto';
import { AddStockDto } from './dto/add-stock.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(StockBalance)
    private stockBalanceRepository: Repository<StockBalance>,
    @InjectRepository(StockMovement)
    private stockMovementRepository: Repository<StockMovement>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private dataSource: DataSource,
  ) {}

  /**
   * Get stock balance for a product in a branch
   */
  async getStockBalance(
    productId: number,
    branchId: number,
  ): Promise<StockBalance> {
    let balance = await this.stockBalanceRepository.findOne({
      where: { product_id: productId, branch_id: branchId },
      relations: ['product', 'branch'],
    });

    // Create if doesn't exist
    if (!balance) {
      balance = this.stockBalanceRepository.create({
        product_id: productId,
        branch_id: branchId,
        quantity: 0,
        reserved_quantity: 0,
      });
      balance = await this.stockBalanceRepository.save(balance);
    }

    return balance;
  }

  /**
   * Deduct stock (OUT) - ⭐ CRITICAL: Uses row-level locking
   */
  async deductStock(deductDto: DeductStockDto, userId: number): Promise<StockMovement> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // ⭐ Row-level lock: SELECT ... FOR UPDATE
      const balance = await queryRunner.manager
        .createQueryBuilder(StockBalance, 'sb')
        .setLock('pessimistic_write') // ⭐ Row-level lock
        .where('sb.product_id = :productId', { productId: deductDto.product_id })
        .andWhere('sb.branch_id = :branchId', { branchId: deductDto.branch_id })
        .getOne();

      if (!balance) {
        throw new NotFoundException(
          `Stock balance not found for product ${deductDto.product_id} in branch ${deductDto.branch_id}`,
        );
      }

      // ⭐ Hard check: Prevent negative stock
      const availableQty = balance.quantity - balance.reserved_quantity;
      if (availableQty < deductDto.quantity) {
        throw new BadRequestException(
          `Insufficient stock. Available: ${availableQty}, Requested: ${deductDto.quantity}`,
        );
      }

      const balanceBefore = balance.quantity;
      balance.quantity -= deductDto.quantity;
      balance.last_moved_at = new Date();
      const balanceAfter = balance.quantity;

      // Update stock balance
      await queryRunner.manager.save(StockBalance, balance);

      // Create stock movement record
      const movement = queryRunner.manager.create(StockMovement, {
        product_id: deductDto.product_id,
        branch_id: deductDto.branch_id,
        move_type: 'sale',
        quantity: -deductDto.quantity, // ⭐ Negative for OUT
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        reference_type: deductDto.reference_type || 'manual',
        reference_id: deductDto.reference_id,
        reason: deductDto.reason || 'Stock deduction',
        created_by: userId,
      });

      const savedMovement = await queryRunner.manager.save(StockMovement, movement);

      await queryRunner.commitTransaction();
      return savedMovement;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to deduct stock: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Add stock (IN)
   */
  async addStock(addDto: AddStockDto, userId: number): Promise<StockMovement> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // ⭐ Row-level lock
      let balance = await queryRunner.manager
        .createQueryBuilder(StockBalance, 'sb')
        .setLock('pessimistic_write')
        .where('sb.product_id = :productId', { productId: addDto.product_id })
        .andWhere('sb.branch_id = :branchId', { branchId: addDto.branch_id })
        .getOne();

      // Create if doesn't exist
      if (!balance) {
        balance = queryRunner.manager.create(StockBalance, {
          product_id: addDto.product_id,
          branch_id: addDto.branch_id,
          quantity: 0,
          reserved_quantity: 0,
        });
        balance = await queryRunner.manager.save(StockBalance, balance);
      }

      const balanceBefore = balance.quantity;
      balance.quantity += addDto.quantity;
      balance.last_moved_at = new Date();
      const balanceAfter = balance.quantity;

      await queryRunner.manager.save(StockBalance, balance);

      // Create stock movement
      const movement = queryRunner.manager.create(StockMovement, {
        product_id: addDto.product_id,
        branch_id: addDto.branch_id,
        move_type: 'receive',
        quantity: addDto.quantity, // ⭐ Positive for IN
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        reference_type: addDto.reference_type || 'manual',
        reference_id: addDto.reference_id,
        reason: addDto.reason || 'Stock addition',
        created_by: userId,
      });

      const savedMovement = await queryRunner.manager.save(StockMovement, movement);

      await queryRunner.commitTransaction();
      return savedMovement;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(`Failed to add stock: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Adjust stock (set to specific quantity)
   */
  async adjustStock(adjustDto: AdjustStockDto, userId: number): Promise<StockMovement> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // ⭐ Row-level lock
      let balance = await queryRunner.manager
        .createQueryBuilder(StockBalance, 'sb')
        .setLock('pessimistic_write')
        .where('sb.product_id = :productId', { productId: adjustDto.product_id })
        .andWhere('sb.branch_id = :branchId', { branchId: adjustDto.branch_id })
        .getOne();

      if (!balance) {
        balance = queryRunner.manager.create(StockBalance, {
          product_id: adjustDto.product_id,
          branch_id: adjustDto.branch_id,
          quantity: 0,
          reserved_quantity: 0,
        });
        balance = await queryRunner.manager.save(StockBalance, balance);
      }

      const balanceBefore = balance.quantity;
      const quantityDiff = adjustDto.new_quantity - balanceBefore;
      balance.quantity = adjustDto.new_quantity;
      balance.last_moved_at = new Date();
      const balanceAfter = balance.quantity;

      await queryRunner.manager.save(StockBalance, balance);

      // Create stock movement
      const movement = queryRunner.manager.create(StockMovement, {
        product_id: adjustDto.product_id,
        branch_id: adjustDto.branch_id,
        move_type: 'adjust',
        quantity: quantityDiff, // ⭐ Difference (can be positive or negative)
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        reference_type: adjustDto.reference_type || 'adjustment',
        reference_id: adjustDto.reference_id,
        reason: adjustDto.reason,
        created_by: userId,
      });

      const savedMovement = await queryRunner.manager.save(StockMovement, movement);

      await queryRunner.commitTransaction();
      return savedMovement;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(`Failed to adjust stock: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get stock movements for a product in a branch
   */
  async getStockMovements(
    productId: number,
    branchId: number,
    limit: number = 50,
  ): Promise<StockMovement[]> {
    return await this.stockMovementRepository.find({
      where: { product_id: productId, branch_id: branchId },
      relations: ['product', 'branch', 'creator'],
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get stock movements by reference (for linking)
   */
  async getMovementsByReference(
    referenceType: string,
    referenceId: number,
  ): Promise<StockMovement[]> {
    return await this.stockMovementRepository.find({
      where: { reference_type: referenceType, reference_id: referenceId },
      relations: ['product', 'branch', 'creator'],
      order: { created_at: 'DESC' },
    });
  }
}

