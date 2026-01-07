# 🧪 API Testing Guide - tmstock Backend

**Version:** 1.0  
**Status:** 📋 Testing Guide

---

## 🚀 Quick Start

### 1. Start Server
```bash
cd backend
npm run start:dev
```

Server will run on: `http://localhost:3000`

---

## 📋 API Endpoints

### Public Endpoints (No Auth Required)

#### 1. Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "uptime": 123.45
}
```

---

#### 2. Register User
```http
POST /auth/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "full_name": "Test User",
  "branch_id": 1
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "username": "testuser",
  "email": "test@example.com",
  "full_name": "Test User",
  "branch_id": 1,
  "active": 1,
  "created_at": "2025-01-15T10:30:00.000Z"
}
```

**Error (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": [
    "username should not be empty",
    "password must be longer than or equal to 6 characters"
  ],
  "error": "Bad Request"
}
```

---

#### 3. Login
```http
POST /auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "full_name": "ผู้ดูแลระบบ",
    "branch_id": 1,
    "roles": [
      {
        "id": 1,
        "name": "admin",
        "permissions": ["admin.all", "product.read", ...]
      }
    ]
  }
}
```

**Error (401 Unauthorized):**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

---

### Protected Endpoints (Auth Required)

**All other endpoints require JWT token in header:**
```http
Authorization: Bearer <access_token>
```

---

## 🧪 Test Cases

### Test Case 1: Health Check
```bash
curl http://localhost:3000/health
```

**Expected:** Status 200, JSON response with status, timestamp, uptime

---

### Test Case 2: Register User (Success)
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User",
    "branch_id": 1
  }'
```

**Expected:** Status 201, User object returned

---

### Test Case 3: Register User (Validation Error)
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "",
    "password": "123"
  }'
```

**Expected:** Status 400, Validation errors

---

### Test Case 4: Login (Success)
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**Expected:** Status 200, access_token and user object

---

### Test Case 5: Login (Invalid Credentials)
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "wrongpassword"
  }'
```

**Expected:** Status 401, "Invalid credentials" error

---

### Test Case 6: Access Protected Route (No Token)
```bash
curl http://localhost:3000/
```

**Expected:** Status 401, "Unauthorized" error

---

### Test Case 7: Access Protected Route (With Token)
```bash
# First, login to get token
TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | jq -r '.access_token')

# Then use token
curl http://localhost:3000/ \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:** Status 200, "Hello World!" response

---

## 📊 Postman Collection

### Import to Postman

1. Create new collection: "tmstock API"
2. Add environment variables:
   - `base_url`: `http://localhost:3000`
   - `token`: (will be set after login)

### Requests

1. **Health Check**
   - Method: GET
   - URL: `{{base_url}}/health`
   - No auth required

2. **Register**
   - Method: POST
   - URL: `{{base_url}}/auth/register`
   - Body (raw JSON):
   ```json
   {
     "username": "testuser",
     "email": "test@example.com",
     "password": "password123",
     "full_name": "Test User",
     "branch_id": 1
   }
   ```

3. **Login**
   - Method: POST
   - URL: `{{base_url}}/auth/login`
   - Body (raw JSON):
   ```json
   {
     "username": "admin",
     "password": "admin123"
   }
   ```
   - Tests (Postman):
   ```javascript
   if (pm.response.code === 200) {
     const jsonData = pm.response.json();
     pm.environment.set("token", jsonData.access_token);
   }
   ```

4. **Get Hello (Protected)**
   - Method: GET
   - URL: `{{base_url}}/`
   - Authorization: Bearer Token `{{token}}`

---

## 🔐 Default Users (After Seeding)

After running `npm run seed`, you can login with:

| Username | Password | Role | Description |
|----------|----------|------|-------------|
| admin | admin123 | admin | ผู้ดูแลระบบ |
| manager | manager123 | manager | ผู้จัดการ |
| cashier | cashier123 | cashier | แคชเชียร์ |

---

## ✅ Testing Checklist

- [ ] Health check endpoint works
- [ ] Register endpoint works with valid data
- [ ] Register endpoint validates input
- [ ] Login endpoint works with valid credentials
- [ ] Login endpoint rejects invalid credentials
- [ ] Protected routes require authentication
- [ ] JWT token works for protected routes
- [ ] Invalid token is rejected
- [ ] Expired token is rejected

---

## 🚨 Common Issues

### Issue 1: Database Connection Failed
**Solution:**
- Check MySQL is running
- Verify .env file has correct credentials
- Check database exists

### Issue 2: 401 Unauthorized on Login
**Solution:**
- Verify user exists in database
- Check password is correct
- Run seeders: `npm run seed`

### Issue 3: 500 Internal Server Error
**Solution:**
- Check server logs
- Verify database connection
- Check entities are properly configured

---

**Status:** 📋 Ready for Testing

**Last Updated:** 2025-01-XX

