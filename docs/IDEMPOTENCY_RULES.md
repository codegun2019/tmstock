# 🔄 Idempotency Rules

**วันที่สร้าง:** 2025-01-XX  
**Version:** 5.0  
**Status:** 📋 Critical Rules

---

## 🎯 Overview

Idempotency Rules เพื่อป้องกันการทำงานซ้ำ (duplicate operations)

**สำคัญ:** ทุก operation ที่สำคัญต้อง idempotent

---

## 🔒 Critical Idempotency Rules

### Rule 1: Pay ซ้ำต้องไม่ตัดสต็อคซ้ำ ⭐ CRITICAL

**Problem:** User อาจกดปุ่ม "ชำระเงิน" หลายครั้ง

**Solution:** Check payment status ก่อนตัดสต็อค

**Implementation:**
```typescript
// InvoicesService.payInvoice()
async payInvoice(invoiceId: number, paymentData: PaymentDto, userId: number) {
  const invoice = await this.findOne(invoiceId);

  // ⭐ Check if already paid (idempotent)
  if (invoice.status === 'completed' || invoice.status === 'paid') {
    // Already paid - return existing invoice (idempotent)
    return invoice; // ⭐ No stock deduction
  }

  // Check if can be paid
  if (invoice.status !== 'draft' && invoice.status !== 'unpaid') {
    throw new BadRequestException('Invoice cannot be paid');
  }

  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.startTransaction();

  try {
    // Update invoice status
    invoice.status = 'completed';
    invoice.paid_amount = paymentData.paid_amount;
    await queryRunner.manager.save(invoice);

    // ⭐ Only deduct stock if not already deducted
    // Check if stock movements already exist for this invoice
    const existingMovements = await this.stockService.getMoves({
      reference_type: 'invoice',
      reference_id: invoiceId,
    });

    if (existingMovements.length === 0) {
      // ⭐ No movements yet - deduct stock
      for (const item of invoice.items) {
        await this.stockService.sale(
          item.product_id,
          item.quantity,
          invoice.id,
          invoice.branch_id,
          userId,
        );
      }
    }
    // ⭐ If movements exist - skip (idempotent)

    await queryRunner.commitTransaction();
    return this.findOne(invoice.id);
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  }
}
```

**Key Points:**
- ✅ Check status ก่อนตัดสต็อค
- ✅ Check existing movements ก่อนตัดสต็อค
- ✅ Return existing invoice ถ้า paid แล้ว (idempotent)

---

### Rule 2: Refund ซ้ำต้องไม่เพิ่มสต็อคซ้ำ ⭐ CRITICAL

**Problem:** User อาจกดปุ่ม "คืนเงิน" หลายครั้ง

**Solution:** Check refund status ก่อนคืนสต็อค

**Implementation:**
```typescript
// InvoicesService.refund()
async refund(invoiceId: number, reason: string, userId: number) {
  const invoice = await this.findOne(invoiceId);

  // ⭐ Check if already refunded (idempotent)
  if (invoice.status === 'refunded') {
    // Already refunded - return existing invoice (idempotent)
    return invoice; // ⭐ No stock return
  }

  // Check if can be refunded
  if (invoice.status !== 'completed' && invoice.status !== 'paid') {
    throw new BadRequestException('Only paid invoices can be refunded');
  }

  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.startTransaction();

  try {
    // ⭐ Check if refund movements already exist
    const existingRefundMovements = await this.stockService.getMoves({
      reference_type: 'invoice_refund',
      reference_id: invoiceId,
    });

    if (existingRefundMovements.length === 0) {
      // ⭐ No refund movements yet - return stock
      for (const item of invoice.items) {
        await this.stockService.returnStock(
          item.product_id,
          item.quantity,
          invoice.id,
          invoice.branch_id,
          userId,
          `Refund invoice: ${reason}`,
        );
      }
    }
    // ⭐ If refund movements exist - skip (idempotent)

    // Update invoice status
    invoice.status = 'refunded';
    invoice.refunded_at = new Date();
    invoice.refunded_reason = reason;
    await queryRunner.manager.save(invoice);

    await queryRunner.commitTransaction();
    return this.findOne(invoice.id);
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  }
}
```

**Key Points:**
- ✅ Check status ก่อนคืนสต็อค
- ✅ Check existing refund movements ก่อนคืนสต็อค
- ✅ Return existing invoice ถ้า refunded แล้ว (idempotent)

---

### Rule 3: Void ซ้ำต้องไม่คืนสต็อคซ้ำ ⭐ CRITICAL

**Similar to Refund:**
- Check status ก่อน void
- Check existing void movements ก่อนคืนสต็อค
- Return existing invoice ถ้า voided แล้ว (idempotent)

---

## 🔄 Idempotency Patterns

### Pattern 1: Status Check
```typescript
// Check status before operation
if (entity.status === targetStatus) {
  return entity; // ⭐ Idempotent - return existing
}
```

### Pattern 2: Movement Check
```typescript
// Check if movements already exist
const existingMovements = await this.stockService.getMoves({
  reference_type: referenceType,
  reference_id: referenceId,
});

if (existingMovements.length > 0) {
  // ⭐ Already processed - skip (idempotent)
  return;
}
```

### Pattern 3: Unique Constraint
```typescript
// Use database unique constraint
// If duplicate → Database throws error → Catch and return existing
try {
  await this.repository.save(entity);
} catch (error) {
  if (error.code === 'ER_DUP_ENTRY') {
    // ⭐ Duplicate - return existing (idempotent)
    return this.repository.findOne({ where: { unique_field: value } });
  }
  throw error;
}
```

---

## 📋 Idempotency Checklist

### Invoice Operations
- [ ] payInvoice() - Check status before deducting stock ⭐
- [ ] payInvoice() - Check existing movements ⭐
- [ ] refund() - Check status before returning stock ⭐
- [ ] refund() - Check existing refund movements ⭐
- [ ] void() - Check status before returning stock ⭐
- [ ] void() - Check existing void movements ⭐

### Stock Operations
- [ ] sale() - Check if movement already exists ⭐
- [ ] returnStock() - Check if return movement already exists ⭐
- [ ] adjust() - Check if adjustment already processed ⭐

### Sequence Generation
- [ ] generate() - Thread-safe (row-level lock) ⭐
- [ ] generate() - Idempotent (same input = same output) ⭐

---

## 🚨 Common Scenarios

### Scenario 1: Double Click "Pay"
```
User clicks "Pay" button twice quickly
  ↓
Request 1: payInvoice() → Deducts stock → Status = 'paid'
Request 2: payInvoice() → Checks status = 'paid' → Returns existing (idempotent) ⭐
```

### Scenario 2: Network Retry
```
Network error → Client retries
  ↓
Request 1: payInvoice() → Success (but client didn't receive response)
Request 2: payInvoice() → Checks status = 'paid' → Returns existing (idempotent) ⭐
```

### Scenario 3: Concurrent Requests
```
Two requests arrive simultaneously
  ↓
Request 1: Lock row → Check status → Deduct stock → Commit
Request 2: Wait for lock → Check status = 'paid' → Skip (idempotent) ⭐
```

---

## ✅ Testing Idempotency

### Test Cases
- [ ] Pay invoice twice → Stock deducted once only
- [ ] Refund invoice twice → Stock returned once only
- [ ] Void invoice twice → Stock returned once only
- [ ] Concurrent pay requests → Stock deducted once only
- [ ] Network retry → No duplicate operations

---

## 📚 Related Documents

- `docs/KEY_POINTS_SYSTEM_INTEGRITY.md` - Critical rules
- `docs/API_CONTRACTS.md` - API contracts
- `docs/CONCURRENCY_NOTES.md` - Concurrency handling

---

**Status:** 📋 Idempotency Rules Complete

**Last Updated:** 2025-01-XX

**⭐ All operations must be idempotent**

