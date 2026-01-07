# 🔍 Entity vs Database Verification Checklist

**วันที่ตรวจสอบ:** 2025-01-XX  
**Version:** 5.0  
**สถานะ:** ⚠️ Verification In Progress

---

## 📊 Coverage Summary

### ✅ Entities Created (28 files)
- Core: 10 entities
- RBAC: 4 entities
- HR: 6 entities
- Cash Ledger: 3 entities
- System: 4 entities
- Additional: 1 entity

### ⚠️ Missing Entities (20+ tables)
- Repair Module: 4 tables
- Documents Module: 6 tables
- GRN Module: 4 tables
- Stock Adjustments: 4 tables
- Stock Transfers: 4 tables
- Contacts Extended: 2 tables
- System Extended: 3 tables

---

## 🔍 Critical Tables Verification

### 1. invoices ✅
**Status:** Entity exists  
**File:** `Invoice.entity.ts`

**Columns to Verify:**
- [ ] `invoice_no` (UNIQUE) - ✅ มี
- [ ] `branch_id` (FK) - ✅ มี
- [ ] `user_id` (FK) - ✅ มี
- [ ] `contact_id` (FK, nullable) - ⚠️ ต้องตรวจสอบ
- [ ] `customer_name` (nullable) - ⚠️ ต้องตรวจสอบ
- [ ] `customer_phone` (nullable) - ⚠️ ต้องตรวจสอบ
- [ ] `subtotal`, `discount_amount`, `total_amount` - ✅ มี
- [ ] `paid_amount`, `change_amount` - ✅ มี
- [ ] `payment_method` - ✅ มี
- [ ] `payment_details` (JSON) - ⚠️ ต้องตรวจสอบ
- [ ] `status` (ENUM) - ✅ มี
- [ ] `void_reason`, `refund_reason` - ⚠️ ต้องตรวจสอบ
- [ ] `voided_by`, `voided_at` - ⚠️ ต้องตรวจสอบ
- [ ] `refunded_by`, `refunded_at` - ⚠️ ต้องตรวจสอบ
- [ ] `notes` - ✅ มี

**Missing in Entity:**
- ⚠️ `contact_id` - อาจจะไม่มี (ต้องตรวจสอบ migration)
- ⚠️ `ref_employee_id` - สำหรับ commission (HR system)
- ⚠️ `created_at`, `updated_at` - ✅ มี

---

### 2. stock_moves ✅
**Status:** Entity exists  
**File:** `StockMovement.entity.ts`

**Columns to Verify:**
- [ ] `product_id` (FK) - ✅ มี
- [ ] `branch_id` (FK) - ✅ มี
- [ ] `move_type` (VARCHAR) - ✅ มี (แต่เป็น ENUM ใน entity)
- [ ] `quantity` (DECIMAL) - ✅ มี
- [ ] `balance_before` (DECIMAL) - ⚠️ ต้องตรวจสอบ
- [ ] `balance_after` (DECIMAL) - ⚠️ ต้องตรวจสอบ
- [ ] `reference_type` (VARCHAR) - ✅ มี
- [ ] `reference_id` (INT) - ✅ มี
- [ ] `reason` (TEXT) - ✅ มี
- [ ] `created_by` (FK) - ✅ มี
- [ ] `created_at` - ✅ มี

**Missing in Entity:**
- ⚠️ `balance_before`, `balance_after` - อาจจะไม่มี (ต้องตรวจสอบ migration)

**Note:** Entity ใช้ชื่อ `StockMovement` แต่ตารางจริงคือ `stock_moves` - ต้องตรวจสอบ decorator `@Entity('stock_moves')`

---

### 3. stock_balances ✅
**Status:** Entity exists  
**File:** `StockBalance.entity.ts`

**Columns to Verify:**
- [ ] `product_id` (FK) - ✅ มี
- [ ] `branch_id` (FK) - ✅ มี
- [ ] `quantity` (DECIMAL) - ✅ มี
- [ ] `reserved_quantity` (DECIMAL) - ⚠️ ต้องตรวจสอบ
- [ ] `available_quantity` (GENERATED) - ⚠️ ต้องตรวจสอบ
- [ ] `last_moved_at` (DATETIME) - ⚠️ ต้องตรวจสอบ

**Missing in Entity:**
- ⚠️ `reserved_quantity` - อาจจะไม่มี
- ⚠️ `available_quantity` - อาจจะเป็น computed column
- ⚠️ `last_moved_at` - อาจจะไม่มี

**Note:** Entity ใช้ชื่อ `StockBalance` แต่ตารางจริงคือ `stock_balances` - ต้องตรวจสอบ decorator `@Entity('stock_balances')`

---

### 4. products ✅
**Status:** Entity exists  
**File:** `Product.entity.ts`

**Columns to Verify:**
- [ ] `barcode` (UNIQUE) - ✅ มี
- [ ] `sku` (UNIQUE, nullable) - ✅ มี
- [ ] `name` - ✅ มี
- [ ] `category_id` (FK, nullable) - ✅ มี
- [ ] `unit_id` (FK, nullable) - ⚠️ ต้องตรวจสอบ (อาจจะเป็น `unit` VARCHAR)
- [ ] `cost_price` (DECIMAL) - ✅ มี
- [ ] `selling_price` (DECIMAL) - ✅ มี
- [ ] `active` (TINYINT) - ✅ มี
- [ ] `image_url` (legacy) - ⚠️ ต้องตรวจสอบ
- [ ] `description` (TEXT) - ✅ มี

**Missing in Entity:**
- ⚠️ `unit` (VARCHAR) - อาจจะมีแทน `unit_id`
- ⚠️ `image_url` - legacy field

---

### 5. users ✅
**Status:** Entity exists  
**File:** `User.entity.ts`

**Columns to Verify:**
- [ ] `username` (UNIQUE) - ✅ มี
- [ ] `email` (UNIQUE) - ✅ มี
- [ ] `password_hash` - ✅ มี
- [ ] `full_name` - ✅ มี
- [ ] `phone` - ✅ มี
- [ ] `branch_id` (FK, nullable) - ✅ มี
- [ ] `active` (TINYINT) - ✅ มี
- [ ] `is_admin` (TINYINT) - ⚠️ ต้องตรวจสอบ
- [ ] `last_login_at` - ✅ มี
- [ ] `last_login_ip` - ✅ มี

**Missing in Entity:**
- ⚠️ `is_admin` - อาจจะไม่มี (ใช้ RBAC แทน)

---

## ⚠️ Missing Entities (High Priority)

### Repair Module (4 tables)
1. ⚠️ `RepairOrder.entity.ts` - `repair_orders`
2. ⚠️ `RepairItem.entity.ts` - `repair_items`
3. ⚠️ `RepairStatusHistory.entity.ts` - `repair_status_history`
4. ⚠️ `RepairSequence.entity.ts` - `repair_sequences`

### Documents Module (6 tables)
5. ⚠️ `DocumentType.entity.ts` - `document_types`
6. ⚠️ `Document.entity.ts` - `documents`
7. ⚠️ `DocumentItem.entity.ts` - `document_items`
8. ⚠️ `DocumentSequence.entity.ts` - `document_sequences`
9. ⚠️ `DocumentAttachment.entity.ts` - `document_attachments`
10. ⚠️ `DocumentHistory.entity.ts` - `document_history`

### GRN Module (4 tables)
11. ⚠️ `Grn.entity.ts` - `grn`
12. ⚠️ `GrnItem.entity.ts` - `grn_items`
13. ⚠️ `GrnAttachment.entity.ts` - `grn_attachments`
14. ⚠️ `GrnSequence.entity.ts` - `grn_sequences`

### Stock Adjustments (4 tables)
15. ⚠️ `StockAdjustment.entity.ts` - `stock_adjustments`
16. ⚠️ `StockAdjustmentItem.entity.ts` - `stock_adjustment_items`
17. ⚠️ `StockAdjustmentAttachment.entity.ts` - `stock_adjustment_attachments`
18. ⚠️ `StockAdjustmentSequence.entity.ts` - `stock_adjustment_sequences`

### Stock Transfers (4 tables)
19. ⚠️ `StockTransfer.entity.ts` - `stock_transfers`
20. ⚠️ `StockTransferItem.entity.ts` - `stock_transfer_items`
21. ⚠️ `StockTransferAttachment.entity.ts` - `stock_transfer_attachments`
22. ⚠️ `StockTransferSequence.entity.ts` - `stock_transfer_sequences`

### Contacts Extended (2 tables)
23. ⚠️ `ContactBank.entity.ts` - `contact_banks`
24. ⚠️ `ContactAttachment.entity.ts` - `contact_attachments`

### System Extended (3 tables)
25. ⚠️ `CustomerTransaction.entity.ts` - `customer_transactions`
26. ⚠️ `Setting.entity.ts` - `settings`
27. ⚠️ `BackupHistory.entity.ts` - `backup_history`
28. ⚠️ `RestoreHistory.entity.ts` - `restore_history`
29. ⚠️ `SchemaMigration.entity.ts` - `schema_migrations`

---

## 🔧 Action Items

### Immediate (Before Development)
1. ✅ Verify `Invoice.entity.ts` columns match database
2. ✅ Verify `StockMovement.entity.ts` columns match database
3. ✅ Verify `StockBalance.entity.ts` columns match database
4. ✅ Verify `Product.entity.ts` columns match database
5. ✅ Verify `User.entity.ts` columns match database

### High Priority (Phase 1-2)
6. ⏳ Create `RepairOrder.entity.ts`
7. ⏳ Create `RepairItem.entity.ts`
8. ⏳ Create `Grn.entity.ts`
9. ⏳ Create `GrnItem.entity.ts`
10. ⏳ Create `StockAdjustment.entity.ts`
11. ⏳ Create `StockAdjustmentItem.entity.ts`
12. ⏳ Create `StockTransfer.entity.ts`
13. ⏳ Create `StockTransferItem.entity.ts`

### Medium Priority (Phase 3-4)
14. ⏳ Create `Document.entity.ts` and related
15. ⏳ Create `ContactBank.entity.ts`
16. ⏳ Create `ContactAttachment.entity.ts`
17. ⏳ Create `CustomerTransaction.entity.ts`
18. ⏳ Create `Setting.entity.ts`

### Low Priority (Phase 5+)
19. ⏳ Create `BackupHistory.entity.ts`
20. ⏳ Create `RestoreHistory.entity.ts`
21. ⏳ Create `SchemaMigration.entity.ts`

---

## 📝 Verification Steps

### Step 1: Connect to Local Database
```sql
-- Check table structure
DESCRIBE invoices;
DESCRIBE stock_moves;
DESCRIBE stock_balances;
DESCRIBE products;
DESCRIBE users;
```

### Step 2: Compare Columns
- [ ] Compare each column name
- [ ] Compare data types
- [ ] Compare nullable constraints
- [ ] Compare default values
- [ ] Compare indexes
- [ ] Compare foreign keys

### Step 3: Fix Discrepancies
- [ ] Update entity decorators (`@Entity`, `@Column`)
- [ ] Add missing columns
- [ ] Remove non-existent columns
- [ ] Fix data types
- [ ] Fix relationships

---

## 🎯 Next Steps

1. **Run SQL queries** to verify table structures
2. **Update entities** to match database exactly
3. **Create missing entities** for high-priority tables
4. **Test TypeORM** connection and entity loading
5. **Verify relationships** work correctly

---

**Status:** ⚠️ Verification Required

**Last Updated:** 2025-01-XX

**⭐ 28 entities created | 20+ missing | Verification needed**

