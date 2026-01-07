# 🧪 Quick API Test Guide

## วิธีทดสอบ API

### 1. เริ่ม Server
```bash
cd backend
npm run start:dev
```

Server จะรันที่: `http://localhost:3000`

---

### 2. ทดสอบด้วย Browser

#### Health Check
เปิด browser ไปที่:
```
http://localhost:3000/health
```

ควรเห็น:
```json
{
  "status": "ok",
  "timestamp": "...",
  "uptime": ...
}
```

#### Swagger Documentation
เปิด browser ไปที่:
```
http://localhost:3000/api/docs
```

ควรเห็น Swagger UI พร้อม API documentation

---

### 3. ทดสอบด้วย Postman

1. เปิด Postman
2. Import Collection: `backend/postman-collection.json`
3. สร้าง Environment:
   - `base_url`: `http://localhost:3000`
4. Run requests ตามลำดับ:
   - Login (จะ set token อัตโนมัติ)
   - Get Products
   - Get Stock Balance
   - Create Invoice
   - Pay Invoice

---

### 4. ทดสอบด้วย PowerShell

```powershell
# Health Check
Invoke-RestMethod -Uri "http://localhost:3000/health" -Method Get

# Login
$loginBody = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $response.access_token

# Get Products (with token)
$headers = @{
    "Authorization" = "Bearer $token"
}
Invoke-RestMethod -Uri "http://localhost:3000/products" -Method Get -Headers $headers
```

---

### 5. ทดสอบด้วย curl (Git Bash / WSL)

```bash
# Health Check
curl http://localhost:3000/health

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Get Products (replace TOKEN with actual token)
curl http://localhost:3000/products \
  -H "Authorization: Bearer TOKEN"
```

---

## ✅ Checklist

- [ ] Server รันที่ port 3000
- [ ] Health check endpoint ทำงาน
- [ ] Swagger docs เปิดได้ที่ /api/docs
- [ ] Login สำเร็จและได้ token
- [ ] Get Products ทำงาน (ต้องมี token)
- [ ] Get Stock Balance ทำงาน
- [ ] Create Invoice ทำงาน
- [ ] Pay Invoice ทำงาน (ตัดสต็อค)

---

## 🐛 Troubleshooting

### Server ไม่รัน
```bash
# ตรวจสอบ port
netstat -ano | findstr :3000

# ตรวจสอบ database connection
# ตรวจสอบ .env file
```

### Login ไม่ได้
```bash
# รัน seeders
npm run seed
```

### 401 Unauthorized
- ตรวจสอบว่า token ถูกต้อง
- ตรวจสอบว่า token ยังไม่หมดอายุ
- Login ใหม่เพื่อได้ token ใหม่

---

**Status:** Ready for Testing

