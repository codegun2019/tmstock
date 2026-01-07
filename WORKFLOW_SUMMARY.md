# 🔄 Development Workflow Summary - tmstock NestJS Project

**วันที่สร้าง:** 2025-01-XX  
**Version:** 1.0  
**สถานะ:** 📋 Active Workflow

---

## 🎯 หลักการสำคัญ

**ทุกครั้งที่ทำ task งาน:**
1. ✅ Commit พร้อมรายละเอียดที่ชัดเจน
2. ✅ Push ขึ้น repository
3. ✅ ทดสอบ API endpoints อย่างละเอียด
4. ✅ บันทึกผลการทดสอบ

---

## 📋 Workflow Steps

### 1. Before Starting Work
```bash
# Pull latest changes
git pull origin main

# Create feature branch (optional)
git checkout -b feat/feature-name
```

### 2. During Development
- Write code following project standards
- Test locally
- Document changes

### 3. Testing (Before Commit)
```bash
# Run tests
npm run test

# Check code quality
npm run lint

# Build project
npm run build

# Test API endpoints (see API_TESTING_GUIDE.md)
# Use TESTING_CHECKLIST.md
```

### 4. Commit
```bash
# Stage changes
git add .

# Commit with detailed message (see COMMIT_GUIDELINES.md)
git commit -m "feat(scope): short description

Detailed description of changes

Changes:
- Change 1
- Change 2

Tested:
- ✅ Test case 1
- ✅ Test case 2"
```

### 5. Push
```bash
# Push to remote
git push origin main
# or
git push origin feat/feature-name
```

---

## 📝 Commit Message Template

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: เพิ่มฟีเจอร์ใหม่
- `fix`: แก้ไขบัค
- `docs`: แก้ไขเอกสาร
- `refactor`: refactor โค้ด
- `test`: เพิ่ม/แก้ไข tests

### Example
```
feat(invoices): add create invoice endpoint

- Add POST /api/invoices endpoint
- Add CreateInvoiceDto with validation
- Add InvoiceService.createInvoice() method
- Add stock deduction logic with row-level locking

Tested:
- ✅ Create invoice with valid data
- ✅ Validate required fields
- ✅ Check stock availability
- ✅ Deduct stock correctly
- ✅ Create stock movements
- ✅ Handle concurrent requests
```

---

## 🧪 Testing Requirements

### Must Test
- [ ] All API endpoints
- [ ] Success cases
- [ ] Error cases
- [ ] Edge cases
- [ ] Concurrency (if applicable)
- [ ] Security (authentication, authorization)

### Test Documentation
- Document test results
- Document any issues found
- Include in commit message

---

## 📚 Related Documents

- **COMMIT_GUIDELINES.md** - Detailed commit guidelines
- **API_TESTING_GUIDE.md** - API testing guide
- **TESTING_CHECKLIST.md** - Testing checklist

---

**Status:** 📋 Active Workflow

**Last Updated:** 2025-01-XX

**⭐ Remember: Test thoroughly, commit clearly, push regularly!**

