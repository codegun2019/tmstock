# 🔒 Key Points - System Integrity & Linking

**วันที่สร้าง:** 2025-01-XX  
**Version:** 5.0  
**สถานะ:** 📋 Critical Rules Document

---

## 🎯 วัตถุประสงค์

เอกสารนี้อธิบาย Key Points ที่ทำให้ระบบลิงก์แน่นและไม่บัค

**สำคัญ:** ทุก rule ในเอกสารนี้ต้องปฏิบัติตามอย่างเคร่งครัด

---

## 🔒 Critical Rules

### Rule 1: ตัดสต็อคเฉพาะตอน PAID ⭐ CRITICAL

**Rule:** ตัดสต็อคเฉพาะเมื่อ invoice status = 'completed' หรือ 'paid'

**Implementation:**
```typescript
// InvoicesService.create()
async create(dto: CreateInvoiceDto, userId: number, branchId: number) {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.startTransaction();

  try {
    // Create invoice with status = 'completed' (paid immediately in POS)
    const invoice = await queryRunner.manager.save({
      // ... invoice data
      status: 'completed', // ⭐ Status = completed means paid
    });

    // ⭐ Only deduct stock if status = 'completed'
    if (invoice.status === 'completed') {
      for (const item of dto.items) {
        await this.inventoryService.sale(
          item.product_id,
          item.quantity,
          invoice.id,
          branchId,
          userId,
        );
      }
    }

    await queryRunner.commitTransaction();
    return invoice;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  }
}
```

**Why:**
- ป้องกันการตัดสต็อคก่อนชำระเงิน
- รองรับ draft invoices (ถ้ามี)
- ป้องกันสต็อคหาย

**Status Flow:**
```
draft → completed (paid) → stock deducted
draft → cancelled → no stock deduction
```

---

### Rule 2: Hard Check ด้วย Lock ก่อนตัดจริง ⭐ CRITICAL

**Rule:** ต้องใช้ row-level lock ก่อนตัดสต็อค

**Implementation:**
```typescript
// InventoryService.move()
async move(...) {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.startTransaction();

  try {
    // ⭐ Lock stock_balance row BEFORE checking/updating
    const balance = await queryRunner.manager
      .createQueryBuilder(StockBalance, 'balance')
      .setLock('pessimistic_write') // ⭐ Row-level lock
      .where('balance.product_id = :productId', { productId })
      .andWhere('balance.branch_id = :branchId', { branchId })
      .getOne();

    // Now check stock availability
    if (balance.quantity < requiredQuantity) {
      throw new BadRequestException('Insufficient stock');
    }

    // Update stock
    balance.quantity = balance.quantity - requiredQuantity;
    await queryRunner.manager.save(balance);

    await queryRunner.commitTransaction();
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  }
}
```

**Why:**
- ป้องกัน race condition
- ป้องกัน concurrent sales ทำให้สต็อคติดลบ
- ป้องกัน double deduction

**Lock Flow:**
```
Transaction 1: Lock row → Check → Update → Commit
Transaction 2: Wait for lock → Check → Update → Commit
```

---

### Rule 3: ตัดสต็อค + Insert Movement + Update Status ใน Transaction เดียว ⭐ CRITICAL

**Rule:** ทุกการเปลี่ยนสต็อคต้องอยู่ใน transaction เดียว

**Implementation:**
```typescript
// InventoryService.move()
async move(...) {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.startTransaction(); // ⭐ Start transaction

  try {
    // 1. Lock and update stock_balance
    const balance = await queryRunner.manager
      .createQueryBuilder(StockBalance, 'balance')
      .setLock('pessimistic_write')
      .where(/* ... */)
      .getOne();

    balance.quantity = balanceAfter;
    await queryRunner.manager.save(balance); // ⭐ Update balance

    // 2. Create stock_move record
    const stockMove = queryRunner.manager.create(StockMove, {
      // ... move data
    });
    await queryRunner.manager.save(stockMove); // ⭐ Insert movement

    // 3. Update invoice status (if needed)
    if (referenceType === 'invoice') {
      await queryRunner.manager.update(Invoice, referenceId, {
        status: 'completed', // ⭐ Update status
      });
    }

    await queryRunner.commitTransaction(); // ⭐ Commit all together
  } catch (error) {
    await queryRunner.rollbackTransaction(); // ⭐ Rollback all
    throw error;
  }
}
```

**Why:**
- ป้องกัน data inconsistency
- ป้องกัน stock_balance updated แต่ stock_move ไม่ได้ insert
- ป้องกัน partial updates

**Transaction Flow:**
```
BEGIN TRANSACTION
  ├─→ UPDATE stock_balances
  ├─→ INSERT stock_moves
  └─→ UPDATE invoices (status)
COMMIT (all or nothing)
```

---

### Rule 4: คืนเงิน = Movement IN + เพิ่มสต็อคกลับ ⭐ CRITICAL

**Rule:** เมื่อ void/refund ต้องสร้าง movement type='IN' และเพิ่มสต็อคกลับ

**Implementation:**
```typescript
// InvoicesService.void()
async void(invoiceId: number, reason: string, userId: number) {
  const invoice = await this.findOne(invoiceId);
  
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.startTransaction();

  try {
    // For each invoice item: Return stock ⭐
    for (const item of invoice.items) {
      await this.inventoryService.returnStock(
        item.product_id,
        item.quantity,
        invoice.id,
        invoice.branch_id,
        userId,
        `Void invoice: ${reason}`,
      );
      // ⭐ This creates movement type='IN' and adds stock back
    }

    // Update invoice status
    invoice.status = 'voided';
    await queryRunner.manager.save(invoice);

    await queryRunner.commitTransaction();
    return invoice;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  }
}
```

**Stock Movement Created:**
```typescript
{
  move_type: "IN", // ⭐ IN for return
  quantity: +2, // ⭐ Positive (adds stock back)
  balance_before: 48,
  balance_after: 50, // ⭐ Stock increased
  reference_type: "invoice_refund", // ⭐ Reference type
  reference_id: invoiceId,
  reason: "Void invoice: reason"
}
```

**Why:**
- สต็อคต้องกลับมาเท่าเดิม
- มี audit trail ชัดเจน
- สามารถย้อนรอยได้

---

### Rule 5: Cancel (ไม่ Paid) = ไม่แตะ Stock ⭐ CRITICAL

**Rule:** ถ้า invoice ยังไม่ paid (status = 'draft' หรือ 'cancelled') ไม่ต้องตัดสต็อค

**Implementation:**
```typescript
// InvoicesService.create()
async create(dto: CreateInvoiceDto, userId: number, branchId: number) {
  const invoice = await queryRunner.manager.save({
    // ... invoice data
    status: dto.payment_status === 'paid' ? 'completed' : 'draft', // ⭐
  });

  // ⭐ Only deduct stock if paid
  if (invoice.status === 'completed') {
    for (const item of dto.items) {
      await this.inventoryService.sale(/* ... */); // ⭐ Deduct stock
    }
  }
  // ⭐ If draft: No stock deduction
}
```

**Cancel Flow:**
```
Create invoice (draft) → No stock deduction
Cancel invoice (draft) → No stock deduction (nothing to reverse)
```

**Why:**
- ป้องกันสต็อคหายจาก draft invoices
- รองรับการสร้างบิลก่อนชำระเงิน
- ป้องกัน double deduction

---

### Rule 6: ใช้ ref_type/ref_id เป็นสะพานลิงก์ระหว่างบิล ↔ Movement ⭐ CRITICAL

**Rule:** ทุก stock_move ต้องมี reference_type และ reference_id เพื่อลิงก์กลับไปยัง source document

**Implementation:**
```typescript
// InventoryService.sale()
async sale(productId: number, quantity: number, invoiceId: number, ...) {
  return this.move(
    productId,
    -quantity,
    'OUT',
    'invoice', // ⭐ reference_type
    invoiceId, // ⭐ reference_id
    `Sale - Invoice #${invoiceNo}`,
    // ... other params
  );
}

// StockMove Entity
{
  reference_type: "invoice", // ⭐ For linking
  reference_id: 123, // ⭐ For linking
  // ... other fields
}
```

**Linking Logic:**
```typescript
// Frontend: Generate link based on reference_type
function getMovementLink(movement: StockMove): string {
  switch (movement.reference_type) {
    case 'invoice':
      return `/admin/invoices/${movement.reference_id}`;
    case 'invoice_refund':
      return `/admin/invoices/${movement.reference_id}`;
    case 'grn':
      return `/admin/grn/${movement.reference_id}`;
    case 'stock_adjustment':
      return `/admin/stock-adjustments/${movement.reference_id}`;
    case 'stock_transfer':
      return `/admin/stock-transfers/${movement.reference_id}`;
    case 'repair':
      return `/admin/repairs/${movement.reference_id}`;
    default:
      return null;
  }
}
```

**Why:**
- สามารถย้อนรอยได้
- สามารถลิงก์กลับไปยัง source document
- รองรับ UX integration

---

## 📊 Reference Type Mapping

| Reference Type | Source Document | Link Path |
|----------------|----------------|-----------|
| `invoice` | Invoice (Sale) | `/admin/invoices/:id` |
| `invoice_refund` | Invoice (Refund) | `/admin/invoices/:id` |
| `grn` | GRN | `/admin/grn/:id` |
| `stock_adjustment` | Stock Adjustment | `/admin/stock-adjustments/:id` |
| `stock_transfer` | Stock Transfer | `/admin/stock-transfers/:id` |
| `repair` | Repair Order | `/admin/repairs/:id` |
| `receive` | Manual Receive | `/admin/inventory/moves/:id` |

---

## 🔄 Complete Flow Example

### Flow: Create Invoice → Deduct Stock → Link Back

```
1. User creates invoice
   ↓
2. InvoicesService.create()
   ↓
3. Check payment status
   ├─→ If paid → status = 'completed'
   └─→ If not paid → status = 'draft'
   ↓
4. If status = 'completed':
   ├─→ Lock stock_balance (row-level lock) ⭐
   ├─→ Check stock availability ⭐
   ├─→ UPDATE stock_balances (quantity - qty) ⭐
   ├─→ INSERT stock_moves (
   │     move_type='OUT',
   │     reference_type='invoice', ⭐
   │     reference_id=invoiceId ⭐
   │   )
   └─→ UPDATE invoices (status='completed')
   ↓
5. Commit transaction (all or nothing) ⭐
   ↓
6. Return invoice with stock_movements
   ↓
7. Frontend displays:
   ├─→ Invoice items
   ├─→ Stock movements (with link to invoice) ⭐
   └─→ Link button: "View Stock Movements"
```

---

## ✅ Implementation Checklist

### InventoryService
- [ ] move() uses row-level lock ⭐
- [ ] move() uses transaction ⭐
- [ ] move() creates stock_move record ⭐
- [ ] move() sets reference_type and reference_id ⭐

### InvoicesService
- [ ] create() checks payment status before deducting stock ⭐
- [ ] create() only deducts stock if paid ⭐
- [ ] void() returns stock (movement type='IN') ⭐
- [ ] refund() returns stock (movement type='IN') ⭐
- [ ] All operations use transactions ⭐

### Stock Movements
- [ ] Every movement has reference_type ⭐
- [ ] Every movement has reference_id ⭐
- [ ] Linking logic works correctly ⭐

---

## 🚨 Common Mistakes to Avoid

### Mistake 1: ตัดสต็อคก่อน Paid
**❌ Wrong:**
```typescript
// Deduct stock immediately, regardless of payment status
await this.inventoryService.sale(/* ... */);
```

**✅ Correct:**
```typescript
// Only deduct stock if paid
if (invoice.status === 'completed') {
  await this.inventoryService.sale(/* ... */);
}
```

---

### Mistake 2: ไม่ใช้ Lock
**❌ Wrong:**
```typescript
// No lock - race condition possible
const balance = await this.stockBalanceRepository.findOne({/* ... */});
balance.quantity = balance.quantity - quantity;
await this.stockBalanceRepository.save(balance);
```

**✅ Correct:**
```typescript
// Use row-level lock
const balance = await queryRunner.manager
  .createQueryBuilder(StockBalance, 'balance')
  .setLock('pessimistic_write') // ⭐ Lock
  .where(/* ... */)
  .getOne();
```

---

### Mistake 3: ไม่ใช้ Transaction
**❌ Wrong:**
```typescript
// No transaction - partial updates possible
await this.stockBalanceRepository.save(balance);
await this.stockMoveRepository.save(move);
await this.invoiceRepository.save(invoice);
```

**✅ Correct:**
```typescript
// Use transaction
const queryRunner = this.dataSource.createQueryRunner();
await queryRunner.startTransaction(); // ⭐
try {
  await queryRunner.manager.save(balance);
  await queryRunner.manager.save(move);
  await queryRunner.manager.save(invoice);
  await queryRunner.commitTransaction(); // ⭐
} catch (error) {
  await queryRunner.rollbackTransaction(); // ⭐
  throw error;
}
```

---

### Mistake 4: ไม่ตั้ง reference_type/ref_id
**❌ Wrong:**
```typescript
// Missing reference info
await this.inventoryService.move(
  productId,
  -quantity,
  'OUT',
  null, // ⭐ Missing reference_type
  null, // ⭐ Missing reference_id
  // ...
);
```

**✅ Correct:**
```typescript
// Include reference info
await this.inventoryService.move(
  productId,
  -quantity,
  'OUT',
  'invoice', // ⭐ reference_type
  invoiceId, // ⭐ reference_id
  // ...
);
```

---

## 📝 Code Examples

### Complete Invoice Creation with Stock Deduction
```typescript
@Injectable()
export class InvoicesService {
  constructor(
    private inventoryService: InventoryService,
    private dataSource: DataSource,
  ) {}

  async create(dto: CreateInvoiceDto, userId: number, branchId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction(); // ⭐ Transaction

    try {
      // Create invoice
      const invoice = await queryRunner.manager.save(
        this.invoiceRepository.create({
          // ... invoice data
          status: dto.payment_status === 'paid' ? 'completed' : 'draft', // ⭐
        }),
      );

      // Create items
      for (const item of dto.items) {
        await queryRunner.manager.save(
          this.invoiceItemRepository.create({
            invoice_id: invoice.id,
            product_id: item.product_id,
            quantity: item.quantity,
            // ... other fields
          }),
        );
      }

      // ⭐ Only deduct stock if paid
      if (invoice.status === 'completed') {
        for (const item of dto.items) {
          await this.inventoryService.sale(
            item.product_id,
            item.quantity,
            invoice.id, // ⭐ reference_id
            branchId,
            userId,
          );
          // ⭐ This creates movement with reference_type='invoice', reference_id=invoice.id
        }
      }

      await queryRunner.commitTransaction(); // ⭐ Commit all
      return this.findOne(invoice.id);
    } catch (error) {
      await queryRunner.rollbackTransaction(); // ⭐ Rollback all
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
```

---

## 🔗 Related Documents

- `plan/PHASE_4_UX_INTEGRATION.md` - UX Integration phase
- `docs/INTEGRATION_POINTS.md` - Integration points
- `INTEGRATION_SUMMARY.md` - Integration summary

---

**Status:** 📋 Critical Rules Document

**Last Updated:** 2025-01-XX

**⭐ All rules must be followed strictly**

