# 🗄️ Database Tables & Relations Summary

**วันที่สร้าง:** 2025-01-XX  
**Version:** 5.0  
**สถานะ:** 📋 Complete Tables & Relations Analysis

---

## 🎯 Overview

สรุปจำนวน tables และ relationships ทั้งหมดในระบบ

**Total Tables:** 31 tables (จาก PHP) + 8 tables (HR + Cash Ledger) = **39 tables**

**Total Relationships:** 50+ relationships

---

## 📊 Tables Summary

### Core Tables (17 tables)

#### 1. Authentication & Authorization (7 tables)
- `users` - พนักงาน/ผู้ใช้
- `roles` - บทบาท
- `permissions` - สิทธิ์
- `role_permissions` - Join table: roles ↔ permissions
- `user_roles` - Join table: users ↔ roles (missing entity)
- `login_attempts` - บันทึกการพยายาม login (missing entity)
- `feature_toggles` - Feature flags (missing entity)

#### 2. Multi-Branch (1 table)
- `branches` - สาขา/ร้านค้า

#### 3. Products & Inventory (6 tables)
- `products` - สินค้า
- `categories` - หมวดหมู่สินค้า
- `units` - หน่วยนับ
- `product_media` - รูปภาพสินค้า (missing entity)
- `product_stocks` (stock_balances) - สต็อคปัจจุบัน (per product per branch)
- `stock_movements` (stock_moves) - ประวัติการเคลื่อนไหวสต็อค

#### 4. Sales & POS (3 tables)
- `invoices` - บิลขาย
- `invoice_items` - รายการสินค้าในบิล
- `invoice_sequences` - เลขลำดับบิล (missing entity)

---

### HR System Tables (8 tables)

#### 5. HR Management (8 tables)
- `employees` - พนักงาน
- `employee_positions` - ตำแหน่งงาน
- `attendance` - เวลาเข้า-ออกงาน (missing entity)
- `payroll_periods` - รอบเงินเดือน (missing entity)
- `payroll_items` - เงินเดือนจริง (missing entity)
- `payroll_adjustments` - เพิ่ม/หักเงินเดือน (missing entity)
- `salary_payments` - จ่ายเงินจริง (missing entity)
- `hr_audit_logs` - Audit log สำหรับ HR (missing entity)

---

### Cash Ledger Tables (3 tables)

#### 6. Money Ledger (3 tables)
- `cash_transactions` - รายการเงินเข้า-ออก
- `cash_categories` - หมวดหมู่รายรับ-รายจ่าย
- `cash_links` - ตารางเชื่อม (optional, missing entity)

---

### Additional Tables (11 tables)

#### 7. Contacts (3 tables)
- `contacts` - ลูกค้า/ผู้จำหน่าย (missing entity)
- `contact_banks` - บัญชีธนาคาร (missing entity)
- `contact_attachments` - ไฟล์แนบ (missing entity)

#### 8. Repair Service (4 tables)
- `repair_orders` - ใบงานซ่อม (missing entity)
- `repair_items` - อะไหล่ที่ใช้ (missing entity)
- `repair_status_history` - ประวัติสถานะ (missing entity)
- `repair_sequences` - เลขลำดับใบงานซ่อม (missing entity)

#### 9. Documents Module (6 tables)
- `document_types` - ประเภทเอกสาร (missing entity)
- `documents` - เอกสารขาย/บัญชี (missing entity)
- `document_items` - รายการในเอกสาร (missing entity)
- `document_sequences` - เลขลำดับเอกสาร (missing entity)
- `document_attachments` - ไฟล์แนบ (missing entity)
- `document_history` - ประวัติการเปลี่ยนแปลง (missing entity)

#### 10. GRN (4 tables)
- `grn` - ใบรับสินค้า (missing entity)
- `grn_items` - รายการสินค้าที่รับ (missing entity)
- `grn_attachments` - ไฟล์แนบ (missing entity)
- `grn_sequences` - เลขลำดับ GRN (missing entity)

#### 11. Stock Adjustments (4 tables)
- `stock_adjustments` - การปรับสต็อค (missing entity)
- `stock_adjustment_items` - รายการปรับสต็อค (missing entity)
- `stock_adjustment_attachments` - ไฟล์แนบ (missing entity)
- `stock_adjustment_sequences` - เลขลำดับ (missing entity)

#### 12. Stock Transfers (4 tables)
- `stock_transfers` - การโอนสต็อค (missing entity)
- `stock_transfer_items` - รายการโอนสต็อค (missing entity)
- `stock_transfer_attachments` - ไฟล์แนบ (missing entity)
- `stock_transfer_sequences` - เลขลำดับ (missing entity)

#### 13. System & Settings (5 tables)
- `audit_logs` - Audit trail (missing entity)
- `settings` - ตั้งค่าระบบ (missing entity)
- `backup_history` - ประวัติ backup (missing entity)
- `restore_history` - ประวัติ restore (missing entity)
- `customer_transactions` - ประวัติการทำธุรกรรมลูกค้า (missing entity)

#### 14. Migration Tracking (1 table)
- `schema_migrations` - ติดตาม migrations (missing entity)

---

## 🔗 Relationships Summary

### Core Relationships

#### 1. Branch Relationships (Central Hub)
```
branches (id)
  ├──→ users (branch_id) [Many-to-One]
  ├──→ employees (branch_id) [Many-to-One]
  ├──→ invoices (branch_id) [Many-to-One]
  ├──→ stock_balances (branch_id) [Many-to-One]
  ├──→ stock_movements (branch_id) [Many-to-One]
  └──→ cash_transactions (branch_id) [Many-to-One]
```

**Total:** 6 relationships from branches

---

#### 2. Product Relationships
```
products (id)
  ├──→ categories (category_id) [Many-to-One]
  ├──→ invoice_items (product_id) [One-to-Many]
  ├──→ stock_balances (product_id) [One-to-Many]
  └──→ stock_movements (product_id) [One-to-Many]
```

**Total:** 4 relationships from products

---

#### 3. Invoice Relationships
```
invoices (id)
  ├──→ branches (branch_id) [Many-to-One]
  ├──→ users (user_id) [Many-to-One]
  ├──→ employees (ref_employee_id) [Many-to-One, nullable]
  ├──→ invoice_items (invoice_id) [One-to-Many]
  └──→ stock_movements (reference_id, reference_type='invoice') [Soft Link]
```

**Total:** 5 relationships from invoices

---

#### 4. Stock Relationships
```
stock_balances (id)
  ├──→ products (product_id) [Many-to-One]
  └──→ branches (branch_id) [Many-to-One]

stock_movements (id)
  ├──→ products (product_id) [Many-to-One]
  ├──→ branches (branch_id) [Many-to-One]
  ├──→ users (created_by) [Many-to-One]
  └──→ [Soft Link] invoices/grn/adjustments (reference_type, reference_id)
```

**Total:** 6 relationships from stock tables

---

#### 5. User Relationships
```
users (id)
  ├──→ branches (branch_id) [Many-to-One]
  ├──→ invoices (user_id) [One-to-Many]
  ├──→ stock_movements (created_by) [One-to-Many]
  ├──→ cash_transactions (created_by) [One-to-Many]
  ├──→ roles (via user_roles) [Many-to-Many]
  └──→ [Soft Link] audit_logs (actor_user_id)
```

**Total:** 6 relationships from users

---

#### 6. RBAC Relationships
```
roles (id)
  ├──→ permissions (via role_permissions) [Many-to-Many]
  └──→ users (via user_roles) [Many-to-Many]

permissions (id)
  └──→ roles (via role_permissions) [Many-to-Many]

role_permissions (role_id, permission_id)
  ├──→ roles (role_id) [Many-to-One]
  └──→ permissions (permission_id) [Many-to-One]
```

**Total:** 3 relationships in RBAC

---

#### 7. Employee Relationships
```
employees (id)
  ├──→ employee_positions (position_id) [Many-to-One]
  ├──→ branches (branch_id) [Many-to-One]
  └──→ invoices (ref_employee_id) [One-to-Many, nullable]

employee_positions (id)
  └──→ employees (position_id) [One-to-Many]
```

**Total:** 4 relationships from employees

---

#### 8. Cash Transaction Relationships
```
cash_transactions (id)
  ├──→ cash_categories (category_id) [Many-to-One]
  ├──→ branches (branch_id) [Many-to-One]
  ├──→ users (created_by) [Many-to-One]
  └──→ [Soft Link] invoices/payroll/repair/grn (reference_type, reference_id)

cash_categories (id)
  ├──→ cash_transactions (category_id) [One-to-Many]
  └──→ cash_categories (parent_id) [Self-referencing, Many-to-One]
```

**Total:** 5 relationships from cash transactions

---

## 🔗 Critical Reference Linking (Soft Links)

### Reference Type Pattern

**Tables using `reference_type` + `reference_id`:**

1. **stock_movements**
   - `reference_type`: 'invoice' | 'invoice_refund' | 'grn' | 'stock_adjustment' | 'stock_transfer' | 'repair'
   - `reference_id`: ID from source document
   - **Links to:** invoices, grn, stock_adjustments, stock_transfers, repair_orders

2. **cash_transactions**
   - `reference_type`: 'POS' | 'PAYROLL' | 'REPAIR' | 'MANUAL' | 'STOCK' | 'GRN' | 'ADJUSTMENT'
   - `reference_id`: ID from source document
   - **Links to:** invoices, payroll_periods, repair_orders, grn

3. **customer_transactions** (missing entity)
   - `reference_type`: 'invoice' | 'payment' | 'refund'
   - `reference_id`: ID from source document
   - **Links to:** invoices, payments

---

## 📊 Relationship Types

### Direct Foreign Keys (Hard Links)

#### Many-to-One (FK in child table)
- `users.branch_id` → `branches.id`
- `products.category_id` → `categories.id`
- `invoices.branch_id` → `branches.id`
- `invoices.user_id` → `users.id`
- `invoice_items.invoice_id` → `invoices.id`
- `invoice_items.product_id` → `products.id`
- `stock_balances.product_id` → `products.id`
- `stock_balances.branch_id` → `branches.id`
- `stock_movements.product_id` → `products.id`
- `stock_movements.branch_id` → `branches.id`
- `employees.position_id` → `employee_positions.id`
- `employees.branch_id` → `branches.id`
- `cash_transactions.category_id` → `cash_categories.id`
- `cash_transactions.branch_id` → `branches.id`

**Total:** 14+ direct foreign keys

---

#### One-to-Many (Reverse of Many-to-One)
- `branches` → `users[]`
- `branches` → `invoices[]`
- `branches` → `stock_balances[]`
- `branches` → `stock_movements[]`
- `branches` → `employees[]`
- `branches` → `cash_transactions[]`
- `products` → `invoice_items[]`
- `products` → `stock_balances[]`
- `products` → `stock_movements[]`
- `invoices` → `invoice_items[]`
- `categories` → `products[]`
- `employee_positions` → `employees[]`
- `cash_categories` → `cash_transactions[]`

**Total:** 13+ one-to-many relationships

---

#### Many-to-Many (via Join Tables)
- `users` ↔ `roles` (via `user_roles`)
- `roles` ↔ `permissions` (via `role_permissions`)

**Total:** 2 many-to-many relationships

---

#### Self-Referencing
- `cash_categories.parent_id` → `cash_categories.id` (sub-categories)
- `categories.parent_id` → `categories.id` (sub-categories)

**Total:** 2 self-referencing relationships

---

### Soft Links (Reference Type Pattern)

#### stock_movements → Source Documents
- `reference_type = 'invoice'` → `invoices.id`
- `reference_type = 'invoice_refund'` → `invoices.id`
- `reference_type = 'grn'` → `grn.id`
- `reference_type = 'stock_adjustment'` → `stock_adjustments.id`
- `reference_type = 'stock_transfer'` → `stock_transfers.id`
- `reference_type = 'repair'` → `repair_orders.id`

**Total:** 6 soft link types

---

#### cash_transactions → Source Documents
- `reference_type = 'POS'` → `invoices.id`
- `reference_type = 'PAYROLL'` → `payroll_periods.id`
- `reference_type = 'REPAIR'` → `repair_orders.id`
- `reference_type = 'GRN'` → `grn.id`
- `reference_type = 'ADJUSTMENT'` → `cash_transactions.id` (for adjustments)
- `reference_type = 'MANUAL'` → `null` (manual entry)

**Total:** 6 soft link types

---

## 📊 Relationship Diagram

### Core Flow

```
┌─────────────┐
│  branches   │ (Central Hub)
└─────────────┘
       │
       ├──→ users
       ├──→ employees
       ├──→ invoices
       ├──→ stock_balances
       ├──→ stock_movements
       └──→ cash_transactions

┌─────────────┐
│  products   │
└─────────────┘
       │
       ├──→ invoice_items
       ├──→ stock_balances
       └──→ stock_movements

┌─────────────┐
│  invoices   │
└─────────────┘
       │
       ├──→ invoice_items
       ├──→ stock_movements (soft link)
       └──→ cash_transactions (soft link)

┌─────────────┐
│  employees  │
└─────────────┘
       │
       ├──→ employee_positions
       ├──→ branches
       └──→ invoices (ref_employee_id)
```

---

### Stock Flow

```
products
  ↓
stock_balances (current stock per branch)
  ↓
stock_movements (history)
  ↓
[Soft Link via reference_type/ref_id]
  ├──→ invoices
  ├──→ grn
  ├──→ stock_adjustments
  ├──→ stock_transfers
  └──→ repair_orders
```

---

### Cash Flow

```
cash_transactions
  ├──→ cash_categories
  ├──→ branches
  ├──→ users
  └──→ [Soft Link via reference_type/ref_id]
        ├──→ invoices (POS)
        ├──→ payroll_periods (PAYROLL)
        ├──→ repair_orders (REPAIR)
        └──→ grn (GRN)
```

---

## 📋 Entity Coverage Status

### ✅ Entities Created (17 files)
- ✅ `Product.entity.ts`
- ✅ `Invoice.entity.ts`
- ✅ `InvoiceItem.entity.ts`
- ✅ `StockBalance.entity.ts`
- ✅ `StockMovement.entity.ts`
- ✅ `Employee.entity.ts`
- ✅ `EmployeePosition.entity.ts`
- ✅ `CashTransaction.entity.ts`
- ✅ `CashCategory.entity.ts`
- ✅ `Category.entity.ts`
- ✅ `Unit.entity.ts`
- ✅ `Branch.entity.ts`
- ✅ `User.entity.ts`
- ✅ `Role.entity.ts`
- ✅ `Permission.entity.ts`
- ✅ `RolePermission.entity.ts`

### ⚠️ Missing Entities (22+ tables)
- ⚠️ `UserRole.entity.ts` (user_roles join table)
- ⚠️ `LoginAttempt.entity.ts`
- ⚠️ `FeatureToggle.entity.ts`
- ⚠️ `ProductMedia.entity.ts`
- ⚠️ `InvoiceSequence.entity.ts`
- ⚠️ `Attendance.entity.ts`
- ⚠️ `PayrollPeriod.entity.ts`
- ⚠️ `PayrollItem.entity.ts`
- ⚠️ `PayrollAdjustment.entity.ts`
- ⚠️ `SalaryPayment.entity.ts`
- ⚠️ `HrAuditLog.entity.ts`
- ⚠️ `Contact.entity.ts`
- ⚠️ `ContactBank.entity.ts`
- ⚠️ `ContactAttachment.entity.ts`
- ⚠️ `RepairOrder.entity.ts`
- ⚠️ `RepairItem.entity.ts`
- ⚠️ `RepairStatusHistory.entity.ts`
- ⚠️ `RepairSequence.entity.ts`
- ⚠️ `DocumentType.entity.ts`
- ⚠️ `Document.entity.ts`
- ⚠️ `DocumentItem.entity.ts`
- ⚠️ `DocumentSequence.entity.ts`
- ⚠️ `DocumentAttachment.entity.ts`
- ⚠️ `DocumentHistory.entity.ts`
- ⚠️ `Grn.entity.ts`
- ⚠️ `GrnItem.entity.ts`
- ⚠️ `GrnAttachment.entity.ts`
- ⚠️ `GrnSequence.entity.ts`
- ⚠️ `StockAdjustment.entity.ts`
- ⚠️ `StockAdjustmentItem.entity.ts`
- ⚠️ `StockAdjustmentAttachment.entity.ts`
- ⚠️ `StockAdjustmentSequence.entity.ts`
- ⚠️ `StockTransfer.entity.ts`
- ⚠️ `StockTransferItem.entity.ts`
- ⚠️ `StockTransferAttachment.entity.ts`
- ⚠️ `StockTransferSequence.entity.ts`
- ⚠️ `AuditLog.entity.ts`
- ⚠️ `Setting.entity.ts`
- ⚠️ `BackupHistory.entity.ts`
- ⚠️ `RestoreHistory.entity.ts`
- ⚠️ `CustomerTransaction.entity.ts`
- ⚠️ `CashLink.entity.ts` (optional)
- ⚠️ `SchemaMigration.entity.ts`

---

## 🔗 Key Relationship Patterns

### Pattern 1: Branch-Centric
**ทุก table ที่เกี่ยวกับ branch จะมี `branch_id` FK**

**Tables:**
- users
- employees
- invoices
- stock_balances
- stock_movements
- cash_transactions
- (และอื่นๆ)

---

### Pattern 2: Reference Linking (Soft Links)
**ใช้ `reference_type` + `reference_id` เพื่อ link ไปยัง source documents**

**Tables:**
- stock_movements → invoices, grn, adjustments, transfers, repairs
- cash_transactions → invoices, payroll, repairs, grn
- customer_transactions → invoices, payments

---

### Pattern 3: Many-to-Many via Join Tables
**RBAC system ใช้ join tables**

**Join Tables:**
- `user_roles` (users ↔ roles)
- `role_permissions` (roles ↔ permissions)

---

### Pattern 4: Self-Referencing
**Categories และ Cash Categories รองรับ sub-categories**

**Tables:**
- `categories.parent_id` → `categories.id`
- `cash_categories.parent_id` → `cash_categories.id`

---

## 📊 Statistics

### Total Counts
- **Total Tables:** 39 tables
- **Entities Created:** 17 entities
- **Missing Entities:** 22+ entities
- **Direct Foreign Keys:** 14+ FKs
- **One-to-Many:** 13+ relationships
- **Many-to-Many:** 2 relationships (via join tables)
- **Self-Referencing:** 2 relationships
- **Soft Links:** 12+ link types

---

## 🎯 Priority Entities to Create

### High Priority (Core System)
1. ⚠️ `UserRole.entity.ts` - RBAC join table
2. ⚠️ `Attendance.entity.ts` - HR attendance
3. ⚠️ `PayrollPeriod.entity.ts` - HR payroll
4. ⚠️ `PayrollItem.entity.ts` - HR payroll items
5. ⚠️ `InvoiceSequence.entity.ts` - Invoice numbering

### Medium Priority (Supporting)
6. ⚠️ `ProductMedia.entity.ts` - Product images
7. ⚠️ `Contact.entity.ts` - Customers/Suppliers
8. ⚠️ `AuditLog.entity.ts` - Audit trail

### Low Priority (Additional Features)
9. ⚠️ Repair entities
10. ⚠️ Document entities
11. ⚠️ GRN entities
12. ⚠️ Stock adjustment/transfer entities

---

## 📚 Related Documents

- `docs/DATABASE_SCHEMA_ANALYSIS.md` - Complete database analysis
- `examples/entities/` - Entity examples
- `docs/INTEGRATION_POINTS.md` - Integration points

---

**Status:** 📋 Tables & Relations Summary Complete

**Last Updated:** 2025-01-XX

**⭐ Total: 39 tables | 17 entities created | 22+ entities missing**

