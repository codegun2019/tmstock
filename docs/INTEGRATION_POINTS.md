# 🔗 System Integration Points

**วันที่สร้าง:** 2025-01-XX  
**Version:** 5.0  
**สถานะ:** 📋 Integration Reference

---

## 📋 Overview

เอกสารนี้อธิบายการโยงระบบระหว่าง modules ต่างๆ ในระบบ mstock POS

**สำคัญ:** ทุก integration point ต้องทำงานร่วมกันได้อย่างถูกต้อง

---

## 🔗 Core Integration Points

### 1. Products ↔ Inventory ⭐ CRITICAL

**Purpose:** สินค้าต้องแสดงสต็อคได้ทันที

**Flow:**
```
Product Entity
  ↓ (has many)
StockBalance Entity (one per branch)
  ↓ (has many)
StockMove Entity (movement history)
```

**Implementation:**
- Product entity มี relation กับ StockBalance
- ProductsService ต้อง inject InventoryService
- Product response DTO ต้องรวม stock_quantity
- Product detail endpoint ต้องแสดง stock by branch

**Code Example:**
```typescript
// ProductsService
async findOne(id: number, branchId: number) {
  const product = await this.productRepository.findOne({ where: { id } });
  
  // ⭐ Get stock from InventoryService
  const balance = await this.inventoryService.getBalance(id, branchId);
  
  return {
    ...product,
    stock_quantity: balance?.quantity || 0, // ⭐ Include stock
  };
}
```

**Endpoints Affected:**
- `GET /api/products` - Must include stock_quantity
- `GET /api/products/:id` - Must include stock_quantity by branch
- `GET /api/products/search` - Must include stock_quantity

---

### 2. POS ↔ Products ↔ Inventory ⭐ CRITICAL

**Purpose:** POS ต้องสแกนสินค้าและแสดงสต็อคได้

**Flow:**
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

**Implementation:**
- POS service ต้อง inject ProductsService
- ProductsService ต้อง inject InventoryService
- POS scan endpoint ต้อง return product + stock_quantity

**Code Example:**
```typescript
// POS Controller
@Get('scan')
async scan(@Query('barcode') barcode: string, @Req() req: any) {
  const branchId = req.user.branch_id; // ⭐ Get branch from context
  
  const product = await this.productsService.findByBarcode(barcode, branchId);
  
  return {
    success: true,
    product: {
      ...product,
      stock_quantity: product.stock_quantity, // ⭐ Include stock
    },
  };
}
```

**Endpoints Affected:**
- `GET /api/pos/scan` - Must return stock_quantity
- `POST /api/pos/scan` - Must return stock_quantity

---

### 3. Invoice ↔ Inventory ⭐ CRITICAL

**Purpose:** เมื่อขายสินค้า ต้องตัดสต็อคทันที

**Flow:**
```
Invoice Creation
  ↓
Invoices Service.create()
  ↓
For each invoice_item:
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

**Code Example:**
```typescript
// InvoicesService
async create(dto: CreateInvoiceDto, userId: number, branchId: number) {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.startTransaction();

  try {
    // Create invoice
    const invoice = await queryRunner.manager.save(/* ... */);

    // For each item: Create item AND deduct stock ⭐
    for (const item of dto.items) {
      // Create invoice item
      await queryRunner.manager.save(/* invoice item */);

      // ⭐ Deduct stock
      await this.inventoryService.sale(
        item.product_id,
        item.quantity,
        invoice.id,
        branchId,
      );
    }

    await queryRunner.commitTransaction();
    return invoice;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  }
}
```

**Endpoints Affected:**
- `POST /api/invoices` - Must deduct stock

---

### 4. Invoice Void/Refund ↔ Inventory ⭐ CRITICAL

**Purpose:** เมื่อ void/refund ต้องคืนสต็อค

**Flow:**
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
- ⭐ **ต้องใช้ transaction**

**Code Example:**
```typescript
// InvoicesService
async void(invoiceId: number, reason: string, userId: number) {
  const invoice = await this.findOne(invoiceId);

  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.startTransaction();

  try {
    // ⭐ Return stock for each item
    for (const item of invoice.items) {
      await this.inventoryService.returnStock(
        item.product_id,
        item.quantity,
        invoice.id,
        invoice.branch_id,
        `Void invoice: ${reason}`,
      );
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

**Endpoints Affected:**
- `POST /api/invoices/:id/void` - Must return stock
- `POST /api/invoices/:id/refund` - Must return stock

---

### 5. Products ↔ Categories ↔ Units

**Purpose:** สินค้าต้องมี category และ unit

**Flow:**
```
Product Entity
  ↓ (belongs to)
Category Entity
  ↓ (has many)
Product Entity

Product Entity
  ↓ (belongs to)
Unit Entity
  ↓ (has many)
Product Entity
```

**Implementation:**
- Product entity มี relation กับ Category และ Unit
- Product DTOs ต้อง validate category_id และ unit_id
- Product service ต้อง validate category/unit exists

**Code Example:**
```typescript
// Product Entity
@ManyToOne(() => Category, { nullable: true })
category: Category | null;

@ManyToOne(() => Unit, { nullable: true })
unit: Unit | null;
```

---

### 6. Users ↔ Roles ↔ Permissions

**Purpose:** User ต้องมี roles และ permissions

**Flow:**
```
User Entity
  ↓ (many-to-many)
Role Entity
  ↓ (many-to-many)
Permission Entity
```

**Implementation:**
- User entity มี relation กับ Role
- Role entity มี relation กับ Permission
- Auth service ต้อง load roles และ permissions
- Guards ต้อง check permissions

---

### 7. Users ↔ Branches

**Purpose:** User ต้องมี branch และ branch context

**Flow:**
```
User Entity
  ↓ (belongs to)
Branch Entity
  ↓ (has many)
User Entity

BranchContext Middleware
  ↓ (sets)
Request.branch_id
  ↓ (used by)
All Services
```

**Implementation:**
- User entity มี relation กับ Branch
- BranchContext middleware ต้อง set branch_id
- Services ต้อง use branch_id จาก context

---

## 📊 Integration Matrix

| Module | Integrates With | Integration Type | Critical |
|--------|----------------|-----------------|----------|
| Products | Inventory | Service Injection | ⭐ Yes |
| Products | Categories | Entity Relation | No |
| Products | Units | Entity Relation | No |
| POS | Products | Service Injection | ⭐ Yes |
| POS | Inventory | Via ProductsService | ⭐ Yes |
| Invoices | Inventory | Service Injection | ⭐ Yes |
| Invoices | Products | Repository | Yes |
| Invoices | InvoiceSequence | Service Injection | Yes |
| Users | Roles | Entity Relation | Yes |
| Users | Branches | Entity Relation | Yes |
| Roles | Permissions | Entity Relation | Yes |

---

## 🔒 Critical Integration Rules

### 1. Stock Operations Must Use Transactions
- ✅ All stock operations must be in transactions
- ✅ Rollback on error
- ✅ All or nothing

### 2. Stock Must Be Checked Before Sale
- ✅ Check stock availability before creating invoice
- ✅ Throw error if insufficient stock
- ✅ Prevent negative stock (if not allowed)

### 3. Stock Must Be Deducted Immediately
- ✅ Deduct stock when invoice is created
- ✅ Don't wait for payment confirmation
- ✅ Record in stock_moves immediately

### 4. Stock Must Be Returned on Void/Refund
- ✅ Return stock when invoice is voided
- ✅ Return stock when invoice is refunded
- ✅ Record in stock_moves immediately

### 5. Branch Context Must Be Used
- ✅ All stock operations must use branch_id from context
- ✅ All product queries must filter by branch
- ✅ All invoice operations must use branch_id

---

## 📝 Implementation Checklist

### Products Module
- [ ] Product entity has StockBalance relation
- [ ] ProductsService injects InventoryService
- [ ] All product endpoints return stock_quantity
- [ ] findByBarcode() returns stock_quantity

### POS Module
- [ ] POS service injects ProductsService
- [ ] POS scan returns product + stock_quantity
- [ ] Stock quantity displayed in real-time

### Invoices Module
- [ ] InvoicesService injects InventoryService
- [ ] Invoice creation deducts stock
- [ ] Stock check before sale
- [ ] Transaction rollback on error
- [ ] Void/Refund returns stock

### Inventory Module
- [ ] InventoryService.move() is thread-safe
- [ ] Stock balances updated correctly
- [ ] Stock moves recorded correctly
- [ ] Negative stock guard working

---

## 🚨 Common Integration Issues

### Issue 1: Stock Not Showing in Products
**Solution:**
- Check InventoryService is injected
- Check branchId is passed
- Check InventoryService.getBalance() is called

### Issue 2: Stock Not Deducted After Sale
**Solution:**
- Check InventoryService.sale() is called
- Check transaction is committed
- Check stock_moves record is created

### Issue 3: Stock Not Returned on Void
**Solution:**
- Check InventoryService.returnStock() is called
- Check transaction is committed
- Check stock_moves record is created

---

## 📚 Related Documents

- `PHASE_2_CORE_MODULES_DETAILED.md` - Products integration details
- `PHASE_3_INVENTORY.md` - Inventory module details
- `PHASE_4_SALES_DETAILED.md` - POS/Invoice integration details

---

**Status:** 📋 Reference Document

**Last Updated:** 2025-01-XX

