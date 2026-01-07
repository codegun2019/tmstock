# 🧪 API Testing Guide - tmstock NestJS Project

**วันที่สร้าง:** 2025-01-XX  
**Version:** 1.0  
**สถานะ:** 📋 Active Testing Guide

---

## 🎯 หลักการ

**ทุกครั้งที่สร้าง/แก้ไข API endpoint ต้อง:**
1. ✅ ทดสอบทุก endpoint อย่างละเอียด
2. ✅ ทดสอบทั้ง success cases และ error cases
3. ✅ ทดสอบ edge cases
4. ✅ บันทึกผลการทดสอบ
5. ✅ ทดสอบ concurrency (ถ้าจำเป็น)

---

## 🛠️ Testing Tools

### Recommended Tools
1. **Postman** ⭐ Recommended
   - GUI-based
   - Easy to use
   - Collection management
   - Environment variables
   - Test scripts

2. **Thunder Client** (VS Code Extension)
   - Built into VS Code
   - Lightweight
   - Good for quick tests

3. **curl** (Command Line)
   - Quick tests
   - Scriptable
   - Good for CI/CD

4. **Jest + Supertest** (Automated Tests)
   - Unit tests
   - Integration tests
   - E2E tests

---

## 📋 Testing Checklist

### Before Testing
- [ ] Server is running
- [ ] Database is connected
- [ ] Authentication token is ready (if needed)
- [ ] Test data is prepared
- [ ] Postman/Testing tool is ready

### During Testing
- [ ] Test all endpoints
- [ ] Test all HTTP methods (GET, POST, PUT, DELETE, PATCH)
- [ ] Test request validation
- [ ] Test response format
- [ ] Test error handling
- [ ] Test edge cases

### After Testing
- [ ] Document test results
- [ ] Document any issues found
- [ ] Fix issues (if any)
- [ ] Re-test after fixes

---

## 📊 Test Case Template

### Success Cases
```markdown
### Test Case: Create Invoice (Success)
**Endpoint:** POST /api/invoices
**Request:**
```json
{
  "branch_id": 1,
  "user_id": 1,
  "customer_name": "John Doe",
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "unit_price": 100.00
    }
  ],
  "payment_method": "cash"
}
```
**Expected Response:**
- Status: 201 Created
- Body: Invoice object with id, invoice_no, status
- Stock deducted correctly
- Stock movement created

**Actual Result:**
- ✅ Status: 201 Created
- ✅ Invoice created with id: 123
- ✅ Invoice number: BKK-20250115-0001
- ✅ Stock deducted: Product 1, quantity -2
- ✅ Stock movement created: reference_type='invoice', reference_id=123

**Tested By:** [Your Name]
**Date:** 2025-01-15
**Time:** 14:30
```

### Error Cases
```markdown
### Test Case: Create Invoice (Insufficient Stock)
**Endpoint:** POST /api/invoices
**Request:**
```json
{
  "branch_id": 1,
  "user_id": 1,
  "items": [
    {
      "product_id": 1,
      "quantity": 1000,  // More than available stock
      "unit_price": 100.00
    }
  ]
}
```
**Expected Response:**
- Status: 400 Bad Request
- Error message: "Insufficient stock for product ID 1"

**Actual Result:**
- ✅ Status: 400 Bad Request
- ✅ Error: "Insufficient stock for product ID 1. Available: 50, Requested: 1000"
- ✅ Stock not deducted
- ✅ No invoice created

**Tested By:** [Your Name]
**Date:** 2025-01-15
**Time:** 14:35
```

### Validation Cases
```markdown
### Test Case: Create Invoice (Missing Required Fields)
**Endpoint:** POST /api/invoices
**Request:**
```json
{
  "items": []  // Missing branch_id, user_id
}
```
**Expected Response:**
- Status: 400 Bad Request
- Validation errors for missing fields

**Actual Result:**
- ✅ Status: 400 Bad Request
- ✅ Errors: 
  - "branch_id should not be empty"
  - "user_id should not be empty"
  - "items should not be empty"

**Tested By:** [Your Name]
**Date:** 2025-01-15
**Time:** 14:40
```

---

## 🔍 Testing Scenarios

### 1. CRUD Operations

#### Create (POST)
- [ ] Valid data → 201 Created
- [ ] Invalid data → 400 Bad Request
- [ ] Missing required fields → 400 Bad Request
- [ ] Duplicate data → 409 Conflict (if applicable)
- [ ] Unauthorized → 401 Unauthorized
- [ ] Forbidden → 403 Forbidden

#### Read (GET)
- [ ] Get all → 200 OK with array
- [ ] Get by ID (exists) → 200 OK with object
- [ ] Get by ID (not exists) → 404 Not Found
- [ ] Get with filters → 200 OK with filtered results
- [ ] Get with pagination → 200 OK with paginated results
- [ ] Unauthorized → 401 Unauthorized

#### Update (PUT/PATCH)
- [ ] Valid data → 200 OK
- [ ] Invalid data → 400 Bad Request
- [ ] Not found → 404 Not Found
- [ ] Unauthorized → 401 Unauthorized
- [ ] Forbidden → 403 Forbidden

#### Delete (DELETE)
- [ ] Valid ID → 200 OK or 204 No Content
- [ ] Not found → 404 Not Found
- [ ] Unauthorized → 401 Unauthorized
- [ ] Forbidden → 403 Forbidden
- [ ] Cascade delete (if applicable)

---

### 2. Business Logic Tests

#### Stock Operations
- [ ] Deduct stock on sale
- [ ] Prevent negative stock
- [ ] Handle concurrent sales
- [ ] Create stock movements
- [ ] Update stock balance

#### Invoice Operations
- [ ] Create invoice
- [ ] Calculate totals correctly
- [ ] Apply discounts
- [ ] Handle taxes
- [ ] Void invoice
- [ ] Refund invoice

#### Payment Operations
- [ ] Process payment
- [ ] Calculate change
- [ ] Handle multiple payment methods
- [ ] Update invoice status

---

### 3. Edge Cases

#### Data Types
- [ ] String with special characters
- [ ] Very long strings
- [ ] Negative numbers (where not allowed)
- [ ] Zero values
- [ ] Null values
- [ ] Empty arrays
- [ ] Large numbers

#### Concurrency
- [ ] Simultaneous requests
- [ ] Race conditions
- [ ] Lock timeouts
- [ ] Transaction conflicts

#### Performance
- [ ] Large payloads
- [ ] Many items in array
- [ ] Deep nesting
- [ ] Response time

---

## 📝 Postman Collection Structure

### Recommended Structure
```
tmstock API Tests
├── Authentication
│   ├── Login (Success)
│   ├── Login (Invalid Credentials)
│   └── Refresh Token
├── Products
│   ├── Get All Products
│   ├── Get Product by ID
│   ├── Create Product
│   ├── Update Product
│   └── Delete Product
├── Invoices
│   ├── Create Invoice (Success)
│   ├── Create Invoice (Insufficient Stock)
│   ├── Get Invoice by ID
│   ├── Void Invoice
│   └── Refund Invoice
├── Stock
│   ├── Get Stock Balance
│   ├── Get Stock Movements
│   └── Stock Adjustment
└── Health Check
    └── Health Check
```

---

## 🧪 Example Test Scripts (Postman)

### Pre-request Script (Set Token)
```javascript
// Get token from environment
const token = pm.environment.get("auth_token");
if (token) {
    pm.request.headers.add({
        key: "Authorization",
        value: `Bearer ${token}`
    });
}
```

### Test Script (Validate Response)
```javascript
// Test response status
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

// Test response body
pm.test("Response has invoice_id", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('id');
    pm.expect(jsonData.id).to.be.a('number');
});

// Test response time
pm.test("Response time is less than 500ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(500);
});
```

---

## 📊 Test Results Documentation

### Format
```markdown
## API Testing Results - [Date]

### Endpoint: POST /api/invoices
**Status:** ✅ PASSED
**Test Cases:**
1. ✅ Create invoice with valid data
2. ✅ Validate required fields
3. ✅ Check stock availability
4. ✅ Handle insufficient stock
5. ✅ Deduct stock correctly
6. ✅ Create stock movements
7. ✅ Handle concurrent requests

**Issues Found:**
- None

**Notes:**
- All test cases passed
- Response time: ~200ms
- Stock deduction works correctly
```

---

## 🚨 Critical Tests (Must Test)

### Stock Operations
- [ ] **Concurrent Sales** - 2 users sell same product simultaneously
- [ ] **Negative Stock Prevention** - Stock never goes negative
- [ ] **Stock Movement Creation** - Every stock change creates movement
- [ ] **Transaction Safety** - All-or-nothing operations

### Invoice Operations
- [ ] **Payment Status** - Stock only deducted when PAID
- [ ] **Refund** - Stock returned on refund
- [ ] **Void** - Stock returned on void (if unpaid)
- [ ] **Idempotency** - Duplicate payment doesn't deduct stock twice

### Security
- [ ] **Authentication** - All protected endpoints require auth
- [ ] **Authorization** - Users can only access their branch data
- [ ] **Input Validation** - All inputs validated
- [ ] **SQL Injection** - No SQL injection possible

---

## 🔗 Related Documents

- `COMMIT_GUIDELINES.md` - Commit Guidelines
- `TESTING_CHECKLIST.md` - Testing Checklist

---

**Status:** 📋 Active Testing Guide

**Last Updated:** 2025-01-XX

**⭐ Remember: Test thoroughly before committing!**

