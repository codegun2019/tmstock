/**
 * Inventory Service Example
 * Example: Stock deduction with row-level locking
 */

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { StockBalance } from '../entities/StockBalance.entity';
import { StockMovement, MoveType, ReferenceType } from '../entities/StockMovement.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(StockBalance)
    private stockBalanceRepo: Repository<StockBalance>,
    @InjectRepository(StockMovement)
    private stockMovementRepo: Repository<StockMovement>,
    private dataSource: DataSource,
  ) {}

  /**
   * Deduct stock with transaction manager
   * ⭐ CRITICAL: Must use row-level locking
   * ⭐ CRITICAL: Must be called within a transaction
   */
  async deductStockWithTransaction(
    queryRunner: QueryRunner, // ⭐ Accept transaction manager (don't create new one)
    productId: number,
    quantity: number,
    branchId: number,
    referenceId: number,
    referenceType: ReferenceType = ReferenceType.INVOICE,
  ) {
    // ⭐ Lock stock balance row BEFORE checking
    const balance = await queryRunner.manager
      .createQueryBuilder(StockBalance, 'balance')
      .setLock('pessimistic_write') // ⭐ SELECT ... FOR UPDATE
      .where('balance.product_id = :productId', { productId })
      .andWhere('balance.branch_id = :branchId', { branchId })
      .getOne();

    if (!balance) {
      throw new NotFoundException(
        `Stock balance not found for product ${productId} in branch ${branchId}`,
      );
    }

    // ⭐ Check stock availability AFTER lock
    if (balance.quantity < quantity) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${balance.quantity}, Required: ${quantity}`,
      );
    }

    // ⭐ Store balance before update
    const balanceBefore = balance.quantity;

    // ⭐ Update stock in same transaction
    balance.quantity -= quantity;
    await queryRunner.manager.save(balance);

    // ⭐ Create stock movement in same transaction
    const movement = queryRunner.manager.create(StockMovement, {
      product_id: productId,
      branch_id: branchId,
      move_type: MoveType.OUT,
      quantity: -quantity, // ⭐ Negative for OUT
      balance_before: balanceBefore,
      balance_after: balance.quantity,
      reference_type: referenceType,
      reference_id: referenceId,
      reason: `Sale - ${referenceType} #${referenceId}`,
      created_by: 1, // ⭐ Get from context
    });

    await queryRunner.manager.save(movement);

    return { balance, movement };
  }

  /**
   * Return stock (for refund/void)
   * ⭐ CRITICAL: Must use row-level locking
   */
  async returnStockWithTransaction(
    queryRunner: QueryRunner,
    productId: number,
    quantity: number,
    branchId: number,
    referenceId: number,
    referenceType: ReferenceType = ReferenceType.INVOICE_REFUND,
  ) {
    // ⭐ Lock stock balance row
    const balance = await queryRunner.manager
      .createQueryBuilder(StockBalance, 'balance')
      .setLock('pessimistic_write')
      .where('balance.product_id = :productId', { productId })
      .andWhere('balance.branch_id = :branchId', { branchId })
      .getOne();

    if (!balance) {
      throw new NotFoundException('Stock balance not found');
    }

    const balanceBefore = balance.quantity;

    // ⭐ Return stock (increase quantity)
    balance.quantity += quantity;
    await queryRunner.manager.save(balance);

    // ⭐ Create stock movement (IN)
    const movement = queryRunner.manager.create(StockMovement, {
      product_id: productId,
      branch_id: branchId,
      move_type: MoveType.IN,
      quantity: quantity, // ⭐ Positive for IN
      balance_before: balanceBefore,
      balance_after: balance.quantity,
      reference_type: referenceType,
      reference_id: referenceId,
      reason: `Return - ${referenceType} #${referenceId}`,
      created_by: 1, // ⭐ Get from context
    });

    await queryRunner.manager.save(movement);

    return { balance, movement };
  }

  /**
   * Get stock balance
   */
  async getBalance(productId: number, branchId: number) {
    const balance = await this.stockBalanceRepo.findOne({
      where: { product_id: productId, branch_id: branchId },
    });

    return balance || { quantity: 0, available_quantity: 0 };
  }
}

