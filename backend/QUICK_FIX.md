# ⚡ Quick Fix - Server Not Starting

## 🔍 สาเหตุที่เป็นไปได้

1. **Database Connection Error** - MySQL password ไม่ถูกต้อง
2. **Port 3000 ถูกใช้งาน** - มี process อื่นใช้ port 3000
3. **Missing Dependencies** - node_modules ไม่ครบ
4. **TypeScript Build Error** - มี error ในการ compile

---

## ✅ วิธีแก้ไข (Step by Step)

### Step 1: ตรวจสอบ Database Connection

```bash
cd C:\MAMP\htdocs\tmstock\backend
node test-db-connection.js
```

**ถ้าเห็น:**
```
✅ Database connection successful!
```
**หมายความว่า:** Database OK

**ถ้าเห็น error:**
- ตรวจสอบ `.env` file
- ตรวจสอบว่า MySQL/MAMP กำลังรัน
- ตรวจสอบ password ใน `.env`

### Step 2: Kill All Node Processes

```powershell
Get-Process -Name node | Stop-Process -Force
```

### Step 3: ตรวจสอบ Port 3000

```bash
netstat -ano | findstr :3000
```

**ถ้ามี process ใช้ port 3000:**
```powershell
taskkill /PID <PID> /F
```

### Step 4: Reinstall Dependencies (ถ้าจำเป็น)

```bash
cd C:\MAMP\htdocs\tmstock\backend
rm -rf node_modules
npm install
```

### Step 5: Build Project

```bash
npm run build
```

**ถ้ามี error:** แก้ไข error ก่อน

### Step 6: รัน Server

```bash
npm run start:dev
```

**รอให้เห็น:**
```
🚀 Application is running on: http://localhost:3000
📚 Swagger docs available at: http://localhost:3000/api/docs
```

---

## 🐛 Common Errors

### Error: Cannot find module
**แก้ไข:**
```bash
npm install
```

### Error: Port 3000 already in use
**แก้ไข:**
```powershell
Get-Process -Name node | Stop-Process -Force
```

### Error: Database connection failed
**แก้ไข:**
1. ตรวจสอบ `.env` file
2. ตรวจสอบ MySQL/MAMP กำลังรัน
3. ทดสอบด้วย `node test-db-connection.js`

---

## 📋 Checklist

- [ ] Database connection ทำงาน (`node test-db-connection.js`)
- [ ] Kill node processes เก่า
- [ ] Port 3000 ว่าง
- [ ] Dependencies ติดตั้งแล้ว (`npm install`)
- [ ] Build สำเร็จ (`npm run build`)
- [ ] รัน server (`npm run start:dev`)
- [ ] เห็นข้อความ "Application is running"

---

**Status:** Troubleshooting Guide

