# ✅ Complete API Endpoints List

**วันที่อัปเดต:** 2025-01-07  
**Status:** ✅ All CRUD Endpoints Complete

---

## 📋 API Endpoints Summary

### 🔐 Authentication (`/auth`)
- ✅ `POST /auth/login` - Login
- ✅ `POST /auth/register` - Register

### 📦 Products (`/products`)
- ✅ `GET /products` - List products (with search, category_id, limit filters)
- ✅ `GET /products/:id` - Get product by ID
- ✅ `GET /products/barcode/:barcode` - Find by barcode
- ✅ `GET /products/:id/stock` - Get stock by branch (UX Integration)
- ✅ `GET /products/:id/movements` - Get stock movements (UX Integration)
- ✅ `POST /products` - Create product
- ✅ `PATCH /products/:id` - Update product
- ✅ `DELETE /products/:id` - Delete product
- ✅ `PATCH /products/:id/activate` - Activate product
- ✅ `PATCH /products/:id/deactivate` - Deactivate product

### 📁 Categories (`/categories`)
- ✅ `GET /categories` - List categories (with active filter)
- ✅ `GET /categories/:id` - Get category by ID
- ✅ `GET /categories/slug/:slug` - Find by slug
- ✅ `POST /categories` - Create category
- ✅ `PATCH /categories/:id` - Update category
- ✅ `DELETE /categories/:id` - Delete category
- ✅ `PATCH /categories/:id/activate` - Activate category
- ✅ `PATCH /categories/:id/deactivate` - Deactivate category

### 📏 Units (`/units`)
- ✅ `GET /units` - List units (with active filter)
- ✅ `GET /units/:id` - Get unit by ID
- ✅ `GET /units/name/:name` - Find by name
- ✅ `POST /units` - Create unit
- ✅ `PATCH /units/:id` - Update unit
- ✅ `DELETE /units/:id` - Delete unit
- ✅ `PATCH /units/:id/activate` - Activate unit
- ✅ `PATCH /units/:id/deactivate` - Deactivate unit

### 🏢 Branches (`/branches`)
- ✅ `GET /branches` - List branches (with active filter)
- ✅ `GET /branches/:id` - Get branch by ID
- ✅ `POST /branches` - Create branch
- ✅ `PATCH /branches/:id` - Update branch
- ✅ `DELETE /branches/:id` - Delete branch
- ✅ `PATCH /branches/:id/activate` - Activate branch
- ✅ `PATCH /branches/:id/deactivate` - Deactivate branch

### 📊 Stock (`/stock`)
- ✅ `GET /stock/balance` - Get balance (query params: product_id, branch_id)
- ✅ `GET /stock/balance/:productId/:branchId` - Get balance (path params)
- ✅ `POST /stock/add` - Add stock (IN)
- ✅ `POST /stock/deduct` - Deduct stock (OUT) with locking
- ✅ `POST /stock/adjust` - Adjust stock (correction)
- ✅ `GET /stock/movements` - Get movements with filters
- ✅ `GET /stock/movements/:productId/:branchId` - Get movements by product/branch
- ✅ `GET /stock/movements/reference/:refType/:refId` - Get by reference (UX Integration)

### 🧾 Invoices (`/invoices`)
- ✅ `GET /invoices` - List invoices (with filters: branch_id, status, date_from, date_to, customer_name, limit)
- ✅ `GET /invoices/:id` - Get invoice by ID
- ✅ `GET /invoices/:id/stock-movements` - Get stock movements (UX Integration)
- ✅ `POST /invoices` - Create invoice (draft)
- ✅ `POST /invoices/:id/pay` - Pay invoice (deducts stock + creates cash transaction)
- ✅ `POST /invoices/:id/void` - Void invoice
- ✅ `POST /invoices/:id/refund` - Refund invoice (returns stock)

### 💰 Cash Ledger (`/cash`)
- ✅ `GET /cash/transactions` - List transactions (with filters)
- ✅ `GET /cash/transactions/:id` - Get transaction by ID
- ✅ `GET /cash/transactions/reference/:refType/:refId` - Get by reference (UX Integration)
- ✅ `POST /cash/transactions` - Create manual transaction
- ✅ `POST /cash/transactions/:id/void` - Void transaction

#### Cash Categories
- ✅ `GET /cash/categories` - List categories (with type filter)
- ✅ `GET /cash/categories/:id` - Get category by ID
- ✅ `POST /cash/categories` - Create category
- ✅ `PATCH /cash/categories/:id` - Update category
- ✅ `DELETE /cash/categories/:id` - Delete category

---

## 🔗 UX Integration Endpoints

### Invoice Detail → Stock Movements
- ✅ `GET /invoices/:id/stock-movements` - Get movements for invoice

### Product Detail → Stock & Movements
- ✅ `GET /products/:id/stock` - Stock by branch
- ✅ `GET /products/:id/movements` - Stock movements history

### Stock Movements → Source Documents
- ✅ `GET /stock/movements/reference/:refType/:refId` - Get by reference
- ✅ `GET /cash/transactions/reference/:refType/:refId` - Get cash by reference

---

## 📊 Filter & Search Capabilities

### Products
- `?active=true` - Active only
- `?search=keyword` - Search by name, barcode, SKU
- `?category_id=1` - Filter by category
- `?limit=50` - Limit results

### Invoices
- `?branch_id=1` - Filter by branch
- `?status=completed` - Filter by status
- `?date_from=2025-01-01` - Date range start
- `?date_to=2025-01-31` - Date range end
- `?customer_name=John` - Search customer
- `?limit=50` - Limit results

### Stock Movements
- `?refType=invoice&refId=1` - Filter by reference
- `?productId=1&branchId=1` - Filter by product/branch
- `?limit=50` - Limit results

### Cash Transactions
- `?branch_id=1` - Filter by branch
- `?txn_type=IN` - Filter by type (IN/OUT)
- `?category_id=1` - Filter by category
- `?ref_type=POS&ref_id=1` - Filter by reference
- `?date_from=2025-01-01&date_to=2025-01-31` - Date range

---

## ✅ CRUD Completeness

| Module | Create | Read | Update | Delete | Activate/Deactivate | Search/Filter |
|--------|--------|------|--------|--------|---------------------|---------------|
| Products | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Categories | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Units | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Branches | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Stock | ✅ | ✅ | ✅ | - | - | ✅ |
| Invoices | ✅ | ✅ | ✅ | - | - | ✅ |
| Cash | ✅ | ✅ | ✅ | - | - | ✅ |
| Cash Categories | ✅ | ✅ | ✅ | ✅ | - | ✅ |

---

## 🎯 Integration Features

### Stock Integration
- ✅ Invoice payment → Stock deduction
- ✅ Invoice refund → Stock return
- ✅ Stock movements → Reference linking

### Cash Integration
- ✅ Invoice payment → Cash transaction (auto)
- ✅ Cash transactions → Reference linking

### UX Integration
- ✅ Invoice → Stock movements
- ✅ Product → Stock by branch
- ✅ Product → Stock movements
- ✅ Stock movements → Source documents
- ✅ Cash transactions → Source documents

---

## 📚 Swagger Documentation

All endpoints are documented in Swagger:
- ✅ API Tags
- ✅ Operation summaries
- ✅ Request/Response examples
- ✅ Error responses
- ✅ Authentication requirements

**Access:** `http://localhost:3001/api/docs`

---

## 🔐 Authentication

All endpoints (except `/auth/*` and `/health`) require:
- JWT Bearer Token
- Header: `Authorization: Bearer <token>`

---

**Status:** ✅ Complete  
**Total Endpoints:** 50+ endpoints  
**Swagger Documentation:** ✅ Complete

