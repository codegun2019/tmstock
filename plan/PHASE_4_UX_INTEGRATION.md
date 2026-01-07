# 🎨 Phase 4: UX Integration & Page Linking

**Duration:** Week 7-8 (Part 2)  
**Status:** ⏸️ Pending  
**Priority:** 🔴 Critical  
**Depends on:** Phase 4 (Sales & POS)

---

## 🎯 เป้าหมาย

สร้าง UX integration ที่ทำให้ระบบลิงก์กันในหน้าจอ: หน้าบิล, Product Detail, Stock Movements

**สำคัญ:** ทุกหน้าในระบบต้องลิงก์กันได้และแสดงข้อมูลที่เกี่ยวข้อง

---

## 🔗 UX Integration Points

### 1. Invoice Detail Page ↔ Stock Movements ⭐ CRITICAL

**Purpose:** หน้าบิลต้องแสดง stock movements ที่เกี่ยวข้อง

**Requirements:**
- [ ] แสดงรายการสินค้าในบิล
- [ ] แสดงสต็อคตอนขาย (optional - snapshot)
- [ ] แสดง Stock Movements ที่เกี่ยวข้อง
  - ดึงจาก `stock_moves` WHERE `reference_type='invoice'` AND `reference_id=invoice_id`
  - แสดง move_type, quantity, balance_before, balance_after
  - แสดงวันที่และเวลา
- [ ] ถ้าคืนเงิน → แสดง movement `reference_type='invoice_refund'`

**API Endpoint:**
```typescript
GET /api/invoices/:id/detail
```

**Response Structure:**
```typescript
{
  invoice: {
    id: 1,
    invoice_no: "BKK-20250115-0001",
    // ... invoice fields
    items: [
      {
        id: 1,
        product_id: 1,
        product_name: "สินค้า A",
        quantity: 2,
        unit_price: 100.00,
        stock_at_sale: 50, // ⭐ Snapshot of stock when sold
      }
    ],
    stock_movements: [ // ⭐ Related stock movements
      {
        id: 1,
        move_type: "OUT",
        quantity: -2,
        balance_before: 50,
        balance_after: 48,
        created_at: "2025-01-15 10:30:00",
        reference_type: "invoice",
        reference_id: 1
      }
    ],
    refund_movements: [ // ⭐ If refunded
      {
        id: 2,
        move_type: "IN",
        quantity: 2,
        balance_before: 48,
        balance_after: 50,
        created_at: "2025-01-15 11:00:00",
        reference_type: "invoice_refund",
        reference_id: 1
      }
    ]
  }
}
```

**Frontend Implementation:**
- [ ] แสดง stock movements ในแท็บ "Stock Movements"
- [ ] แสดง stock_at_sale ในรายการสินค้า
- [ ] Link ไปยัง Stock Movements page (ถ้าต้องการ)

**Estimated Time:** 4 hours

---

### 2. Product Detail Page ⭐ CRITICAL

**Purpose:** หน้า Product Detail เป็น central hub สำหรับข้อมูลสินค้าทั้งหมด

**Requirements:**

#### 2.1 Stock by Branch Tab
- [ ] แสดงสต็อคแยกตามสาขา
- [ ] ดึงจาก `stock_balances` WHERE `product_id=product_id`
- [ ] แสดง quantity, reserved_quantity, available_quantity
- [ ] แสดง last_moved_at

**Data Source:**
```typescript
// From InventoryService
const balances = await this.inventoryService.getBalancesByProduct(productId);
// Returns: [{ branch_id, branch_name, quantity, reserved_quantity, available_quantity, last_moved_at }]
```

**Estimated Time:** 2 hours

---

#### 2.2 Sales History Tab
- [ ] แสดงประวัติการขาย
- [ ] Join `invoice_items` + `invoices` WHERE `product_id=product_id`
- [ ] แสดง invoice_no, date, quantity, unit_price, subtotal
- [ ] Link ไปยัง Invoice Detail page

**Data Source:**
```typescript
// From InvoicesService or ProductsService
const salesHistory = await this.productsService.getSalesHistory(productId, filters);
// Returns: [{ invoice_id, invoice_no, date, quantity, unit_price, subtotal, branch_name }]
```

**Estimated Time:** 3 hours

---

#### 2.3 Stock Movements History Tab ⭐ CRITICAL
- [ ] แสดงประวัติการเคลื่อนไหวสต็อคทั้งหมด
- [ ] ดึงจาก `stock_moves` WHERE `product_id=product_id`
- [ ] แสดง move_type, quantity, balance_before, balance_after
- [ ] แสดง reference_type, reference_id
- [ ] **Link ไปยัง source document** (บิล, GRN, Adjustment, etc.) ⭐

**Data Source:**
```typescript
// From InventoryService
const movements = await this.inventoryService.getMoves({
  productId: productId,
  // ... filters
});
// Returns: [{ id, move_type, quantity, balance_before, balance_after, reference_type, reference_id, created_at, ... }]
```

**Linking Logic:**
```typescript
// Frontend: Generate link based on reference_type
if (movement.reference_type === 'invoice') {
  link = `/admin/invoices/${movement.reference_id}`;
} else if (movement.reference_type === 'grn') {
  link = `/admin/grn/${movement.reference_id}`;
} else if (movement.reference_type === 'stock_adjustment') {
  link = `/admin/stock-adjustments/${movement.reference_id}`;
}
```

**Estimated Time:** 4 hours

---

#### 2.4 Used in Repairs Tab (Future)
- [ ] แสดงการใช้งานในงานซ่อม
- [ ] ดึงจาก `repair_items` WHERE `product_id=product_id`
- [ ] Link ไปยัง Repair Detail page

**Estimated Time:** 2 hours (Future)

---

**Total Estimated Time:** 11 hours

---

### 3. Stock Movements Page ↔ Source Documents ⭐ CRITICAL

**Purpose:** หน้า Stock Movements ต้องลิงก์ไปยัง source document ได้

**Requirements:**
- [ ] แสดงรายการ stock movements ทั้งหมด
- [ ] แสดง reference_type และ reference_id
- [ ] **กด movement แล้วไปยัง source document ได้** ⭐
- [ ] แสดง link button ตาม reference_type

**Linking Logic:**
```typescript
// Frontend: Generate link based on reference_type
getMovementLink(movement: StockMove): string {
  switch (movement.reference_type) {
    case 'invoice':
      return `/admin/invoices/${movement.reference_id}`;
    case 'invoice_refund':
      return `/admin/invoices/${movement.reference_id}`; // Same invoice
    case 'grn':
      return `/admin/grn/${movement.reference_id}`;
    case 'stock_adjustment':
      return `/admin/stock-adjustments/${movement.reference_id}`;
    case 'stock_transfer':
      return `/admin/stock-transfers/${movement.reference_id}`;
    case 'repair':
      return `/admin/repairs/${movement.reference_id}`;
    default:
      return null; // No link
  }
}
```

**UI Implementation:**
- [ ] แสดง icon/link button ในแต่ละ movement row
- [ ] Tooltip แสดง "View Invoice", "View GRN", etc.
- [ ] Click → Navigate to source document

**Estimated Time:** 3 hours

---

## 📋 Tasks Checklist

### 1. Invoice Detail Enhancement
- [ ] Create InvoiceDetailDto (include stock_movements)
- [ ] Update InvoicesService.getDetail() method
  - [ ] Include invoice items
  - [ ] Include stock_movements (reference_type='invoice')
  - [ ] Include refund_movements (reference_type='invoice_refund')
  - [ ] Include stock_at_sale snapshot
- [ ] Update InvoicesController.getDetail() endpoint
- [ ] Create frontend Invoice Detail page
- [ ] Display stock movements tab
- [ ] Link to Stock Movements page

**Estimated Time:** 6 hours

---

### 2. Product Detail Page (Complete)
- [ ] Create ProductDetailDto
- [ ] Create ProductsService.getDetail() method
  - [ ] Include stock by branch
  - [ ] Include sales history
  - [ ] Include stock movements history
- [ ] Create ProductsController.getDetail() endpoint
- [ ] Create frontend Product Detail page
- [ ] Create tabs: Stock by Branch, Sales History, Stock Movements
- [ ] Implement linking logic

**Estimated Time:** 10 hours

---

### 3. Stock Movements Page Enhancement
- [ ] Update InventoryController.getMoves() endpoint
  - [ ] Include reference_type and reference_id
  - [ ] Include product and branch info
- [ ] Create frontend Stock Movements page
- [ ] Implement linking logic (reference_type → link)
- [ ] Add link buttons/icons
- [ ] Add tooltips

**Estimated Time:** 4 hours

---

## 🔄 Linking Flow Diagrams

### Flow 1: Invoice Detail → Stock Movements
```
User views Invoice Detail
  ↓
GET /api/invoices/:id/detail
  ↓
InvoicesService.getDetail(id)
  ↓
  ├─→ Get invoice + items
  └─→ Get stock_movements WHERE reference_type='invoice' AND reference_id=id ⭐
  ↓
Return invoice + items + stock_movements
  ↓
Frontend displays:
  - Invoice items (with stock_at_sale)
  - Stock Movements tab (with movements)
  - Link buttons to Stock Movements page
```

---

### Flow 2: Product Detail → Stock Movements → Invoice
```
User views Product Detail
  ↓
GET /api/products/:id/detail
  ↓
ProductsService.getDetail(id)
  ↓
  ├─→ Get product info
  ├─→ Get stock by branch (from stock_balances)
  ├─→ Get sales history (from invoice_items + invoices)
  └─→ Get stock movements (from stock_moves) ⭐
  ↓
Return product + stock + sales + movements
  ↓
Frontend displays tabs:
  - Stock by Branch
  - Sales History (with links to invoices)
  - Stock Movements (with links to source documents) ⭐
  ↓
User clicks movement link
  ↓
Navigate to source document (Invoice, GRN, etc.)
```

---

### Flow 3: Stock Movements → Source Document
```
User views Stock Movements page
  ↓
GET /api/inventory/moves?product_id=1
  ↓
InventoryService.getMoves(filters)
  ↓
Return movements with reference_type and reference_id ⭐
  ↓
Frontend displays movements with link buttons
  ↓
User clicks link button
  ↓
Frontend generates link based on reference_type:
  - reference_type='invoice' → /admin/invoices/:id
  - reference_type='grn' → /admin/grn/:id
  - etc.
  ↓
Navigate to source document
```

---

## 📊 Data Structure for Linking

### StockMove Entity (Enhanced)
```typescript
{
  id: 1,
  product_id: 1,
  branch_id: 1,
  move_type: "OUT",
  quantity: -2,
  balance_before: 50,
  balance_after: 48,
  reference_type: "invoice", // ⭐ For linking
  reference_id: 123, // ⭐ For linking
  reason: "Sale - Invoice #BKK-20250115-0001",
  created_at: "2025-01-15 10:30:00",
  // ... other fields
}
```

### InvoiceItem Entity (Enhanced)
```typescript
{
  id: 1,
  invoice_id: 123,
  product_id: 1,
  quantity: 2,
  unit_price: 100.00,
  stock_at_sale: 50, // ⭐ Snapshot when sold (optional)
  // ... other fields
}
```

---

## ✅ Acceptance Criteria

### Invoice Detail Page
- ✅ แสดงรายการสินค้า
- ✅ แสดงสต็อคตอนขาย (stock_at_sale)
- ✅ แสดง Stock Movements ที่เกี่ยวข้อง
- ✅ แสดง Refund Movements (ถ้ามี)
- ✅ Link ไปยัง Stock Movements page

### Product Detail Page
- ✅ แสดง Stock by Branch tab
- ✅ แสดง Sales History tab (with links)
- ✅ แสดง Stock Movements tab (with links) ⭐
- ✅ Link ไปยัง source documents

### Stock Movements Page
- ✅ แสดง reference_type และ reference_id
- ✅ Link ไปยัง source documents ได้ ⭐
- ✅ Link buttons/icons ชัดเจน

---

## 🧪 Testing Checklist

### Invoice Detail
- [ ] Stock movements แสดงถูกต้อง
- [ ] Refund movements แสดงถูกต้อง (ถ้ามี)
- [ ] Links ไปยัง Stock Movements page ทำงาน

### Product Detail
- [ ] Stock by Branch แสดงถูกต้อง
- [ ] Sales History แสดงถูกต้อง
- [ ] Links ไปยัง invoices ทำงาน
- [ ] Stock Movements แสดงถูกต้อง
- [ ] Links ไปยัง source documents ทำงาน ⭐

### Stock Movements
- [ ] Links ไปยัง invoices ทำงาน
- [ ] Links ไปยัง GRN ทำงาน
- [ ] Links ไปยัง adjustments ทำงาน
- [ ] Links ไปยัง transfers ทำงาน

---

## 📝 API Endpoints to Implement

### Invoice Detail
```
GET /api/invoices/:id/detail
  Response: {
    invoice: {...},
    items: [...],
    stock_movements: [...], // ⭐
    refund_movements: [...] // ⭐
  }
```

### Product Detail
```
GET /api/products/:id/detail
  Response: {
    product: {...},
    stock_by_branch: [...], // ⭐
    sales_history: [...], // ⭐
    stock_movements: [...] // ⭐
  }
```

### Stock Movements (Enhanced)
```
GET /api/inventory/moves?product_id=1
  Response: {
    movements: [
      {
        ...,
        reference_type: "invoice", // ⭐
        reference_id: 123, // ⭐
        link: "/admin/invoices/123" // ⭐ (optional, can generate in frontend)
      }
    ]
  }
```

---

## 🚨 Common Issues & Solutions

### Issue 1: Stock Movements Not Showing in Invoice Detail
**Solution:**
- Check reference_type='invoice' AND reference_id=invoice_id
- Check stock_moves table has data
- Check API endpoint returns movements

### Issue 2: Links Not Working
**Solution:**
- Check reference_type and reference_id are correct
- Check frontend linking logic
- Check routes exist

### Issue 3: Stock at Sale Not Captured
**Solution:**
- Capture stock_at_sale when creating invoice_item
- Store in invoice_items table (optional column)
- Or calculate from stock_moves (balance_before)

---

## 📊 Progress Tracking

### Week 7 (Part 2)
- **Day 1:** Invoice Detail enhancement
- **Day 2:** Product Detail page (Stock by Branch + Sales History)
- **Day 3:** Product Detail page (Stock Movements tab)
- **Day 4:** Stock Movements page enhancement
- **Day 5:** Testing + Bug fixes

---

## 🎯 Definition of Done

Phase 4 UX Integration is complete when:
- ✅ Invoice Detail shows stock movements
- ✅ Product Detail shows all tabs with links ⭐
- ✅ Stock Movements page has working links ⭐
- ✅ All pages link to each other correctly
- ✅ All tests passing
- ✅ Documentation updated

---

## 🔗 Related Documents

- `PHASE_4_SALES_DETAILED.md` - Sales & POS phase
- `docs/INTEGRATION_POINTS.md` - Integration points
- `INTEGRATION_SUMMARY.md` - Integration summary

---

## ⏭️ Next Phase

After completing Phase 4 UX Integration, proceed to:
**Phase 5: Additional Modules** (`PHASE_5_ADDITIONAL.md`)

---

**Status:** ⏸️ Pending  
**Ready to Start:** After Phase 4 (Sales) complete  
**Blockers:** None

**⭐ Key Points:**
- Invoice Detail → Stock Movements linking
- Product Detail → Source Documents linking
- Stock Movements → Source Documents linking
- Reference type/id เป็นสะพานลิงก์

