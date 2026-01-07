# 🚀 Server Started Successfully

**Date:** 2025-01-07  
**Port:** 3001  
**Status:** ✅ Running

---

## ✅ Server Status

Server กำลังรันอยู่ที่:
```
http://localhost:3001
```

---

## 🌐 Available Endpoints

### Health Check
```
http://localhost:3001/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "...",
  "uptime": ...
}
```

### Swagger Documentation
```
http://localhost:3001/api/docs
```

**Features:**
- Interactive API testing
- JWT authentication support
- All endpoints documented

### API Base
```
http://localhost:3001
```

---

## 🧪 Quick Test

### 1. Test Health Check
เปิด browser ไปที่:
```
http://localhost:3001/health
```

### 2. Open Swagger
เปิด browser ไปที่:
```
http://localhost:3001/api/docs
```

### 3. Test Login
1. ใน Swagger UI → คลิก `POST /auth/login`
2. ใส่ข้อมูล:
   ```json
   {
     "username": "admin",
     "password": "admin123"
   }
   ```
3. Execute → Copy token

### 4. Authorize
1. คลิก "Authorize" (🔓)
2. ใส่ token ที่ได้จาก login
3. ทดสอบ endpoints อื่นๆ

---

## 📋 Test Checklist

- [ ] Health check works
- [ ] Swagger docs accessible
- [ ] Login successful
- [ ] Token received
- [ ] Protected endpoints work with token

---

## 🛑 Stop Server

ใน PowerShell window ที่รัน server:
- กด `Ctrl + C`

หรือ:
```powershell
Get-Process -Name node | Stop-Process -Force
```

---

## 🔄 Restart Server

```bash
cd C:\MAMP\htdocs\tmstock\backend
npm run start:dev
```

---

**Status:** ✅ Server Running  
**Next:** Test API endpoints via Swagger

