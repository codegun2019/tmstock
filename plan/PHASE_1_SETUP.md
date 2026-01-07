# 🔧 Phase 1: Setup & Core Infrastructure

**Duration:** Week 2  
**Status:** ⏸️ Pending  
**Priority:** 🔴 Critical

---

## 🎯 เป้าหมาย

สร้างโครงสร้างพื้นฐานและ core modules สำหรับ NestJS project

---

## 📋 Tasks Checklist

### 1. Project Initialization
- [ ] Install NestJS CLI globally
- [ ] Create new NestJS project (`nest new mstock-nestjs`)
- [ ] Setup project structure
- [ ] Install required packages
- [ ] Configure TypeScript
- [ ] Setup environment variables (.env)

**Estimated Time:** 2 hours

---

### 2. Database Setup
- [ ] Install TypeORM and MySQL driver
- [ ] Create database configuration
- [ ] Test database connection
- [ ] Setup migration system
- [ ] Create base entity class

**Estimated Time:** 3 hours

---

### 3. Authentication System
- [ ] Install JWT and Passport
- [ ] Create auth configuration
- [ ] Create JWT strategy
- [ ] Create auth service
- [ ] Create auth controller
- [ ] Create login DTO
- [ ] Test login/logout

**Estimated Time:** 4 hours

---

### 4. Guards & Decorators
- [ ] Create JWT auth guard
- [ ] Create roles guard
- [ ] Create permissions guard
- [ ] Create public decorator
- [ ] Create roles decorator
- [ ] Create permissions decorator
- [ ] Test guards

**Estimated Time:** 3 hours

---

### 5. Common Utilities
- [ ] Create audit log interceptor
- [ ] Create transform interceptor
- [ ] Create exception filter
- [ ] Create validation pipe
- [ ] Create CSRF middleware
- [ ] Create branch context middleware

**Estimated Time:** 4 hours

---

### 6. Base Entities
- [ ] Create User entity
- [ ] Create Role entity
- [ ] Create Permission entity
- [ ] Create Branch entity
- [ ] Create AuditLog entity
- [ ] Create FeatureToggle entity
- [ ] Test entities

**Estimated Time:** 6 hours

---

### 7. Feature Toggle System
- [ ] Create feature toggle service
- [ ] Create feature toggle entity
- [ ] Create feature toggle decorator
- [ ] Test feature toggles

**Estimated Time:** 3 hours

---

### 8. Testing Setup
- [ ] Setup Jest
- [ ] Create test utilities
- [ ] Write unit tests for auth
- [ ] Write unit tests for guards
- [ ] Write integration tests

**Estimated Time:** 4 hours

---

## 📁 Files to Create

### Configuration Files
```
src/config/
├── database.config.ts
├── auth.config.ts
└── app.config.ts
```

### Common Files
```
src/common/
├── decorators/
│   ├── roles.decorator.ts
│   ├── permissions.decorator.ts
│   └── public.decorator.ts
├── guards/
│   ├── auth.guard.ts
│   ├── roles.guard.ts
│   └── permissions.guard.ts
├── interceptors/
│   ├── audit-log.interceptor.ts
│   └── transform.interceptor.ts
├── middleware/
│   ├── csrf.middleware.ts
│   └── branch-context.middleware.ts
└── filters/
    └── http-exception.filter.ts
```

### Database Files
```
src/database/
├── entities/
│   ├── base.entity.ts
│   ├── user.entity.ts
│   ├── role.entity.ts
│   ├── permission.entity.ts
│   ├── branch.entity.ts
│   ├── audit-log.entity.ts
│   └── feature-toggle.entity.ts
└── migrations/
```

### Auth Files
```
src/auth/
├── auth.module.ts
├── auth.controller.ts
├── auth.service.ts
├── strategies/
│   └── jwt.strategy.ts
└── dto/
    └── login.dto.ts
```

---

## ✅ Acceptance Criteria

### Functional
- ✅ NestJS project initialized
- ✅ Database connection working
- ✅ Authentication working (login/logout)
- ✅ JWT tokens generated correctly
- ✅ Guards protecting routes
- ✅ Decorators working
- ✅ Base entities created

### Non-Functional
- ✅ Code follows NestJS best practices
- ✅ TypeScript types correct
- ✅ Error handling implemented
- ✅ Logging configured
- ✅ Environment variables used

---

## 🧪 Testing Checklist

### Unit Tests
- [ ] Auth service tests
- [ ] JWT strategy tests
- [ ] Guards tests
- [ ] Decorators tests

### Integration Tests
- [ ] Database connection test
- [ ] Auth flow test (login → get profile → logout)
- [ ] Guard protection test

### Manual Tests
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Access protected route without token
- [ ] Access protected route with token
- [ ] Access route with wrong role
- [ ] Access route with wrong permission

---

## 📝 Documentation

### Required Documentation
- [ ] Update README.md with setup instructions
- [ ] Document environment variables
- [ ] Document authentication flow
- [ ] Document guards usage
- [ ] Document decorators usage

---

## 🚨 Common Issues & Solutions

### Issue 1: Database Connection Failed
**Solution:**
- Check MySQL is running
- Verify .env file
- Check database exists
- Verify credentials

### Issue 2: JWT Token Invalid
**Solution:**
- Check JWT_SECRET in .env
- Verify token expiration
- Check token format

### Issue 3: Guards Not Working
**Solution:**
- Check guard order
- Verify decorators applied
- Check user roles/permissions

---

## 📊 Progress Tracking

### Daily Progress
- **Day 1:** Project initialization + Database setup
- **Day 2:** Authentication system
- **Day 3:** Guards & Decorators
- **Day 4:** Common utilities
- **Day 5:** Base entities + Testing

### Weekly Review
- Review completed tasks
- Identify blockers
- Plan next phase

---

## 🎯 Definition of Done

Phase 1 is complete when:
- ✅ All tasks checked
- ✅ All tests passing
- ✅ Documentation updated
- ✅ Code reviewed
- ✅ Ready for Phase 2

---

## 🔗 Related Documents

- `../docs/PROJECT_SETUP.md` - Detailed setup instructions
- `../docs/CODE_EXAMPLES.md` - Code examples
- `../MASTER_PLAN.md` - Overall plan

---

## ⏭️ Next Phase

After completing Phase 1, proceed to:
**Phase 2: Core Business Modules** (`PHASE_2_CORE_MODULES.md`)

---

**Status:** ⏸️ Pending  
**Ready to Start:** Yes  
**Blockers:** None

