# 🚀 NestJS Migration Plan - mstock POS System

**วันที่สร้าง:** 2025-01-XX  
**Version:** 5.0  
**สถานะ:** 📋 Planning Phase

---

## 📋 Executive Summary

แผนการ migrate ระบบ mstock POS จาก PHP (Vanilla) ไปยัง **NestJS** (Node.js Framework)

### เป้าหมาย
- ✅ Migrate ทุกฟีเจอร์ที่มีอยู่
- ✅ รักษา Database Schema เดิม (MySQL)
- ✅ รองรับ Frontend เดิม (Tailwind CSS + Alpine.js)
- ✅ TypeScript-first approach
- ✅ Modular architecture
- ✅ Better scalability & maintainability

---

## 🏗️ Architecture Overview

### Current Stack (PHP)
- **Backend:** PHP 8.x (Vanilla)
- **Database:** MySQL 8.0
- **Frontend:** Tailwind CSS + Alpine.js
- **Session:** PHP Sessions
- **Routing:** Custom Router

### Target Stack (NestJS)
- **Backend:** NestJS 10.x (Node.js 20+)
- **Database:** MySQL 8.0 (TypeORM)
- **Frontend:** Tailwind CSS + Alpine.js (ไม่เปลี่ยน)
- **Session:** JWT + Redis (optional)
- **Routing:** NestJS Router

---

## 📊 Module Mapping

### Core Modules

| PHP Class | NestJS Module | Description |
|-----------|---------------|-------------|
| `Auth.php` | `auth.module.ts` | Authentication & Authorization |
| `Database.php` | `database.module.ts` | Database connection (TypeORM) |
| `CSRF.php` | `csrf.module.ts` | CSRF protection |
| `Router.php` | Built-in NestJS | Routing system |
| `Feature.php` | `feature-toggle.module.ts` | Feature toggle system |
| `AuditLog.php` | `audit-log.module.ts` | Audit logging |
| `BranchContext.php` | `branch-context.module.ts` | Branch context management |
| `Inventory.php` | `inventory.module.ts` | Stock management |
| `TransactionHelper.php` | `transaction-helper.module.ts` | Transaction utilities |

### Business Modules

| PHP Controller | NestJS Module | Description |
|----------------|---------------|-------------|
| `AuthController` | `auth.module.ts` | Login/Logout |
| `UsersController` | `users.module.ts` | User management |
| `RolesController` | `roles.module.ts` | RBAC management |
| `BranchController` | `branches.module.ts` | Branch management |
| `ProductsController` | `products.module.ts` | Product CRUD |
| `CategoriesController` | `categories.module.ts` | Category management |
| `UnitsController` | `units.module.ts` | Unit management |
| `ContactsController` | `contacts.module.ts` | Customer/Supplier |
| `InventoryController` | `inventory.module.ts` | Stock operations |
| `InvoiceController` | `invoices.module.ts` | POS & Invoices |
| `PosController` | `pos.module.ts` | POS operations |
| `RepairController` | `repairs.module.ts` | Repair orders |
| `DocumentsController` | `documents.module.ts` | Sales documents |
| `ReportsController` | `reports.module.ts` | Reports |
| `SettingsController` | `settings.module.ts` | System settings |
| `BackupController` | `backup.module.ts` | Backup/Restore |
| `AccountsReceivableController` | `accounts-receivable.module.ts` | Receivables |
| `FeatureTogglesController` | `feature-toggles.module.ts` | Feature toggles |
| `LogsController` | `audit-logs.module.ts` | Audit logs |

### Sequence Generators

| PHP Class | NestJS Service | Description |
|-----------|----------------|-------------|
| `InvoiceSequence.php` | `invoice-sequence.service.ts` | Invoice number generation |
| `GRNSequence.php` | `grn-sequence.service.ts` | GRN number generation |
| `StockAdjustmentSequence.php` | `stock-adjustment-sequence.service.ts` | Adjustment number |
| `StockTransferSequence.php` | `stock-transfer-sequence.service.ts` | Transfer number |
| `DocumentSequence.php` | `document-sequence.service.ts` | Document number |
| `RepairSequence.php` | `repair-sequence.service.ts` | Repair order number |

---

## 📁 Project Structure

```
mstock-nestjs/
├── src/
│   ├── main.ts                    # Application entry point
│   ├── app.module.ts              # Root module
│   │
│   ├── common/                    # Shared modules
│   │   ├── decorators/           # Custom decorators
│   │   │   ├── roles.decorator.ts
│   │   │   ├── permissions.decorator.ts
│   │   │   └── branch-context.decorator.ts
│   │   ├── filters/              # Exception filters
│   │   │   └── http-exception.filter.ts
│   │   ├── guards/               # Auth guards
│   │   │   ├── auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   └── permissions.guard.ts
│   │   ├── interceptors/         # Interceptors
│   │   │   ├── audit-log.interceptor.ts
│   │   │   └── transform.interceptor.ts
│   │   ├── middleware/           # Middleware
│   │   │   ├── csrf.middleware.ts
│   │   │   └── branch-context.middleware.ts
│   │   └── pipes/                # Validation pipes
│   │       └── validation.pipe.ts
│   │
│   ├── config/                    # Configuration
│   │   ├── database.config.ts
│   │   ├── auth.config.ts
│   │   └── app.config.ts
│   │
│   ├── database/                 # Database
│   │   ├── migrations/           # TypeORM migrations
│   │   ├── seeds/                # Database seeds
│   │   └── entities/             # TypeORM entities
│   │       ├── user.entity.ts
│   │       ├── role.entity.ts
│   │       ├── permission.entity.ts
│   │       ├── branch.entity.ts
│   │       ├── product.entity.ts
│   │       ├── invoice.entity.ts
│   │       └── ...
│   │
│   ├── auth/                     # Authentication module
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   └── dto/
│   │       ├── login.dto.ts
│   │       └── register.dto.ts
│   │
│   ├── users/                    # Users module
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── dto/
│   │
│   ├── roles/                    # RBAC module
│   │   ├── roles.module.ts
│   │   ├── roles.controller.ts
│   │   ├── roles.service.ts
│   │   └── dto/
│   │
│   ├── branches/                 # Branches module
│   │   ├── branches.module.ts
│   │   ├── branches.controller.ts
│   │   ├── branches.service.ts
│   │   └── dto/
│   │
│   ├── products/                 # Products module
│   │   ├── products.module.ts
│   │   ├── products.controller.ts
│   │   ├── products.service.ts
│   │   └── dto/
│   │
│   ├── inventory/                # Inventory module
│   │   ├── inventory.module.ts
│   │   ├── inventory.controller.ts
│   │   ├── inventory.service.ts
│   │   └── dto/
│   │
│   ├── invoices/                 # Invoices module
│   │   ├── invoices.module.ts
│   │   ├── invoices.controller.ts
│   │   ├── invoices.service.ts
│   │   └── dto/
│   │
│   ├── pos/                      # POS module
│   │   ├── pos.module.ts
│   │   ├── pos.controller.ts
│   │   └── pos.service.ts
│   │
│   ├── repairs/                  # Repairs module
│   │   ├── repairs.module.ts
│   │   ├── repairs.controller.ts
│   │   └── repairs.service.ts
│   │
│   ├── documents/                # Documents module
│   │   ├── documents.module.ts
│   │   ├── documents.controller.ts
│   │   └── documents.service.ts
│   │
│   ├── contacts/                 # Contacts module
│   │   ├── contacts.module.ts
│   │   ├── contacts.controller.ts
│   │   └── contacts.service.ts
│   │
│   ├── reports/                  # Reports module
│   │   ├── reports.module.ts
│   │   ├── reports.controller.ts
│   │   └── reports.service.ts
│   │
│   ├── settings/                 # Settings module
│   │   ├── settings.module.ts
│   │   ├── settings.controller.ts
│   │   └── settings.service.ts
│   │
│   ├── backup/                   # Backup module
│   │   ├── backup.module.ts
│   │   ├── backup.controller.ts
│   │   └── backup.service.ts
│   │
│   ├── accounts-receivable/      # Receivables module
│   │   ├── accounts-receivable.module.ts
│   │   ├── accounts-receivable.controller.ts
│   │   └── accounts-receivable.service.ts
│   │
│   ├── feature-toggles/          # Feature toggles module
│   │   ├── feature-toggles.module.ts
│   │   ├── feature-toggles.controller.ts
│   │   └── feature-toggles.service.ts
│   │
│   ├── audit-logs/               # Audit logs module
│   │   ├── audit-logs.module.ts
│   │   ├── audit-logs.controller.ts
│   │   └── audit-logs.service.ts
│   │
│   └── sequences/                # Sequence generators
│       ├── sequences.module.ts
│       ├── invoice-sequence.service.ts
│       ├── grn-sequence.service.ts
│       ├── stock-adjustment-sequence.service.ts
│       ├── stock-transfer-sequence.service.ts
│       ├── document-sequence.service.ts
│       └── repair-sequence.service.ts
│
├── public/                        # Static files (frontend)
│   ├── index.html
│   ├── assets/
│   └── uploads/
│
├── test/                         # E2E tests
│   ├── app.e2e-spec.ts
│   └── ...
│
├── .env                          # Environment variables
├── .env.example
├── nest-cli.json                 # NestJS CLI config
├── package.json
├── tsconfig.json                 # TypeScript config
└── README.md
```

---

## 🔄 Migration Phases

### Phase 1: Setup & Core Infrastructure (Week 1-2)
**เป้าหมาย:** สร้างโครงสร้างพื้นฐานและ core modules

- [ ] Initialize NestJS project
- [ ] Setup TypeORM with MySQL
- [ ] Create database entities (from existing schema)
- [ ] Setup authentication (JWT)
- [ ] Create guards & decorators
- [ ] Setup CSRF protection
- [ ] Create audit log interceptor
- [ ] Setup feature toggle system

**Deliverables:**
- ✅ NestJS project structure
- ✅ Database connection working
- ✅ Auth system (login/logout)
- ✅ RBAC guards working

---

### Phase 2: Core Business Modules (Week 3-4)
**เป้าหมาย:** Migrate core business logic

- [ ] Users module
- [ ] Roles & Permissions module
- [ ] Branches module
- [ ] Products module
- [ ] Categories & Units modules
- [ ] Contacts module

**Deliverables:**
- ✅ All CRUD operations working
- ✅ Permission checks working
- ✅ Branch context working

---

### Phase 3: Inventory & Stock Management (Week 5-6)
**เป้าหมาย:** Migrate inventory system

- [ ] Inventory module
- [ ] Stock movements
- [ ] Stock balances
- [ ] Sequence generators
- [ ] GRN module (if exists)
- [ ] Stock Adjustment module (if exists)
- [ ] Stock Transfer module (if exists)

**Deliverables:**
- ✅ Stock operations working
- ✅ Stock ledger working
- ✅ Sequence generation working

---

### Phase 4: Sales & POS (Week 7-8)
**เป้าหมาย:** Migrate POS and sales system

- [ ] POS module
- [ ] Invoices module
- [ ] Invoice sequences
- [ ] Receipt generation
- [ ] Void/Refund functionality

**Deliverables:**
- ✅ POS working
- ✅ Invoice creation working
- ✅ Stock deduction working

---

### Phase 5: Additional Modules (Week 9-10)
**เป้าหมาย:** Migrate remaining modules

- [ ] Repairs module
- [ ] Documents module
- [ ] Reports module
- [ ] Settings module
- [ ] Backup module
- [ ] Accounts Receivable module
- [ ] Feature Toggles module
- [ ] Audit Logs module

**Deliverables:**
- ✅ All modules migrated
- ✅ All features working

---

### Phase 6: Testing & Optimization (Week 11-12)
**เป้าหมาย:** Testing และ optimization

- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation

**Deliverables:**
- ✅ Test coverage > 80%
- ✅ Performance benchmarks
- ✅ Security audit report
- ✅ API documentation

---

## 🔧 Technical Decisions

### 1. Database ORM: TypeORM
**เหตุผล:**
- ✅ Mature and stable
- ✅ Good MySQL support
- ✅ Migration support
- ✅ Entity-based approach
- ✅ Query builder

### 2. Authentication: JWT
**เหตุผล:**
- ✅ Stateless
- ✅ Scalable
- ✅ Better for API
- ✅ Can add Redis for session (optional)

### 3. Validation: class-validator
**เหตุผล:**
- ✅ Decorator-based
- ✅ TypeScript-friendly
- ✅ Built-in validators
- ✅ DTO pattern

### 4. File Upload: multer
**เหตุผล:**
- ✅ Standard for NestJS
- ✅ Good performance
- ✅ Easy to use

### 5. API Documentation: Swagger
**เหตุผล:**
- ✅ Auto-generated
- ✅ TypeScript integration
- ✅ Easy to maintain

---

## 📝 Database Migration Strategy

### Option 1: Keep Existing Schema (Recommended)
- ✅ Use existing MySQL database
- ✅ Create TypeORM entities matching existing tables
- ✅ No data migration needed
- ✅ Can run both systems in parallel

### Option 2: Fresh Migration
- ⚠️ Export data from PHP
- ⚠️ Import to new database
- ⚠️ More complex
- ⚠️ Downtime required

**Recommendation:** Option 1 - Keep existing schema

---

## 🔒 Security Considerations

### 1. Authentication
- ✅ JWT tokens (access + refresh)
- ✅ Password hashing (bcrypt)
- ✅ Rate limiting
- ✅ CSRF protection

### 2. Authorization
- ✅ RBAC guards
- ✅ Permission decorators
- ✅ Branch context guards

### 3. Data Protection
- ✅ Input validation
- ✅ SQL injection prevention (TypeORM)
- ✅ XSS protection
- ✅ File upload validation

### 4. Audit Logging
- ✅ All actions logged
- ✅ IP address tracking
- ✅ User agent tracking

---

## 📊 API Design

### RESTful Conventions
```
GET    /api/users              # List users
GET    /api/users/:id          # Get user
POST   /api/users              # Create user
PUT    /api/users/:id          # Update user
DELETE /api/users/:id          # Delete user
```

### Response Format
```typescript
{
  success: boolean;
  data?: any;
  message?: string;
  errors?: string[];
}
```

### Error Handling
```typescript
{
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
}
```

---

## 🧪 Testing Strategy

### Unit Tests
- ✅ Service methods
- ✅ Utility functions
- ✅ Guards & decorators

### Integration Tests
- ✅ API endpoints
- ✅ Database operations
- ✅ Authentication flow

### E2E Tests
- ✅ Complete user flows
- ✅ POS checkout flow
- ✅ Stock operations

---

## 📈 Performance Considerations

### 1. Database
- ✅ Connection pooling
- ✅ Query optimization
- ✅ Indexes (keep existing)
- ✅ Caching (Redis - optional)

### 2. API
- ✅ Response compression
- ✅ Pagination
- ✅ Lazy loading
- ✅ Rate limiting

### 3. File Uploads
- ✅ Streaming
- ✅ Size limits
- ✅ Async processing

---

## 🚀 Deployment Strategy

### Development
- ✅ Local MySQL
- ✅ Hot reload
- ✅ Debug mode

### Staging
- ✅ Separate database
- ✅ Environment variables
- ✅ Logging enabled

### Production
- ✅ PM2 or Docker
- ✅ Nginx reverse proxy
- ✅ SSL/TLS
- ✅ Monitoring

---

## 📋 Checklist

### Pre-Migration
- [ ] Backup existing database
- [ ] Document all API endpoints
- [ ] List all features
- [ ] Identify dependencies

### During Migration
- [ ] Create entities
- [ ] Migrate services
- [ ] Migrate controllers
- [ ] Update frontend (if needed)
- [ ] Test each module

### Post-Migration
- [ ] Full system test
- [ ] Performance test
- [ ] Security audit
- [ ] Documentation
- [ ] Training (if needed)

---

## 🎯 Success Criteria

### Functional
- ✅ All features working
- ✅ No data loss
- ✅ API compatibility (if needed)
- ✅ Frontend working

### Non-Functional
- ✅ Performance ≥ PHP version
- ✅ Security ≥ PHP version
- ✅ Test coverage > 80%
- ✅ Documentation complete

---

## 📝 Notes

### Frontend Compatibility
- ✅ Keep Tailwind CSS + Alpine.js
- ✅ Update API calls (if needed)
- ✅ Update CSRF token handling
- ✅ Update session handling (JWT)

### Database Compatibility
- ✅ Keep existing schema
- ✅ Keep existing data
- ✅ Run both systems in parallel (optional)

### Rollback Plan
- ✅ Keep PHP version running
- ✅ Database backup before migration
- ✅ Feature flags for gradual rollout

---

## 🚧 Risks & Mitigation

### Risk 1: Data Loss
**Mitigation:** 
- Full database backup
- Test migration on staging
- Parallel running period

### Risk 2: Performance Issues
**Mitigation:**
- Load testing
- Performance monitoring
- Optimization

### Risk 3: Feature Gaps
**Mitigation:**
- Feature checklist
- Testing
- User acceptance testing

---

## 📚 Resources

### NestJS Documentation
- https://docs.nestjs.com/
- https://github.com/nestjs/nest

### TypeORM Documentation
- https://typeorm.io/

### Migration Guides
- https://docs.nestjs.com/techniques/database

---

**Status:** 📋 Planning Complete - Ready for Implementation

**Next Steps:**
1. Review and approve plan
2. Setup development environment
3. Start Phase 1: Setup & Core Infrastructure

