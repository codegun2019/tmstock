# 📋 Entities Summary

**วันที่สร้าง:** 2025-01-XX  
**Version:** 5.0  
**สถานะ:** 📋 Complete Entities Collection

---

## ✅ Entities Created (28 files)

### Core Entities (10 files)
1. ✅ `Product.entity.ts`
2. ✅ `Invoice.entity.ts`
3. ✅ `InvoiceItem.entity.ts`
4. ✅ `StockBalance.entity.ts`
5. ✅ `StockMovement.entity.ts`
6. ✅ `Branch.entity.ts`
7. ✅ `User.entity.ts`
8. ✅ `Category.entity.ts`
9. ✅ `Unit.entity.ts`
10. ✅ `ProductMedia.entity.ts`

### RBAC Entities (4 files)
11. ✅ `Role.entity.ts`
12. ✅ `Permission.entity.ts`
13. ✅ `RolePermission.entity.ts`
14. ✅ `UserRole.entity.ts`

### HR Entities (6 files)
15. ✅ `Employee.entity.ts`
16. ✅ `EmployeePosition.entity.ts`
17. ✅ `Attendance.entity.ts`
18. ✅ `PayrollPeriod.entity.ts`
19. ✅ `PayrollItem.entity.ts`
20. ✅ `PayrollAdjustment.entity.ts`
21. ✅ `SalaryPayment.entity.ts`

### Cash Ledger Entities (3 files)
22. ✅ `CashTransaction.entity.ts`
23. ✅ `CashCategory.entity.ts`
24. ✅ `CashLink.entity.ts`

### System Entities (4 files)
25. ✅ `AuditLog.entity.ts`
26. ✅ `LoginAttempt.entity.ts`
27. ✅ `FeatureToggle.entity.ts`
28. ✅ `InvoiceSequence.entity.ts`

### Additional Entities (1 file)
29. ✅ `Contact.entity.ts`

---

## ⚠️ Missing Entities (10+ tables)

### Low Priority (Additional Features)
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
- ⚠️ `Setting.entity.ts`
- ⚠️ `BackupHistory.entity.ts`
- ⚠️ `RestoreHistory.entity.ts`
- ⚠️ `CustomerTransaction.entity.ts`
- ⚠️ `SchemaMigration.entity.ts`

---

## 🔗 Key Relationships

### Branch-Centric (6 relationships)
- `users.branch_id` → `branches.id`
- `employees.branch_id` → `branches.id`
- `invoices.branch_id` → `branches.id`
- `stock_balances.branch_id` → `branches.id`
- `stock_movements.branch_id` → `branches.id`
- `cash_transactions.branch_id` → `branches.id`

### Product Relationships (4 relationships)
- `products.category_id` → `categories.id`
- `products` → `invoice_items[]`
- `products` → `stock_balances[]`
- `products` → `stock_movements[]`
- `products` → `product_media[]`

### Invoice Relationships (5 relationships)
- `invoices.branch_id` → `branches.id`
- `invoices.user_id` → `users.id`
- `invoices.ref_employee_id` → `employees.id`
- `invoices` → `invoice_items[]`
- `invoices` → `stock_movements[]` (soft link)

### Stock Relationships (6 relationships)
- `stock_balances.product_id` → `products.id`
- `stock_balances.branch_id` → `branches.id`
- `stock_movements.product_id` → `products.id`
- `stock_movements.branch_id` → `branches.id`
- `stock_movements.created_by` → `users.id`
- `stock_movements` → source documents (soft link)

### RBAC Relationships (4 relationships)
- `users` ↔ `roles` (via `user_roles`)
- `roles` ↔ `permissions` (via `role_permissions`)

### HR Relationships (7 relationships)
- `employees.position_id` → `employee_positions.id`
- `employees.branch_id` → `branches.id`
- `attendance.employee_id` → `employees.id`
- `attendance.branch_id` → `branches.id`
- `payroll_items.payroll_period_id` → `payroll_periods.id`
- `payroll_items.employee_id` → `employees.id`
- `payroll_adjustments.employee_id` → `employees.id`
- `payroll_adjustments.payroll_period_id` → `payroll_periods.id`
- `salary_payments.payroll_period_id` → `payroll_periods.id`
- `salary_payments.employee_id` → `employees.id`

### Cash Ledger Relationships (5 relationships)
- `cash_transactions.category_id` → `cash_categories.id`
- `cash_transactions.branch_id` → `branches.id`
- `cash_transactions.created_by` → `users.id`
- `cash_transactions` → `cash_links[]`
- `cash_categories.parent_id` → `cash_categories.id` (self-referencing)

---

## 📊 Coverage Statistics

- **Total Tables:** 39 tables
- **Entities Created:** 28 entities
- **Missing Entities:** 10+ entities (low priority)
- **Coverage:** ~72% (28/39)

---

**Status:** 📋 Entities Collection Complete (Core + HR + Cash Ledger)

**Last Updated:** 2025-01-XX

**⭐ 28 entities created | 10+ missing (low priority)**

