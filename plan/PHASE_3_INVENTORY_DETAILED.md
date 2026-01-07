# 📦 Phase 3: Inventory & Stock Management (Detailed)

**Duration:** Week 5-6  
**Status:** ⏸️ Pending  
**Priority:** 🔴 Critical  
**Depends on:** Phase 2 (Products must be complete)

---

## 🎯 เป้าหมาย

Migrate inventory system: Stock balances, Stock movements, Sequence generators, GRN, Stock Adjustment, Stock Transfer

**สำคัญ:** InventoryService เป็น core ของระบบ ต้องทำงานถูกต้องและ integrate กับ Products และ Invoices

---

## 🔗 System Integration Points

### 1. InventoryService ↔ Products ⭐ CRITICAL
**Purpose:** ProductsService ต้องใช้ InventoryService เพื่อ query stock

**Integration Flow:**
```
Products Service
  ↓ (injects)
Inventory Service
  ↓ (queries)
StockBalance Entity
  ↓ (returns)
stock_quantity
```

**Implementation:**
- ProductsService ต้อง inject InventoryService
- InventoryService.getBalance() ใช้ใน ProductsService
- Product response ต้อง include stock_quantity

---

### 2. InventoryService ↔ Invoices ⭐ CRITICAL
**Purpose:** Invoice creation ต้องตัดสต็อคผ่าน InventoryService

**Integration Flow:**
```
Invoices Service
  ↓ (injects)
Inventory Service
  ↓ (calls)
InventoryService.sale()
  ↓ (calls)
InventoryService.move()
  ↓ (updates)
StockBalance + StockMove
```

**Implementation:**
- InvoicesService ต้อง inject InventoryService
- Invoice creation ต้องเรียก InventoryService.sale()
- Void/Refund ต้องเรียก InventoryService.returnStock()

---

## 📋 Tasks Checklist (Detailed)

### 1. Inventory Core Module ⭐ CRITICAL

#### 1.1 Create StockBalance Entity
**File:** `src/database/entities/stock-balance.entity.ts`

**Requirements:**
- [ ] Extends BaseEntity
- [ ] Has product_id (FK to products)
- [ ] Has branch_id (FK to branches)
- [ ] Has quantity (DECIMAL 10,2)
- [ ] Has reserved_quantity (DECIMAL 10,2, default 0)
- [ ] Has available_quantity (computed: quantity - reserved_quantity)
- [ ] Has last_moved_at (DATETIME)
- [ ] Unique constraint: (product_id, branch_id)

**Relations:**
```typescript
@ManyToOne(() => Product, (product) => product.stockBalances)
product: Product;

@ManyToOne(() => Branch)
branch: Branch;

@OneToMany(() => StockMove, (move) => move.balance)
moves: StockMove[];
```

**Estimated Time:** 1 hour

---

#### 1.2 Create StockMove Entity
**File:** `src/database/entities/stock-move.entity.ts`

**Requirements:**
- [ ] Extends BaseEntity
- [ ] Has product_id (FK to products)
- [ ] Has branch_id (FK to branches)
- [ ] Has move_type (ENUM: 'OUT', 'IN', 'ADJUST', 'TRANSFER')
- [ ] Has quantity (DECIMAL 10,2) - Positive for IN, Negative for OUT
- [ ] Has balance_before (DECIMAL 10,2)
- [ ] Has balance_after (DECIMAL 10,2)
- [ ] Has reference_type (VARCHAR) - 'invoice', 'grn', 'adjustment', etc.
- [ ] Has reference_id (INT, nullable)
- [ ] Has reason (TEXT, nullable)
- [ ] Has created_by (FK to users)
- [ ] Has approved_by (FK to users, nullable)
- [ ] Has approved_at (DATETIME, nullable)
- [ ] Has status (ENUM: 'pending', 'approved', 'rejected')

**Relations:**
```typescript
@ManyToOne(() => Product)
product: Product;

@ManyToOne(() => Branch)
branch: Branch;

@ManyToOne(() => StockBalance, (balance) => balance.moves)
balance: StockBalance;

@ManyToOne(() => User)
createdBy: User;

@ManyToOne(() => User, { nullable: true })
approvedBy: User | null;
```

**Indexes Required:**
- [ ] Index on (product_id, branch_id)
- [ ] Index on (reference_type, reference_id)
- [ ] Index on created_at

**Estimated Time:** 1.5 hours

---

#### 1.3 Create Inventory Service ⭐ CRITICAL
**File:** `src/inventory/inventory.service.ts`

**Dependencies:**
- Inject StockBalanceRepository
- Inject StockMoveRepository
- Inject ProductRepository (for validation)
- Inject BranchRepository (for validation)
- Inject DataSource (for transactions)
- Inject FeatureService (for negative stock check)

**Methods Required:**

##### 1.3.1 move() - Core Stock Movement Method ⭐ CRITICAL
**Purpose:** Core method สำหรับทุกการเปลี่ยนสต็อค

**Flow:**
```typescript
async move(
  productId: number,
  quantity: number, // Positive = IN, Negative = OUT
  moveType: 'OUT' | 'IN' | 'ADJUST' | 'TRANSFER',
  referenceType: string,
  referenceId: number | null,
  reason: string | null,
  branchId: number,
  userId: number,
  requireApproval: boolean = false,
): Promise<StockMove> {
  // 1. Start transaction
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // 2. Validate product exists
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(`Product ${productId} not found`);
    }

    // 3. Validate branch exists
    const branch = await this.branchRepository.findOne({
      where: { id: branchId },
    });
    if (!branch) {
      throw new NotFoundException(`Branch ${branchId} not found`);
    }

    // 4. Get or create stock balance (with row-level lock) ⭐
    const balance = await queryRunner.manager
      .createQueryBuilder(StockBalance, 'balance')
      .setLock('pessimistic_write') // ⭐ Row-level lock
      .where('balance.product_id = :productId', { productId })
      .andWhere('balance.branch_id = :branchId', { branchId })
      .getOne();

    let stockBalance: StockBalance;
    if (!balance) {
      // Create new balance
      stockBalance = queryRunner.manager.create(StockBalance, {
        product_id: productId,
        branch_id: branchId,
        quantity: 0,
        reserved_quantity: 0,
      });
    } else {
      stockBalance = balance;
    }

    // 5. Calculate new balance
    const balanceBefore = stockBalance.quantity;
    const balanceAfter = balanceBefore + quantity;

    // 6. Check negative stock (if not allowed) ⭐
    const allowNegative = await this.featureService.isEnabled(
      'inventory.negative_stock',
      userId,
      branchId,
    );
    if (!allowNegative && balanceAfter < 0) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${balanceBefore}, Required: ${Math.abs(quantity)}`,
      );
    }

    // 7. Update stock balance ⭐
    stockBalance.quantity = balanceAfter;
    stockBalance.last_moved_at = new Date();
    await queryRunner.manager.save(stockBalance);

    // 8. Create stock move record ⭐
    const stockMove = queryRunner.manager.create(StockMove, {
      product_id: productId,
      branch_id: branchId,
      move_type: moveType,
      quantity: quantity,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      reference_type: referenceType,
      reference_id: referenceId,
      reason: reason,
      created_by: userId,
      status: requireApproval ? 'pending' : 'approved',
    });
    await queryRunner.manager.save(stockMove);

    // 9. Commit transaction
    await queryRunner.commitTransaction();

    return stockMove;
  } catch (error) {
    // Rollback on error
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}
```

**Critical Points:**
- ⭐ **ต้องใช้ transaction (all or nothing)**
- ⭐ **ต้องใช้ row-level lock (pessimistic_write)**
- ⭐ **ต้องตรวจสอบ negative stock**
- ⭐ **ต้องสร้าง stock_moves record ทุกครั้ง**

**Estimated Time:** 4 hours

---

##### 1.3.2 sale() - Sale Stock Deduction ⭐ CRITICAL
**Purpose:** ตัดสต็อคเมื่อขาย (ใช้ใน Invoice creation)

**Flow:**
```typescript
async sale(
  productId: number,
  quantity: number,
  invoiceId: number,
  branchId: number,
  userId: number,
): Promise<StockMove> {
  return this.move(
    productId,
    -Math.abs(quantity), // ⭐ Negative for OUT
    'OUT', // ⭐ Move type: OUT
    'invoice', // ⭐ Reference type
    invoiceId, // ⭐ Reference ID
    `Sale - Invoice #${invoiceId}`, // Reason
    branchId,
    userId,
    false, // No approval required for sales
  );
}
```

**Usage:**
- เรียกจาก InvoicesService เมื่อสร้าง invoice
- ต้องตัดสต็อคทันที

**Estimated Time:** 0.5 hours

---

##### 1.3.3 receive() - Receive Stock ⭐ CRITICAL
**Purpose:** รับสต็อคเข้า (ใช้ใน GRN, Receive)

**Flow:**
```typescript
async receive(
  productId: number,
  quantity: number,
  reason: string,
  branchId: number,
  userId: number,
  referenceType: string = 'receive',
  referenceId: number | null = null,
  requireApproval: boolean = false,
): Promise<StockMove> {
  return this.move(
    productId,
    Math.abs(quantity), // ⭐ Positive for IN
    'IN', // ⭐ Move type: IN
    referenceType, // 'grn', 'receive', etc.
    referenceId,
    reason,
    branchId,
    userId,
    requireApproval,
  );
}
```

**Usage:**
- เรียกจาก GRNService เมื่อสร้าง GRN
- เรียกจาก InventoryController เมื่อ receive stock

**Estimated Time:** 0.5 hours

---

##### 1.3.4 returnStock() - Return Stock ⭐ CRITICAL
**Purpose:** คืนสต็อค (ใช้ใน Invoice void/refund)

**Flow:**
```typescript
async returnStock(
  productId: number,
  quantity: number,
  invoiceId: number,
  branchId: number,
  userId: number,
  reason: string,
): Promise<StockMove> {
  return this.move(
    productId,
    Math.abs(quantity), // ⭐ Positive for IN (return)
    'IN', // ⭐ Move type: IN
    'invoice', // ⭐ Reference type
    invoiceId, // ⭐ Reference ID
    reason, // e.g., "Void invoice: reason"
    branchId,
    userId,
    false, // No approval required for returns
  );
}
```

**Usage:**
- เรียกจาก InvoicesService เมื่อ void/refund invoice
- ต้องคืนสต็อคทันที

**Estimated Time:** 0.5 hours

---

##### 1.3.5 adjust() - Adjust Stock
**Purpose:** ปรับสต็อค (ใช้ใน Stock Adjustment)

**Flow:**
```typescript
async adjust(
  productId: number,
  quantity: number, // Can be positive or negative
  reason: string,
  branchId: number,
  userId: number,
  referenceType: string = 'adjustment',
  referenceId: number | null = null,
  requireApproval: boolean = true,
): Promise<StockMove> {
  return this.move(
    productId,
    quantity, // ⭐ Can be positive or negative
    'ADJUST', // ⭐ Move type: ADJUST
    referenceType,
    referenceId,
    reason,
    branchId,
    userId,
    requireApproval, // ⭐ Usually requires approval
  );
}
```

**Usage:**
- เรียกจาก StockAdjustmentService เมื่อ approve adjustment

**Estimated Time:** 0.5 hours

---

##### 1.3.6 getBalance() - Get Stock Balance ⭐ CRITICAL
**Purpose:** ดึงสต็อคปัจจุบัน (ใช้ใน ProductsService)

**Flow:**
```typescript
async getBalance(
  productId: number,
  branchId: number,
): Promise<StockBalance | null> {
  return this.stockBalanceRepository.findOne({
    where: {
      product_id: productId,
      branch_id: branchId,
    },
  });
}
```

**Usage:**
- เรียกจาก ProductsService เพื่อแสดง stock
- เรียกจาก POS เพื่อแสดง stock
- เรียกจาก InvoicesService เพื่อ check stock

**Estimated Time:** 0.5 hours

---

##### 1.3.7 getMoves() - Get Stock Movements
**Purpose:** ดึงประวัติการเคลื่อนไหวสต็อค

**Flow:**
```typescript
async getMoves(filters: {
  productId?: number;
  branchId?: number;
  moveType?: string;
  referenceType?: string;
  referenceId?: number;
  dateFrom?: Date;
  dateTo?: Date;
}): Promise<StockMove[]> {
  const queryBuilder = this.stockMoveRepository
    .createQueryBuilder('move')
    .leftJoinAndSelect('move.product', 'product')
    .leftJoinAndSelect('move.branch', 'branch')
    .leftJoinAndSelect('move.createdBy', 'createdBy');

  if (filters.productId) {
    queryBuilder.andWhere('move.product_id = :productId', {
      productId: filters.productId,
    });
  }

  if (filters.branchId) {
    queryBuilder.andWhere('move.branch_id = :branchId', {
      branchId: filters.branchId,
    });
  }

  if (filters.moveType) {
    queryBuilder.andWhere('move.move_type = :moveType', {
      moveType: filters.moveType,
    });
  }

  if (filters.dateFrom) {
    queryBuilder.andWhere('move.created_at >= :dateFrom', {
      dateFrom: filters.dateFrom,
    });
  }

  if (filters.dateTo) {
    queryBuilder.andWhere('move.created_at <= :dateTo', {
      dateTo: filters.dateTo,
    });
  }

  return queryBuilder
    .orderBy('move.created_at', 'DESC')
    .getMany();
}
```

**Estimated Time:** 1 hour

---

#### 1.4 Create Inventory Module
**File:** `src/inventory/inventory.module.ts`

**Module Configuration:**
```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([StockBalance, StockMove, Product, Branch]),
    FeatureTogglesModule, // For negative stock check
  ],
  providers: [InventoryService],
  exports: [InventoryService], // ⭐ Export for other modules
  controllers: [InventoryController],
})
export class InventoryModule {}
```

**Important:** ⭐ **ต้อง export InventoryService** เพื่อให้ modules อื่นใช้ได้

**Estimated Time:** 0.5 hours

---

#### 1.5 Create Inventory Controller
**File:** `src/inventory/inventory.controller.ts`

**Endpoints Required:**
```typescript
GET    /api/inventory/balance        // Get stock balance
GET    /api/inventory/moves          // Get stock movements
POST   /api/inventory/receive        // Receive stock
POST   /api/inventory/adjust         // Adjust stock
POST   /api/inventory/transfer       // Transfer stock
POST   /api/inventory/approve        // Approve stock move
```

**Estimated Time:** 2 hours

---

## 🔄 Integration Flow Diagrams

### Flow 1: ProductsService → InventoryService.getBalance()
```
Products Service.findOne(id, branchId)
  ↓
Inventory Service.getBalance(productId, branchId)
  ↓
StockBalance Repository.findOne()
  ↓
Return balance.quantity
  ↓
Products Service returns product + stock_quantity
```

### Flow 2: InvoicesService → InventoryService.sale()
```
Invoices Service.create()
  ↓
For each item:
  └─→ Inventory Service.sale(productId, quantity, invoiceId, branchId, userId)
      ↓
      └─→ Inventory Service.move()
          ↓
          ├─→ Lock StockBalance (row-level lock)
          ├─→ Calculate balance_after
          ├─→ Check negative stock
          ├─→ UPDATE stock_balances
          └─→ INSERT stock_moves
      ↓
      Return StockMove
  ↓
Commit transaction
```

---

## 📊 Database Relationships

### StockBalance ↔ StockMove ↔ Product
```sql
products (id)
  ↓
stock_balances (product_id, branch_id, quantity)
  ↓
stock_moves (product_id, branch_id, move_type, quantity, reference_type, reference_id)
```

**TypeORM Relations:**
```typescript
// Product Entity
@OneToMany(() => StockBalance, (balance) => balance.product)
stockBalances: StockBalance[];

// StockBalance Entity
@ManyToOne(() => Product, (product) => product.stockBalances)
product: Product;

@OneToMany(() => StockMove, (move) => move.balance)
moves: StockMove[];

// StockMove Entity
@ManyToOne(() => StockBalance, (balance) => balance.moves)
balance: StockBalance;

@ManyToOne(() => Product)
product: Product;
```

---

## ✅ Acceptance Criteria (Detailed)

### InventoryService
- ✅ move() method works correctly
- ✅ sale() deducts stock correctly ⭐
- ✅ receive() adds stock correctly ⭐
- ✅ returnStock() returns stock correctly ⭐
- ✅ getBalance() returns correct balance ⭐
- ✅ Transaction rollback on error ⭐
- ✅ Row-level locking works ⭐
- ✅ Negative stock guard works ⭐

### Integration Points
- ✅ ProductsService can use InventoryService.getBalance() ⭐
- ✅ InvoicesService can use InventoryService.sale() ⭐
- ✅ InvoicesService can use InventoryService.returnStock() ⭐

---

## 🧪 Testing Checklist (Detailed)

### InventoryService Tests
- [ ] move() updates stock_balances correctly
- [ ] move() creates stock_moves record
- [ ] move() uses transaction (rollback on error)
- [ ] move() uses row-level locking
- [ ] sale() deducts stock correctly
- [ ] receive() adds stock correctly
- [ ] returnStock() returns stock correctly
- [ ] getBalance() returns correct balance
- [ ] Negative stock guard works
- [ ] Concurrent operations handled correctly

### Integration Tests
- [ ] ProductsService.getBalance() works
- [ ] InvoicesService.sale() works
- [ ] InvoicesService.returnStock() works
- [ ] Stock updates correctly after operations

---

## 📝 Code Examples

### InventoryService.move() - Complete Implementation
```typescript
@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(StockBalance)
    private stockBalanceRepository: Repository<StockBalance>,
    @InjectRepository(StockMove)
    private stockMoveRepository: Repository<StockMove>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Branch)
    private branchRepository: Repository<Branch>,
    private featureService: FeatureService,
    private dataSource: DataSource,
  ) {}

  async move(
    productId: number,
    quantity: number,
    moveType: 'OUT' | 'IN' | 'ADJUST' | 'TRANSFER',
    referenceType: string,
    referenceId: number | null,
    reason: string | null,
    branchId: number,
    userId: number,
    requireApproval: boolean = false,
  ): Promise<StockMove> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate product
      const product = await this.productRepository.findOne({
        where: { id: productId },
      });
      if (!product) {
        throw new NotFoundException(`Product ${productId} not found`);
      }

      // Validate branch
      const branch = await this.branchRepository.findOne({
        where: { id: branchId },
      });
      if (!branch) {
        throw new NotFoundException(`Branch ${branchId} not found`);
      }

      // Get or create balance with lock ⭐
      const balance = await queryRunner.manager
        .createQueryBuilder(StockBalance, 'balance')
        .setLock('pessimistic_write') // ⭐ Row-level lock
        .where('balance.product_id = :productId', { productId })
        .andWhere('balance.branch_id = :branchId', { branchId })
        .getOne();

      let stockBalance: StockBalance;
      if (!balance) {
        stockBalance = queryRunner.manager.create(StockBalance, {
          product_id: productId,
          branch_id: branchId,
          quantity: 0,
          reserved_quantity: 0,
        });
      } else {
        stockBalance = balance;
      }

      // Calculate new balance
      const balanceBefore = stockBalance.quantity;
      const balanceAfter = balanceBefore + quantity;

      // Check negative stock ⭐
      const allowNegative = await this.featureService.isEnabled(
        'inventory.negative_stock',
        userId,
        branchId,
      );
      if (!allowNegative && balanceAfter < 0) {
        throw new BadRequestException(
          `Insufficient stock. Available: ${balanceBefore}, Required: ${Math.abs(quantity)}`,
        );
      }

      // Update balance ⭐
      stockBalance.quantity = balanceAfter;
      stockBalance.last_moved_at = new Date();
      await queryRunner.manager.save(stockBalance);

      // Create move record ⭐
      const stockMove = queryRunner.manager.create(StockMove, {
        product_id: productId,
        branch_id: branchId,
        move_type: moveType,
        quantity: quantity,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        reference_type: referenceType,
        reference_id: referenceId,
        reason: reason,
        created_by: userId,
        status: requireApproval ? 'pending' : 'approved',
      });
      await queryRunner.manager.save(stockMove);

      await queryRunner.commitTransaction();
      return stockMove;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
```

---

## 🚨 Common Issues & Solutions

### Issue 1: Race Condition (Concurrent Sales)
**Solution:**
- Use row-level locking (pessimistic_write)
- Use transactions
- Lock stock_balance row before update

### Issue 2: Stock Not Updated
**Solution:**
- Check transaction is committed
- Check move() method is called
- Check stock_moves record is created
- Check stock_balances is updated

### Issue 3: Negative Stock Allowed
**Solution:**
- Check negative stock guard
- Check feature toggle 'inventory.negative_stock'
- Verify balance calculation

---

## 📊 Progress Tracking

### Week 5
- **Day 1:** StockBalance + StockMove entities
- **Day 2:** InventoryService.move() method ⭐
- **Day 3:** InventoryService methods (sale, receive, returnStock, adjust)
- **Day 4:** InventoryService.getBalance() + getMoves()
- **Day 5:** Inventory module + controller

### Week 6
- **Day 1:** Sequence generators
- **Day 2:** GRN module
- **Day 3:** Stock Adjustment module
- **Day 4:** Stock Transfer module
- **Day 5:** Testing + integration

---

## 🎯 Definition of Done

Phase 3 is complete when:
- ✅ InventoryService.move() working correctly ⭐
- ✅ InventoryService.sale() working correctly ⭐
- ✅ InventoryService.getBalance() working correctly ⭐
- ✅ **ProductsService can use InventoryService** ⭐
- ✅ **InvoicesService can use InventoryService** ⭐
- ✅ Transaction safety working ⭐
- ✅ Row-level locking working ⭐
- ✅ All tests passing
- ✅ Documentation updated
- ✅ Ready for Phase 4

---

## 🔗 Related Documents

- `../docs/INTEGRATION_POINTS.md` - Integration points reference
- `PHASE_2_CORE_MODULES_DETAILED.md` - Products integration
- `PHASE_4_SALES_DETAILED.md` - Invoice integration

---

## ⏭️ Next Phase

After completing Phase 3, proceed to:
**Phase 4: Sales & POS** (`PHASE_4_SALES_DETAILED.md`)

**Important:** Phase 4 จะใช้ InventoryService ที่สร้างใน Phase 3

---

**Status:** ⏸️ Pending  
**Ready to Start:** After Phase 2 complete  
**Blockers:** None

**⭐ Key Integration Points:**
- InventoryService ↔ ProductsService (stock queries)
- InventoryService ↔ InvoicesService (stock deduction/return)

