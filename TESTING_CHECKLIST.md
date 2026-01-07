# ✅ Testing Checklist - tmstock NestJS Project

**วันที่สร้าง:** 2025-01-XX  
**Version:** 1.0  
**สถานะ:** 📋 Active Checklist

---

## 🎯 หลักการ

**ใช้ checklist นี้ทุกครั้งก่อน commit:**

---

## 📋 Pre-Commit Testing Checklist

### 1. Code Quality ✅
- [ ] Code compiles without errors
- [ ] No TypeScript errors (`npm run build`)
- [ ] No linter errors (`npm run lint`)
- [ ] Code follows project standards
- [ ] Proper error handling implemented
- [ ] Proper logging implemented
- [ ] Code comments added (where needed)

### 2. API Endpoints Testing ✅

#### Authentication
- [ ] Login endpoint works
- [ ] Logout endpoint works
- [ ] Token refresh works
- [ ] Invalid credentials rejected
- [ ] Expired token rejected

#### CRUD Operations
- [ ] **Create (POST)**
  - [ ] Valid data → 201 Created
  - [ ] Invalid data → 400 Bad Request
  - [ ] Missing fields → 400 Bad Request
  - [ ] Unauthorized → 401 Unauthorized
  
- [ ] **Read (GET)**
  - [ ] Get all → 200 OK
  - [ ] Get by ID (exists) → 200 OK
  - [ ] Get by ID (not exists) → 404 Not Found
  - [ ] Filters work correctly
  - [ ] Pagination works correctly
  
- [ ] **Update (PUT/PATCH)**
  - [ ] Valid data → 200 OK
  - [ ] Invalid data → 400 Bad Request
  - [ ] Not found → 404 Not Found
  
- [ ] **Delete (DELETE)**
  - [ ] Valid ID → 200/204 OK
  - [ ] Not found → 404 Not Found

### 3. Business Logic Testing ✅

#### Stock Operations
- [ ] Stock deduction works
- [ ] Stock never goes negative
- [ ] Concurrent sales handled correctly
- [ ] Stock movements created
- [ ] Stock balance updated correctly
- [ ] Row-level locking works

#### Invoice Operations
- [ ] Invoice creation works
- [ ] Totals calculated correctly
- [ ] Discounts applied correctly
- [ ] Taxes calculated correctly
- [ ] Payment processing works
- [ ] Change calculation correct
- [ ] Invoice void works
- [ ] Invoice refund works
- [ ] Stock returned on refund

#### Payment Operations
- [ ] Payment only deducts stock when PAID
- [ ] Duplicate payment prevented (idempotent)
- [ ] Multiple payment methods work
- [ ] Payment status updated correctly

### 4. Validation Testing ✅
- [ ] Required fields validated
- [ ] Data types validated
- [ ] String length validated
- [ ] Number ranges validated
- [ ] Email format validated (if applicable)
- [ ] Date format validated (if applicable)
- [ ] Enum values validated
- [ ] Custom validators work

### 5. Error Handling ✅
- [ ] 400 Bad Request - Invalid input
- [ ] 401 Unauthorized - No auth token
- [ ] 403 Forbidden - No permission
- [ ] 404 Not Found - Resource not found
- [ ] 409 Conflict - Duplicate data
- [ ] 500 Internal Server Error - Server errors
- [ ] Error messages are clear and helpful
- [ ] Error responses follow standard format

### 6. Security Testing ✅
- [ ] Authentication required for protected endpoints
- [ ] Authorization checks work
- [ ] Branch scope enforced
- [ ] Input sanitization works
- [ ] SQL injection prevented
- [ ] XSS prevented
- [ ] CSRF protection (if applicable)

### 7. Concurrency Testing ✅
- [ ] Concurrent requests handled correctly
- [ ] Race conditions prevented
- [ ] Database locks work
- [ ] Transaction conflicts handled
- [ ] No data corruption

### 8. Performance Testing ✅
- [ ] Response time acceptable (< 500ms for simple operations)
- [ ] No memory leaks
- [ ] Database queries optimized
- [ ] No N+1 query problems
- [ ] Pagination works for large datasets

### 9. Edge Cases ✅
- [ ] Empty arrays handled
- [ ] Null values handled
- [ ] Very long strings handled
- [ ] Large numbers handled
- [ ] Negative numbers (where not allowed) rejected
- [ ] Zero values handled correctly
- [ ] Special characters handled

### 10. Integration Testing ✅
- [ ] Database operations work
- [ ] Transactions work correctly
- [ ] Foreign key constraints work
- [ ] Cascade deletes work (if applicable)
- [ ] Relationships work correctly

---

## 📊 Test Results Template

```markdown
## Testing Results - [Feature Name] - [Date]

### Endpoint: [HTTP Method] [Endpoint Path]

**Status:** ✅ PASSED / ❌ FAILED

**Test Cases:**
1. ✅/❌ [Test case 1]
2. ✅/❌ [Test case 2]
3. ✅/❌ [Test case 3]

**Issues Found:**
- [Issue 1] (if any)
- [Issue 2] (if any)

**Performance:**
- Average response time: [X]ms
- Max response time: [X]ms

**Notes:**
[Any additional notes]

**Tested By:** [Your Name]
**Date:** [Date]
**Time:** [Time]
```

---

## 🚨 Critical Tests (Must Pass)

### Stock Operations
- [ ] **Concurrent Sales Test**
  - Test: 2 users sell same product simultaneously
  - Expected: Stock never goes negative, both sales succeed or one fails gracefully
  
- [ ] **Negative Stock Prevention**
  - Test: Try to sell more than available stock
  - Expected: 400 Bad Request, stock not deducted

- [ ] **Stock Movement Creation**
  - Test: Every stock change creates movement record
  - Expected: Movement created with correct reference_type and reference_id

### Invoice Operations
- [ ] **Payment Status Check**
  - Test: Stock only deducted when invoice status = PAID
  - Expected: Stock not deducted for DRAFT invoices

- [ ] **Refund Test**
  - Test: Refund invoice
  - Expected: Stock returned, movement created with type='IN'

- [ ] **Idempotency Test**
  - Test: Pay same invoice twice
  - Expected: Second payment doesn't deduct stock again

---

## 📝 Quick Test Commands

### Start Server
```bash
npm run start:dev
```

### Run Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Check Code Quality
```bash
# Lint
npm run lint

# Build
npm run build

# Format
npm run format
```

---

## 🔗 Related Documents

- `COMMIT_GUIDELINES.md` - Commit Guidelines
- `API_TESTING_GUIDE.md` - API Testing Guide

---

**Status:** 📋 Active Checklist

**Last Updated:** 2025-01-XX

**⭐ Use this checklist before every commit!**

