# 🚀 วิธีเริ่ม Server (Step by Step)

## ⚠️ ถ้าเห็น ERR_CONNECTION_REFUSED

**หมายความว่า:** Server ยังไม่รันอยู่

---

## ✅ วิธีแก้ไข (ทำตามลำดับ)

### Step 1: เปิด PowerShell/Terminal ใหม่

**สำคัญ:** ต้องเปิด Terminal ใหม่เพื่อให้แน่ใจว่าไม่มี process เก่าค้างอยู่

### Step 2: ไปที่โฟเดอร์ backend

```powershell
cd C:\MAMP\htdocs\tmstock\backend
```

### Step 3: ตรวจสอบ .env file

```powershell
Get-Content .env
```

**ต้องมี:**
```
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=root
DB_DATABASE=mstock
```

**ถ้าไม่มี:** สร้างไฟล์ `.env` ด้วยข้อมูลข้างบน

### Step 4: ตรวจสอบ Database Connection

```powershell
node test-db-connection.js
```

**ควรเห็น:**
```
✅ Database connection successful!
```

**ถ้าเห็น error:** แก้ไข `.env` file ให้ถูกต้อง

### Step 5: Kill Node Processes เก่า (ถ้ามี)

```powershell
Get-Process -Name node | Stop-Process -Force
```

### Step 6: รัน Server

```powershell
npm run start:dev
```

### Step 7: รอให้เห็นข้อความนี้:

```
🚀 Application is running on: http://localhost:3000
📚 Swagger docs available at: http://localhost:3000/api/docs
```

**ถ้าเห็น error:**
- อ่าน error message
- แก้ไขตาม error ที่พบ
- รันใหม่

---

## 🔍 ตรวจสอบว่า Server รันแล้ว

### วิธีที่ 1: ดู Terminal

**ต้องเห็น:**
```
🚀 Application is running on: http://localhost:3000
```

### วิธีที่ 2: เปิด Browser

ไปที่:
```
http://localhost:3000/health
```

**ควรเห็น:**
```json
{
  "status": "ok",
  "timestamp": "...",
  "uptime": ...
}
```

### วิธีที่ 3: ตรวจสอบ Port

```powershell
netstat -ano | findstr :3000 | findstr LISTENING
```

**ควรเห็น:** มี process กำลัง LISTENING ที่ port 3000

---

## 🐛 Common Errors

### Error: Database connection failed

**แก้ไข:**
1. ตรวจสอบ MySQL/MAMP กำลังรัน
2. ตรวจสอบ `.env` file
3. ทดสอบด้วย `node test-db-connection.js`

### Error: Port 3000 already in use

**แก้ไข:**
```powershell
# หา process
netstat -ano | findstr :3000

# Kill process
taskkill /PID <PID> /F
```

### Error: Cannot find module

**แก้ไข:**
```powershell
npm install
```

---

## 📋 Checklist

- [ ] Terminal ใหม่
- [ ] อยู่ในโฟเดอร์ `backend`
- [ ] `.env` file ถูกต้อง
- [ ] Database connection ทำงาน
- [ ] Kill node processes เก่า
- [ ] รัน `npm run start:dev`
- [ ] เห็นข้อความ "Application is running"
- [ ] ทดสอบ `http://localhost:3000/health` ได้

---

## 💡 Tips

1. **เปิด Terminal ใหม่เสมอ** - เพื่อให้แน่ใจว่าไม่มี process เก่าค้าง
2. **ดู Error Messages** - อ่าน error ที่เห็นใน terminal
3. **ตรวจสอบ Database** - ใช้ `node test-db-connection.js` ทดสอบก่อน
4. **รอให้ Server Start** - อาจใช้เวลา 10-30 วินาที

---

**Status:** Ready to Start

