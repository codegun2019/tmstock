# 🚀 Setup Guide - tmstock Backend

**Version:** 1.0  
**Status:** 📋 Setup Instructions

---

## 📋 Prerequisites

- Node.js >= 18
- MySQL >= 8.0
- npm or yarn

---

## 🔧 Setup Steps

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env file with your database credentials
```

**Edit `.env` file:**
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password_here
DB_DATABASE=mstock

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h

# Application
NODE_ENV=development
PORT=3000

# CORS
CORS_ORIGIN=http://localhost:5173
```

### 3. Create Database

```sql
CREATE DATABASE IF NOT EXISTS mstock CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Run Seeders

```bash
npm run seed
```

This will create:
- Default branches (BKK, CMK)
- Roles and permissions (admin, manager, cashier)
- Default users (admin/admin123, manager/manager123, cashier/cashier123)

### 5. Start Development Server

```bash
npm run start:dev
```

Server will run on: `http://localhost:3000`

---

## 🧪 Test API Endpoints

### Health Check
```bash
curl http://localhost:3000/health
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Get Profile (Protected)
```bash
# First, get token from login
TOKEN="your_token_here"

curl http://localhost:3000/profile \
  -H "Authorization: Bearer $TOKEN"
```

See `API_TESTING.md` for detailed testing guide.

---

## 🔐 Default Users

After running seeders, you can login with:

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | admin |
| manager | manager123 | manager |
| cashier | cashier123 | cashier |

---

## 🚨 Troubleshooting

### Database Connection Failed
- Check MySQL is running
- Verify database exists
- Check .env file has correct credentials

### Seeder Errors
- Make sure database exists
- Check database connection
- Verify .env file is configured

### Port Already in Use
- Change PORT in .env file
- Or kill process using port 3000

---

## 📚 Next Steps

1. Test all API endpoints
2. Start Phase 2: Core Business Modules
3. Create Products module
4. Create Invoices module

---

**Status:** 📋 Ready for Setup

**Last Updated:** 2025-01-XX

