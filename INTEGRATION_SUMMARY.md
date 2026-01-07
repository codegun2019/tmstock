# 🔗 Integration Summary - Quick Reference

**วันที่สร้าง:** 2025-01-XX  
**Version:** 5.0  
**สถานะ:** 📋 Quick Reference

---

## 🎯 Overview

เอกสารสรุปการโยงระบบระหว่าง modules สำหรับ Cursor AI เพื่อใช้ในการเขียนโค้ด

---

## ⭐ Critical Integration Points

### 1. Products ↔ Inventory ⭐ CRITICAL

**ProductsService ต้อง:**
- ✅ Inject InventoryService
- ✅ Call `inventoryService.getBalance(productId, branchId)` เพื่อ query stock
- ✅ Include `stock_quantity` ใน response DTOs

**Code Pattern:**
```typescript
// ProductsService
constructor(
  @InjectRepository(Product) private productRepository: Repository<Product>,
  private inventoryService: InventoryService, // ⭐ Inject
) {}

async findOne(id: number, branchId: number) {
  const product = await this.productRepository.findOne({ where: { id } });
  const balance = await this.inventoryService.getBalance(id, branchId); // ⭐
  return { ...product, stock_quantity: balance?.quantity || 0 }; // ⭐
}
```

---

### 2. POS ↔ Products ↔ Inventory ⭐ CRITICAL

**POS Controller ต้อง:**
- ✅ Inject ProductsService
- ✅ Call `productsService.findByBarcode(barcode, branchId)`
- ✅ ProductsService จะ return product + stock_quantity

**Code Pattern:**
```typescript
// POS Controller
constructor(private productsService: ProductsService) {} // ⭐ Inject

@Get('scan')
async scan(@Query('barcode') barcode: string, @Req() req: any) {
  const branchId = req.user.branch_id; // ⭐ Get branch
  const product = await this.productsService.findByBarcode(barcode, branchId);
  return { success: true, product }; // ⭐ Includes stock_quantity
}
```

---

### 3. Invoice ↔ Inventory ⭐ CRITICAL

**InvoicesService ต้อง:**
- ✅ Inject InventoryService
- ✅ Call `inventoryService.sale()` เมื่อสร้าง invoice
- ✅ Call `inventoryService.returnStock()` เมื่อ void/refund
- ✅ ใช้ transaction (all or nothing)

**Code Pattern:**
```typescript
// InvoicesService
constructor(
  private inventoryService: InventoryService, // ⭐ Inject
  private dataSource: DataSource,
) {}

async create(dto: CreateInvoiceDto, userId: number, branchId: number) {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.startTransaction(); // ⭐ Transaction

  try {
    // Create invoice
    const invoice = await queryRunner.manager.save(/* ... */);

    // For each item: Create item AND deduct stock ⭐
    for (const item of dto.items) {
      await queryRunner.manager.save(/* invoice item */);
      
      // ⭐ Deduct stock
      await this.inventoryService.sale(
        item.product_id,
        item.quantity,
        invoice.id,
        branchId,
        userId,
      );
    }

    await queryRunner.commitTransaction(); // ⭐ Commit
    return invoice;
  } catch (error) {
    await queryRunner.rollbackTransaction(); // ⭐ Rollback
    throw error;
  }
}
```

---

## 📊 Module Dependencies

### Products Module
**Depends on:**
- InventoryModule (for stock queries) ⭐

**Exports:**
- ProductsService (for POS, Invoices)

---

### POS Module
**Depends on:**
- ProductsModule (for product scan) ⭐

**Exports:**
- POSService

---

### Invoices Module
**Depends on:**
- ProductsModule (for product validation)
- InventoryModule (for stock deduction) ⭐
- InvoiceSequenceModule (for invoice number)

**Exports:**
- InvoicesService

---

### Inventory Module
**Depends on:**
- ProductsModule (for product validation)
- BranchesModule (for branch validation)
- FeatureTogglesModule (for negative stock check)

**Exports:**
- InventoryService ⭐ **CRITICAL - Used by Products, Invoices**

---

## 🔄 Common Flows

### Flow 1: View Product → Show Stock
```
GET /api/products/:id
  ↓
ProductsController.findOne()
  ↓
ProductsService.findOne(id, branchId)
  ↓
  ├─→ ProductRepository.findOne()
  └─→ InventoryService.getBalance(id, branchId) ⭐
  ↓
Return product + stock_quantity
```

### Flow 2: POS Scan → Show Stock
```
GET /api/pos/scan?barcode=xxx
  ↓
POSController.scan()
  ↓
ProductsService.findByBarcode(barcode, branchId)
  ↓
  ├─→ ProductRepository.findOne()
  └─→ InventoryService.getBalance(id, branchId) ⭐
  ↓
Return product + stock_quantity
```

### Flow 3: Create Invoice → Deduct Stock
```
POST /api/invoices
  ↓
InvoicesController.create()
  ↓
InvoicesService.create()
  ↓
Start Transaction
  ↓
For each item:
  ├─→ Create invoice_item
  └─→ InventoryService.sale() ⭐
      ↓
      └─→ InventoryService.move()
          ↓
          ├─→ UPDATE stock_balances
          └─→ INSERT stock_moves
  ↓
Commit Transaction
```

### Flow 4: Void Invoice → Return Stock
```
POST /api/invoices/:id/void
  ↓
InvoicesController.void()
  ↓
InvoicesService.void()
  ↓
Start Transaction
  ↓
For each item:
  └─→ InventoryService.returnStock() ⭐
      ↓
      └─→ InventoryService.move()
          ↓
          ├─→ UPDATE stock_balances
          └─→ INSERT stock_moves
  ↓
Commit Transaction
```

---

## ✅ Implementation Checklist

### Products Module
- [ ] ProductsService injects InventoryService ⭐
- [ ] findAll() includes stock_quantity ⭐
- [ ] findOne() includes stock_quantity ⭐
- [ ] findByBarcode() includes stock_quantity ⭐
- [ ] search() includes stock_quantity ⭐

### POS Module
- [ ] POS service injects ProductsService ⭐
- [ ] scan() returns product + stock_quantity ⭐

### Invoices Module
- [ ] InvoicesService injects InventoryService ⭐
- [ ] create() calls inventoryService.sale() ⭐
- [ ] void() calls inventoryService.returnStock() ⭐
- [ ] refund() calls inventoryService.returnStock() ⭐
- [ ] Uses transactions ⭐

### Inventory Module
- [ ] InventoryService.move() is thread-safe ⭐
- [ ] InventoryService.sale() works correctly ⭐
- [ ] InventoryService.getBalance() works correctly ⭐
- [ ] InventoryService.returnStock() works correctly ⭐
- [ ] Exports InventoryService ⭐

---

## 🚨 Critical Rules

1. ⭐ **ทุกการเปลี่ยนสต็อคต้องผ่าน InventoryService.move()**
2. ⭐ **ProductsService ต้อง inject InventoryService เพื่อ query stock**
3. ⭐ **InvoicesService ต้อง inject InventoryService เพื่อตัดสต็อค**
4. ⭐ **ต้องใช้ transaction สำหรับ operations ที่เปลี่ยนสต็อค**
5. ⭐ **ต้องตรวจสอบสต็อคก่อนขาย (ถ้าไม่ให้ติดลบ)**

---

## 📚 Related Documents

- `docs/INTEGRATION_POINTS.md` - Detailed integration points
- `plan/PHASE_2_CORE_MODULES_DETAILED.md` - Products integration
- `plan/PHASE_3_INVENTORY_DETAILED.md` - Inventory integration
- `plan/PHASE_4_SALES_DETAILED.md` - POS/Invoice integration

---

**Status:** 📋 Quick Reference

**Last Updated:** 2025-01-XX

