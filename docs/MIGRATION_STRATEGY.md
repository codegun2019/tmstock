# 🔄 Migration Strategy - Strangler Pattern

**วันที่สร้าง:** 2025-01-XX  
**Version:** 5.0  
**Status:** 📋 Migration Strategy

---

## 🎯 Overview

Migration Strategy: ยกจาก PHP → NestJS แบบ **"ไม่หยุดระบบ"**

**แนวที่ปลอดภัยสุด:** **Strangler Pattern**

---

## 🏛️ Strangler Pattern

### Concept
**ค่อยๆ แทนที่ PHP ด้วย NestJS โดยไม่หยุดระบบ**

**Flow:**
```
Phase 1: PHP (100%) → NestJS (0%)
Phase 2: PHP (80%) → NestJS (20%)
Phase 3: PHP (50%) → NestJS (50%)
Phase 4: PHP (20%) → NestJS (80%)
Phase 5: PHP (0%) → NestJS (100%)
```

---

## 📋 Strategy Details

### 1. ใช้ Database เดิม
**Rule:** ไม่เปลี่ยน database schema

**Benefits:**
- ✅ No data migration needed
- ✅ Both systems can use same database
- ✅ Easy rollback
- ✅ No downtime

**Implementation:**
- NestJS ใช้ database เดิม
- TypeORM entities match existing schema
- No schema changes during migration

---

### 2. เริ่มทำ NestJS แค่บางโมดูลก่อน

**ลำดับที่แนะนำ:**

#### Phase 1: StockModule (ฐาน) ⭐
**Why First:**
- Core ของระบบ
- Modules อื่นต้องใช้
- Low risk (internal operations)

**Implementation:**
- สร้าง StockModule ใน NestJS
- PHP ยังใช้ Inventory.php
- NestJS และ PHP ใช้ database เดียวกัน

---

#### Phase 2: SalesModule (Phase 4) ⭐
**Why Second:**
- ใช้ StockModule
- Critical business logic
- High visibility

**Implementation:**
- สร้าง SalesModule ใน NestJS
- PHP ยังใช้ Invoice.php
- Test parallel running

---

#### Phase 3: UX Integration Endpoints (Phase 4.5) ⭐
**Why Third:**
- ใช้ SalesModule และ StockModule
- Frontend integration
- User-facing features

**Implementation:**
- สร้าง UX endpoints ใน NestJS
- Frontend calls NestJS APIs
- PHP APIs ยังทำงาน (fallback)

---

#### Phase 4: Products/Contacts UI
**Why Last:**
- Less critical
- Can migrate gradually
- Frontend can switch gradually

---

### 3. PHP ค่อยๆ โยนงานไป API NestJS

**Option 1: Reverse Proxy**
```
Frontend → Nginx → PHP (old) / NestJS (new)
```

**Configuration:**
```nginx
# Old PHP routes
location /admin/products {
  proxy_pass http://php-backend;
}

# New NestJS routes
location /api/products {
  proxy_pass http://nestjs-backend;
}
```

**Benefits:**
- ✅ Gradual migration
- ✅ Easy to switch
- ✅ No frontend changes needed

---

**Option 2: API Gateway**
```
Frontend → API Gateway → PHP / NestJS
```

**Benefits:**
- ✅ Centralized routing
- ✅ Easy to switch
- ✅ Load balancing

---

**Option 3: Feature Flags**
```
Frontend checks feature flag:
- If enabled → Call NestJS API
- If disabled → Call PHP API
```

**Benefits:**
- ✅ Gradual rollout
- ✅ Easy rollback
- ✅ A/B testing

---

## 📊 Migration Phases

### Phase 1: StockModule (Week 5-6)
**Status:** PHP + NestJS parallel

**PHP:**
- Inventory.php ยังทำงาน
- InventoryController ยังทำงาน

**NestJS:**
- StockModule สร้างเสร็จ
- StockService ทำงาน
- Test parallel running

**Switch Strategy:**
- Feature flag: `use_nestjs_stock`
- If enabled → Frontend calls NestJS
- If disabled → Frontend calls PHP

---

### Phase 2: SalesModule (Week 7-8)
**Status:** PHP + NestJS parallel

**PHP:**
- Invoice.php ยังทำงาน
- InvoiceController ยังทำงาน

**NestJS:**
- SalesModule สร้างเสร็จ
- InvoicesService ทำงาน
- Uses StockModule

**Switch Strategy:**
- Feature flag: `use_nestjs_sales`
- If enabled → Frontend calls NestJS
- If disabled → Frontend calls PHP

---

### Phase 3: UX Integration (Week 7-8 Part 2)
**Status:** NestJS only (new endpoints)

**NestJS:**
- UX endpoints สร้างเสร็จ
- Invoice detail with movements
- Product detail with tabs
- Stock movements with links

**Switch Strategy:**
- Frontend calls NestJS directly (new endpoints)
- No PHP equivalent

---

### Phase 4: Gradual Migration
**Status:** Migrate remaining modules

**Strategy:**
- Migrate one module at a time
- Test thoroughly
- Switch gradually
- Monitor for issues

---

## 🔄 Parallel Running Strategy

### Database Sharing
```
PHP Backend ──┐
              ├──→ MySQL Database (same)
NestJS Backend┘
```

**Rules:**
- ✅ Both use same database
- ✅ Both use same tables
- ✅ No schema conflicts
- ✅ Transaction isolation

---

### API Routing
```
Frontend
  ├─→ /api/products → NestJS (if enabled)
  └─→ /admin/products → PHP (if disabled)
```

**Implementation:**
- Feature flags control routing
- Easy to switch
- Easy to rollback

---

## 🚨 Risk Mitigation

### Risk 1: Data Conflicts
**Mitigation:**
- Use transactions
- Use row-level locking
- Monitor for conflicts

---

### Risk 2: Performance Issues
**Mitigation:**
- Load testing
- Performance monitoring
- Gradual rollout

---

### Risk 3: Feature Gaps
**Mitigation:**
- Feature checklist
- Testing
- User acceptance testing

---

## 📋 Migration Checklist

### Pre-Migration
- [ ] Backup database
- [ ] Setup NestJS environment
- [ ] Test database connection
- [ ] Create feature flags

### During Migration
- [ ] Migrate StockModule
- [ ] Test parallel running
- [ ] Migrate SalesModule
- [ ] Test integration
- [ ] Migrate UX endpoints
- [ ] Test frontend integration

### Post-Migration
- [ ] Monitor performance
- [ ] Monitor errors
- [ ] Gather user feedback
- [ ] Plan next phase

---

## 🎯 Success Criteria

### Functional
- ✅ All features working
- ✅ No data loss
- ✅ No downtime
- ✅ Easy rollback

### Non-Functional
- ✅ Performance ≥ PHP version
- ✅ No conflicts
- ✅ Stable operation

---

## 📚 Related Documents

- `MASTER_PLAN.md` - Overall plan
- `docs/MIGRATION_PLAN.md` - Detailed migration plan

---

**Status:** 📋 Migration Strategy Complete

**Last Updated:** 2025-01-XX

**⭐ Strangler Pattern = Safe Migration**

