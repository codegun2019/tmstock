# 🧪 API Test Results

**วันที่ทดสอบ:** 2025-01-07  
**Tester:** System  
**Status:** ⚠️ Manual Testing Required

---

## 📋 Test Summary

เนื่องจาก server ต้องรันใน background และต้องการ database connection จริง ฉันได้สร้าง:

1. ✅ **Swagger Documentation** - พร้อมใช้งานที่ `/api/docs`
2. ✅ **Postman Collection** - `postman-collection.json`
3. ✅ **Full System Test Guide** - `FULL_SYSTEM_TEST.md`
4. ✅ **Quick Test Guide** - `QUICK_TEST.md`
5. ✅ **Deployment Guide** - `DEPLOYMENT_GUIDE.md`

---

## 🚀 วิธีทดสอบ

### Option 1: ใช้ Swagger UI (แนะนำ)

1. เริ่ม server:
   ```bash
   cd backend
   npm run start:dev
   ```

2. เปิด browser ไปที่:
   ```
   http://localhost:3000/api/docs
   ```

3. ทดสอบ endpoints:
   - คลิก "Authorize" → ใส่ token (ได้จาก login)
   - ทดสอบ endpoints ต่างๆ ผ่าน Swagger UI

### Option 2: ใช้ Postman

1. Import `postman-collection.json` เข้า Postman
2. สร้าง Environment:
   - `base_url`: `http://localhost:3000`
3. Run requests ตามลำดับ

### Option 3: ใช้ PowerShell Script

```powershell
cd backend
.\test-api.ps1
```

---

## ✅ Expected Results

### Health Check
- **Endpoint:** `GET /health`
- **Expected:** `{"status":"ok","timestamp":"...","uptime":...}`

### Login
- **Endpoint:** `POST /auth/login`
- **Expected:** `{"access_token":"...","user":{...}}`

### Get Products
- **Endpoint:** `GET /products`
- **Expected:** Array of products
- **Auth:** Required (Bearer token)

### Create Invoice
- **Endpoint:** `POST /invoices`
- **Expected:** Invoice object with status "draft"
- **Auth:** Required

### Pay Invoice
- **Endpoint:** `POST /invoices/:id/pay`
- **Expected:** Invoice with status "completed"
- **Side Effects:**
  - ✅ Stock deducted
  - ✅ Stock movement created
  - ✅ Cash transaction created

---

## 📊 Test Coverage

| Module | Endpoints | Status |
|--------|-----------|--------|
| Auth | Login, Register | ✅ Ready |
| Products | CRUD, Stock, Movements | ✅ Ready |
| Stock | Balance, Add, Deduct, Movements | ✅ Ready |
| Invoices | Create, Pay, Void, Refund | ✅ Ready |
| Cash | Create, List, Void | ✅ Ready |
| UX Integration | Invoice movements, Product stock | ✅ Ready |

---

## 🎯 Next Steps

1. **Start Server:**
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Run Seeders (if not done):**
   ```bash
   npm run seed
   ```

3. **Test via Swagger:**
   - เปิด `http://localhost:3000/api/docs`
   - ทดสอบ endpoints ตาม `FULL_SYSTEM_TEST.md`

4. **Verify Integration:**
   - Create Invoice → Pay → Check Stock → Check Cash Transaction

---

**Status:** ⚠️ Manual Testing Required  
**Note:** Server ต้องรันและ database ต้องพร้อมใช้งาน

