# 👥 Phase 2: Core Business Modules

**Duration:** Week 3-4  
**Status:** ⏸️ Pending  
**Priority:** 🔴 Critical  
**Depends on:** Phase 1

---

## 🎯 เป้าหมาย

Migrate core business logic modules: Users, Roles, Permissions, Branches, Products, Categories, Units, Contacts

---

## 📋 Tasks Checklist

### 1. Users Module
- [ ] Create User entity (if not done in Phase 1)
- [ ] Create Users module
- [ ] Create Users service
- [ ] Create Users controller
- [ ] Create DTOs (CreateUserDto, UpdateUserDto)
- [ ] Implement CRUD operations
- [ ] Implement password hashing
- [ ] Implement user activation/suspension
- [ ] Add permission checks
- [ ] Write tests

**Estimated Time:** 6 hours

---

### 2. Roles Module
- [ ] Create Role entity (if not done in Phase 1)
- [ ] Create Roles module
- [ ] Create Roles service
- [ ] Create Roles controller
- [ ] Create DTOs
- [ ] Implement CRUD operations
- [ ] Implement role-permission assignment
- [ ] Add permission checks
- [ ] Write tests

**Estimated Time:** 5 hours

---

### 3. Permissions Module
- [ ] Create Permission entity (if not done in Phase 1)
- [ ] Create Permissions service
- [ ] Create Permissions controller (optional)
- [ ] Implement permission checking
- [ ] Add permission seeding
- [ ] Write tests

**Estimated Time:** 3 hours

---

### 4. Branches Module
- [ ] Create Branch entity (if not done in Phase 1)
- [ ] Create Branches module
- [ ] Create Branches service
- [ ] Create Branches controller
- [ ] Create DTOs
- [ ] Implement CRUD operations
- [ ] Implement branch context
- [ ] Implement branch activation/deactivation
- [ ] Add permission checks
- [ ] Write tests

**Estimated Time:** 5 hours

---

### 5. Products Module
- [ ] Create Product entity
- [ ] Create ProductMedia entity
- [ ] Create Products module
- [ ] Create Products service
- [ ] Create Products controller
- [ ] Create DTOs
- [ ] Implement CRUD operations
- [ ] Implement barcode/SKU validation
- [ ] Implement product search
- [ ] Implement product media upload
- [ ] Add permission checks
- [ ] Write tests

**Estimated Time:** 8 hours

---

### 6. Categories Module
- [ ] Create Category entity
- [ ] Create Categories module
- [ ] Create Categories service
- [ ] Create Categories controller
- [ ] Create DTOs
- [ ] Implement CRUD operations
- [ ] Add permission checks
- [ ] Write tests

**Estimated Time:** 3 hours

---

### 7. Units Module
- [ ] Create Unit entity
- [ ] Create Units module
- [ ] Create Units service
- [ ] Create Units controller
- [ ] Create DTOs
- [ ] Implement CRUD operations
- [ ] Add permission checks
- [ ] Write tests

**Estimated Time:** 3 hours

---

### 8. Contacts Module
- [ ] Create Contact entity
- [ ] Create ContactAttachment entity
- [ ] Create ContactBank entity
- [ ] Create Contacts module
- [ ] Create Contacts service
- [ ] Create Contacts controller
- [ ] Create DTOs
- [ ] Implement CRUD operations
- [ ] Implement contact type (customer/supplier/both)
- [ ] Implement tax ID lookup
- [ ] Implement phone lookup
- [ ] Implement attachment upload
- [ ] Add permission checks
- [ ] Write tests

**Estimated Time:** 8 hours

---

## 📁 Files to Create

### Users Module
```
src/users/
├── users.module.ts
├── users.controller.ts
├── users.service.ts
└── dto/
    ├── create-user.dto.ts
    ├── update-user.dto.ts
    └── user-response.dto.ts
```

### Roles Module
```
src/roles/
├── roles.module.ts
├── roles.controller.ts
├── roles.service.ts
└── dto/
    ├── create-role.dto.ts
    ├── update-role.dto.ts
    └── assign-permissions.dto.ts
```

### Branches Module
```
src/branches/
├── branches.module.ts
├── branches.controller.ts
├── branches.service.ts
└── dto/
    ├── create-branch.dto.ts
    └── update-branch.dto.ts
```

### Products Module
```
src/products/
├── products.module.ts
├── products.controller.ts
├── products.service.ts
└── dto/
    ├── create-product.dto.ts
    ├── update-product.dto.ts
    └── product-response.dto.ts
```

### Categories Module
```
src/categories/
├── categories.module.ts
├── categories.controller.ts
├── categories.service.ts
└── dto/
    ├── create-category.dto.ts
    └── update-category.dto.ts
```

### Units Module
```
src/units/
├── units.module.ts
├── units.controller.ts
├── units.service.ts
└── dto/
    ├── create-unit.dto.ts
    └── update-unit.dto.ts
```

### Contacts Module
```
src/contacts/
├── contacts.module.ts
├── contacts.controller.ts
├── contacts.service.ts
└── dto/
    ├── create-contact.dto.ts
    ├── update-contact.dto.ts
    └── contact-response.dto.ts
```

---

## ✅ Acceptance Criteria

### Functional
- ✅ All CRUD operations working
- ✅ Permission checks working
- ✅ Branch context working
- ✅ Validation working
- ✅ File uploads working (products, contacts)
- ✅ Search functionality working

### Non-Functional
- ✅ Code follows NestJS best practices
- ✅ DTOs validated
- ✅ Error handling implemented
- ✅ Tests written (>80% coverage)
- ✅ Documentation updated

---

## 🧪 Testing Checklist

### Unit Tests
- [ ] Users service tests
- [ ] Roles service tests
- [ ] Branches service tests
- [ ] Products service tests
- [ ] Categories service tests
- [ ] Units service tests
- [ ] Contacts service tests

### Integration Tests
- [ ] Users CRUD flow
- [ ] Roles CRUD + permission assignment
- [ ] Branches CRUD + context
- [ ] Products CRUD + media upload
- [ ] Categories CRUD
- [ ] Units CRUD
- [ ] Contacts CRUD + attachments

### E2E Tests
- [ ] Create user → assign role → check permissions
- [ ] Create product → upload images → view product
- [ ] Create contact → upload attachment → view contact

---

## 📝 API Endpoints to Implement

### Users
```
GET    /api/users              # List users
GET    /api/users/:id          # Get user
POST   /api/users              # Create user
PUT    /api/users/:id          # Update user
DELETE /api/users/:id          # Delete user
POST   /api/users/:id/suspend  # Suspend user
POST   /api/users/:id/activate # Activate user
```

### Roles
```
GET    /api/roles                    # List roles
GET    /api/roles/:id                # Get role
POST   /api/roles                    # Create role
PUT    /api/roles/:id                # Update role
DELETE /api/roles/:id                # Delete role
GET    /api/roles/:id/permissions    # Get role permissions
POST   /api/roles/:id/permissions    # Assign permissions
```

### Branches
```
GET    /api/branches           # List branches
GET    /api/branches/:id       # Get branch
POST   /api/branches           # Create branch
PUT    /api/branches/:id       # Update branch
POST   /api/branches/:id/disable # Disable branch
POST   /api/branches/:id/enable  # Enable branch
POST   /api/branches/set-context # Set branch context
```

### Products
```
GET    /api/products           # List products
GET    /api/products/:id      # Get product
POST   /api/products           # Create product
PUT    /api/products/:id      # Update product
DELETE /api/products/:id       # Delete product
GET    /api/products/search    # Search products
POST   /api/products/:id/media # Upload media
DELETE /api/products/:id/media/:mediaId # Delete media
```

### Categories
```
GET    /api/categories         # List categories
GET    /api/categories/:id     # Get category
POST   /api/categories         # Create category
PUT    /api/categories/:id     # Update category
DELETE /api/categories/:id     # Delete category
```

### Units
```
GET    /api/units              # List units
GET    /api/units/:id          # Get unit
POST   /api/units              # Create unit
PUT    /api/units/:id          # Update unit
DELETE /api/units/:id         # Delete unit
```

### Contacts
```
GET    /api/contacts           # List contacts
GET    /api/contacts/:id       # Get contact
POST   /api/contacts           # Create contact
PUT    /api/contacts/:id       # Update contact
DELETE /api/contacts/:id       # Delete contact
GET    /api/contacts/search-tax-id # Search by tax ID
GET    /api/contacts/search-phone  # Search by phone
POST   /api/contacts/:id/attachments # Upload attachment
DELETE /api/contacts/:id/attachments/:attachmentId # Delete attachment
```

---

## 🚨 Common Issues & Solutions

### Issue 1: Permission Check Failing
**Solution:**
- Verify user has correct roles
- Check role has correct permissions
- Verify guard is applied correctly

### Issue 2: Branch Context Not Working
**Solution:**
- Check middleware is applied
- Verify branch_id in request
- Check user has access to branch

### Issue 3: File Upload Failing
**Solution:**
- Check multer configuration
- Verify file size limits
- Check upload directory permissions

---

## 📊 Progress Tracking

### Week 3
- **Day 1:** Users + Roles modules
- **Day 2:** Permissions + Branches modules
- **Day 3:** Products module (part 1)
- **Day 4:** Products module (part 2) + Categories
- **Day 5:** Units + Contacts modules

### Week 4
- **Day 1:** Testing + Bug fixes
- **Day 2:** Documentation
- **Day 3:** Code review
- **Day 4:** Integration testing
- **Day 5:** Phase 2 completion review

---

## 🎯 Definition of Done

Phase 2 is complete when:
- ✅ All modules implemented
- ✅ All CRUD operations working
- ✅ Permission checks working
- ✅ Branch context working
- ✅ All tests passing
- ✅ Documentation updated
- ✅ Ready for Phase 3

---

## 🔗 Related Documents

- `../docs/CODE_EXAMPLES.md` - Code examples
- `../MASTER_PLAN.md` - Overall plan
- `PHASE_1_SETUP.md` - Previous phase

---

## ⏭️ Next Phase

After completing Phase 2, proceed to:
**Phase 3: Inventory & Stock Management** (`PHASE_3_INVENTORY.md`)

---

**Status:** ⏸️ Pending  
**Ready to Start:** After Phase 1 complete  
**Blockers:** None

