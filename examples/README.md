# 📚 Code Examples - NestJS Migration

**วันที่สร้าง:** 2025-01-XX  
**Version:** 5.0  
**สถานะ:** 📋 Code Examples Collection

---

## 🎯 Overview

Collection of code examples for NestJS migration, following best practices and critical rules.

---

## 📁 Structure

```
examples/
├── entities/              # TypeORM entities (28 files)
│   ├── Product.entity.ts
│   ├── Invoice.entity.ts
│   ├── InvoiceItem.entity.ts
│   ├── StockBalance.entity.ts
│   ├── StockMovement.entity.ts
│   ├── Employee.entity.ts
│   ├── EmployeePosition.entity.ts
│   ├── CashTransaction.entity.ts
│   ├── CashCategory.entity.ts
│   ├── Category.entity.ts
│   ├── Unit.entity.ts
│   ├── Branch.entity.ts
│   ├── User.entity.ts
│   ├── Role.entity.ts
│   ├── Permission.entity.ts
│   └── RolePermission.entity.ts
├── dto/                   # DTOs with validation (11 files)
│   ├── CreateInvoiceDto.ts
│   ├── CreateCashTransactionDto.ts
│   ├── CreateProductDto.ts
│   ├── UpdateProductDto.ts
│   ├── CreateEmployeeDto.ts
│   ├── CreateAttendanceDto.ts
│   ├── VoidInvoiceDto.ts
│   ├── RefundInvoiceDto.ts
│   ├── CreatePayrollPeriodDto.ts
│   ├── VoidCashTransactionDto.ts
│   └── AdjustCashTransactionDto.ts
├── seeders/               # Database seeders (7 files)
│   ├── MainSeeder.ts
│   ├── RolesPermissionsSeeder.ts
│   ├── BranchesSeeder.ts
│   ├── CashCategoriesSeeder.ts
│   ├── EmployeePositionsSeeder.ts
│   ├── CategoriesSeeder.ts
│   └── UnitsSeeder.ts
├── services/              # Business logic services (3 files)
│   ├── InvoiceService.example.ts
│   ├── InventoryService.example.ts
│   └── CashLedgerService.example.ts
├── controllers/           # API controllers (1 file)
│   └── InvoicesController.example.ts
├── guards/                # Auth & permission guards (2 files)
│   ├── PermissionGuard.example.ts
│   └── BranchScopeGuard.example.ts
├── modules/               # NestJS modules (1 file)
│   └── InvoicesModule.example.ts
├── README.md              # Examples guide
└── DTO_SEEDER_SUMMARY.md  # DTOs & Seeders summary
```

**Total: 53+ files**

**Entities: 28 files | DTOs: 11 files | Seeders: 7 files | Services: 3 files | Controllers: 1 file | Guards: 2 files | Modules: 1 file**

---

## 🔑 Key Patterns

### 1. Transaction Safety
- ✅ Always use transactions for multi-step operations
- ✅ Pass QueryRunner to child services (don't create new transactions)
- ✅ Rollback on error
- ✅ Release QueryRunner in finally block

### 2. Row-level Locking
- ✅ Use `setLock('pessimistic_write')` for stock operations
- ✅ Lock BEFORE checking stock availability
- ✅ Update in same transaction

### 3. Idempotency
- ✅ Check status before processing
- ✅ Return existing if already processed
- ✅ Use unique constraints where possible

### 4. Auto-linking
- ✅ BE sets `ref_type` and `ref_id` (FE cannot)
- ✅ Manual entry = `ref_type = null, ref_id = null`
- ✅ Auto-entry = BE sets ref_type/ref_id

### 5. Security
- ✅ Use guards on all endpoints
- ✅ Check permissions for each operation
- ✅ Enforce branch scope
- ✅ Log all sensitive operations

---

## 📖 Usage

### For Developers
1. Copy examples and adapt to your needs
2. Follow patterns and best practices
3. Ensure all critical rules are followed
4. Test thoroughly before deployment

### For Cursor AI
1. Use examples as templates
2. Follow patterns exactly
3. Ensure all critical points are covered
4. Generate code following examples

---

## ⚠️ Critical Rules

### Rule 1: Stock Deduction
- ✅ Only deduct when payment_status = 'paid'
- ✅ Use row-level locking
- ✅ Check stock availability after lock
- ✅ Deduct in same transaction as invoice creation

### Rule 2: Idempotency
- ✅ Check status before processing
- ✅ Return success if already processed
- ✅ Don't create duplicate records

### Rule 3: Transaction Safety
- ✅ Use transactions for multi-step operations
- ✅ Pass QueryRunner to child services
- ✅ Rollback on error

### Rule 4: Security
- ✅ Validate all inputs
- ✅ Check permissions
- ✅ Enforce branch scope
- ✅ Log all actions

---

## 📚 Related Documents

- `docs/CRITICAL_BUGS_AND_SOLUTIONS.md` - Critical bugs and solutions
- `docs/SECURITY_AND_BUGS_ANALYSIS.md` - Security analysis
- `docs/API_CONTRACTS.md` - API contracts
- `docs/HR_SYSTEM_DESIGN.md` - HR system design
- `docs/CASH_LEDGER_DESIGN.md` - Cash ledger design

---

**Status:** 📋 Examples Collection Complete

**Last Updated:** 2025-01-XX

**⭐ Use examples as templates and follow all critical rules**

