# 💰 Cash Ledger System Design - Complete Guide

**วันที่สร้าง:** 2025-01-XX  
**Version:** 5.0  
**สถานะ:** 📋 Complete Cash Ledger Design

---

## 🎯 Overview

ออกแบบระบบ Cash Ledger (Money Ledger) ที่เป็นระบบกลางสำหรับจัดการเงินเข้า-ออกทั้งหมดในระบบ

**แนวคิดหลัก:** Ledger กลางของเงิน (Money Ledger) - ไม่ใช่แค่รายรับ-รายจ่ายธรรมดา

**หลักการ:**
- ทุก "เงินเข้า/ออก" = 1 record
- มาจากระบบไหนก็ได้
- มี `ref_type` / `ref_id` ชี้กลับต้นทาง
- กรอกมือได้
- ไม่แก้ย้อนหลัง (แก้ = ทำ adjustment ใหม่)

---

## 🏗️ Architecture Overview

### Money Ledger Concept

```
┌─────────────────────────────────────────┐
│  Source Systems                         │
│  - POS (Sales)                         │
│  - Payroll                             │
│  - Repair                              │
│  - Stock (GRN)                         │
│  - Manual Entry                        │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Cash Ledger (Central)                 │
│  - cash_transactions                   │
│  - ref_type / ref_id                   │
│  - Auto-linking                        │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Reports & Analytics                   │
│  - Cash Flow Report                    │
│  - Income/Expense Report               │
│  - Category Analysis                  │
└─────────────────────────────────────────┘
```

---

## 📊 Database Schema Design

### 2.1 cash_transactions (ตารางหลัก)

```sql
CREATE TABLE cash_transactions (
  id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  txn_date DATE NOT NULL COMMENT 'วันที่เกิดรายการ',
  txn_type ENUM('IN', 'OUT') NOT NULL COMMENT 'IN = รายรับ, OUT = รายจ่าย',
  amount DECIMAL(10,2) NOT NULL COMMENT 'จำนวนเงิน',
  category_id INT(11) NOT NULL COMMENT 'FK → cash_categories.id',
  description VARCHAR(500) COMMENT 'รายละเอียด',
  branch_id INT(11) NOT NULL COMMENT 'สาขา',
  ref_type VARCHAR(50) DEFAULT NULL COMMENT 'POS | PAYROLL | REPAIR | MANUAL | STOCK | GRN | etc.',
  ref_id INT(11) DEFAULT NULL COMMENT 'id จากระบบต้นทาง',
  payment_method ENUM('cash', 'transfer', 'bank', 'e-wallet') NOT NULL DEFAULT 'cash',
  status ENUM('draft', 'confirmed', 'void') NOT NULL DEFAULT 'confirmed',
  created_by INT(11) NOT NULL COMMENT 'ผู้สร้าง',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_branch (branch_id),
  INDEX idx_txn_date (txn_date),
  INDEX idx_txn_type (txn_type),
  INDEX idx_category (category_id),
  INDEX idx_ref (ref_type, ref_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  
  FOREIGN KEY (branch_id) REFERENCES branches(id),
  FOREIGN KEY (category_id) REFERENCES cash_categories(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**❗ Important Notes:**
- `ref_type` + `ref_id` = ชี้กลับต้นทาง (nullable สำหรับ manual entry)
- `status = 'void'` = ยกเลิก (ไม่ลบ record)
- `txn_date` = วันที่เกิดรายการ (อาจไม่เท่ากับ `created_at`)

**👉 ตารางเดียวเอาอยู่ 80% ของงาน**

---

### 2.2 cash_categories (หมวดหมู่รายรับ–รายจ่าย)

```sql
CREATE TABLE cash_categories (
  id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE COMMENT 'ชื่อหมวดหมู่',
  type ENUM('IN', 'OUT', 'BOTH') NOT NULL COMMENT 'IN = รายรับ, OUT = รายจ่าย, BOTH = ทั้งสอง',
  parent_id INT(11) DEFAULT NULL COMMENT 'FK → cash_categories.id (รองรับหมวดย่อย)',
  active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1 = ใช้งาน, 0 = ไม่ใช้งาน',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_type (type),
  INDEX idx_parent (parent_id),
  INDEX idx_active (active),
  
  FOREIGN KEY (parent_id) REFERENCES cash_categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Example Categories:**

**รายรับ (IN):**
- ขายหน้าร้าน (POS)
- ค่าซ่อม (Repair)
- รายได้อื่น (Other Income)

**รายจ่าย (OUT):**
- เงินเดือน (Payroll)
- ค่าไฟ (Electricity)
- ค่าเช่า (Rent)
- ค่าอะไหล่ (Parts/Stock)
- ค่าบริการ (Service)

**BOTH:**
- โอนเงินระหว่างบัญชี (Transfer)

---

### 2.3 cash_links (ตารางเชื่อม - Optional)

```sql
CREATE TABLE cash_links (
  id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  cash_transaction_id INT(11) NOT NULL COMMENT 'FK → cash_transactions.id',
  ref_type VARCHAR(50) NOT NULL COMMENT 'POS | PAYROLL | REPAIR | etc.',
  ref_id INT(11) NOT NULL COMMENT 'id จากระบบต้นทาง',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_link (cash_transaction_id, ref_type, ref_id),
  INDEX idx_ref (ref_type, ref_id),
  
  FOREIGN KEY (cash_transaction_id) REFERENCES cash_transactions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**❗ Usage:**
- ใช้ในกรณี 1 เอกสาร → หลาย cash entry
- ถ้า 1 ต่อ 1 ใช้ `ref_type`/`ref_id` ในตารางหลักพอ

**Example:**
- Invoice 1 ใบ → เงินสด 500 + โอน 1000 = 2 cash_transactions
- ทั้ง 2 records ชี้ไป invoice เดียวกันผ่าน `cash_links`

---

### 2.4 Audit (ใช้ของเดิม)

```sql
-- ใช้ audit_logs เดิมได้เลย
-- create / void / adjust
```

**Actions to Log:**
- `create` - สร้าง cash transaction
- `void` - ยกเลิก cash transaction
- `adjust` - ปรับแก้ cash transaction

---

## 🔗 Auto-linking from Existing Systems

### 3.1 POS → รายรับ (Auto-entry)

#### Implementation in InvoiceService

```typescript
// ✅ CORRECT: Auto-create cash transaction when invoice is paid
@Injectable()
export class InvoiceService {
  constructor(
    private cashLedgerService: CashLedgerService,
    private dataSource: DataSource,
  ) {}

  async payInvoice(invoiceId: number, userId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      // 1. Lock invoice
      const invoice = await queryRunner.manager
        .createQueryBuilder(Invoice, 'invoice')
        .setLock('pessimistic_write')
        .where('invoice.id = :id', { id: invoiceId })
        .getOne();

      if (!invoice) {
        throw new NotFoundException('Invoice not found');
      }

      // 2. Idempotency check
      if (invoice.status === 'PAID') {
        await queryRunner.rollbackTransaction();
        return {
          success: true,
          message: 'Invoice already paid',
          invoice,
          idempotent: true,
        };
      }

      // 3. Deduct stock (existing logic)
      // ...

      // 4. Update invoice status
      invoice.status = 'PAID';
      invoice.paid_at = new Date();
      invoice.paid_by = userId;
      await queryRunner.manager.save(invoice);

      // ⭐ 5. Auto-create cash transaction (IN)
      await this.cashLedgerService.createFromInvoice(
        queryRunner, // ⭐ Pass transaction manager
        {
          invoice_id: invoiceId,
          amount: invoice.total_amount,
          txn_date: new Date(),
          payment_method: invoice.payment_method,
          branch_id: invoice.branch_id,
          created_by: userId,
        },
      );

      await queryRunner.commitTransaction();
      return { success: true, invoice };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
```

#### CashLedgerService.createFromInvoice()

```typescript
// ✅ CORRECT: Create cash transaction from invoice
@Injectable()
export class CashLedgerService {
  async createFromInvoice(
    queryRunner: QueryRunner,
    data: {
      invoice_id: number;
      amount: number;
      txn_date: Date;
      payment_method: string;
      branch_id: number;
      created_by: number;
    },
  ) {
    // ⭐ Idempotency check: Don't create duplicate
    const existing = await queryRunner.manager.findOne(CashTransaction, {
      where: {
        ref_type: 'POS',
        ref_id: data.invoice_id,
        status: 'confirmed',
      },
    });

    if (existing) {
      // ⭐ Already exists, return existing
      return existing;
    }

    // ⭐ Get category for POS sales
    const category = await queryRunner.manager.findOne(CashCategory, {
      where: { name: 'ขายหน้าร้าน', type: 'IN' },
    });

    if (!category) {
      throw new NotFoundException('Cash category not found');
    }

    // ⭐ Create cash transaction
    const cashTransaction = queryRunner.manager.create(CashTransaction, {
      txn_date: data.txn_date,
      txn_type: 'IN',
      amount: data.amount,
      category_id: category.id,
      description: `ขายหน้าร้าน - Invoice #${data.invoice_id}`,
      branch_id: data.branch_id,
      ref_type: 'POS',
      ref_id: data.invoice_id,
      payment_method: data.payment_method,
      status: 'confirmed',
      created_by: data.created_by,
    });

    await queryRunner.manager.save(cashTransaction);

    // ⭐ Log audit
    await this.auditLogService.log(
      'create',
      'cash_transaction',
      cashTransaction.id,
      null,
      cashTransaction,
      data.created_by,
    );

    return cashTransaction;
  }
}
```

**❗ Important:**
- 📌 ห้ามให้ FE สร้างเอง
- ทำใน transaction เดียวกับ `payInvoice()`
- Idempotent: ไม่สร้างซ้ำถ้ามีอยู่แล้ว

---

### 3.2 Repair → รายรับ (Auto-entry)

```typescript
// ✅ CORRECT: Auto-create cash transaction when repair invoice is paid
@Injectable()
export class RepairService {
  async processPayment(repairId: number, userId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      // Process repair payment...

      // ⭐ Auto-create cash transaction (IN)
      await this.cashLedgerService.createFromRepair(queryRunner, {
        repair_id: repairId,
        amount: repair.total_amount,
        txn_date: new Date(),
        payment_method: repair.payment_method,
        branch_id: repair.branch_id,
        created_by: userId,
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

// CashLedgerService.createFromRepair()
async createFromRepair(
  queryRunner: QueryRunner,
  data: {
    repair_id: number;
    amount: number;
    txn_date: Date;
    payment_method: string;
    branch_id: number;
    created_by: number;
  },
) {
  // ⭐ Idempotency check
  const existing = await queryRunner.manager.findOne(CashTransaction, {
    where: {
      ref_type: 'REPAIR',
      ref_id: data.repair_id,
      status: 'confirmed',
    },
  });

  if (existing) {
    return existing;
  }

  // ⭐ Get category for repair
  const category = await queryRunner.manager.findOne(CashCategory, {
    where: { name: 'ค่าซ่อม', type: 'IN' },
  });

  const cashTransaction = queryRunner.manager.create(CashTransaction, {
    txn_date: data.txn_date,
    txn_type: 'IN',
    amount: data.amount,
    category_id: category.id,
    description: `ค่าซ่อม - Repair #${data.repair_id}`,
    branch_id: data.branch_id,
    ref_type: 'REPAIR',
    ref_id: data.repair_id,
    payment_method: data.payment_method,
    status: 'confirmed',
    created_by: data.created_by,
  });

  await queryRunner.manager.save(cashTransaction);
  return cashTransaction;
}
```

---

### 3.3 Payroll → รายจ่าย (Auto-entry)

```typescript
// ✅ CORRECT: Auto-create cash transaction when salary is paid
@Injectable()
export class PayrollService {
  async paySalary(periodId: number, employeeIds: number[], userId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      // Process salary payment...

      // ⭐ Auto-create cash transaction (OUT) for each employee
      for (const employeeId of employeeIds) {
        const payrollItem = await this.getPayrollItem(periodId, employeeId);

        await this.cashLedgerService.createFromPayroll(queryRunner, {
          payroll_period_id: periodId,
          employee_id: employeeId,
          amount: payrollItem.net_salary,
          txn_date: new Date(),
          payment_method: paymentMethod,
          branch_id: employee.branch_id,
          created_by: userId,
        });
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

// CashLedgerService.createFromPayroll()
async createFromPayroll(
  queryRunner: QueryRunner,
  data: {
    payroll_period_id: number;
    employee_id: number;
    amount: number;
    txn_date: Date;
    payment_method: string;
    branch_id: number;
    created_by: number;
  },
) {
  // ⭐ Idempotency check
  const existing = await queryRunner.manager.findOne(CashTransaction, {
    where: {
      ref_type: 'PAYROLL',
      ref_id: data.payroll_period_id,
      description: `เงินเดือน - Employee #${data.employee_id}`,
      status: 'confirmed',
    },
  });

  if (existing) {
    return existing;
  }

  // ⭐ Get category for payroll
  const category = await queryRunner.manager.findOne(CashCategory, {
    where: { name: 'เงินเดือน', type: 'OUT' },
  });

  const cashTransaction = queryRunner.manager.create(CashTransaction, {
    txn_date: data.txn_date,
    txn_type: 'OUT',
    amount: data.amount,
    category_id: category.id,
    description: `เงินเดือน - Period #${data.payroll_period_id} - Employee #${data.employee_id}`,
    branch_id: data.branch_id,
    ref_type: 'PAYROLL',
    ref_id: data.payroll_period_id,
    payment_method: data.payment_method,
    status: 'confirmed',
    created_by: data.created_by,
  });

  await queryRunner.manager.save(cashTransaction);
  return cashTransaction;
}
```

---

### 3.4 Stock (GRN) → รายจ่าย (Auto-entry)

```typescript
// ✅ CORRECT: Auto-create cash transaction when GRN is completed
@Injectable()
export class GrnService {
  async completeGrn(grnId: number, userId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      // Process GRN completion...

      // ⭐ Auto-create cash transaction (OUT) if paid
      if (grn.payment_status === 'paid') {
        await this.cashLedgerService.createFromGrn(queryRunner, {
          grn_id: grnId,
          amount: grn.total_amount,
          txn_date: new Date(),
          payment_method: grn.payment_method,
          branch_id: grn.branch_id,
          created_by: userId,
        });
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

// CashLedgerService.createFromGrn()
async createFromGrn(
  queryRunner: QueryRunner,
  data: {
    grn_id: number;
    amount: number;
    txn_date: Date;
    payment_method: string;
    branch_id: number;
    created_by: number;
  },
) {
  // ⭐ Idempotency check
  const existing = await queryRunner.manager.findOne(CashTransaction, {
    where: {
      ref_type: 'GRN',
      ref_id: data.grn_id,
      status: 'confirmed',
    },
  });

  if (existing) {
    return existing;
  }

  // ⭐ Get category for stock purchase
  const category = await queryRunner.manager.findOne(CashCategory, {
    where: { name: 'ค่าอะไหล่', type: 'OUT' },
  });

  const cashTransaction = queryRunner.manager.create(CashTransaction, {
    txn_date: data.txn_date,
    txn_type: 'OUT',
    amount: data.amount,
    category_id: category.id,
    description: `ค่าอะไหล่ - GRN #${data.grn_id}`,
    branch_id: data.branch_id,
    ref_type: 'GRN',
    ref_id: data.grn_id,
    payment_method: data.payment_method,
    status: 'confirmed',
    created_by: data.created_by,
  });

  await queryRunner.manager.save(cashTransaction);
  return cashTransaction;
}
```

---

## 📝 Manual Entry

### 4.1 POST /cash/transactions

**Create manual cash transaction**

**Request Body:**
```typescript
{
  txn_date: "2024-01-07",
  txn_type: "OUT",
  amount: 1200.00,
  category_id: 5,
  description: "ค่าไฟ",
  branch_id: 1,
  payment_method: "transfer"
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    id: 9001,
    txn_date: "2024-01-07",
    txn_type: "OUT",
    amount: 1200.00,
    category: {
      id: 5,
      name: "ค่าไฟ"
    },
    description: "ค่าไฟ",
    branch: {
      id: 1,
      name: "สาขากรุงเทพ"
    },
    ref_type: null, // ⭐ Manual entry = no ref
    ref_id: null,
    payment_method: "transfer",
    status: "confirmed",
    created_at: "2024-01-07T10:30:00Z"
  }
}
```

**Implementation:**
```typescript
@Post('transactions')
@UseGuards(JwtAuthGuard, PermissionGuard, BranchScopeGuard)
@RequirePermission('cash.create')
async createTransaction(
  @Body() dto: CreateCashTransactionDto,
  @CurrentUser() user: User,
) {
  // ⭐ Manual entry: ref_type and ref_id are null
  // ⭐ Use user's branch_id if not provided
  if (!dto.branch_id) {
    dto.branch_id = user.branch_id;
  }

  return await this.cashLedgerService.createManual(dto, user.id);
}
```

---

## 🔌 API Endpoints Design

### 5.1 GET /cash/transactions

**List cash transactions with filters**

**Query Parameters:**
- `branch_id` (optional) - Filter by branch
- `type` (optional) - Filter by type (IN | OUT)
- `category_id` (optional) - Filter by category
- `ref_type` (optional) - Filter by reference type
- `date_from` (optional) - Filter from date (YYYY-MM-DD)
- `date_to` (optional) - Filter to date (YYYY-MM-DD)
- `status` (optional) - Filter by status (draft | confirmed | void)
- `page` (optional) - Page number
- `limit` (optional) - Items per page

**Response:**
```typescript
{
  success: true,
  data: {
    transactions: [
      {
        id: 9001,
        txn_date: "2024-01-07",
        txn_type: "IN",
        amount: 1500.00,
        category: {
          id: 1,
          name: "ขายหน้าร้าน"
        },
        description: "ขายหน้าร้าน - Invoice #123",
        branch: {
          id: 1,
          name: "สาขากรุงเทพ"
        },
        ref: {
          type: "POS",
          id: 123,
          link: "/sales/123" // ⭐ Generated link
        },
        payment_method: "cash",
        status: "confirmed",
        created_by: {
          id: 1,
          name: "พนักงาน A"
        },
        created_at: "2024-01-07T10:30:00Z"
      }
    ],
    pagination: {
      page: 1,
      limit: 20,
      total: 100,
      total_pages: 5
    },
    summary: {
      total_income: 50000.00,
      total_expense: 30000.00,
      net_amount: 20000.00
    }
  }
}
```

---

### 5.2 GET /cash/transactions/:id

**Get cash transaction detail**

**Response:**
```typescript
{
  success: true,
  data: {
    transaction: {
      id: 9001,
      txn_date: "2024-01-07",
      txn_type: "IN",
      amount: 1500.00,
      category: {
        id: 1,
        name: "ขายหน้าร้าน",
        type: "IN"
      },
      description: "ขายหน้าร้าน - Invoice #123",
      branch: {
        id: 1,
        name: "สาขากรุงเทพ"
      },
      ref: {
        type: "POS",
        id: 123,
        link: "/sales/123", // ⭐ Link to source document
        source_doc: { // ⭐ Source document summary
          invoice_no: "BKK-20240107-0001",
          date: "2024-01-07",
          customer_name: "ลูกค้า A"
        }
      },
      payment_method: "cash",
      status: "confirmed",
      created_by: {
        id: 1,
        name: "พนักงาน A"
      },
      created_at: "2024-01-07T10:30:00Z"
    }
  }
}
```

---

### 5.3 POST /cash/transactions/:id/void

**Void cash transaction**

**Request Body:**
```typescript
{
  reason: "ยกเลิกเพราะผิดพลาด" // ⭐ Required
}
```

**Response:**
```typescript
{
  success: true,
  message: "Cash transaction voided",
  data: {
    id: 9001,
    status: "void",
    voided_at: "2024-01-07T11:00:00Z",
    voided_reason: "ยกเลิกเพราะผิดพลาด"
  }
}
```

**Implementation:**
```typescript
@Post('transactions/:id/void')
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequirePermission('cash.void')
async voidTransaction(
  @Param('id') id: number,
  @Body() dto: VoidCashTransactionDto,
  @CurrentUser() user: User,
) {
  return await this.cashLedgerService.voidTransaction(id, dto.reason, user.id);
}

// CashLedgerService.voidTransaction()
async voidTransaction(
  transactionId: number,
  reason: string,
  userId: number,
) {
  const transaction = await this.cashTransactionRepo.findOne({
    where: { id: transactionId },
  });

  if (!transaction) {
    throw new NotFoundException('Transaction not found');
  }

  if (transaction.status === 'void') {
    throw new BadRequestException('Transaction already voided');
  }

  // ⭐ Don't delete, just mark as void
  transaction.status = 'void';
  await this.cashTransactionRepo.save(transaction);

  // ⭐ Log audit
  await this.auditLogService.log(
    'void',
    'cash_transaction',
    transactionId,
    { status: 'confirmed' },
    { status: 'void', reason },
    userId,
  );

  return transaction;
}
```

---

### 5.4 POST /cash/transactions/adjust

**Adjust cash transaction (create new record)**

**Request Body:**
```typescript
{
  original_transaction_id: 9001, // ⭐ Reference to original
  txn_date: "2024-01-07",
  txn_type: "OUT",
  amount: 1300.00, // ⭐ Adjusted amount
  category_id: 5,
  description: "ค่าไฟ (ปรับจาก 1200 เป็น 1300)",
  branch_id: 1,
  payment_method: "transfer",
  reason: "ปรับเพิ่มค่าไฟ 100 บาท" // ⭐ Required
}
```

**Response:**
```typescript
{
  success: true,
  message: "Cash transaction adjusted",
  data: {
    id: 9002, // ⭐ New transaction ID
    original_transaction_id: 9001,
    txn_date: "2024-01-07",
    txn_type: "OUT",
    amount: 1300.00,
    status: "confirmed"
  }
}
```

**Implementation:**
```typescript
@Post('transactions/adjust')
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequirePermission('cash.adjust')
async adjustTransaction(
  @Body() dto: AdjustCashTransactionDto,
  @CurrentUser() user: User,
) {
  return await this.cashLedgerService.adjustTransaction(dto, user.id);
}

// CashLedgerService.adjustTransaction()
async adjustTransaction(
  dto: AdjustCashTransactionDto,
  userId: number,
) {
  // ⭐ Verify original transaction exists
  const original = await this.cashTransactionRepo.findOne({
    where: { id: dto.original_transaction_id },
  });

  if (!original) {
    throw new NotFoundException('Original transaction not found');
  }

  // ⭐ Create new transaction (don't modify original)
  const adjusted = this.cashTransactionRepo.create({
    txn_date: dto.txn_date,
    txn_type: dto.txn_type,
    amount: dto.amount,
    category_id: dto.category_id,
    description: dto.description,
    branch_id: dto.branch_id,
    ref_type: 'ADJUSTMENT', // ⭐ Mark as adjustment
    ref_id: dto.original_transaction_id, // ⭐ Reference to original
    payment_method: dto.payment_method,
    status: 'confirmed',
    created_by: userId,
  });

  await this.cashTransactionRepo.save(adjusted);

  // ⭐ Log audit
  await this.auditLogService.log(
    'adjust',
    'cash_transaction',
    adjusted.id,
    original,
    adjusted,
    userId,
  );

  return adjusted;
}
```

**❗ Important:**
- ❌ ไม่แก้ record เดิม
- ✅ สร้าง record ใหม่
- `ref_type = 'ADJUSTMENT'` + `ref_id = original_transaction_id`

---

## 🎨 UX Integration

### 6.1 จาก Sale Detail

**แสดง "รายการเงินรับ"**

```typescript
// GET /sales/:id/detail
{
  invoice: { ... },
  items: [ ... ],
  cash_transaction: { // ⭐ Add cash transaction link
    id: 9001,
    amount: 1500.00,
    txn_date: "2024-01-07",
    link: "/cash/transactions/9001" // ⭐ Link to cash detail
  }
}
```

**Frontend:**
```html
<!-- Sale Detail Page -->
<div class="cash-transaction-section">
  <h3>รายการเงินรับ</h3>
  <a href="/cash/transactions/9001">
    เงินสด: 1,500.00 บาท
  </a>
</div>
```

---

### 6.2 จาก Payroll

**แสดง "รายการเงินจ่าย"**

```typescript
// GET /hr/payroll/:period_id/detail
{
  period: { ... },
  employees: [ ... ],
  cash_transactions: [ // ⭐ Add cash transactions
    {
      id: 9002,
      employee_id: 1,
      amount: 17000.00,
      link: "/cash/transactions/9002"
    }
  ]
}
```

---

### 6.3 จาก Cash Transaction

**ปุ่ม "ไปเอกสารต้นทาง"**

```typescript
// GET /cash/transactions/:id
{
  transaction: {
    ref: {
      type: "POS",
      id: 123,
      link: "/sales/123" // ⭐ Generated link
    }
  }
}

// Frontend
function getSourceDocumentLink(ref: { type: string; id: number }): string {
  switch (ref.type) {
    case 'POS':
      return `/sales/${ref.id}`;
    case 'PAYROLL':
      return `/hr/payroll/${ref.id}`;
    case 'REPAIR':
      return `/repairs/${ref.id}`;
    case 'GRN':
      return `/grn/${ref.id}`;
    default:
      return null;
  }
}
```

---

## 🎨 Sidebar Menu

### เพิ่มหมวดใหม่

```
💰 การเงิน
├── 📊 ภาพรวมรายรับ–รายจ่าย
│   ├── Dashboard (สรุปยอด)
│   └── Cash Flow Chart
├── 📋 รายการเงินเข้า–ออก
│   ├── รายการทั้งหมด
│   ├── รายรับ
│   ├── รายจ่าย
│   └── กรอกรายการใหม่
├── 🏷️ หมวดหมู่รายรับ–รายจ่าย
│   ├── รายการหมวดหมู่
│   └── เพิ่มหมวดหมู่
└── 📊 รายงานกระแสเงินสด
    ├── รายงานรายวัน
    ├── รายงานรายเดือน
    ├── รายงานรายปี
    └── ส่งออก Excel
```

**(วางใกล้ Report จะสวย)**

---

## ⚠️ Critical Points to Watch

### ❗ Rule 1: ห้ามให้ FE ใส่ ref_type/ref_id มั่ว

```typescript
// ❌ WRONG: FE can set ref_type/ref_id
POST /cash/transactions
{
  ref_type: "POS", // ⚠️ FE can set this
  ref_id: 123
}

// ✅ CORRECT: Only BE can set ref_type/ref_id
// Manual entry: ref_type = null, ref_id = null
// Auto-entry: BE sets ref_type/ref_id in service
```

**Implementation:**
```typescript
@Post('transactions')
async createTransaction(@Body() dto: CreateCashTransactionDto) {
  // ⭐ Remove ref_type/ref_id from DTO if present
  delete dto.ref_type;
  delete dto.ref_id;
  
  // ⭐ Manual entry = no ref
  return await this.cashLedgerService.createManual(dto);
}
```

---

### ❗ Rule 2: Auto-entry ต้อง idempotent

```typescript
// ✅ CORRECT: Check before creating
async createFromInvoice(...) {
  // ⭐ Idempotency check
  const existing = await this.cashTransactionRepo.findOne({
    where: {
      ref_type: 'POS',
      ref_id: invoiceId,
      status: 'confirmed',
    },
  });

  if (existing) {
    return existing; // ⭐ Return existing, don't create duplicate
  }

  // Create new...
}
```

---

### ❗ Rule 3: ลบ = void เท่านั้น

```typescript
// ❌ WRONG: Delete transaction
DELETE /cash/transactions/:id

// ✅ CORRECT: Void transaction
POST /cash/transactions/:id/void
{
  reason: "ยกเลิกเพราะผิดพลาด"
}
```

**Implementation:**
```typescript
// ⭐ Don't provide DELETE endpoint
// ⭐ Only provide VOID endpoint
@Post('transactions/:id/void')
async voidTransaction(...) {
  // Mark as void, don't delete
  transaction.status = 'void';
  await this.save(transaction);
}
```

---

### ❗ Rule 4: Branch scope ต้อง enforce

```typescript
// ✅ CORRECT: Enforce branch scope
@Post('transactions')
@UseGuards(JwtAuthGuard, BranchScopeGuard)
async createTransaction(@Body() dto: CreateCashTransactionDto, @CurrentUser() user: User) {
  // ⭐ Use user's branch_id
  dto.branch_id = user.branch_id;
  
  return await this.cashLedgerService.createManual(dto);
}

@Get('transactions')
@UseGuards(JwtAuthGuard, BranchScopeGuard)
async listTransactions(@Query() filters: FilterCashTransactionDto, @CurrentUser() user: User) {
  // ⭐ Filter by user's branch
  filters.branch_id = user.branch_id;
  
  return await this.cashLedgerService.list(filters);
}
```

---

### ❗ Rule 5: เงิน = sensitive → log ทุก action

```typescript
// ✅ CORRECT: Log all cash transaction actions
@Injectable()
export class CashLedgerService {
  async createManual(dto: CreateCashTransactionDto, userId: number) {
    const transaction = await this.cashTransactionRepo.save({
      ...dto,
      created_by: userId,
    });

    // ⭐ Log audit
    await this.auditLogService.log(
      'create',
      'cash_transaction',
      transaction.id,
      null,
      transaction,
      userId,
    );

    return transaction;
  }

  async voidTransaction(id: number, reason: string, userId: number) {
    const before = await this.findOne(id);
    
    // Void transaction
    const after = { ...before, status: 'void' };
    await this.cashTransactionRepo.update(id, { status: 'void' });

    // ⭐ Log audit
    await this.auditLogService.log(
      'void',
      'cash_transaction',
      id,
      before,
      after,
      userId,
    );
  }
}
```

---

## 📋 Development Order (ไม่สะดุด)

### Phase 1: Foundation (Week 1)
1. ✅ **cash_categories**
   - Create entity
   - Create CRUD endpoints
   - Seed default categories

---

### Phase 2: Core (Week 2)
2. ✅ **cash_transactions**
   - Create entity
   - Create CRUD endpoints
   - Add validation
   - Add branch scope

---

### Phase 3: Auto-linking (Week 3-4)
3. ✅ **Auto-hook จาก POS**
   - Integrate with InvoiceService
   - Auto-create on payment
   - Idempotency check

4. ✅ **Auto-hook จาก Payroll**
   - Integrate with PayrollService
   - Auto-create on payment
   - Idempotency check

---

### Phase 4: Manual Entry (Week 5)
5. ✅ **Manual entry**
   - Create manual transaction endpoint
   - Validation
   - Branch scope enforcement

---

### Phase 5: Reports (Week 6)
6. ✅ **Reports (daily / monthly)**
   - Cash flow report
   - Income/Expense report
   - Category analysis
   - Export to Excel

---

### Phase 6: Security (Week 7)
7. ✅ **Permission + audit**
   - Add permissions
   - Audit logging
   - Role-based access

---

## 📚 Related Documents

- `docs/HR_SYSTEM_DESIGN.md` - HR System Design
- `docs/API_CONTRACTS.md` - API Contracts
- `docs/SECURITY_AND_BUGS_ANALYSIS.md` - Security & Bugs
- `docs/CRITICAL_BUGS_AND_SOLUTIONS.md` - Critical Bugs

---

**Status:** 📋 Cash Ledger Design Complete

**Last Updated:** 2025-01-XX

**⭐ Critical: Follow all rules to prevent bugs**

