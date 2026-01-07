# 🚀 tmstock Backend - NestJS

**Version:** 1.0.0  
**Status:** 🟢 In Development

---

## 📋 Quick Start

### Prerequisites
- Node.js >= 18
- MySQL >= 8.0
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
```

### Environment Variables

Create `.env` file:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=mstock

JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

NODE_ENV=development
PORT=3000

CORS_ORIGIN=http://localhost:5173
```

### Running the App

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── common/          # Common utilities
│   │   └── entities/    # Base entities
│   ├── auth/            # Authentication module
│   ├── users/           # Users module
│   ├── products/        # Products module
│   ├── invoices/        # Invoices/Sales module
│   ├── stock/           # Stock/Inventory module
│   ├── app.module.ts    # Root module
│   └── main.ts          # Application entry point
├── test/                # E2E tests
├── .env                 # Environment variables (not in git)
└── package.json
```

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

---

## 📚 Documentation

See parent directory (`../docs/`) for:
- API Documentation
- Database Schema
- Architecture Guide
- Development Guidelines

---

## 🔗 Related

- **Commit Guidelines:** `../COMMIT_GUIDELINES.md`
- **API Testing Guide:** `../API_TESTING_GUIDE.md`
- **Testing Checklist:** `../TESTING_CHECKLIST.md`

---

**Status:** 🟢 Active Development
