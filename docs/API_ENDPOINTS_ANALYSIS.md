# 🔌 API Endpoints Analysis - Frontend Guide

**วันที่วิเคราะห์:** 2025-01-XX  
**Version:** 5.0  
**สถานะ:** 📋 Complete API Analysis

---

## 🎯 Overview

วิเคราะห์ API endpoints ทั้งหมดเพื่อให้ frontend ทำงานได้ง่ายขึ้น

**Total Endpoints:** 100+ endpoints  
**API Base Path:** `/api` (RESTful) และ `/admin` (Admin pages)

---

## 📊 API Structure Overview

### Current PHP Structure
- Mixed routes: `/admin/*` (pages) และ `/api/*` (AJAX)
- Response format: JSON (`success`, `message`, `data`)

### Target NestJS Structure
- RESTful: `/api/*` (all API endpoints)
- Consistent response format
- Proper HTTP methods (GET, POST, PUT, DELETE)

---

## 🔗 API Endpoints by Feature

### 1. Authentication & Authorization

#### Auth Endpoints
```
GET    /api/auth/login          # Login page (redirect)
POST   /api/auth/login          # Login attempt
GET    /api/auth/logout         # Logout
GET    /api/auth/me             # Get current user
```

**Response Format:**
```typescript
// Success
{
  success: true,
  user: {
    id: 1,
    username: "admin",
    full_name: "ผู้ดูแลระบบ",
    branch_id: 1,
    roles: ["admin"]
  }
}

// Error
{
  success: false,
  message: "Invalid credentials"
}
```

---

### 2. Users Management

#### Users Endpoints
```
GET    /api/users               # List users
GET    /api/users/:id           # Get user
POST   /api/users               # Create user
PUT    /api/users/:id           # Update user
DELETE /api/users/:id           # Delete user
POST   /api/users/:id/suspend   # Suspend user
POST   /api/users/:id/activate  # Activate user
POST   /api/users/:id/reset-password # Reset password
```

**Request Example (Create):**
```typescript
POST /api/users
{
  username: "cashier1",
  email: "cashier1@example.com",
  password: "password123",
  full_name: "พนักงานขาย 1",
  branch_id: 1,
  role_ids: [2] // Cashier role
}
```

**Response Example:**
```typescript
{
  success: true,
  data: {
    id: 1,
    username: "cashier1",
    full_name: "พนักงานขาย 1",
    branch_id: 1,
    active: 1
  }
}
```

---

### 3. Roles & Permissions

#### Roles Endpoints
```
GET    /api/roles                    # List roles
GET    /api/roles/:id                # Get role
POST   /api/roles                    # Create role
PUT    /api/roles/:id                # Update role
DELETE /api/roles/:id                # Delete role
GET    /api/roles/:id/permissions    # Get role permissions
POST   /api/roles/:id/permissions    # Assign permissions
GET    /api/permissions              # List all permissions
```

**Request Example (Assign Permissions):**
```typescript
POST /api/roles/1/permissions
{
  permission_ids: [1, 2, 3, 4]
}
```

---

### 4. Branches Management

#### Branches Endpoints
```
GET    /api/branches                 # List branches
GET    /api/branches/:id             # Get branch
POST   /api/branches                 # Create branch
PUT    /api/branches/:id             # Update branch
POST   /api/branches/:id/disable     # Disable branch
POST   /api/branches/:id/enable      # Enable branch
POST   /api/branches/set-context     # Set branch context (for current user)
```

**Request Example (Set Context):**
```typescript
POST /api/branches/set-context
{
  branch_id: 1
}
```

**Response:**
```typescript
{
  success: true,
  message: "Branch context updated",
  branch: {
    id: 1,
    code: "BKK",
    name: "สาขากรุงเทพ"
  }
}
```

---

### 5. Products Management ⭐ CRITICAL

#### Products Endpoints
```
GET    /api/products                 # List products (with filters)
GET    /api/products/:id             # Get product
GET    /api/products/:id/detail      # Get product detail (with stock, sales, movements) ⭐
POST   /api/products                 # Create product
PUT    /api/products/:id             # Update product
DELETE /api/products/:id             # Delete product
GET    /api/products/search           # Search products (must include stock_quantity) ⭐
POST   /api/products/:id/disable     # Disable product
POST   /api/products/:id/enable      # Enable product
```

#### Product Media Endpoints
```
GET    /api/products/:id/media      # Get product media
POST   /api/products/:id/media       # Upload media
DELETE /api/products/:id/media/:mediaId # Delete media
POST   /api/products/:id/media/:mediaId/set-primary # Set primary image
POST   /api/products/:id/media/reorder # Reorder media
POST   /api/products/temp-upload     # Temporary upload (for form)
POST   /api/products/temp-delete     # Delete temporary file
```

**Request Example (Search):**
```typescript
GET /api/products/search?q=สินค้า&branch_id=1
```

**Response Example (Must Include Stock):**
```typescript
{
  success: true,
  data: {
    products: [
      {
        id: 1,
        barcode: "1234567890",
        name: "สินค้า A",
        selling_price: 100.00,
        stock_quantity: 50, // ⭐ Must include
        unit: "ชิ้น"
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

**Request Example (Get Detail):**
```typescript
GET /api/products/1/detail?branch_id=1
```

**Response Example (Detail with Tabs):**
```typescript
{
  success: true,
  data: {
    product: {
      id: 1,
      name: "สินค้า A",
      barcode: "1234567890",
      selling_price: 100.00
    },
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
        unit_price: 100.00,
        link: "/admin/invoices/1" // ⭐ Link to invoice
      }
    ],
    stock_movements: [ // ⭐ Tab 3
      {
        id: 1,
        move_type: "OUT",
        quantity: -2,
        reference_type: "invoice", // ⭐
        reference_id: 1, // ⭐
        source_doc_link: "/admin/invoices/1", // ⭐ Generated link
        created_at: "2025-01-15T10:30:00Z"
      }
    ]
  }
}
```

---

### 6. Categories Management

#### Categories Endpoints
```
GET    /api/categories               # List categories
GET    /api/categories/:id          # Get category
POST   /api/categories              # Create category
PUT    /api/categories/:id         # Update category
DELETE /api/categories/:id         # Delete category
```

---

### 7. Units Management

#### Units Endpoints
```
GET    /api/units                   # List units
GET    /api/units/:id               # Get unit
POST   /api/units                   # Create unit
PUT    /api/units/:id               # Update unit
DELETE /api/units/:id               # Delete unit
```

---

### 8. Contacts Management (Customers/Suppliers)

#### Contacts Endpoints
```
GET    /api/contacts                # List contacts
GET    /api/contacts/:id            # Get contact
POST   /api/contacts                # Create contact
PUT    /api/contacts/:id            # Update contact
DELETE /api/contacts/:id            # Delete contact
GET    /api/contacts/search-tax-id  # Search by tax ID
GET    /api/contacts/search-phone   # Search by phone
```

#### Contact Attachments Endpoints
```
POST   /api/contacts/:id/attachments # Upload attachment
DELETE /api/contacts/:id/attachments/:attachmentId # Delete attachment
```

---

### 9. POS Operations ⭐ CRITICAL

#### POS Endpoints
```
GET    /api/pos/scan                # Scan barcode (query param)
POST   /api/pos/scan                # Scan barcode (body)
POST   /api/pos/quick-create        # Quick create product from POS
```

**Request Example (Scan):**
```typescript
GET /api/pos/scan?barcode=1234567890
// or
POST /api/pos/scan
{
  barcode: "1234567890"
}
```

**Response Example (Found):**
```typescript
{
  success: true,
  product: {
    id: 1,
    barcode: "1234567890",
    name: "สินค้า A",
    selling_price: 100.00,
    stock_quantity: 50, // ⭐ Must include
    unit: "ชิ้น",
    image_url: "/uploads/products/1.jpg"
  }
}
```

**Response Example (Not Found):**
```typescript
{
  success: false,
  not_found: true,
  barcode: "1234567890",
  message: "ไม่พบสินค้า"
}
```

**Request Example (Quick Create):**
```typescript
POST /api/pos/quick-create
{
  barcode: "9876543210",
  name: "สินค้าใหม่",
  selling_price: 150.00,
  cost_price: 100.00,
  unit: "ชิ้น"
}
```

---

### 10. Invoices (Sales) ⭐ CRITICAL

#### Invoice Endpoints
```
GET    /api/invoices                # List invoices
GET    /api/invoices/:id            # Get invoice
GET    /api/invoices/:id/detail     # Get invoice detail (with stock movements) ⭐
POST   /api/invoices                # Create invoice (checkout) ⭐
PUT    /api/invoices/:id            # Update invoice
POST   /api/invoices/:id/void       # Void invoice ⭐
POST   /api/invoices/:id/refund     # Refund invoice ⭐
GET    /api/invoices/:id/receipt    # Get receipt (print)
```

**Request Example (Create Invoice):**
```typescript
POST /api/invoices
{
  items: [
    {
      product_id: 1,
      quantity: 2,
      unit_price: 100.00,
      discount_amount: 0
    }
  ],
  customer_name: "ลูกค้า A",
  customer_phone: "0812345678",
  discount_amount: 0,
  paid_amount: 200.00,
  payment_method: "cash",
  payment_status: "paid", // ⭐ "paid" or "unpaid"
  notes: "ขายหน้าร้าน"
}
```

**Response Example:**
```typescript
{
  success: true,
  message: "ขายสำเร็จ",
  data: {
    id: 1,
    invoice_no: "BKK-20250115-0001",
    status: "completed", // ⭐ "completed" if paid
    total_amount: 200.00,
    paid_amount: 200.00,
    items: [
      {
        id: 1,
        product_id: 1,
        product_name: "สินค้า A",
        quantity: 2,
        unit_price: 100.00,
        subtotal: 200.00
      }
    ]
  }
}
```

**Request Example (Get Detail with Stock Movements):**
```typescript
GET /api/invoices/1/detail
```

**Response Example:**
```typescript
{
  success: true,
  data: {
    invoice: {
      id: 1,
      invoice_no: "BKK-20250115-0001",
      status: "completed",
      total_amount: 200.00
    },
    items: [
      {
        id: 1,
        product_id: 1,
        product_name: "สินค้า A",
        quantity: 2,
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
    refund_movements: [] // ⭐ If refunded
  }
}
```

**Request Example (Void Invoice):**
```typescript
POST /api/invoices/1/void
{
  reason: "ยกเลิกบิล" // ⭐ Required
}
```

**Response Example:**
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

---

### 11. Inventory Management ⭐ CRITICAL

#### Inventory Endpoints
```
GET    /api/inventory/balance        # Get stock balance (product_id, branch_id)
GET    /api/inventory/moves          # Get stock movements (with filters)
GET    /api/inventory/moves/:id      # Get movement detail (with source link) ⭐
POST   /api/inventory/receive        # Receive stock
POST   /api/inventory/adjust         # Adjust stock
POST   /api/inventory/transfer       # Transfer stock
POST   /api/inventory/approve        # Approve stock move
```

**Request Example (Get Movements):**
```typescript
GET /api/inventory/moves?product_id=1&reference_type=invoice&reference_id=1&branch_id=1
```

**Response Example:**
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
        reference_type: "invoice", // ⭐
        reference_id: 1, // ⭐
        source_doc_link: "/admin/invoices/1", // ⭐ Generated link
        source_doc_summary: { // ⭐ Optional
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

**Request Example (Get Movement Detail):**
```typescript
GET /api/inventory/moves/1
```

**Response Example:**
```typescript
{
  success: true,
  data: {
    movement: {
      id: 1,
      move_type: "OUT",
      quantity: -2,
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

### 12. Invoice Sequences

#### Sequence Endpoints
```
GET    /api/invoice-sequence/generate # Generate next invoice number
GET    /api/invoice-sequence/current  # Get current sequence
GET    /api/invoice-sequence/statistics # Get sequence statistics
```

**Request Example:**
```typescript
GET /api/invoice-sequence/generate?branch_id=1
```

**Response Example:**
```typescript
{
  success: true,
  data: {
    invoice_no: "BKK-20250115-0001",
    sequence: 1,
    date: "2025-01-15"
  }
}
```

---

### 13. Repair Service

#### Repair Endpoints
```
GET    /api/repairs                  # List repairs
GET    /api/repairs/:id              # Get repair
POST   /api/repairs                  # Create repair order
PUT    /api/repairs/:id              # Update repair order
POST   /api/repairs/:id/change-status # Change status
POST   /api/repairs/:id/process-payment # Process payment
POST   /api/repairs/:id/cancel       # Cancel repair
POST   /api/repairs/:id/upload-image # Upload image
POST   /api/repairs/:id/delete-image # Delete image
GET    /api/repairs/:id/print        # Print repair order
```

---

### 14. Documents (Sales & Accounting)

#### Documents Endpoints
```
GET    /api/documents                # List documents
GET    /api/documents/:id            # Get document
POST   /api/documents                # Create document
PUT    /api/documents/:id            # Update document
POST   /api/documents/:id/issue      # Issue document
POST   /api/documents/:id/cancel     # Cancel document
GET    /api/documents/:id/print      # Print document
```

---

### 15. GRN (Goods Receipt Note)

#### GRN Endpoints
```
GET    /api/grn                      # List GRN
GET    /api/grn/:id                  # Get GRN
POST   /api/grn                      # Create GRN
PUT    /api/grn/:id                  # Update GRN
POST   /api/grn/:id/complete         # Complete GRN (update stock)
POST   /api/grn/:id/cancel           # Cancel GRN
POST   /api/grn/:id/upload-attachment # Upload attachment
```

---

### 16. Stock Adjustments

#### Stock Adjustment Endpoints
```
GET    /api/stock-adjustments        # List adjustments
GET    /api/stock-adjustments/:id    # Get adjustment
POST   /api/stock-adjustments        # Create adjustment
PUT    /api/stock-adjustments/:id    # Update adjustment
POST   /api/stock-adjustments/:id/approve # Approve adjustment (update stock)
POST   /api/stock-adjustments/:id/reject  # Reject adjustment
POST   /api/stock-adjustments/:id/cancel  # Cancel adjustment
```

---

### 17. Stock Transfers

#### Stock Transfer Endpoints
```
GET    /api/stock-transfers          # List transfers
GET    /api/stock-transfers/:id      # Get transfer
POST   /api/stock-transfers          # Create transfer
PUT    /api/stock-transfers/:id      # Update transfer
POST   /api/stock-transfers/:id/submit # Submit transfer
POST   /api/stock-transfers/:id/approve # Approve transfer
POST   /api/stock-transfers/:id/receive # Receive transfer (update stock)
POST   /api/stock-transfers/:id/cancel # Cancel transfer
```

---

### 18. Reports

#### Reports Endpoints
```
GET    /api/reports/daily            # Daily sales report
GET    /api/reports/monthly          # Monthly sales report
GET    /api/reports/yearly           # Yearly sales report
GET    /api/reports/export-csv       # Export report to CSV
```

---

### 19. Audit Logs

#### Audit Logs Endpoints
```
GET    /api/logs                     # List audit logs
GET    /api/logs/:id                 # Get audit log
```

---

### 20. Settings

#### Settings Endpoints
```
GET    /api/settings                 # List all settings
GET    /api/settings/by-category     # Get settings by category
GET    /api/settings/value           # Get setting value
POST   /api/settings                 # Update setting
POST   /api/settings/batch           # Update multiple settings
DELETE /api/settings/:id             # Delete setting
```

---

### 21. Backup & Restore

#### Backup Endpoints
```
GET    /api/backup                   # List backups
POST   /api/backup/create-full      # Create full backup
POST   /api/backup/create-database   # Create database backup
POST   /api/backup/restore          # Restore backup
DELETE /api/backup/:id               # Delete backup
GET    /api/backup/:id/download     # Download backup
```

---

### 22. Accounts Receivable

#### Accounts Receivable Endpoints
```
GET    /api/accounts-receivable      # List receivables
POST   /api/accounts-receivable/record-payment # Record payment
GET    /api/accounts-receivable/summary # Get summary
```

---

### 23. Feature Toggles

#### Feature Toggles Endpoints
```
GET    /api/feature-toggles         # List feature toggles
POST   /api/feature-toggles/set     # Set feature toggle
DELETE /api/feature-toggles/:id     # Delete feature toggle
```

---

## 🔄 API Dependencies & Flow

### Flow 1: POS Checkout Flow
```
1. Scan Product
   GET /api/pos/scan?barcode=xxx
   ↓
   Returns: product + stock_quantity

2. Add to Cart (Frontend)
   Cart: [{product_id, quantity, unit_price}]

3. Checkout
   POST /api/invoices
   {
     items: cart,
     payment_status: "paid"
   }
   ↓
   Backend:
   - Creates invoice
   - Deducts stock (if paid)
   - Creates stock_moves (OUT)
   ↓
   Returns: invoice + items

4. View Invoice Detail
   GET /api/invoices/:id/detail
   ↓
   Returns: invoice + items + stock_movements
```

---

### Flow 2: Product Detail Flow
```
1. View Product
   GET /api/products/:id/detail?branch_id=1
   ↓
   Returns: product + stock_by_branch + sales_history + stock_movements

2. Click Sales History Link
   Navigate to: /admin/invoices/:invoice_id

3. Click Stock Movement Link
   Navigate to: /admin/inventory/moves?reference_type=invoice&reference_id=:id
```

---

### Flow 3: Stock Movements → Source Document Flow
```
1. View Stock Movements
   GET /api/inventory/moves?product_id=1
   ↓
   Returns: movements with source_doc_link

2. Click Source Document Link
   Navigate to: source_doc_link (e.g., /admin/invoices/1)
```

---

## 📋 Frontend Usage Patterns

### Pattern 1: List with Filters
```typescript
// Products List
GET /api/products?active=1&category=electronics&search=สินค้า&page=1&limit=20

// Response includes pagination
{
  data: { products: [...] },
  pagination: {
    page: 1,
    limit: 20,
    total: 100,
    total_pages: 5
  }
}
```

---

### Pattern 2: Detail with Related Data
```typescript
// Product Detail (includes tabs data)
GET /api/products/:id/detail?branch_id=1

// Invoice Detail (includes stock movements)
GET /api/invoices/:id/detail

// Stock Movement Detail (includes source link)
GET /api/inventory/moves/:id
```

---

### Pattern 3: Create with Validation
```typescript
// Create Invoice
POST /api/invoices
{
  items: [...],
  payment_status: "paid"
}

// Response includes created entity
{
  success: true,
  data: { id: 1, ... }
}
```

---

### Pattern 4: Action Endpoints
```typescript
// Void Invoice
POST /api/invoices/:id/void
{
  reason: "ยกเลิกบิล"
}

// Response includes updated entity + related data
{
  success: true,
  data: {
    invoice: { status: "voided", ... },
    stock_movements: [...] // Return movements
  }
}
```

---

## 🎯 API Response Standards

### Success Response
```typescript
{
  success: true,
  data: { ... }, // Main data
  message?: string, // Optional message
  pagination?: { // If list endpoint
    page: number,
    limit: number,
    total: number,
    total_pages: number
  }
}
```

### Error Response
```typescript
{
  success: false,
  error: "ERROR_CODE", // e.g., "INSUFFICIENT_STOCK"
  message: "Error message (Thai)",
  details?: { // Optional details
    product_id: 1,
    available: 1,
    required: 2
  }
}
```

---

## 🔗 Linking Endpoints (UX Integration)

### Invoice Detail → Stock Movements
```
GET /api/invoices/:id/detail
  ↓
Returns: stock_movements[]
  ↓
Each movement has: reference_type, reference_id
  ↓
Frontend generates link:
  - reference_type='invoice' → /admin/invoices/:reference_id
  - reference_type='grn' → /admin/grn/:reference_id
```

---

### Product Detail → Source Documents
```
GET /api/products/:id/detail
  ↓
Returns:
  - sales_history[] (with invoice links)
  - stock_movements[] (with source_doc_link)
  ↓
Frontend displays tabs with links
```

---

### Stock Movements → Source Documents
```
GET /api/inventory/moves/:id
  ↓
Returns: source_doc_link
  ↓
Frontend navigates to source document
```

---

## 📊 API Grouping for Frontend

### Core APIs (Most Used)
1. **Auth APIs** - Login, logout, current user
2. **POS APIs** - Scan, quick create, checkout
3. **Product APIs** - Search, detail, list
4. **Invoice APIs** - Create, detail, void, refund
5. **Inventory APIs** - Balance, movements

### Management APIs
6. **Users APIs** - CRUD users
7. **Products APIs** - CRUD products
8. **Contacts APIs** - CRUD contacts
9. **Branches APIs** - CRUD branches

### Advanced APIs
10. **GRN APIs** - Goods receipt
11. **Stock Adjustment APIs** - Stock corrections
12. **Stock Transfer APIs** - Inter-branch transfers
13. **Repair APIs** - Repair service
14. **Documents APIs** - Sales documents

---

## ✅ Frontend Checklist

### Critical Endpoints (Must Implement)
- [ ] `/api/auth/login` - Login
- [ ] `/api/pos/scan` - Scan barcode ⭐
- [ ] `/api/invoices` (POST) - Create invoice ⭐
- [ ] `/api/invoices/:id/detail` - Invoice detail with movements ⭐
- [ ] `/api/products/search` - Search products (with stock) ⭐
- [ ] `/api/products/:id/detail` - Product detail (with tabs) ⭐
- [ ] `/api/inventory/moves` - Stock movements (with links) ⭐

### Important Endpoints
- [ ] `/api/invoices/:id/void` - Void invoice
- [ ] `/api/invoices/:id/refund` - Refund invoice
- [ ] `/api/inventory/balance` - Get stock balance
- [ ] `/api/branches/set-context` - Set branch context

### Supporting Endpoints
- [ ] `/api/categories` - List categories
- [ ] `/api/units` - List units
- [ ] `/api/contacts/search-tax-id` - Search contact
- [ ] `/api/invoice-sequence/generate` - Generate invoice number

---

## 🚨 Critical API Rules

### 1. Stock Quantity Must Be Included ⭐
- ✅ `/api/products/search` - Must include `stock_quantity`
- ✅ `/api/products/:id` - Must include `stock_quantity`
- ✅ `/api/pos/scan` - Must include `stock_quantity`

### 2. Reference Linking Must Be Included ⭐
- ✅ `/api/inventory/moves` - Must include `reference_type`, `reference_id`, `source_doc_link`
- ✅ `/api/invoices/:id/detail` - Must include `stock_movements` with references
- ✅ `/api/products/:id/detail` - Must include `stock_movements` with references

### 3. Payment Status Check ⭐
- ✅ `/api/invoices` (POST) - Only deduct stock if `payment_status='paid'`
- ✅ `/api/invoices/:id/void` - Only return stock if invoice was paid

### 4. Branch Context ⭐
- ✅ All stock-related endpoints must use `branch_id` from context
- ✅ `/api/branches/set-context` - Set branch for current session

---

## 📚 Related Documents

- `docs/API_CONTRACTS.md` - API Contracts Specification
- `docs/PAGE_STRUCTURE_MAPPING.md` - Page Structure Mapping
- `docs/INTEGRATION_POINTS.md` - Integration Points

---

**Status:** 📋 API Analysis Complete

**Last Updated:** 2025-01-XX

**⭐ Total: 100+ endpoints, organized by feature**

