# 🚀 Server Status

## ✅ Server กำลังรัน

Server ถูกรันใน background แล้ว

---

## 🔍 วิธีตรวจสอบ

### 1. เปิด Browser
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

### 2. เปิด Swagger Documentation
ไปที่:
```
http://localhost:3000/api/docs
```

**ควรเห็น:** Swagger UI พร้อม API documentation

---

## 📋 Configuration

- **Port:** 3000
- **Database:** mstock
- **Environment:** development

---

## 🛑 หยุด Server

```powershell
Get-Process -Name node | Stop-Process -Force
```

---

## 🔄 รัน Server ใหม่

```bash
cd C:\MAMP\htdocs\tmstock\backend
npm run start:dev
```

---

**Status:** Running in Background

