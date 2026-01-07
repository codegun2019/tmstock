# 📝 Commit Guidelines - tmstock NestJS Project

**วันที่สร้าง:** 2025-01-XX  
**Version:** 1.0  
**สถานะ:** 📋 Active Guidelines

---

## 🎯 หลักการ

**ทุกครั้งที่ทำ task งาน ต้อง:**
1. ✅ Commit พร้อมรายละเอียดที่ชัดเจน
2. ✅ Push ขึ้น repository
3. ✅ ทดสอบ API endpoints อย่างละเอียด
4. ✅ บันทึกผลการทดสอบ

---

## 📋 Commit Message Format

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: เพิ่มฟีเจอร์ใหม่
- `fix`: แก้ไขบัค
- `docs`: แก้ไขเอกสาร
- `style`: แก้ไข formatting (ไม่กระทบโค้ด)
- `refactor`: refactor โค้ด
- `test`: เพิ่ม/แก้ไข tests
- `chore`: งานอื่นๆ (dependencies, config)

### Scope (Optional)
- `auth`: Authentication module
- `products`: Products module
- `invoices`: Invoices/Sales module
- `stock`: Stock/Inventory module
- `hr`: HR module
- `cash`: Cash Ledger module
- `api`: API endpoints
- `dto`: DTOs
- `entity`: Entities
- `service`: Services
- `controller`: Controllers
- `guard`: Guards
- `config`: Configuration

### Examples

#### Good Commit Messages
```
feat(invoices): add create invoice endpoint

- Add POST /api/invoices endpoint
- Add CreateInvoiceDto with validation
- Add InvoiceService.createInvoice() method
- Add stock deduction logic with row-level locking
- Add transaction safety for stock operations

Tested:
- ✅ Create invoice with valid data
- ✅ Validate required fields
- ✅ Check stock availability
- ✅ Deduct stock correctly
- ✅ Create stock movements
- ✅ Handle concurrent requests

Closes #123
```

```
fix(stock): prevent negative stock on concurrent sales

- Add row-level locking in InventoryService.deductStock()
- Add hard check before stock deduction
- Add transaction wrapper for stock operations

Tested:
- ✅ Concurrent sales of same product
- ✅ Stock never goes negative
- ✅ Proper error handling for insufficient stock

Fixes #456
```

```
docs(api): add API testing guide

- Add API_TESTING_GUIDE.md
- Add example test cases
- Add Postman collection structure

No code changes
```

#### Bad Commit Messages
```
❌ fix bug
❌ update
❌ changes
❌ wip
❌ test
```

---

## 🔄 Workflow

### 1. Before Starting Work
```bash
# Pull latest changes
git pull origin main

# Create feature branch (optional)
git checkout -b feat/invoice-create-endpoint
```

### 2. During Development
```bash
# Make changes
# Test locally
# ...

# Stage changes
git add .

# Commit with detailed message
git commit -m "feat(invoices): add create invoice endpoint

- Add POST /api/invoices endpoint
- Add CreateInvoiceDto with validation
- Add InvoiceService.createInvoice() method
- Add stock deduction logic with row-level locking
- Add transaction safety for stock operations

Tested:
- ✅ Create invoice with valid data
- ✅ Validate required fields
- ✅ Check stock availability
- ✅ Deduct stock correctly
- ✅ Create stock movements
- ✅ Handle concurrent requests"
```

### 3. After Testing
```bash
# Push to remote
git push origin main
# or
git push origin feat/invoice-create-endpoint
```

---

## ✅ Pre-Commit Checklist

### Code Quality
- [ ] Code compiles without errors
- [ ] No TypeScript errors
- [ ] No linter errors
- [ ] Follows project coding standards
- [ ] Proper error handling
- [ ] Proper logging

### Testing
- [ ] Unit tests pass (if applicable)
- [ ] API endpoints tested manually
- [ ] Test cases documented
- [ ] Edge cases handled
- [ ] Error cases handled

### Documentation
- [ ] Code comments added (if needed)
- [ ] API documentation updated (if applicable)
- [ ] README updated (if applicable)

### Database
- [ ] Database migrations tested (if applicable)
- [ ] No breaking changes to existing data
- [ ] Rollback plan ready (if needed)

---

## 📊 Commit Frequency

### Small Changes
- Commit immediately after completing a small task
- Example: Add a single endpoint, fix a bug

### Large Features
- Commit in logical chunks
- Example: 
  1. Commit: Add DTO
  2. Commit: Add Service method
  3. Commit: Add Controller endpoint
  4. Commit: Add tests

---

## 🚨 Important Rules

1. **Never commit without testing**
2. **Never commit broken code**
3. **Always write descriptive commit messages**
4. **Always test API endpoints before committing**
5. **Always document test results**

---

## 📝 Commit Message Template

```bash
# Copy this template for your commits

git commit -m "feat(<scope>): <short description>

<detailed description of changes>

Changes:
- <change 1>
- <change 2>
- <change 3>

Tested:
- ✅ <test case 1>
- ✅ <test case 2>
- ✅ <test case 3>

Related: #<issue_number>"
```

---

## 🔗 Related Documents

- `API_TESTING_GUIDE.md` - API Testing Guidelines
- `TESTING_CHECKLIST.md` - Testing Checklist

---

**Status:** 📋 Active Guidelines

**Last Updated:** 2025-01-XX

**⭐ Remember: Every commit should be tested and documented!**

