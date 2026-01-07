# 📄 Page Structure Mapping

**วันที่สร้าง:** 2025-01-XX  
**Version:** 5.0  
**Status:** 📋 Page Structure Reference

---

## 🎯 Overview

Mapping หน้าจอ (Pages) กับ API Endpoints

**สำคัญ:** ทุกหน้าในระบบต้องลิงก์กันได้

---

## 📋 Page Structures

### 1. Invoice Detail Page

**Route:** `/admin/invoices/:id` หรือ `/pos/invoices/:id`

**API Endpoint:**
```
GET /api/invoices/:id/detail
```

**Page Structure:**
```
┌─────────────────────────────────────┐
│ Invoice Detail                      │
├─────────────────────────────────────┤
│ Invoice Info                        │
│   - Invoice No: BKK-20250115-0001   │
│   - Date: 2025-01-15                │
│   - Status: Completed               │
│   - Total: 200.00                   │
├─────────────────────────────────────┤
│ Items                               │
│   ┌─────────────────────────────┐  │
│   │ Product A  | Qty: 2 | 200.00│  │
│   │ Stock at sale: 50 ⭐         │  │
│   └─────────────────────────────┘  │
├─────────────────────────────────────┤
│ Stock Movements ⭐                  │
│   ┌─────────────────────────────┐  │
│   │ OUT | -2 | 50→48 | [Link] ⭐│  │
│   └─────────────────────────────┘  │
│   [View All Movements] → Link ⭐    │
├─────────────────────────────────────┤
│ Actions                             │
│   [Void] [Refund] [Print]           │
└─────────────────────────────────────┘
```

**Data Structure:**
```typescript
{
  invoice: {...},
  items: [
    {
      product_id: 1,
      product_name: "Product A",
      quantity: 2,
      stock_at_sale: 50, // ⭐ Snapshot
    }
  ],
  stock_movements: [ // ⭐ Related movements
    {
      id: 1,
      move_type: "OUT",
      quantity: -2,
      reference_type: "invoice",
      reference_id: 1,
      link: "/admin/invoices/1" // ⭐ Link to invoice
    }
  ]
}
```

**Links:**
- ⭐ Stock Movement → Product Detail (`/admin/products/:product_id`)
- ⭐ Stock Movement → Stock Movements Page (`/admin/inventory/moves?reference_type=invoice&reference_id=:id`)

---

### 2. Product Detail Page ⭐ CRITICAL

**Route:** `/admin/products/:id`

**API Endpoint:**
```
GET /api/products/:id/detail?branch_id=1
```

**Page Structure:**
```
┌─────────────────────────────────────┐
│ Product Detail                      │
├─────────────────────────────────────┤
│ Product Info                        │
│   - Name: สินค้า A                  │
│   - Barcode: 1234567890             │
│   - Price: 100.00                   │
├─────────────────────────────────────┤
│ Tabs ⭐                             │
│   [Stock] [Sales] [Movements] [Repairs]│
├─────────────────────────────────────┤
│ Tab: Stock by Branch ⭐             │
│   ┌─────────────────────────────┐  │
│   │ Branch A | Stock: 50         │  │
│   │ Branch B | Stock: 30         │  │
│   └─────────────────────────────┘  │
├─────────────────────────────────────┤
│ Tab: Sales History ⭐               │
│   ┌─────────────────────────────┐  │
│   │ Invoice #001 | 2 pcs | [Link]⭐│
│   │ Invoice #002 | 1 pcs | [Link]⭐│
│   └─────────────────────────────┘  │
├─────────────────────────────────────┤
│ Tab: Stock Movements ⭐              │
│   ┌─────────────────────────────┐  │
│   │ OUT | Invoice #001 | [Link]⭐│  │
│   │ IN  | GRN #001     | [Link]⭐│  │
│   └─────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Data Structure:**
```typescript
{
  product: {...},
  stock_by_branch: [ // ⭐ Tab 1
    {
      branch_id: 1,
      branch_name: "สาขากรุงเทพ",
      quantity: 50,
      available_quantity: 50
    }
  ],
  sales_history: [ // ⭐ Tab 2
    {
      invoice_id: 1,
      invoice_no: "BKK-20250115-0001",
      date: "2025-01-15",
      quantity: 2,
      link: "/admin/invoices/1" // ⭐ Link to invoice
    }
  ],
  stock_movements: [ // ⭐ Tab 3
    {
      id: 1,
      move_type: "OUT",
      reference_type: "invoice",
      reference_id: 1,
      source_doc_link: "/admin/invoices/1" // ⭐ Link to source
    }
  ]
}
```

**Links:**
- ⭐ Sales History → Invoice Detail (`/admin/invoices/:invoice_id`)
- ⭐ Stock Movements → Source Document (Invoice, GRN, Adjustment, etc.)

---

### 3. Stock Movements Page

**Route:** `/admin/inventory/moves`

**API Endpoint:**
```
GET /api/stock/movements?product_id=1&reference_type=invoice&reference_id=1
```

**Page Structure:**
```
┌─────────────────────────────────────┐
│ Stock Movements                    │
├─────────────────────────────────────┤
│ Filters                            │
│   [Product] [Branch] [Type] [Date]  │
├─────────────────────────────────────┤
│ Movements List                      │
│   ┌─────────────────────────────┐  │
│   │ OUT | Product A | -2 | [Link]⭐│
│   │ IN  | Product B | +5 | [Link]⭐│
│   └─────────────────────────────┘  │
├─────────────────────────────────────┤
│ Movement Detail (on click)          │
│   - Move Type: OUT                 │
│   - Quantity: -2                    │
│   - Reference: Invoice #001 [Link]⭐│
│   - [View Source Document] ⭐       │
└─────────────────────────────────────┘
```

**Data Structure:**
```typescript
{
  movements: [
    {
      id: 1,
      product_name: "Product A",
      move_type: "OUT",
      quantity: -2,
      reference_type: "invoice", // ⭐
      reference_id: 1, // ⭐
      source_doc_link: "/admin/invoices/1", // ⭐ Generated link
      source_doc_summary: { // ⭐ Optional
        invoice_no: "BKK-20250115-0001",
        date: "2025-01-15"
      }
    }
  ]
}
```

**Links:**
- ⭐ Movement → Source Document (Invoice, GRN, Adjustment, etc.)
- ⭐ Movement → Product Detail (`/admin/products/:product_id`)

---

## 🔗 Linking Logic

### Frontend Link Generation
```typescript
// Generate link based on reference_type
function getSourceDocumentLink(movement: StockMove): string {
  switch (movement.reference_type) {
    case 'invoice':
      return `/admin/invoices/${movement.reference_id}`;
    case 'invoice_refund':
      return `/admin/invoices/${movement.reference_id}`;
    case 'grn':
      return `/admin/grn/${movement.reference_id}`;
    case 'stock_adjustment':
      return `/admin/stock-adjustments/${movement.reference_id}`;
    case 'stock_transfer':
      return `/admin/stock-transfers/${movement.reference_id}`;
    case 'repair':
      return `/admin/repairs/${movement.reference_id}`;
    default:
      return null;
  }
}
```

---

## 📊 Page Flow Diagrams

### Flow 1: Invoice Detail → Stock Movements → Product Detail
```
User views Invoice Detail
  ↓
Sees stock movements
  ↓
Clicks movement link
  ↓
Navigate to Stock Movements page (filtered)
  ↓
Clicks product link
  ↓
Navigate to Product Detail page
  ↓
Sees all movements for this product
```

---

### Flow 2: Product Detail → Sales History → Invoice Detail
```
User views Product Detail
  ↓
Clicks "Sales History" tab
  ↓
Sees sales history with links
  ↓
Clicks invoice link
  ↓
Navigate to Invoice Detail page
  ↓
Sees invoice with stock movements
```

---

### Flow 3: Stock Movements → Source Document
```
User views Stock Movements page
  ↓
Sees movements with source document links
  ↓
Clicks source document link
  ↓
Navigate to source document (Invoice, GRN, etc.)
  ↓
Sees document with related movements
```

---

## ✅ Page Structure Checklist

### Invoice Detail Page
- [ ] แสดง invoice info
- [ ] แสดง items (with stock_at_sale) ⭐
- [ ] แสดง stock movements ⭐
- [ ] แสดง refund movements (if any) ⭐
- [ ] Links ไปยัง Product Detail ⭐
- [ ] Links ไปยัง Stock Movements page ⭐

### Product Detail Page
- [ ] แสดง product info
- [ ] Tab: Stock by Branch ⭐
- [ ] Tab: Sales History (with links) ⭐
- [ ] Tab: Stock Movements (with links) ⭐
- [ ] Tab: Used in Repairs (future)
- [ ] Links ไปยัง source documents ⭐

### Stock Movements Page
- [ ] แสดง movements list
- [ ] Filters (product, branch, type, date)
- [ ] Links ไปยัง source documents ⭐
- [ ] Links ไปยัง Product Detail ⭐
- [ ] Movement detail modal (optional)

---

## 📚 Related Documents

- `plan/PHASE_4_UX_INTEGRATION.md` - UX Integration phase
- `docs/API_CONTRACTS.md` - API contracts
- `docs/INTEGRATION_POINTS.md` - Integration points

---

**Status:** 📋 Page Structure Mapping Complete

**Last Updated:** 2025-01-XX

**⭐ All pages must link to each other**

