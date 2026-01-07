# 💰 Phase 4: Sales & POS (Detailed)

**Duration:** Week 7-8  
**Status:** ⏸️ Pending  
**Priority:** 🔴 Critical  
**Depends on:** Phase 3 (Inventory must be complete)

---

## 🎯 เป้าหมาย

Migrate POS and sales system: POS operations, Invoice creation, Receipt generation, Void/Refund functionality

**สำคัญ:** POS ต้องโยงกับ Products และ Inventory เพื่อตัดสต็อคอัตโนมัติ

---

## 🔗 System Integration Points

### 1. POS ↔ Products ↔ Inventory Integration ⭐ CRITICAL
**ความสำคัญ:** เมื่อขายสินค้า ต้องตัดสต็อคทันที

**Integration Flow:**
```
POS Cart
  ↓ (checkout)
Invoices Service.create()
  ↓
For each cart item:
  ├─→ Create invoice_item
  └─→ InventoryService.sale(productId, quantity, invoiceId) ⭐
      ↓
      └─→ InventoryService.move() [Deduct stock]
          ↓
          ├─→ UPDATE stock_balances (quantity - qty)
          └─→ INSERT stock_moves (move_type='OUT', reference_type='invoice')
  ↓
Commit transaction (all or nothing)
```

**Critical Rules:**
- ⭐ **ต้องตัดสต็อคทันทีเมื่อสร้าง invoice**
- ⭐ **ต้องใช้ transaction (rollback ถ้า fail)**
- ⭐ **ต้องตรวจสอบสต็อคก่อนขาย (ถ้าไม่ให้ติดลบ)**

---

### 2. POS ↔ Products Integration (Scan)
**ความสำคัญ:** POS ต้องสแกนสินค้าและแสดงสต็อคได้

**Integration Flow:**
```
POS Scanner → Barcode
  ↓
POS Controller.scan(barcode)
  ↓
Products Service.findByBarcode(barcode, branchId)
  ↓
  ├─→ Get product from database
  └─→ Get stock from InventoryService.getBalance() ⭐
  ↓
Return product + stock_quantity
  ↓
POS displays product with stock
```

**Critical Rules:**
- ⭐ **ต้องแสดงสต็อคปัจจุบัน**
- ⭐ **ต้องแสดงเฉพาะสินค้าที่ active**
- ⭐ **ต้องใช้ branch_id จาก context**

---

### 3. Invoice ↔ Inventory Integration (Void/Refund)
**ความสำคัญ:** เมื่อ void/refund ต้องคืนสต็อค

**Integration Flow:**
```
Invoice Void/Refund
  ↓
Invoices Service.void() or refund()
  ↓
For each invoice_item:
  └─→ InventoryService.returnStock(productId, quantity, invoiceId) ⭐
      ↓
      └─→ InventoryService.move() [Return stock]
          ↓
          ├─→ UPDATE stock_balances (quantity + qty)
          └─→ INSERT stock_moves (move_type='IN', reference_type='invoice')
  ↓
Update invoice status
```

**Critical Rules:**
- ⭐ **ต้องคืนสต็อคเมื่อ void/refund**
- ⭐ **ต้องมีเหตุผล (required)**
- ⭐ **ต้องบันทึก audit log**

---

## 📋 Tasks Checklist (Detailed)

### 1. POS Module

#### 1.1 Create POS Service
**File:** `src/pos/pos.service.ts`

**Dependencies:**
- Inject ProductsService ⭐
- Inject InventoryService ⭐ (for stock checks)

**Methods Required:**
- [ ] `scanBarcode(barcode, branchId)` - Scan barcode
  - Call ProductsService.findByBarcode()
  - Return product with stock_quantity ⭐
  - Return null if not found
- [ ] `quickCreateProduct(dto)` - Quick create product
  - Call ProductsService.create()
  - Return product with stock_quantity = 0

**Integration Points:**
- ⭐ **scanBarcode() ต้อง return stock_quantity**
- ⭐ **ต้องใช้ branchId จาก context**

**Estimated Time:** 2 hours

---

#### 1.2 Create POS Controller
**File:** `src/pos/pos.controller.ts`

**Endpoints Required:**
```typescript
GET  /api/pos/scan?barcode=xxx
POST /api/pos/scan (body: { barcode })
POST /api/pos/quick-create (body: { barcode, name, selling_price, ... })
```

**Flow for Scan:**
```typescript
@Get('scan')
async scan(@Query('barcode') barcode: string, @Req() req: any) {
  const branchId = req.user.branch_id; // ⭐ Get branch from context
  
  const product = await this.posService.scanBarcode(barcode, branchId);
  
  if (!product) {
    return {
      success: false,
      not_found: true,
      barcode,
    };
  }
  
  return {
    success: true,
    product: {
      id: product.id,
      barcode: product.barcode,
      name: product.name,
      selling_price: product.selling_price,
      stock_quantity: product.stock_quantity, // ⭐ Include stock
      unit: product.unit?.name,
    },
  };
}
```

**Guards Required:**
- JwtAuthGuard
- PermissionsGuard with 'pos.sale' or 'pos.access'

**Estimated Time:** 2 hours

---

### 2. Invoices Module (Detailed)

#### 2.1 Create Invoice Entity
**File:** `src/database/entities/invoice.entity.ts`

**Requirements:**
- [ ] Extends BaseEntity
- [ ] Has invoice_no (unique)
- [ ] Has branch_id (FK to branches)
- [ ] Has user_id (FK to users)
- [ ] Has customer_name, customer_phone
- [ ] Has subtotal, discount_amount, total_amount
- [ ] Has paid_amount, change_amount
- [ ] Has payment_method, payment_details (JSON)
- [ ] Has status (draft, completed, voided, refunded)
- [ ] Has voided_by, voided_at, voided_reason
- [ ] Has refunded_by, refunded_at, refunded_reason

**Relations:**
```typescript
@ManyToOne(() => Branch)
branch: Branch;

@ManyToOne(() => User)
user: User;

@OneToMany(() => InvoiceItem, (item) => item.invoice)
items: InvoiceItem[];
```

**Estimated Time:** 1 hour

---

#### 2.2 Create InvoiceItem Entity
**File:** `src/database/entities/invoice-item.entity.ts`

**Requirements:**
- [ ] Extends BaseEntity
- [ ] Has invoice_id (FK to invoices)
- [ ] Has product_id (FK to products)
- [ ] Has product_name, barcode (snapshot)
- [ ] Has quantity, unit_price
- [ ] Has discount_amount, subtotal

**Relations:**
```typescript
@ManyToOne(() => Invoice, (invoice) => invoice.items)
invoice: Invoice;

@ManyToOne(() => Product)
product: Product;
```

**Estimated Time:** 1 hour

---

#### 2.3 Create Invoices Service
**File:** `src/invoices/invoices.service.ts`

**Dependencies:**
- Inject InvoiceRepository
- Inject InvoiceItemRepository
- Inject ProductRepository (for validation)
- Inject InventoryService ⭐ **CRITICAL**
- Inject InvoiceSequenceService (for invoice number)

**Methods Required:**

##### 2.3.1 create() - Create Invoice ⭐ CRITICAL
**Flow:**
```typescript
async create(dto: CreateInvoiceDto, userId: number, branchId: number) {
  // 1. Start transaction
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // 2. Generate invoice number
    const invoiceNo = await this.invoiceSequenceService.generate(branchId);

    // 3. Calculate totals
    let subtotal = 0;
    for (const item of dto.items) {
      // Validate product exists
      const product = await this.productRepository.findOne({
        where: { id: item.product_id },
      });
      if (!product) {
        throw new NotFoundException(`Product ${item.product_id} not found`);
      }

      // ⭐ Check stock availability
      const balance = await this.inventoryService.getBalance(
        item.product_id,
        branchId,
      );
      if (balance.quantity < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product ${product.name}. Available: ${balance.quantity}, Required: ${item.quantity}`,
        );
      }

      // Calculate item subtotal
      const itemSubtotal =
        item.quantity * item.unit_price - (item.discount_amount || 0);
      subtotal += itemSubtotal;
    }

    const totalAmount = subtotal - (dto.discount_amount || 0);

    // 4. Create invoice
    const invoice = this.invoiceRepository.create({
      invoice_no: invoiceNo,
      branch_id: branchId,
      user_id: userId,
      customer_name: dto.customer_name,
      customer_phone: dto.customer_phone,
      subtotal,
      discount_amount: dto.discount_amount || 0,
      total_amount: totalAmount,
      paid_amount: dto.paid_amount || totalAmount,
      change_amount: (dto.paid_amount || totalAmount) - totalAmount,
      payment_method: dto.payment_method || 'cash',
      payment_details: dto.payment_details,
      notes: dto.notes,
      status: 'completed',
    });
    await queryRunner.manager.save(invoice);

    // 5. Create invoice items AND deduct stock ⭐ CRITICAL
    for (const item of dto.items) {
      const product = await this.productRepository.findOne({
        where: { id: item.product_id },
      });

      // Create invoice item
      const invoiceItem = this.invoiceItemRepository.create({
        invoice_id: invoice.id,
        product_id: item.product_id,
        product_name: product.name,
        barcode: product.barcode,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_amount: item.discount_amount || 0,
        subtotal:
          item.quantity * item.unit_price - (item.discount_amount || 0),
      });
      await queryRunner.manager.save(invoiceItem);

      // ⭐ Deduct stock (CRITICAL)
      await this.inventoryService.sale(
        item.product_id,
        item.quantity,
        invoice.id,
        branchId,
      );
    }

    // 6. Commit transaction
    await queryRunner.commitTransaction();

    // 7. Return invoice with items
    return this.findOne(invoice.id);
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
- ⭐ **ต้องตรวจสอบสต็อคก่อนขาย**
- ⭐ **ต้องตัดสต็อคทันทีเมื่อสร้าง invoice**
- ⭐ **ต้อง rollback ถ้า fail**

**Estimated Time:** 4 hours

---

##### 2.3.2 void() - Void Invoice ⭐ CRITICAL
**Flow:**
```typescript
async void(invoiceId: number, reason: string, userId: number) {
  const invoice = await this.findOne(invoiceId);

  if (invoice.status !== 'completed') {
    throw new BadRequestException('Only completed invoices can be voided');
  }

  if (!reason || reason.trim().length === 0) {
    throw new BadRequestException('Reason is required for void');
  }

  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // 1. Return stock for each item ⭐ CRITICAL
    for (const item of invoice.items) {
      await this.inventoryService.returnStock(
        item.product_id,
        item.quantity,
        invoice.id,
        invoice.branch_id,
        `Void invoice ${invoice.invoice_no}: ${reason}`,
      );
    }

    // 2. Update invoice status
    invoice.status = 'voided';
    invoice.voided_by = userId;
    invoice.voided_at = new Date();
    invoice.voided_reason = reason;
    await queryRunner.manager.save(invoice);

    // 3. Commit transaction
    await queryRunner.commitTransaction();

    // 4. Audit log
    await this.auditLogService.log({
      action: 'void',
      entity_type: 'invoice',
      entity_id: invoice.id,
      description: `Voided invoice ${invoice.invoice_no}: ${reason}`,
      user_id: userId,
      branch_id: invoice.branch_id,
    });

    return this.findOne(invoice.id);
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}
```

**Critical Points:**
- ⭐ **ต้องคืนสต็อคทุก item**
- ⭐ **ต้องมีเหตุผล (required)**
- ⭐ **ต้องใช้ transaction**

**Estimated Time:** 2 hours

---

##### 2.3.3 refund() - Refund Invoice ⭐ CRITICAL
**Flow:** Similar to void(), but with refund-specific logic

**Critical Points:**
- ⭐ **ต้องคืนสต็อคทุก item**
- ⭐ **ต้องมีเหตุผล (required)**
- ⭐ **ต้องใช้ transaction**

**Estimated Time:** 2 hours

---

#### 2.4 Create Invoices Controller
**File:** `src/invoices/invoices.controller.ts`

**Endpoints Required:**
```typescript
GET    /api/invoices              // List invoices
GET    /api/invoices/:id          // Get invoice with items
POST   /api/invoices              // Create invoice ⭐ CRITICAL
PUT    /api/invoices/:id          // Update invoice
POST   /api/invoices/:id/void     // Void invoice ⭐ CRITICAL
POST   /api/invoices/:id/refund   // Refund invoice ⭐ CRITICAL
```

**Critical Endpoint: POST /api/invoices**
```typescript
@Post()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions('pos.sale', 'invoice.create')
async create(@Body() dto: CreateInvoiceDto, @Req() req: any) {
  const userId = req.user.id;
  const branchId = req.user.branch_id; // ⭐ Get branch from context

  return this.invoicesService.create(dto, userId, branchId);
}
```

**Guards Required:**
- JwtAuthGuard (all endpoints)
- PermissionsGuard with 'pos.sale' or 'invoice.create' (POST)
- PermissionsGuard with 'pos.void' (void endpoint)
- PermissionsGuard with 'pos.refund' (refund endpoint)

**DTOs Required:**
- CreateInvoiceDto (items[], customer_name, customer_phone, discount_amount, paid_amount, payment_method, notes)
- InvoiceItemDto (product_id, quantity, unit_price, discount_amount)
- VoidRefundDto (reason)

**Estimated Time:** 2 hours

---

## 🔄 Integration Flow Diagrams

### Flow 1: POS Checkout → Create Invoice → Deduct Stock
```
User clicks "Checkout"
  ↓
POS sends cart items to /api/invoices (POST)
  ↓
Invoices Controller.create()
  ↓
Invoices Service.create()
  ↓
Start Transaction
  ↓
Generate invoice number
  ↓
For each cart item:
  ├─→ Validate product exists
  ├─→ ⭐ Check stock availability (InventoryService.getBalance())
  ├─→ Create invoice_item
  └─→ ⭐ Deduct stock (InventoryService.sale())
      ↓
      └─→ InventoryService.move()
          ↓
          ├─→ UPDATE stock_balances (quantity - qty)
          └─→ INSERT stock_moves (move_type='OUT', reference_type='invoice')
  ↓
Create invoice record
  ↓
Commit Transaction
  ↓
Return invoice with items
```

**Critical Points:**
- ⭐ **Transaction: All or nothing**
- ⭐ **Stock check before sale**
- ⭐ **Stock deduction immediately**

---

### Flow 2: Void Invoice → Return Stock
```
User clicks "Void Invoice"
  ↓
Invoices Controller.void()
  ↓
Invoices Service.void()
  ↓
Start Transaction
  ↓
For each invoice_item:
  └─→ ⭐ Return stock (InventoryService.returnStock())
      ↓
      └─→ InventoryService.move()
          ↓
          ├─→ UPDATE stock_balances (quantity + qty)
          └─→ INSERT stock_moves (move_type='IN', reference_type='invoice')
  ↓
Update invoice status = 'voided'
  ↓
Commit Transaction
  ↓
Return updated invoice
```

**Critical Points:**
- ⭐ **Return stock for all items**
- ⭐ **Transaction: All or nothing**

---

## 📊 Database Relationships

### Invoice ↔ InvoiceItem ↔ Product ↔ StockBalance
```sql
invoices (id, invoice_no, branch_id, ...)
  ↓
invoice_items (invoice_id, product_id, quantity, ...)
  ↓
products (id, name, ...)
  ↓
stock_balances (product_id, branch_id, quantity)
  ↓
stock_moves (product_id, branch_id, move_type, reference_type='invoice', reference_id=invoice_id)
```

**TypeORM Relations:**
```typescript
// Invoice Entity
@OneToMany(() => InvoiceItem, (item) => item.invoice)
items: InvoiceItem[];

// InvoiceItem Entity
@ManyToOne(() => Invoice, (invoice) => invoice.items)
invoice: Invoice;

@ManyToOne(() => Product)
product: Product;

// Product Entity
@OneToMany(() => InvoiceItem, (item) => item.product)
invoiceItems: InvoiceItem[];
```

---

## ✅ Acceptance Criteria (Detailed)

### POS Module
- ✅ POS scan returns product + stock_quantity
- ✅ POS quick create works
- ✅ Stock quantity displayed in real-time

### Invoices Module
- ✅ Invoice creation deducts stock immediately ⭐
- ✅ Stock check before sale ⭐
- ✅ Transaction rollback on error ⭐
- ✅ Void invoice returns stock ⭐
- ✅ Refund invoice returns stock ⭐
- ✅ Stock movements recorded correctly ⭐

### Integration Points
- ✅ POS ↔ Products ↔ Inventory: Working ⭐
- ✅ Invoice ↔ Inventory: Working ⭐
- ✅ Void/Refund ↔ Inventory: Working ⭐

---

## 🧪 Testing Checklist (Detailed)

### POS Tests
- [ ] Scan barcode returns product + stock
- [ ] Scan non-existent barcode returns not_found
- [ ] Stock quantity updates in real-time
- [ ] Quick create product works

### Invoice Creation Tests
- [ ] Create invoice deducts stock ⭐
- [ ] Stock check prevents sale if insufficient ⭐
- [ ] Transaction rollback on error ⭐
- [ ] Stock movements recorded correctly ⭐
- [ ] Multiple items handled correctly ⭐

### Void/Refund Tests
- [ ] Void invoice returns stock ⭐
- [ ] Refund invoice returns stock ⭐
- [ ] Stock movements recorded correctly ⭐
- [ ] Reason required for void/refund ⭐

### Integration Tests
- [ ] Complete POS flow (scan → checkout → stock deducted)
- [ ] Void flow (void → stock returned)
- [ ] Refund flow (refund → stock returned)
- [ ] Concurrent sales (race condition handling)

---

## 📝 Code Examples

### Invoice Creation with Stock Deduction
```typescript
@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private invoiceItemRepository: Repository<InvoiceItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private inventoryService: InventoryService, // ⭐ Inject InventoryService
    private invoiceSequenceService: InvoiceSequenceService,
    private dataSource: DataSource,
  ) {}

  async create(dto: CreateInvoiceDto, userId: number, branchId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Generate invoice number
      const invoiceNo = await this.invoiceSequenceService.generate(branchId);

      // Calculate totals and validate stock ⭐
      let subtotal = 0;
      for (const item of dto.items) {
        const product = await this.productRepository.findOne({
          where: { id: item.product_id },
        });
        if (!product) {
          throw new NotFoundException(`Product ${item.product_id} not found`);
        }

        // ⭐ Check stock availability
        const balance = await this.inventoryService.getBalance(
          item.product_id,
          branchId,
        );
        if (balance.quantity < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for ${product.name}. Available: ${balance.quantity}, Required: ${item.quantity}`,
          );
        }

        subtotal += item.quantity * item.unit_price - (item.discount_amount || 0);
      }

      // Create invoice
      const invoice = await queryRunner.manager.save(
        this.invoiceRepository.create({
          invoice_no: invoiceNo,
          branch_id: branchId,
          user_id: userId,
          // ... other fields
        }),
      );

      // Create items and deduct stock ⭐
      for (const item of dto.items) {
        // Create invoice item
        await queryRunner.manager.save(
          this.invoiceItemRepository.create({
            invoice_id: invoice.id,
            product_id: item.product_id,
            quantity: item.quantity,
            // ... other fields
          }),
        );

        // ⭐ Deduct stock
        await this.inventoryService.sale(
          item.product_id,
          item.quantity,
          invoice.id,
          branchId,
        );
      }

      await queryRunner.commitTransaction();
      return this.findOne(invoice.id);
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

### Issue 1: Stock Not Deducted After Sale
**Solution:**
- Check InventoryService.sale() is called
- Check transaction is committed
- Check stock_moves record is created
- Check stock_balances is updated

### Issue 2: Stock Deducted But Invoice Not Created
**Solution:**
- Check transaction is used
- Check rollback on error
- Check error handling

### Issue 3: Race Condition (Concurrent Sales)
**Solution:**
- Use database transactions
- Use row-level locking in InventoryService
- Check stock before deducting

---

## 📊 Progress Tracking

### Week 7
- **Day 1:** POS module (scan + quick create)
- **Day 2:** Invoice entities + service (create method)
- **Day 3:** Invoice service (void + refund methods)
- **Day 4:** Invoice controller + receipt generation
- **Day 5:** Testing + integration

### Week 8
- **Day 1:** Payment processing
- **Day 2:** Testing + bug fixes
- **Day 3:** Documentation
- **Day 4:** Code review
- **Day 5:** Phase 4 completion review

---

## 🎯 Definition of Done

Phase 4 is complete when:
- ✅ POS working
- ✅ Invoice creation working
- ✅ **Stock deduction working** ⭐
- ✅ **Void/Refund returning stock** ⭐
- ✅ **Transaction safety working** ⭐
- ✅ Receipt generation working
- ✅ All tests passing
- ✅ Documentation updated
- ✅ Ready for Phase 5

---

## 🔗 Related Documents

- `../docs/CODE_EXAMPLES.md` - Code examples
- `../MASTER_PLAN.md` - Overall plan
- `PHASE_3_INVENTORY.md` - Previous phase (Inventory details)
- `PHASE_2_CORE_MODULES_DETAILED.md` - Products integration

---

## ⏭️ Next Phase

After completing Phase 4, proceed to:
**Phase 5: Additional Modules** (`PHASE_5_ADDITIONAL.md`)

---

**Status:** ⏸️ Pending  
**Ready to Start:** After Phase 3 complete  
**Blockers:** None

**⭐ Key Integration Points:**
- POS ↔ Products ↔ Inventory (scan + stock display)
- Invoice ↔ Inventory (stock deduction on sale)
- Void/Refund ↔ Inventory (stock return)

