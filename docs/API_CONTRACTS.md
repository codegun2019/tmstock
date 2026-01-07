# 📋 API Contracts Specification

**วันที่สร้าง:** 2025-01-XX  
**Version:** 5.0  
**Status:** 📋 API Specification

---

## 🎯 Overview

API Contract Spec สำหรับทุก endpoints ที่สำคัญ

**สำคัญ:** ทุก endpoint ต้อง follow contracts นี้

---

## 📋 Invoice Endpoints

### GET /api/invoices/:id/detail
**Purpose:** ดึง invoice detail พร้อม stock movements

**Request:**
```typescript
GET /api/invoices/:id/detail
Headers: {
  Authorization: "Bearer {token}"
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    invoice: {
      id: 1,
      invoice_no: "BKK-20250115-0001",
      branch_id: 1,
      user_id: 1,
      customer_name: "ลูกค้า A",
      subtotal: 200.00,
      discount_amount: 0,
      total_amount: 200.00,
      paid_amount: 200.00,
      payment_method: "cash",
      status: "completed",
      created_at: "2025-01-15T10:30:00Z"
    },
    items: [
      {
        id: 1,
        product_id: 1,
        product_name: "สินค้า A",
        quantity: 2,
        unit_price: 100.00,
        subtotal: 200.00,
        stock_at_sale: 50 // ⭐ Snapshot when sold
      }
    ],
    stock_movements: [ // ⭐ Related movements
      {
        id: 1,
        move_type: "OUT",
        quantity: -2,
        balance_before: 50,
        balance_after: 48,
        reference_type: "invoice",
        reference_id: 1,
        created_at: "2025-01-15T10:30:00Z"
      }
    ],
    refund_movements: [ // ⭐ If refunded
      {
        id: 2,
        move_type: "IN",
        quantity: 2,
        balance_before: 48,
        balance_after: 50,
        reference_type: "invoice_refund",
        reference_id: 1,
        created_at: "2025-01-15T11:00:00Z"
      }
    ]
  }
}
```

**Error Responses:**
```typescript
// Not Found
{
  success: false,
  error: "INVOICE_NOT_FOUND",
  message: "Invoice with ID 1 not found"
}

// Unauthorized
{
  success: false,
  error: "UNAUTHORIZED",
  message: "Authentication required"
}

// Forbidden
{
  success: false,
  error: "FORBIDDEN",
  message: "Insufficient permissions"
}
```

---

### POST /api/invoices
**Purpose:** สร้าง invoice และตัดสต็อค

**Request:**
```typescript
POST /api/invoices
Headers: {
  Authorization: "Bearer {token}",
  Content-Type: "application/json"
}
Body: {
  items: [
    {
      product_id: 1,
      quantity: 2,
      unit_price: 100.00,
      discount_amount: 0
    }
  ],
  customer_name: "ลูกค้า A",
  discount_amount: 0,
  paid_amount: 200.00,
  payment_method: "cash",
  payment_status: "paid" // ⭐ "paid" or "unpaid"
}
```

**Response (Success):**
```typescript
{
  success: true,
  data: {
    id: 1,
    invoice_no: "BKK-20250115-0001",
    status: "completed", // ⭐ "completed" if paid
    // ... other fields
  }
}
```

**Error Responses:**
```typescript
// Insufficient Stock
{
  success: false,
  error: "INSUFFICIENT_STOCK",
  message: "Insufficient stock for product สินค้า A. Available: 1, Required: 2",
  details: {
    product_id: 1,
    product_name: "สินค้า A",
    available: 1,
    required: 2
  }
}

// Product Not Found
{
  success: false,
  error: "PRODUCT_NOT_FOUND",
  message: "Product with ID 1 not found"
}

// Already Paid
{
  success: false,
  error: "ALREADY_PAID",
  message: "Invoice is already paid"
}
```

**Critical Rules:**
- ⭐ **ต้องตัดสต็อคเฉพาะเมื่อ payment_status = 'paid'**
- ⭐ **ต้องใช้ transaction (all or nothing)**
- ⭐ **ต้องตรวจสอบสต็อคก่อนขาย**

---

### POST /api/invoices/:id/void
**Purpose:** Void invoice และคืนสต็อค

**Request:**
```typescript
POST /api/invoices/:id/void
Headers: {
  Authorization: "Bearer {token}",
  Content-Type: "application/json"
}
Body: {
  reason: "ยกเลิกบิล" // ⭐ Required
}
```

**Response (Success):**
```typescript
{
  success: true,
  data: {
    id: 1,
    status: "voided",
    voided_at: "2025-01-15T11:00:00Z",
    voided_reason: "ยกเลิกบิล",
    stock_movements: [ // ⭐ Return movements
      {
        id: 2,
        move_type: "IN",
        quantity: 2,
        reference_type: "invoice_refund",
        reference_id: 1
      }
    ]
  }
}
```

**Error Responses:**
```typescript
// Already Voided
{
  success: false,
  error: "ALREADY_VOIDED",
  message: "Invoice is already voided"
}

// Not Paid
{
  success: false,
  error: "NOT_PAID",
  message: "Only paid invoices can be voided"
}

// Reason Required
{
  success: false,
  error: "REASON_REQUIRED",
  message: "Reason is required for void"
}
```

**Critical Rules:**
- ⭐ **ต้องคืนสต็อคทุก item**
- ⭐ **ต้องมีเหตุผล (required)**
- ⭐ **ต้องใช้ transaction**

---

## 📦 Product Endpoints

### GET /api/products/:id/detail
**Purpose:** ดึง product detail พร้อม stock, sales, movements

**Request:**
```typescript
GET /api/products/:id/detail?branch_id=1
Headers: {
  Authorization: "Bearer {token}"
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    product: {
      id: 1,
      name: "สินค้า A",
      barcode: "1234567890",
      selling_price: 100.00,
      cost_price: 80.00,
      // ... other fields
    },
    stock_by_branch: [ // ⭐ Stock by branch
      {
        branch_id: 1,
        branch_name: "สาขากรุงเทพ",
        quantity: 50,
        reserved_quantity: 0,
        available_quantity: 50,
        last_moved_at: "2025-01-15T10:30:00Z"
      }
    ],
    sales_history: [ // ⭐ Sales history
      {
        invoice_id: 1,
        invoice_no: "BKK-20250115-0001",
        date: "2025-01-15",
        quantity: 2,
        unit_price: 100.00,
        subtotal: 200.00,
        branch_name: "สาขากรุงเทพ"
      }
    ],
    stock_movements: [ // ⭐ Movements with links
      {
        id: 1,
        move_type: "OUT",
        quantity: -2,
        balance_before: 50,
        balance_after: 48,
        reference_type: "invoice", // ⭐ For linking
        reference_id: 1, // ⭐ For linking
        source_doc_link: "/admin/invoices/1", // ⭐ Generated link
        created_at: "2025-01-15T10:30:00Z"
      }
    ]
  }
}
```

**Error Responses:**
```typescript
// Not Found
{
  success: false,
  error: "PRODUCT_NOT_FOUND",
  message: "Product with ID 1 not found"
}
```

---

### GET /api/products/search
**Purpose:** ค้นหาสินค้า (ต้อง include stock_quantity)

**Request:**
```typescript
GET /api/products/search?q=สินค้า&branch_id=1
Headers: {
  Authorization: "Bearer {token}"
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    products: [
      {
        id: 1,
        name: "สินค้า A",
        barcode: "1234567890",
        selling_price: 100.00,
        stock_quantity: 50, // ⭐ Must include
        unit: "ชิ้น"
      }
    ]
  }
}
```

**Critical Rules:**
- ⭐ **ต้อง include stock_quantity**
- ⭐ **ต้องใช้ branch_id จาก context**

---

## 📊 Stock Endpoints

### GET /api/stock/movements
**Purpose:** ดึง stock movements (with reference linking)

**Request:**
```typescript
GET /api/stock/movements?product_id=1&reference_type=invoice&reference_id=1
Headers: {
  Authorization: "Bearer {token}"
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    movements: [
      {
        id: 1,
        product_id: 1,
        product_name: "สินค้า A",
        branch_id: 1,
        branch_name: "สาขากรุงเทพ",
        move_type: "OUT",
        quantity: -2,
        balance_before: 50,
        balance_after: 48,
        reference_type: "invoice", // ⭐ For linking
        reference_id: 1, // ⭐ For linking
        source_doc_link: "/admin/invoices/1", // ⭐ Generated link
        source_doc_summary: { // ⭐ Optional summary
          invoice_no: "BKK-20250115-0001",
          date: "2025-01-15"
        },
        reason: "Sale - Invoice #BKK-20250115-0001",
        created_at: "2025-01-15T10:30:00Z",
        created_by: 1,
        created_by_name: "พนักงาน A"
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

**Critical Rules:**
- ⭐ **ต้อง include reference_type และ reference_id**
- ⭐ **ต้อง include source_doc_link (generated)**
- ⭐ **ต้อง include source_doc_summary (optional)**

---

### GET /api/stock/movements/:id
**Purpose:** ดึง movement detail พร้อม source document link

**Request:**
```typescript
GET /api/stock/movements/:id
Headers: {
  Authorization: "Bearer {token}"
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    movement: {
      id: 1,
      // ... movement fields
      reference_type: "invoice",
      reference_id: 1,
      source_doc_link: "/admin/invoices/1", // ⭐ Link to source
      source_doc: { // ⭐ Source document summary
        type: "invoice",
        id: 1,
        number: "BKK-20250115-0001",
        date: "2025-01-15"
      }
    }
  }
}
```

---

## 🔄 POS Endpoints

### GET /api/pos/scan
**Purpose:** สแกนบาร์โค้ด (ต้อง return stock_quantity)

**Request:**
```typescript
GET /api/pos/scan?barcode=1234567890
Headers: {
  Authorization: "Bearer {token}"
}
```

**Response (Found):**
```typescript
{
  success: true,
  product: {
    id: 1,
    barcode: "1234567890",
    name: "สินค้า A",
    selling_price: 100.00,
    stock_quantity: 50, // ⭐ Must include
    unit: "ชิ้น"
  }
}
```

**Response (Not Found):**
```typescript
{
  success: false,
  not_found: true,
  barcode: "1234567890"
}
```

**Critical Rules:**
- ⭐ **ต้อง include stock_quantity**
- ⭐ **ต้องใช้ branch_id จาก context**

---

## 🚨 Error Codes

### Stock Errors
- `INSUFFICIENT_STOCK` - สต็อคไม่พอ
- `NEGATIVE_STOCK_NOT_ALLOWED` - ไม่ให้ติดลบ
- `STOCK_LOCK_FAILED` - Lock ไม่สำเร็จ

### Invoice Errors
- `INVOICE_NOT_FOUND` - ไม่พบบิล
- `ALREADY_PAID` - จ่ายแล้ว
- `ALREADY_VOIDED` - Void แล้ว
- `NOT_PAID` - ยังไม่จ่าย
- `REASON_REQUIRED` - ต้องมีเหตุผล

### Product Errors
- `PRODUCT_NOT_FOUND` - ไม่พบสินค้า
- `BARCODE_EXISTS` - Barcode ซ้ำ
- `SKU_EXISTS` - SKU ซ้ำ

### General Errors
- `UNAUTHORIZED` - ไม่ได้ login
- `FORBIDDEN` - ไม่มีสิทธิ์
- `VALIDATION_ERROR` - Validation failed
- `INTERNAL_ERROR` - Server error

---

## ✅ API Contract Checklist

### Invoice Endpoints
- [ ] GET /api/invoices/:id/detail returns stock_movements ⭐
- [ ] POST /api/invoices only deducts stock if paid ⭐
- [ ] POST /api/invoices/:id/void returns stock ⭐
- [ ] Error codes defined

### Product Endpoints
- [ ] GET /api/products/:id/detail returns stock + sales + movements ⭐
- [ ] GET /api/products/search includes stock_quantity ⭐
- [ ] Error codes defined

### Stock Endpoints
- [ ] GET /api/stock/movements includes reference_type/ref_id ⭐
- [ ] GET /api/stock/movements includes source_doc_link ⭐
- [ ] Error codes defined

### POS Endpoints
- [ ] GET /api/pos/scan includes stock_quantity ⭐
- [ ] Error codes defined

---

## 📚 Related Documents

- `docs/KEY_POINTS_SYSTEM_INTEGRITY.md` - Critical rules
- `plan/PHASE_4_UX_INTEGRATION.md` - UX integration
- `docs/IDEMPOTENCY_RULES.md` - Idempotency rules

---

**Status:** 📋 API Specification Complete

**Last Updated:** 2025-01-XX

