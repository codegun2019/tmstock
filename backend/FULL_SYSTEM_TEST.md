# 🧪 Full System Integration Test Guide

**วันที่สร้าง:** 2025-01-07  
**Version:** 1.0  
**Status:** Complete Testing Guide

---

## 🎯 Overview

คู่มือทดสอบระบบเต็มรูปแบบ ครอบคลุมการทำงานร่วมกันของทุก modules

**Test Flow:**
1. Authentication & Authorization
2. Product Management
3. Stock Management
4. Invoice Creation & Payment
5. Cash Ledger Integration
6. UX Integration Endpoints

---

## 📋 Prerequisites

### 1. Database Setup
```bash
# Ensure database is running
# Run seeders
npm run seed
```

### 2. Start Server
```bash
npm run start:dev
```

### 3. Test Tools
- Postman / Thunder Client
- curl
- Browser (for manual testing)

---

## 🔐 Phase 1: Authentication

### 1.1 Register User (Optional)
```http
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "full_name": "Test User"
}
```

### 1.2 Login
```http
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "full_name": "Admin User"
  }
}
```

**Save the `access_token` for subsequent requests**

---

## 📦 Phase 2: Product Management

### 2.1 Create Category
```http
POST http://localhost:3000/categories
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Electronics",
  "description": "Electronic products"
}
```

### 2.2 Create Unit
```http
POST http://localhost:3000/units
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "ชิ้น",
  "code": "PCS"
}
```

### 2.3 Create Product
```http
POST http://localhost:3000/products
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Test Product",
  "barcode": "1234567890123",
  "category_id": 1,
  "unit_id": 1,
  "price": 100.00,
  "cost": 50.00,
  "active": 1
}
```

**Expected Response:**
```json
{
  "id": 1,
  "name": "Test Product",
  "barcode": "1234567890123",
  "price": 100.00,
  "cost": 50.00
}
```

**Save `product_id` for next steps**

---

## 📊 Phase 3: Stock Management

### 3.1 Add Initial Stock
```http
POST http://localhost:3000/stock/add
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "product_id": 1,
  "branch_id": 1,
  "quantity": 100,
  "reference_type": "GRN",
  "reference_id": 1,
  "reason": "Initial stock"
}
```

**Expected Response:**
```json
{
  "id": 1,
  "product_id": 1,
  "branch_id": 1,
  "move_type": "grn",
  "quantity": 100,
  "balance_before": 0,
  "balance_after": 100
}
```

### 3.2 Check Stock Balance
```http
GET http://localhost:3000/stock/balance?product_id=1&branch_id=1
Authorization: Bearer {access_token}
```

**Expected Response:**
```json
{
  "product_id": 1,
  "branch_id": 1,
  "quantity": 100,
  "reserved_quantity": 0,
  "available_quantity": 100
}
```

---

## 🧾 Phase 4: Invoice Management

### 4.1 Create Invoice (Draft)
```http
POST http://localhost:3000/invoices
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "branch_id": 1,
  "customer_name": "Test Customer",
  "customer_phone": "0812345678",
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "unit_price": 100.00
    }
  ],
  "discount_percent": 0,
  "payment_method": "cash"
}
```

**Expected Response:**
```json
{
  "id": 1,
  "invoice_no": "BKK-20250107-0001",
  "status": "draft",
  "total_amount": 200.00,
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "unit_price": 100.00,
      "subtotal": 200.00
    }
  ]
}
```

**Save `invoice_id` for next steps**

**✅ Verify:**
- Invoice created with status `draft`
- Stock NOT deducted yet (status is draft)
- Invoice number generated correctly

### 4.2 Pay Invoice (CRITICAL TEST)
```http
POST http://localhost:3000/invoices/1/pay
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "paid_amount": 200.00,
  "payment_method": "cash"
}
```

**Expected Response:**
```json
{
  "id": 1,
  "invoice_no": "BKK-20250107-0001",
  "status": "completed",
  "total_amount": 200.00,
  "paid_amount": 200.00,
  "change_amount": 0.00
}
```

**✅ Verify:**
- Invoice status changed to `completed`
- Stock deducted (check stock balance)
- Stock movement created (OUT)
- Cash transaction created (IN)

### 4.3 Verify Stock Deduction
```http
GET http://localhost:3000/stock/balance?product_id=1&branch_id=1
Authorization: Bearer {access_token}
```

**Expected:**
- `quantity` should be 98 (100 - 2)
- `available_quantity` should be 98

### 4.4 Verify Stock Movement
```http
GET http://localhost:3000/stock/movements?refType=invoice&refId=1
Authorization: Bearer {access_token}
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "product_id": 1,
    "move_type": "sale",
    "quantity": -2,
    "balance_before": 100,
    "balance_after": 98,
    "reference_type": "invoice",
    "reference_id": 1,
    "reason": "Sale - Invoice #1"
  }
]
```

### 4.5 Verify Cash Transaction
```http
GET http://localhost:3000/cash/transactions/reference/POS/1
Authorization: Bearer {access_token}
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "txn_type": "IN",
    "amount": 200.00,
    "reference_type": "POS",
    "reference_id": 1,
    "status": "confirmed",
    "description": "ขายหน้าร้าน - Invoice #1"
  }
]
```

---

## 🔗 Phase 5: UX Integration Endpoints

### 5.1 Invoice Detail with Stock Movements
```http
GET http://localhost:3000/invoices/1/stock-movements
Authorization: Bearer {access_token}
```

**Expected Response:**
```json
{
  "invoice": {
    "id": 1,
    "invoice_no": "BKK-20250107-0001",
    "status": "completed",
    "total_amount": 200.00
  },
  "movements": [
    {
      "id": 1,
      "product_id": 1,
      "product_name": "Test Product",
      "move_type": "sale",
      "quantity": -2,
      "balance_before": 100,
      "balance_after": 98
    }
  ]
}
```

### 5.2 Product Stock by Branch
```http
GET http://localhost:3000/products/1/stock
Authorization: Bearer {access_token}
```

**Expected Response:**
```json
{
  "product": {
    "id": 1,
    "name": "Test Product",
    "barcode": "1234567890123"
  },
  "stock_by_branch": [
    {
      "branch_id": 1,
      "branch_name": "BKK",
      "quantity": 98,
      "available_quantity": 98
    }
  ]
}
```

### 5.3 Product Stock Movements
```http
GET http://localhost:3000/products/1/movements?branch_id=1&limit=10
Authorization: Bearer {access_token}
```

**Expected Response:**
```json
{
  "product": {
    "id": 1,
    "name": "Test Product"
  },
  "movements": [
    {
      "id": 1,
      "move_type": "sale",
      "quantity": -2,
      "reference_type": "invoice",
      "reference_id": 1
    },
    {
      "id": 2,
      "move_type": "grn",
      "quantity": 100,
      "reference_type": "GRN",
      "reference_id": 1
    }
  ]
}
```

---

## 💰 Phase 6: Cash Ledger

### 6.1 Manual Cash Transaction (OUT)
```http
POST http://localhost:3000/cash/transactions
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "txn_date": "2025-01-07",
  "txn_type": "OUT",
  "amount": 50.00,
  "category_id": 5,
  "description": "ค่าไฟ",
  "branch_id": 1,
  "payment_method": "transfer"
}
```

**Expected Response:**
```json
{
  "id": 2,
  "txn_type": "OUT",
  "amount": 50.00,
  "status": "confirmed",
  "reference_type": null,
  "reference_id": null
}
```

### 6.2 List Cash Transactions
```http
GET http://localhost:3000/cash/transactions?branch_id=1&txn_type=IN
Authorization: Bearer {access_token}
```

**Expected:** List of IN transactions including the one from invoice payment

### 6.3 Void Cash Transaction
```http
POST http://localhost:3000/cash/transactions/2/void
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "reason": "Wrong amount"
}
```

**Expected:** Transaction status changed to `void`

---

## 🧪 Phase 7: Edge Cases & Error Handling

### 7.1 Insufficient Stock Test
```http
# Try to pay invoice with quantity > available stock
POST http://localhost:3000/invoices
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "branch_id": 1,
  "items": [
    {
      "product_id": 1,
      "quantity": 1000,  # More than available
      "unit_price": 100.00
    }
  ]
}
```

**Then try to pay:**
```http
POST http://localhost:3000/invoices/{invoice_id}/pay
```

**Expected:** Error 400 - "Insufficient stock"

### 7.2 Duplicate Payment Test (Idempotency)
```http
# Pay the same invoice twice
POST http://localhost:3000/invoices/1/pay
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "paid_amount": 200.00
}
```

**Expected:** Returns invoice without creating duplicate stock movements or cash transactions

### 7.3 Void Invoice Test
```http
POST http://localhost:3000/invoices/1/void
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "reason": "Customer cancelled"
}
```

**Expected:** Invoice status changed to `voided` (stock NOT returned)

### 7.4 Refund Invoice Test
```http
POST http://localhost:3000/invoices/1/refund
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "reason": "Product defect"
}
```

**Expected:**
- Invoice status changed to `refunded`
- Stock returned (IN movement)
- Cash transaction created (OUT) or linked

---

## ✅ Test Checklist

### Core Functionality
- [ ] User authentication works
- [ ] Product creation works
- [ ] Stock addition works
- [ ] Invoice creation (draft) works
- [ ] Invoice payment deducts stock
- [ ] Stock movement created on payment
- [ ] Cash transaction created on payment
- [ ] Invoice number generation works

### Integration
- [ ] Invoice → Stock Movement linking works
- [ ] Invoice → Cash Transaction linking works
- [ ] Product → Stock by Branch works
- [ ] Product → Stock Movements works
- [ ] Stock Movement → Source Document linking works

### Error Handling
- [ ] Insufficient stock error handled
- [ ] Duplicate payment prevented (idempotency)
- [ ] Invalid invoice status handled
- [ ] Invalid product/category handled

### Data Integrity
- [ ] Stock balance correct after payment
- [ ] Stock movements balance correct
- [ ] Cash transactions balance correct
- [ ] Reference linking correct

---

## 🐛 Common Issues & Solutions

### Issue: Stock not deducted
**Solution:** Check invoice status - must be `completed`, not `draft`

### Issue: Cash transaction not created
**Solution:** Check if `createFromInvoice()` is called in `payInvoice()` transaction

### Issue: Duplicate stock movements
**Solution:** Verify idempotency check in `payInvoice()`

### Issue: Reference linking not working
**Solution:** Check `ref_type` and `ref_id` values in database

---

## 📊 Test Results Template

```
Test Date: ___________
Tester: ___________

Phase 1: Authentication
- [ ] Login: PASS / FAIL
- [ ] Token validation: PASS / FAIL

Phase 2: Product Management
- [ ] Create product: PASS / FAIL
- [ ] List products: PASS / FAIL

Phase 3: Stock Management
- [ ] Add stock: PASS / FAIL
- [ ] Check balance: PASS / FAIL

Phase 4: Invoice Management
- [ ] Create invoice: PASS / FAIL
- [ ] Pay invoice: PASS / FAIL
- [ ] Stock deducted: PASS / FAIL
- [ ] Cash transaction created: PASS / FAIL

Phase 5: UX Integration
- [ ] Invoice stock movements: PASS / FAIL
- [ ] Product stock by branch: PASS / FAIL
- [ ] Product movements: PASS / FAIL

Phase 6: Cash Ledger
- [ ] Manual entry: PASS / FAIL
- [ ] List transactions: PASS / FAIL
- [ ] Void transaction: PASS / FAIL

Overall Status: ✅ PASS / ❌ FAIL
```

---

## 🎯 Next Steps

After successful testing:
1. Document any issues found
2. Fix bugs
3. Re-test
4. Deploy to staging
5. User acceptance testing

---

**Status:** Ready for Testing  
**Last Updated:** 2025-01-07

