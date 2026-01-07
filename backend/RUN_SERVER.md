# 🚀 วิธีรัน Server ให้ทำงาน

## ⚠️ ปัญหา: ERR_CONNECTION_REFUSED

**สาเหตุ:** Server ยังไม่รันอยู่ หรือรันแต่มี error

---

## ✅ วิธีแก้ไข (Step by Step)

### Step 1: เปิด Terminal/PowerShell ใหม่

**สำคัญ:** ต้องเปิด Terminal ใหม่เพื่อให้แน่ใจว่าไม่มี process เก่าค้างอยู่

### Step 2: ไปที่โฟเดอร์ backend

```bash
cd C:\MAMP\htdocs\tmstock\backend
```

### Step 3: ตรวจสอบ .env file

```bash
# ตรวจสอบว่ามี .env หรือไม่
dir .env

# ถ้าไม่มี ให้สร้างด้วยข้อมูลนี้:
```

**สร้างไฟล์ `.env` ด้วยข้อมูลนี้:**
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=mstock
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=info
```

### Step 4: ตรวจสอบว่า MySQL/MAMP รันอยู่

- เปิด MAMP
- ตรวจสอบว่า MySQL กำลังรัน (Status: Running)
- ตรวจสอบว่า database `mstock` มีอยู่

### Step 5: Kill node processes เก่า (ถ้ามี)

```powershell
# หา process ที่ใช้ port 3000
netstat -ano | findstr :3000

# Kill process (แทนที่ PID ด้วย process ID)
taskkill /PID <PID> /F
```

### Step 6: รัน Server

```bash
npm run start:dev
```

### Step 7: รอให้เห็นข้อความนี้:

```
🚀 Application is running on: http://localhost:3000
📚 Swagger docs available at: http://localhost:3000/api/docs
```

**ถ้าเห็น error:**
- ตรวจสอบ database connection
- ตรวจสอบ .env file
- ตรวจสอบว่า MySQL รันอยู่

---

## 🔍 ตรวจสอบว่า Server รันแล้ว

### วิธีที่ 1: เปิด Browser

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

### วิธีที่ 2: เปิด Swagger Docs

ไปที่:
```
http://localhost:3000/api/docs
```

**ควรเห็น:** Swagger UI พร้อม API documentation

---

## 🐛 Common Errors

### Error: Cannot connect to database

**แก้ไข:**
1. ตรวจสอบว่า MySQL/MAMP รันอยู่
2. ตรวจสอบ .env file (DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE)
3. ตรวจสอบว่า database `mstock` มีอยู่

### Error: Port 3000 already in use

**แก้ไข:**
```bash
# หา process
netstat -ano | findstr :3000

# Kill process
taskkill /PID <PID> /F
```

### Error: Module not found

**แก้ไข:**
```bash
npm install
```

---

## 📋 Checklist

- [ ] Terminal/PowerShell ใหม่
- [ ] อยู่ในโฟเดอร์ `C:\MAMP\htdocs\tmstock\backend`
- [ ] มีไฟล์ `.env` และถูกต้อง
- [ ] MySQL/MAMP กำลังรัน
- [ ] Database `mstock` มีอยู่
- [ ] รัน `npm run start:dev`
- [ ] เห็นข้อความ "Application is running"
- [ ] ทดสอบ `http://localhost:3000/health` ได้

---

**Status:** Ready to Run

