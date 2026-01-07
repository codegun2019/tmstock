# 🔍 วิธีตรวจสอบว่า Server รันอยู่หรือไม่

## วิธีที่ 1: ตรวจสอบด้วย Browser

เปิด browser ไปที่:
```
http://localhost:3000/health
```

**ถ้าเห็น:**
```json
{
  "status": "ok",
  "timestamp": "...",
  "uptime": ...
}
```
**หมายความว่า:** ✅ Server รันอยู่แล้ว

**ถ้าเห็น ERR_CONNECTION_REFUSED:**
❌ Server ยังไม่รัน → ต้องรัน server ก่อน

---

## วิธีที่ 2: ตรวจสอบด้วย PowerShell

```powershell
# ตรวจสอบว่า port 3000 ถูกใช้งานหรือไม่
netstat -ano | findstr :3000

# ตรวจสอบ process node
Get-Process -Name node -ErrorAction SilentlyContinue
```

---

## วิธีที่ 3: ตรวจสอบด้วย Command Line

```bash
# ตรวจสอบ port
netstat -ano | findstr :3000

# ทดสอบ connection
curl http://localhost:3000/health
```

---

## 🚀 วิธีรัน Server

### 1. เปิด Terminal/PowerShell

### 2. ไปที่โฟเดอร์ backend
```bash
cd C:\MAMP\htdocs\tmstock\backend
```

### 3. ตรวจสอบ .env file
```bash
# ตรวจสอบว่ามี .env หรือไม่
dir .env

# ถ้าไม่มี ให้สร้าง (ดูตัวอย่างใน START_HERE.md)
```

### 4. รัน Server
```bash
npm run start:dev
```

### 5. รอให้เห็นข้อความนี้:
```
🚀 Application is running on: http://localhost:3000
📚 Swagger docs available at: http://localhost:3000/api/docs
```

---

## 🐛 Troubleshooting

### ปัญหา: Port 3000 ถูกใช้งานแล้ว

**วิธีแก้:**
```bash
# หา process ที่ใช้ port 3000
netstat -ano | findstr :3000

# Kill process (แทนที่ PID ด้วย process ID)
taskkill /PID <PID> /F

# หรือเปลี่ยน port ใน .env
PORT=3001
```

### ปัญหา: Database connection failed

**วิธีแก้:**
1. ตรวจสอบว่า MySQL/MAMP กำลังรันอยู่
2. ตรวจสอบ .env file:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=root
   DB_PASSWORD=
   DB_DATABASE=mstock
   ```
3. ตรวจสอบว่า database `mstock` มีอยู่จริง

### ปัญหา: Module not found

**วิธีแก้:**
```bash
npm install
```

---

## ✅ Checklist

- [ ] MySQL/MAMP กำลังรันอยู่
- [ ] Database `mstock` มีอยู่
- [ ] .env file ถูกต้อง
- [ ] node_modules มีอยู่ (npm install แล้ว)
- [ ] รัน `npm run start:dev`
- [ ] เห็นข้อความ "Application is running"
- [ ] ทดสอบ `http://localhost:3000/health` ได้

---

**Status:** Ready to Check

