# 🎨 Frontend API Guide - Quick Reference

**วันที่สร้าง:** 2025-01-XX  
**Version:** 5.0  
**สถานะ:** 📋 Frontend Quick Reference

---

## 🎯 Overview

Quick reference guide สำหรับ frontend developers

---

## 🚀 Most Used APIs

### 1. POS Operations
```typescript
// Scan barcode
GET /api/pos/scan?barcode=1234567890
→ Returns: { success: true, product: { ..., stock_quantity: 50 } }

// Quick create product
POST /api/pos/quick-create
→ Returns: { success: true, product: { ... } }

// Create invoice (checkout)
POST /api/invoices
→ Returns: { success: true, data: { invoice: { ... } } }
```

---

### 2. Product Operations
```typescript
// Search products
GET /api/products/search?q=สินค้า&branch_id=1
→ Returns: { products: [{ ..., stock_quantity: 50 }] }

// Get product detail
GET /api/products/:id/detail?branch_id=1
→ Returns: { product, stock_by_branch, sales_history, stock_movements }

// Get product
GET /api/products/:id
→ Returns: { product: { ..., stock_quantity: 50 } }
```

---

### 3. Invoice Operations
```typescript
// Get invoice detail
GET /api/invoices/:id/detail
→ Returns: { invoice, items, stock_movements, refund_movements }

// Void invoice
POST /api/invoices/:id/void
Body: { reason: "ยกเลิกบิล" }
→ Returns: { invoice: { status: "voided" }, stock_movements: [...] }

// Refund invoice
POST /api/invoices/:id/refund
Body: { reason: "คืนเงิน" }
→ Returns: { invoice: { status: "refunded" }, stock_movements: [...] }
```

---

### 4. Stock Operations
```typescript
// Get stock movements
GET /api/inventory/moves?product_id=1&reference_type=invoice&reference_id=1
→ Returns: { movements: [{ ..., source_doc_link: "/admin/invoices/1" }] }

// Get movement detail
GET /api/inventory/moves/:id
→ Returns: { movement: { ..., source_doc_link: "/admin/invoices/1" } }

// Get stock balance
GET /api/inventory/balance?product_id=1&branch_id=1
→ Returns: { balance: { quantity: 50 } }
```

---

## 🔗 Linking Logic (Frontend)

### Generate Link from Reference
```typescript
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

## 📋 Common Patterns

### Pattern 1: List with Pagination
```typescript
GET /api/products?page=1&limit=20&active=1

Response:
{
  success: true,
  data: {
    products: [...],
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

### Pattern 2: Detail with Related Data
```typescript
GET /api/products/:id/detail?branch_id=1

Response:
{
  success: true,
  data: {
    product: {...},
    stock_by_branch: [...],
    sales_history: [...],
    stock_movements: [...]
  }
}
```

---

### Pattern 3: Action with Reason
```typescript
POST /api/invoices/:id/void
{
  reason: "ยกเลิกบิล" // Required
}

Response:
{
  success: true,
  data: {
    invoice: { status: "voided" },
    stock_movements: [...]
  }
}
```

---

## ✅ Frontend Checklist

### Critical APIs
- [ ] `/api/pos/scan` - Scan barcode ⭐
- [ ] `/api/invoices` (POST) - Create invoice ⭐
- [ ] `/api/invoices/:id/detail` - Invoice detail ⭐
- [ ] `/api/products/search` - Search products ⭐
- [ ] `/api/products/:id/detail` - Product detail ⭐
- [ ] `/api/inventory/moves` - Stock movements ⭐

### Important APIs
- [ ] `/api/invoices/:id/void` - Void invoice
- [ ] `/api/invoices/:id/refund` - Refund invoice
- [ ] `/api/branches/set-context` - Set branch

---

## 📚 Related Documents

- `docs/API_ENDPOINTS_ANALYSIS.md` - Complete API analysis
- `docs/API_CONTRACTS.md` - API contracts
- `docs/PAGE_STRUCTURE_MAPPING.md` - Page structure

---

**Status:** 📋 Frontend Quick Reference

**Last Updated:** 2025-01-XX

