# ⚡ Concurrency Notes

**วันที่สร้าง:** 2025-01-XX  
**Version:** 5.0  
**Status:** 📋 Concurrency Handling Guide

---

## 🎯 Overview

เอกสารนี้อธิบายการจัดการ Concurrency ในระบบ mstock POS

**สำคัญ:** 2 แคชเชียร์ขายพร้อมกันต้องไม่ติดลบ

---

## 🔒 Concurrency Problems

### Problem 1: Race Condition (Concurrent Sales)
**Scenario:**
```
แคชเชียร์ A และ B ขายสินค้าเดียวกันพร้อมกัน
Stock: 10 ชิ้น
แคชเชียร์ A: ขาย 8 ชิ้น
แคชเชียร์ B: ขาย 5 ชิ้น
```

**Without Lock:**
```
Time 1: A reads stock = 10
Time 2: B reads stock = 10
Time 3: A calculates: 10 - 8 = 2, updates stock = 2
Time 4: B calculates: 10 - 5 = 5, updates stock = 5 ❌ WRONG!
Result: Stock = 5 (should be -3 or error)
```

**With Lock:**
```
Time 1: A locks row, reads stock = 10
Time 2: B waits for lock
Time 3: A calculates: 10 - 8 = 2, updates stock = 2, commits, releases lock
Time 4: B acquires lock, reads stock = 2
Time 5: B calculates: 2 - 5 = -3, throws error (insufficient stock) ✅ CORRECT
```

---

### Problem 2: Double Payment
**Scenario:**
```
User clicks "Pay" button twice quickly
```

**Solution:** Idempotency check (see IDEMPOTENCY_RULES.md)

---

## 🛠️ Concurrency Solutions

### Solution 1: Row-Level Locking ⭐ CRITICAL

**Implementation:**
```typescript
// InventoryService.move()
async move(...) {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.startTransaction();

  try {
    // ⭐ Lock stock_balance row BEFORE reading
    const balance = await queryRunner.manager
      .createQueryBuilder(StockBalance, 'balance')
      .setLock('pessimistic_write') // ⭐ Row-level lock
      .where('balance.product_id = :productId', { productId })
      .andWhere('balance.branch_id = :branchId', { branchId })
      .getOne();

    // Now check stock availability (locked row)
    if (balance.quantity < requiredQuantity) {
      throw new BadRequestException('Insufficient stock');
    }

    // Update stock (still locked)
    balance.quantity = balance.quantity - requiredQuantity;
    await queryRunner.manager.save(balance);

    await queryRunner.commitTransaction(); // ⭐ Release lock
  } catch (error) {
    await queryRunner.rollbackTransaction(); // ⭐ Release lock
    throw error;
  }
}
```

**How It Works:**
1. Transaction 1 locks row
2. Transaction 2 waits for lock
3. Transaction 1 updates and commits
4. Transaction 2 acquires lock and reads updated value
5. Transaction 2 checks and updates

**Benefits:**
- ✅ Prevents race conditions
- ✅ Prevents negative stock
- ✅ Ensures data consistency

---

### Solution 2: Transaction Isolation Level

**Recommended:** `REPEATABLE READ` หรือ `SERIALIZABLE`

**TypeORM Configuration:**
```typescript
// database.config.ts
{
  type: 'mysql',
  // ...
  extra: {
    isolationLevel: 'REPEATABLE READ', // ⭐
  },
}
```

**Isolation Levels:**
- `READ UNCOMMITTED` - ❌ Too weak (dirty reads)
- `READ COMMITTED` - ⚠️ May have issues (non-repeatable reads)
- `REPEATABLE READ` - ✅ Recommended (prevents phantom reads)
- `SERIALIZABLE` - ✅ Strongest (but slower)

---

### Solution 3: Optimistic Locking (Optional)

**For High-Contention Scenarios:**
```typescript
// StockBalance Entity
@VersionColumn()
version: number; // ⭐ Version column

// Service
async move(...) {
  const balance = await this.repository.findOne({ where: { id } });
  const originalVersion = balance.version;

  balance.quantity = balanceAfter;
  await this.repository.save(balance);

  // If version changed → throw error (concurrent update)
  if (balance.version !== originalVersion + 1) {
    throw new ConflictException('Concurrent update detected');
  }
}
```

**Use Case:** When pessimistic locking is too slow

---

## 📊 Concurrency Scenarios

### Scenario 1: Two Cashiers Selling Same Product
```
Cashier A: Sell Product 1, Quantity 8
Cashier B: Sell Product 1, Quantity 5
Stock Available: 10

Flow:
1. A locks row → Reads stock = 10
2. B waits for lock
3. A checks: 10 >= 8 ✅ → Updates stock = 2 → Commits → Releases lock
4. B acquires lock → Reads stock = 2
5. B checks: 2 >= 5 ❌ → Throws error "Insufficient stock"
```

**Result:** ✅ Stock = 2, B gets error (correct)

---

### Scenario 2: Concurrent Stock Adjustment
```
Adjustment A: Increase Product 1 by 10
Adjustment B: Decrease Product 1 by 5
Stock: 10

Flow:
1. A locks row → Reads stock = 10 → Updates stock = 20 → Commits
2. B locks row → Reads stock = 20 → Updates stock = 15 → Commits
```

**Result:** ✅ Stock = 15 (correct)

---

### Scenario 3: Sale + Adjustment Concurrent
```
Sale: Sell Product 1, Quantity 8
Adjustment: Increase Product 1 by 10
Stock: 10

Flow:
1. Sale locks row → Reads stock = 10 → Updates stock = 2 → Commits
2. Adjustment locks row → Reads stock = 2 → Updates stock = 12 → Commits
```

**Result:** ✅ Stock = 12 (correct)

---

## 🔒 Lock Types

### Pessimistic Write Lock (Recommended)
```typescript
.setLock('pessimistic_write')
```

**Behavior:**
- Locks row for writing
- Other transactions wait
- Released on commit/rollback

**Use Case:** Stock operations (sale, receive, adjust)

---

### Pessimistic Read Lock
```typescript
.setLock('pessimistic_read')
```

**Behavior:**
- Locks row for reading
- Prevents writes until released

**Use Case:** Read operations that need consistency

---

### Optimistic Lock
```typescript
@VersionColumn()
version: number;
```

**Behavior:**
- No lock during read
- Check version on update
- Throw error if version changed

**Use Case:** Low-contention scenarios

---

## 📋 Concurrency Checklist

### Stock Operations
- [ ] sale() uses pessimistic write lock ⭐
- [ ] receive() uses pessimistic write lock ⭐
- [ ] adjust() uses pessimistic write lock ⭐
- [ ] returnStock() uses pessimistic write lock ⭐
- [ ] All operations in transactions ⭐

### Invoice Operations
- [ ] create() uses transaction ⭐
- [ ] payInvoice() checks status (idempotent) ⭐
- [ ] void() checks status (idempotent) ⭐
- [ ] refund() checks status (idempotent) ⭐

### Sequence Generation
- [ ] generate() uses pessimistic write lock ⭐
- [ ] generate() uses transaction ⭐
- [ ] Thread-safe sequence generation ⭐

---

## 🧪 Testing Concurrency

### Test Case 1: Concurrent Sales
```typescript
// Test: Two concurrent sales of same product
const productId = 1;
const initialStock = 10;

// Start two concurrent requests
const promise1 = invoicesService.create({
  items: [{ product_id: productId, quantity: 8 }],
  payment_status: 'paid',
});

const promise2 = invoicesService.create({
  items: [{ product_id: productId, quantity: 5 }],
  payment_status: 'paid',
});

const [result1, result2] = await Promise.allSettled([promise1, promise2]);

// Expected:
// - One succeeds (stock = 2)
// - One fails (insufficient stock)
// - Stock = 2 (not negative)
```

### Test Case 2: Concurrent Payments
```typescript
// Test: Pay same invoice twice
const invoiceId = 1;

// Start two concurrent requests
const promise1 = invoicesService.payInvoice(invoiceId, paymentData);
const promise2 = invoicesService.payInvoice(invoiceId, paymentData);

const [result1, result2] = await Promise.allSettled([promise1, promise2]);

// Expected:
// - Both succeed (idempotent)
// - Stock deducted once only
```

---

## 🚨 Common Concurrency Issues

### Issue 1: Stock Goes Negative
**Cause:** No locking or wrong isolation level

**Solution:**
- Use pessimistic write lock
- Check stock before update
- Use transaction

---

### Issue 2: Duplicate Stock Deduction
**Cause:** No idempotency check

**Solution:**
- Check payment status
- Check existing movements
- Return existing if already processed

---

### Issue 3: Sequence Duplicates
**Cause:** No locking in sequence generation

**Solution:**
- Use pessimistic write lock
- Use transaction
- Row-level locking

---

## 📊 Performance Considerations

### Lock Duration
- ✅ Keep locks short (only during critical section)
- ✅ Release locks immediately after commit
- ✅ Avoid long-running operations in locked section

### Lock Granularity
- ✅ Lock specific rows (not entire table)
- ✅ Lock only necessary rows
- ✅ Use row-level locking (not table-level)

### Deadlock Prevention
- ✅ Lock rows in consistent order
- ✅ Use timeouts
- ✅ Retry on deadlock

---

## ✅ Best Practices

### 1. Always Use Transactions
```typescript
const queryRunner = this.dataSource.createQueryRunner();
await queryRunner.startTransaction();
try {
  // Operations
  await queryRunner.commitTransaction();
} catch (error) {
  await queryRunner.rollbackTransaction();
  throw error;
}
```

### 2. Always Lock Before Update
```typescript
const balance = await queryRunner.manager
  .createQueryBuilder(StockBalance, 'balance')
  .setLock('pessimistic_write') // ⭐ Lock first
  .where(/* ... */)
  .getOne();
```

### 3. Check Before Update
```typescript
// Check stock availability
if (balance.quantity < requiredQuantity) {
  throw new BadRequestException('Insufficient stock');
}
```

### 4. Idempotency Checks
```typescript
// Check status before operation
if (invoice.status === 'paid') {
  return invoice; // ⭐ Idempotent
}
```

---

## 📚 Related Documents

- `docs/KEY_POINTS_SYSTEM_INTEGRITY.md` - Critical rules
- `docs/IDEMPOTENCY_RULES.md` - Idempotency rules
- `plan/PHASE_3_INVENTORY_DETAILED.md` - Inventory implementation

---

**Status:** 📋 Concurrency Notes Complete

**Last Updated:** 2025-01-XX

**⭐ 2 แคชเชียร์ขายพร้อมกันต้องไม่ติดลบ**

