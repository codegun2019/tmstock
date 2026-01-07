# 👥 HR System Design - Complete Guide

**วันที่สร้าง:** 2025-01-XX  
**Version:** 5.0  
**สถานะ:** 📋 Complete HR System Design

---

## 🎯 Overview

ออกแบบระบบ HR (Human Resources) สำหรับ mstock POS ที่ครอบคลุม:
- การจัดการพนักงาน
- การคำนวณเงินเดือน
- การจัดการเวลาเข้า-ออกงาน
- การจ่ายเงินเดือน

**แนวคิดหลัก:** HR = People + Time + Money + Audit

---

## 🏗️ Architecture Overview

### 4-Layer Architecture

```
┌─────────────────────────────────────────┐
│  Layer 1: People (Master Data)         │
│  - Employees                            │
│  - Positions                            │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Layer 2: Time (Attendance)             │
│  - Check-in/Check-out                  │
│  - Work hours                           │
│  - Leave management                     │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Layer 3: Money (Payroll)              │
│  - Payroll periods                      │
│  - Salary calculation                   │
│  - Payments                             │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Layer 4: Security + Audit             │
│  - HR Audit logs                        │
│  - Role-based access                    │
│  - Data protection                     │
└─────────────────────────────────────────┘
```

---

## 📊 Database Schema Design

### 2.1 employees (ตารางหลักพนักงาน)

```sql
CREATE TABLE employees (
  id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  employee_code VARCHAR(50) NOT NULL UNIQUE COMMENT 'รหัสพนักงาน',
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  position_id INT(11) NOT NULL,
  branch_id INT(11) NOT NULL,
  employment_type ENUM('fulltime', 'parttime', 'daily') NOT NULL DEFAULT 'fulltime',
  salary_type ENUM('monthly', 'daily', 'hourly') NOT NULL DEFAULT 'monthly',
  base_salary DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'เงินเดือนฐาน (ใช้เป็น base เท่านั้น)',
  hire_date DATE NOT NULL,
  status ENUM('active', 'resigned', 'suspended') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_branch (branch_id),
  INDEX idx_position (position_id),
  INDEX idx_status (status),
  INDEX idx_employee_code (employee_code),
  
  FOREIGN KEY (branch_id) REFERENCES branches(id),
  FOREIGN KEY (position_id) REFERENCES employee_positions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**❗ Important Notes:**
- `base_salary` = เงินเดือนฐานเท่านั้น (ไม่ใช่เงินเดือนจริง)
- เงินเดือนจริงคำนวณจาก `payroll_items`
- `employee_code` ต้อง unique

---

### 2.2 employee_positions (ตำแหน่งงาน)

```sql
CREATE TABLE employee_positions (
  id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Example Positions:**
- Cashier (พนักงานขาย)
- Manager (ผู้จัดการ)
- Stock Keeper (พนักงานสต็อค)
- Accountant (บัญชี)

---

### 2.3 attendance (เวลาเข้า–ออกงาน)

```sql
CREATE TABLE attendance (
  id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  employee_id INT(11) NOT NULL,
  branch_id INT(11) NOT NULL,
  work_date DATE NOT NULL,
  check_in DATETIME,
  check_out DATETIME,
  work_hours DECIMAL(5,2) DEFAULT 0.00 COMMENT 'ชั่วโมงทำงาน',
  status ENUM('present', 'late', 'absent', 'leave') NOT NULL DEFAULT 'present',
  notes TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_employee_date (employee_id, work_date),
  INDEX idx_branch (branch_id),
  INDEX idx_work_date (work_date),
  INDEX idx_status (status),
  
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  FOREIGN KEY (branch_id) REFERENCES branches(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**❗ Important Notes:**
- `work_date` + `employee_id` = unique (1 วันต่อพนักงาน)
- `work_hours` คำนวณจาก `check_in` และ `check_out`
- `status` ใช้สำหรับคำนวณเงินเดือน (ขาดงาน = หักเงิน)

---

### 2.4 payroll_periods (รอบเงินเดือน)

```sql
CREATE TABLE payroll_periods (
  id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  period_month INT(2) NOT NULL COMMENT 'เดือน (1-12)',
  period_year INT(4) NOT NULL COMMENT 'ปี',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('draft', 'calculated', 'paid', 'locked') NOT NULL DEFAULT 'draft',
  calculated_at DATETIME DEFAULT NULL,
  calculated_by INT(11) DEFAULT NULL,
  locked_at DATETIME DEFAULT NULL,
  locked_by INT(11) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_period (period_month, period_year),
  INDEX idx_status (status),
  INDEX idx_dates (start_date, end_date),
  
  FOREIGN KEY (calculated_by) REFERENCES users(id),
  FOREIGN KEY (locked_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**❗ Important Notes:**
- `status = 'locked'` = ห้ามแก้ย้อนหลัง (กันบัค)
- `period_month` + `period_year` = unique (1 รอบต่อเดือน)
- `calculated_at` = เวลาที่คำนวณเงินเดือน
- `locked_at` = เวลาที่ล็อค (ห้ามแก้)

---

### 2.5 payroll_items (เงินเดือนจริง)

```sql
CREATE TABLE payroll_items (
  id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  payroll_period_id INT(11) NOT NULL,
  employee_id INT(11) NOT NULL,
  base_salary DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'เงินเดือนฐาน (snapshot)',
  overtime_amount DECIMAL(10,2) DEFAULT 0.00 COMMENT 'ค่าล่วงเวลา',
  commission_amount DECIMAL(10,2) DEFAULT 0.00 COMMENT 'คอมมิชชั่น',
  allowance_amount DECIMAL(10,2) DEFAULT 0.00 COMMENT 'เบี้ยเลี้ยง/โบนัส',
  deduction_amount DECIMAL(10,2) DEFAULT 0.00 COMMENT 'หัก (ขาดงาน, ค่าปรับ)',
  net_salary DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'เงินเดือนสุทธิ',
  calculated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_employee_period (payroll_period_id, employee_id),
  INDEX idx_period (payroll_period_id),
  INDEX idx_employee (employee_id),
  
  FOREIGN KEY (payroll_period_id) REFERENCES payroll_periods(id),
  FOREIGN KEY (employee_id) REFERENCES employees(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**❗ Important Notes:**
- `base_salary` = snapshot จาก `employees.base_salary` ตอนคำนวณ
- `net_salary` = `base_salary` + `overtime_amount` + `commission_amount` + `allowance_amount` - `deduction_amount`
- `payroll_period_id` + `employee_id` = unique (1 รายการต่อพนักงานต่อรอบ)

---

### 2.6 payroll_adjustments (เพิ่ม/หัก)

```sql
CREATE TABLE payroll_adjustments (
  id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  employee_id INT(11) NOT NULL,
  payroll_period_id INT(11) NOT NULL,
  type ENUM('allowance', 'deduction') NOT NULL COMMENT 'allowance = เพิ่ม, deduction = หัก',
  amount DECIMAL(10,2) NOT NULL,
  reason VARCHAR(500) NOT NULL COMMENT 'เหตุผล (บังคับ)',
  created_by INT(11) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_employee_period (employee_id, payroll_period_id),
  INDEX idx_type (type),
  
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  FOREIGN KEY (payroll_period_id) REFERENCES payroll_periods(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Usage Examples:**
- **Allowance:** โบนัส, ค่าทำงานล่วงเวลา, คอมมิชชั่นพิเศษ
- **Deduction:** หักขาดงาน, ค่าปรับ, หักเงินกู้

---

### 2.7 salary_payments (จ่ายเงินจริง)

```sql
CREATE TABLE salary_payments (
  id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  payroll_period_id INT(11) NOT NULL,
  employee_id INT(11) NOT NULL,
  payment_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL COMMENT 'จำนวนที่จ่าย',
  payment_method ENUM('cash', 'transfer', 'cheque') NOT NULL DEFAULT 'transfer',
  ref_no VARCHAR(100) COMMENT 'เลขที่อ้างอิง (เช็ค, โอน)',
  notes TEXT,
  paid_by INT(11) NOT NULL COMMENT 'ผู้จ่าย',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_period (payroll_period_id),
  INDEX idx_employee (employee_id),
  INDEX idx_payment_date (payment_date),
  
  FOREIGN KEY (payroll_period_id) REFERENCES payroll_periods(id),
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  FOREIGN KEY (paid_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**❗ Important Notes:**
- `amount` = จำนวนที่จ่ายจริง (อาจไม่เท่ากับ `net_salary` ถ้าจ่ายบางส่วน)
- `payment_method` = วิธีจ่าย (เงินสด, โอน, เช็ค)
- `ref_no` = เลขที่อ้างอิง (เช็ค, โอน)

---

### 2.8 hr_audit_logs (Audit Log)

```sql
CREATE TABLE hr_audit_logs (
  id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  actor_user_id INT(11) NOT NULL COMMENT 'ผู้ทำ',
  action VARCHAR(50) NOT NULL COMMENT 'create, update, delete, calculate, lock, pay',
  entity_type VARCHAR(50) NOT NULL COMMENT 'employee, attendance, payroll, payment',
  entity_id INT(11) DEFAULT NULL,
  before_data JSON DEFAULT NULL COMMENT 'ข้อมูลก่อนแก้ไข',
  after_data JSON DEFAULT NULL COMMENT 'ข้อมูลหลังแก้ไข',
  branch_id INT(11) DEFAULT NULL,
  ip_address VARCHAR(45),
  user_agent VARCHAR(255),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_actor (actor_user_id),
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at),
  
  FOREIGN KEY (actor_user_id) REFERENCES users(id),
  FOREIGN KEY (branch_id) REFERENCES branches(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**❗ Important Notes:**
- Log ทุก action ที่เกี่ยวกับ HR
- `before_data` / `after_data` = JSON สำหรับเก็บข้อมูลก่อน/หลัง
- ใช้สำหรับ audit และป้องกัน fraud

---

## 🔌 API Endpoints Design

### 3.1 Employees Management

#### GET /hr/employees
**List employees with filters**

**Query Parameters:**
- `branch_id` (optional) - Filter by branch
- `status` (optional) - Filter by status (active, resigned, suspended)
- `position_id` (optional) - Filter by position
- `search` (optional) - Search by name or employee_code
- `page` (optional) - Page number
- `limit` (optional) - Items per page

**Response:**
```typescript
{
  success: true,
  data: {
    employees: [
      {
        id: 1,
        employee_code: "EMP001",
        first_name: "สมชาย",
        last_name: "ใจดี",
        phone: "0812345678",
        email: "somchai@example.com",
        position: {
          id: 1,
          name: "Cashier"
        },
        branch: {
          id: 1,
          name: "สาขากรุงเทพ"
        },
        employment_type: "fulltime",
        salary_type: "monthly",
        base_salary: 15000.00,
        hire_date: "2024-01-15",
        status: "active"
      }
    ],
    pagination: {
      page: 1,
      limit: 20,
      total: 50,
      total_pages: 3
    }
  }
}
```

---

#### POST /hr/employees
**Create new employee**

**Request Body:**
```typescript
{
  employee_code: "EMP002",
  first_name: "สมหญิง",
  last_name: "รักดี",
  phone: "0812345679",
  email: "somying@example.com",
  position_id: 1,
  branch_id: 1,
  employment_type: "fulltime",
  salary_type: "monthly",
  base_salary: 15000.00,
  hire_date: "2024-01-20"
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    id: 2,
    employee_code: "EMP002",
    // ... other fields
  }
}
```

---

#### GET /hr/employees/:id
**Get employee detail**

**Response:**
```typescript
{
  success: true,
  data: {
    employee: {
      id: 1,
      employee_code: "EMP001",
      // ... all fields
    },
    attendance_summary: {
      total_days: 22,
      present_days: 20,
      late_days: 2,
      absent_days: 0
    },
    recent_payroll: [
      {
        period: "2024-01",
        net_salary: 15000.00,
        status: "paid"
      }
    ]
  }
}
```

---

#### PUT /hr/employees/:id
**Update employee**

**Request Body:**
```typescript
{
  first_name: "สมชาย",
  last_name: "ใจดีมาก",
  base_salary: 16000.00, // ⭐ Update base salary
  // ... other fields
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    id: 1,
    // ... updated fields
  }
}
```

---

### 3.2 Attendance Management

#### POST /hr/attendance/check-in
**Check-in (เข้างาน)**

**Request Body:**
```typescript
{
  employee_id: 1,
  branch_id: 1, // ⭐ Must match user's branch
  work_date: "2024-01-20", // Optional, default = today
  check_in: "2024-01-20T08:30:00Z", // Optional, default = now
  notes: "สแกน QR code" // Optional
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    id: 1,
    employee_id: 1,
    work_date: "2024-01-20",
    check_in: "2024-01-20T08:30:00Z",
    status: "present"
  }
}
```

**❗ Important:**
- ถ้า `check_in` หลัง 9:00 = `status = 'late'`
- ถ้า `check_in` ก่อน 8:00 = `status = 'present'`

---

#### POST /hr/attendance/check-out
**Check-out (ออกงาน)**

**Request Body:**
```typescript
{
  employee_id: 1,
  work_date: "2024-01-20", // Required
  check_out: "2024-01-20T17:30:00Z", // Optional, default = now
  notes: "ออกงานปกติ" // Optional
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    id: 1,
    employee_id: 1,
    work_date: "2024-01-20",
    check_in: "2024-01-20T08:30:00Z",
    check_out: "2024-01-20T17:30:00Z",
    work_hours: 9.0, // ⭐ Calculated automatically
    status: "present"
  }
}
```

**❗ Important:**
- `work_hours` คำนวณจาก `check_in` และ `check_out`
- ถ้า `work_hours < 8` = อาจต้องหักเงิน

---

#### GET /hr/attendance
**Get attendance records**

**Query Parameters:**
- `employee_id` (optional) - Filter by employee
- `branch_id` (optional) - Filter by branch
- `date` (optional) - Filter by date (YYYY-MM-DD)
- `start_date` (optional) - Filter from date
- `end_date` (optional) - Filter to date
- `status` (optional) - Filter by status
- `page` (optional) - Page number
- `limit` (optional) - Items per page

**Response:**
```typescript
{
  success: true,
  data: {
    attendance: [
      {
        id: 1,
        employee: {
          id: 1,
          employee_code: "EMP001",
          name: "สมชาย ใจดี"
        },
        branch: {
          id: 1,
          name: "สาขากรุงเทพ"
        },
        work_date: "2024-01-20",
        check_in: "2024-01-20T08:30:00Z",
        check_out: "2024-01-20T17:30:00Z",
        work_hours: 9.0,
        status: "present"
      }
    ],
    pagination: {
      page: 1,
      limit: 20,
      total: 100,
      total_pages: 5
    }
  }
}
```

---

### 3.3 Payroll Periods Management

#### POST /hr/payroll/periods
**Create payroll period**

**Request Body:**
```typescript
{
  period_month: 1, // 1-12
  period_year: 2024,
  start_date: "2024-01-01",
  end_date: "2024-01-31"
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    id: 1,
    period_month: 1,
    period_year: 2024,
    start_date: "2024-01-01",
    end_date: "2024-01-31",
    status: "draft"
  }
}
```

---

#### GET /hr/payroll/periods
**List payroll periods**

**Query Parameters:**
- `year` (optional) - Filter by year
- `status` (optional) - Filter by status
- `page` (optional) - Page number
- `limit` (optional) - Items per page

**Response:**
```typescript
{
  success: true,
  data: {
    periods: [
      {
        id: 1,
        period_month: 1,
        period_year: 2024,
        start_date: "2024-01-01",
        end_date: "2024-01-31",
        status: "calculated",
        calculated_at: "2024-02-01T10:00:00Z",
        total_employees: 10,
        total_amount: 150000.00
      }
    ],
    pagination: {
      page: 1,
      limit: 20,
      total: 12,
      total_pages: 1
    }
  }
}
```

---

#### POST /hr/payroll/:period_id/calculate
**Calculate payroll for period**

**Request Body:**
```typescript
{
  // No body required
}
```

**Response:**
```typescript
{
  success: true,
  message: "Payroll calculated successfully",
  data: {
    period_id: 1,
    total_employees: 10,
    total_amount: 150000.00,
    calculated_at: "2024-02-01T10:00:00Z"
  }
}
```

**❗ Important:**
- Idempotent: กด calculate ซ้ำได้ (ไม่คำนวณซ้ำ)
- ถ้า `status = 'calculated'` หรือ `'paid'` หรือ `'locked'` = return success (idempotent)

---

#### POST /hr/payroll/:period_id/lock
**Lock payroll period (ห้ามแก้ย้อนหลัง)**

**Request Body:**
```typescript
{
  // No body required
}
```

**Response:**
```typescript
{
  success: true,
  message: "Payroll period locked",
  data: {
    period_id: 1,
    status: "locked",
    locked_at: "2024-02-05T10:00:00Z"
  }
}
```

**❗ Important:**
- Lock แล้วห้ามแก้ `payroll_items` และ `payroll_adjustments`
- Lock แล้วห้ามคำนวณใหม่ (ยกเว้น unlock ก่อน)

---

### 3.4 Payroll Items (รายละเอียดเงินเดือน)

#### GET /hr/payroll/:period_id/employees
**Get payroll items for period (รายละเอียดเงินเดือนรายคน)**

**Response:**
```typescript
{
  success: true,
  data: {
    period: {
      id: 1,
      period_month: 1,
      period_year: 2024,
      status: "calculated"
    },
    employees: [
      {
        employee_id: 1,
        employee_code: "EMP001",
        name: "สมชาย ใจดี",
        base_salary: 15000.00, // ⭐ Snapshot
        overtime_amount: 2000.00,
        commission_amount: 500.00,
        allowance_amount: 0.00,
        deduction_amount: 500.00, // ⭐ หักขาดงาน
        net_salary: 17000.00,
        adjustments: [
          {
            id: 1,
            type: "deduction",
            amount: 500.00,
            reason: "หักขาดงาน 1 วัน",
            created_at: "2024-02-01T09:00:00Z"
          }
        ],
        attendance_summary: {
          total_days: 22,
          present_days: 21,
          late_days: 1,
          absent_days: 1
        }
      }
    ],
    summary: {
      total_employees: 10,
      total_base_salary: 150000.00,
      total_overtime: 20000.00,
      total_commission: 5000.00,
      total_allowance: 0.00,
      total_deduction: 5000.00,
      total_net_salary: 170000.00
    }
  }
}
```

---

### 3.5 Salary Payment

#### POST /hr/payroll/:period_id/pay
**Pay salary for period**

**Request Body:**
```typescript
{
  employee_ids: [1, 2, 3], // Optional, if empty = pay all
  payment_date: "2024-02-05",
  payment_method: "transfer", // cash | transfer | cheque
  ref_no: "TRF20240205001" // Optional
}
```

**Response:**
```typescript
{
  success: true,
  message: "Salary paid successfully",
  data: {
    payments: [
      {
        id: 1,
        employee_id: 1,
        employee_name: "สมชาย ใจดี",
        amount: 17000.00,
        payment_date: "2024-02-05",
        payment_method: "transfer",
        ref_no: "TRF20240205001"
      }
    ],
    total_amount: 51000.00,
    total_count: 3
  }
}
```

---

#### GET /hr/payroll/:period_id/payments
**Get payment records for period**

**Response:**
```typescript
{
  success: true,
  data: {
    payments: [
      {
        id: 1,
        employee: {
          id: 1,
          employee_code: "EMP001",
          name: "สมชาย ใจดี"
        },
        payment_date: "2024-02-05",
        amount: 17000.00,
        payment_method: "transfer",
        ref_no: "TRF20240205001",
        paid_by: {
          id: 1,
          name: "ผู้จัดการ"
        }
      }
    ],
    summary: {
      total_paid: 170000.00,
      total_count: 10,
      paid_count: 10,
      unpaid_count: 0
    }
  }
}
```

---

## 🔗 Integration with Existing System

### 4.1 เชื่อมกับ POS / Sales

#### Link Sales to Employees
```typescript
// Update invoices table
ALTER TABLE invoices
ADD COLUMN ref_employee_id INT(11) DEFAULT NULL COMMENT 'พนักงานที่ขาย',
ADD INDEX idx_employee (ref_employee_id),
ADD FOREIGN KEY (ref_employee_id) REFERENCES employees(id);

// Calculate commission from sales
async calculateCommission(
  employeeId: number,
  periodId: number,
  startDate: Date,
  endDate: Date,
) {
  // ⭐ Get sales for employee in period
  const sales = await this.invoiceRepo
    .createQueryBuilder('invoice')
    .where('invoice.ref_employee_id = :employeeId', { employeeId })
    .andWhere('invoice.status = :status', { status: 'completed' })
    .andWhere('invoice.created_at BETWEEN :start AND :end', {
      start: startDate,
      end: endDate,
    })
    .getMany();

  // ⭐ Calculate commission (e.g., 2% of total sales)
  const totalSales = sales.reduce((sum, invoice) => sum + invoice.total_amount, 0);
  const commissionRate = 0.02; // 2%
  const commission = totalSales * commissionRate;

  return commission;
}
```

---

### 4.2 เชื่อมกับ Branch

#### Branch Context for Attendance
```typescript
// ⭐ Attendance must be in same branch as user
@Post('attendance/check-in')
@UseGuards(JwtAuthGuard, BranchScopeGuard)
async checkIn(@Body() dto: CheckInDto, @CurrentUser() user: User) {
  // ⭐ Use user's branch_id
  dto.branch_id = user.branch_id;
  
  return await this.attendanceService.checkIn(dto);
}
```

---

### 4.3 เชื่อมกับ Audit

#### HR Audit Logging
```typescript
// ⭐ Log all HR actions
@Injectable()
export class HrAuditService {
  async log(action: string, entityType: string, entityId: number, beforeData: any, afterData: any, userId: number) {
    await this.auditLogRepo.save({
      actor_user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      before_data: beforeData,
      after_data: afterData,
      branch_id: // Get from context
      ip_address: // Get from request
      user_agent: // Get from request
    });
  }
}

// ⭐ Use in services
async updateEmployee(id: number, dto: UpdateEmployeeDto, userId: number) {
  const before = await this.employeeRepo.findOne({ where: { id } });
  
  // Update employee
  await this.employeeRepo.update(id, dto);
  
  const after = await this.employeeRepo.findOne({ where: { id } });
  
  // ⭐ Log audit
  await this.hrAuditService.log('update', 'employee', id, before, after, userId);
}
```

---

## 🎨 UX Design - Menu Structure

### Sidebar Menu

```
👥 HR & เงินเดือน
├── 📋 พนักงาน
│   ├── รายชื่อพนักงาน
│   ├── เพิ่มพนักงาน
│   └── ตำแหน่งงาน
├── ⏰ เวลาเข้า–ออกงาน
│   ├── เช็คอิน/เช็คเอาท์
│   ├── ประวัติการเข้า–ออกงาน
│   └── รายงานเวลา
├── 💰 รอบเงินเดือน
│   ├── รอบเงินเดือน
│   ├── สร้างรอบใหม่
│   └── ประวัติรอบ
├── 🧮 คำนวณเงินเดือน
│   ├── คำนวณเงินเดือน
│   ├── ดูรายละเอียดเงินเดือน
│   └── ปรับเพิ่ม/หัก
├── 💵 จ่ายเงินเดือน
│   ├── จ่ายเงินเดือน
│   └── ประวัติการจ่าย
├── 📊 รายงานเงินเดือน
│   ├── รายงานรายเดือน
│   ├── รายงานรายปี
│   └── ส่งออก Excel
└── 🔍 Audit HR
    └── บันทึกการเปลี่ยนแปลง
```

---

## ⚠️ Critical Points to Watch

### ❗ Rule 1: ห้ามแก้ payroll ที่ locked
```typescript
// ✅ CORRECT: Check status before update
async updatePayrollItem(periodId: number, itemId: number, dto: UpdatePayrollItemDto) {
  const period = await this.payrollPeriodRepo.findOne({ where: { id: periodId } });
  
  if (period.status === 'locked') {
    throw new ForbiddenException('Payroll period is locked. Cannot modify.');
  }
  
  // Update payroll item
}
```

---

### ❗ Rule 2: การคำนวณต้อง idempotent
```typescript
// ✅ CORRECT: Idempotent calculation
async calculatePayroll(periodId: number, userId: number) {
  const period = await this.payrollPeriodRepo.findOne({ where: { id: periodId } });
  
  // ⭐ Idempotency check
  if (['calculated', 'paid', 'locked'].includes(period.status)) {
    return {
      success: true,
      message: 'Payroll already calculated',
      data: period,
      idempotent: true,
    };
  }
  
  // Calculate payroll...
}
```

---

### ❗ Rule 3: เงินเดือน = snapshot
```typescript
// ✅ CORRECT: Use snapshot for payroll
async calculatePayroll(periodId: number) {
  const employees = await this.employeeRepo.find({ where: { status: 'active' } });
  
  for (const employee of employees) {
    // ⭐ Snapshot: Use current base_salary
    const baseSalary = employee.base_salary;
    
    // Calculate other amounts...
    const netSalary = baseSalary + overtime + commission + allowance - deduction;
    
    // ⭐ Save with snapshot
    await this.payrollItemRepo.save({
      payroll_period_id: periodId,
      employee_id: employee.id,
      base_salary: baseSalary, // ⭐ Snapshot
      net_salary: netSalary,
    });
  }
}
```

---

### ❗ Rule 4: แยก role HR / Admin / Manager
```typescript
// ✅ CORRECT: Role-based access
@Post('payroll/:period_id/calculate')
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequirePermission('hr.payroll.calculate') // ⭐ HR only
async calculatePayroll(@Param('period_id') periodId: number) {
  // Only HR can calculate payroll
}

@Post('payroll/:period_id/lock')
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequirePermission('hr.payroll.lock') // ⭐ Admin/Manager only
async lockPayroll(@Param('period_id') periodId: number) {
  // Only Admin/Manager can lock
}
```

---

### ❗ Rule 5: HR data = sensitive (log ทุก action)
```typescript
// ✅ CORRECT: Log all HR actions
@Injectable()
export class EmployeeService {
  async updateEmployee(id: number, dto: UpdateEmployeeDto, userId: number) {
    const before = await this.findOne(id);
    
    // Update
    await this.employeeRepo.update(id, dto);
    
    const after = await this.findOne(id);
    
    // ⭐ Log audit
    await this.hrAuditService.log(
      'update',
      'employee',
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

### Phase 1: Foundation (Week 1-2)
1. ✅ **employees + positions**
   - Create entities
   - Create CRUD endpoints
   - Add validation
   - Add audit logging

---

### Phase 2: Attendance (Week 3)
2. ✅ **attendance**
   - Create entity
   - Create check-in/check-out endpoints
   - Calculate work hours
   - Add branch scope

---

### Phase 3: Payroll Foundation (Week 4)
3. ✅ **payroll_periods + payroll_items**
   - Create entities
   - Create period management endpoints
   - Add status management

---

### Phase 4: Payroll Calculation (Week 5-6)
4. ✅ **calculate payroll**
   - Implement calculation logic
   - Calculate base salary
   - Calculate overtime
   - Calculate commission (from sales)
   - Calculate deductions (from attendance)
   - Add idempotency

---

### Phase 5: Lock & Payment (Week 7)
5. ✅ **lock & payment**
   - Implement lock functionality
   - Implement payment endpoints
   - Add payment tracking
   - Add audit logging

---

## 📚 Related Documents

- `docs/MODULE_MAPPING.md` - Module Mapping
- `docs/API_CONTRACTS.md` - API Contracts
- `docs/SECURITY_AND_BUGS_ANALYSIS.md` - Security & Bugs
- `docs/CRITICAL_BUGS_AND_SOLUTIONS.md` - Critical Bugs

---

**Status:** 📋 HR System Design Complete

**Last Updated:** 2025-01-XX

**⭐ Critical: Follow all rules to prevent bugs**

