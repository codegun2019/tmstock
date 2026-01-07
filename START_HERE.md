# 🚀 เริ่มต้นใช้งาน tmstock Backend

## 📍 โฟเดอร์ที่ต้องรัน

**โฟเดอร์หลัก:** `tmstock/backend`

```
tmstock/
├── backend/          ← ⭐ รันจากโฟเดอร์นี้
│   ├── src/
│   ├── package.json
│   ├── .env
│   └── ...
└── docs/
```

---

## 🎯 ขั้นตอนการรัน

### 1. เปิด Terminal/PowerShell

### 2. ไปที่โฟเดอร์ backend
```bash
cd C:\MAMP\htdocs\tmstock\backend
```

### 3. ตรวจสอบ .env file
```bash
# ตรวจสอบว่ามี .env file หรือไม่
dir .env

# ถ้าไม่มี ให้ copy จาก .env.example
copy .env.example .env

# แก้ไข .env ให้ตรงกับ database ของคุณ
```

### 4. ติดตั้ง Dependencies (ถ้ายังไม่ได้ติดตั้ง)
```bash
npm install
```

### 5. รัน Database Seeders (ครั้งแรกเท่านั้น)
```bash
npm run seed
```

### 6. เริ่ม Server
```bash
npm run start:dev
```

---

## ✅ ตรวจสอบว่า Server รันแล้ว

เมื่อรัน `npm run start:dev` สำเร็จ จะเห็น:

```
🚀 Application is running on: http://localhost:3000
📚 Swagger docs available at: http://localhost:3000/api/docs
```

---

## 🌐 Endpoints ที่ใช้ได้

### 1. Health Check
```
http://localhost:3000/health
```

### 2. Swagger Documentation
```
http://localhost:3000/api/docs
```

### 3. API Endpoints
```
POST   http://localhost:3000/auth/login
GET    http://localhost:3000/products
POST   http://localhost:3000/invoices
GET    http://localhost:3000/stock/balance
...
```

---

## 📋 คำสั่งที่ใช้บ่อย

```bash
# เริ่ม development server
npm run start:dev

# Build สำหรับ production
npm run build

# เริ่ม production server
npm run start:prod

# รัน database seeders
npm run seed

# ตรวจสอบ linting
npm run lint
```

---

## 🐛 Troubleshooting

### ปัญหา: Port 3000 ถูกใช้งานแล้ว
```bash
# ตรวจสอบ process ที่ใช้ port 3000
netstat -ano | findstr :3000

# หรือเปลี่ยน port ใน .env
PORT=3001
```

### ปัญหา: Database connection failed
- ตรวจสอบ `.env` file
- ตรวจสอบว่า MySQL/MAMP กำลังรันอยู่
- ตรวจสอบ database credentials

### ปัญหา: Module not found
```bash
# ติดตั้ง dependencies ใหม่
npm install
```

---

## 📚 เอกสารเพิ่มเติม

- `backend/FULL_SYSTEM_TEST.md` - คู่มือทดสอบแบบละเอียด
- `backend/QUICK_TEST.md` - คู่มือทดสอบแบบเร็ว
- `backend/DEPLOYMENT_GUIDE.md` - คู่มือ deploy production
- `backend/API_TESTING.md` - คู่มือทดสอบ API

---

**Status:** Ready to Run  
**Last Updated:** 2025-01-07
