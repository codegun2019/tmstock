# 🔧 แก้ไข Database Connection Error

## ❌ Error ที่พบ

```
Access denied for user 'root'@'localhost' (using password: NO)
```

## 🔍 สาเหตุ

MySQL/MAMP ต้องการ password แต่ใน `.env` file มี `DB_PASSWORD=` (ว่างเปล่า)

## ✅ วิธีแก้ไข

### วิธีที่ 1: ตั้งค่า Password ใน .env

แก้ไขไฟล์ `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=root          ← เปลี่ยนจากว่างเป็น "root" (หรือ password ของคุณ)
DB_DATABASE=mstock
```

**สำหรับ MAMP:**
- Default password มักจะเป็น `root`
- หรือ password ที่คุณตั้งไว้

### วิธีที่ 2: ตรวจสอบ Password ของ MySQL

1. เปิด MAMP
2. ไปที่ "Open WebStart page"
3. ไปที่ phpMyAdmin
4. ลอง login ด้วย username: `root` และ password ที่คุณรู้

### วิธีที่ 3: ตั้งค่า MySQL ให้ไม่ต้องใช้ Password (ไม่แนะนำ)

ถ้าคุณต้องการไม่ใช้ password:
1. เปิด MySQL command line
2. รัน:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY '';
FLUSH PRIVILEGES;
```

---

## 🧪 ทดสอบ Database Connection

หลังจากแก้ไข `.env` แล้ว ทดสอบด้วย:

```bash
cd backend
node test-db-connection.js
```

**ถ้าเห็น:**
```
✅ Database connection successful!
✅ Query test successful: [ { test: 1 } ]
```

**หมายความว่า:** ✅ Database connection ทำงานแล้ว

---

## 🚀 รัน Server ใหม่

หลังจากแก้ไข `.env` แล้ว:

```bash
cd backend
npm run start:dev
```

**ควรเห็น:**
```
🚀 Application is running on: http://localhost:3000
📚 Swagger docs available at: http://localhost:3000/api/docs
```

---

## 📋 Checklist

- [ ] แก้ไข `.env` file (DB_PASSWORD)
- [ ] ทดสอบ database connection (`node test-db-connection.js`)
- [ ] MySQL/MAMP กำลังรันอยู่
- [ ] Database `mstock` มีอยู่
- [ ] รัน `npm run start:dev`
- [ ] Server รันสำเร็จ

---

**Status:** Fixed

