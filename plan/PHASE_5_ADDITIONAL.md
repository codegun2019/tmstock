# 🔧 Phase 5: Additional Modules

**Duration:** Week 9-10  
**Status:** ⏸️ Pending  
**Priority:** 🟡 Medium  
**Depends on:** Phase 4

---

## 🎯 เป้าหมาย

Migrate remaining modules: Repairs, Documents, Reports, Settings, Backup, Accounts Receivable, Feature Toggles, Audit Logs

---

## 📋 Tasks Checklist

### 1. Repairs Module
- [ ] Create RepairOrder entity
- [ ] Create RepairItem entity
- [ ] Create RepairImage entity
- [ ] Create RepairStatusHistory entity
- [ ] Create Repairs module
- [ ] Create Repairs service
- [ ] Create Repairs controller
- [ ] Create DTOs
- [ ] Implement repair creation
- [ ] Implement status tracking
- [ ] Implement spare parts usage (stock deduction)
- [ ] Implement payment processing
- [ ] Implement invoice creation
- [ ] Implement image upload
- [ ] Add permission checks
- [ ] Write tests

**Estimated Time:** 10 hours

---

### 2. Documents Module
- [ ] Create Document entity
- [ ] Create DocumentItem entity
- [ ] Create Documents module
- [ ] Create Documents service
- [ ] Create Documents controller
- [ ] Create DTOs
- [ ] Implement document creation
- [ ] Implement document issuance
- [ ] Implement document cancellation
- [ ] Implement document printing
- [ ] Integrate DocumentSequence service
- [ ] Add permission checks
- [ ] Write tests

**Estimated Time:** 8 hours

---

### 3. Reports Module
- [ ] Create Reports module
- [ ] Create Reports service
- [ ] Create Reports controller
- [ ] Implement daily report
- [ ] Implement monthly report
- [ ] Implement yearly report
- [ ] Implement sales report
- [ ] Implement inventory report
- [ ] Implement financial report
- [ ] Implement export functionality (CSV/Excel)
- [ ] Add permission checks
- [ ] Write tests

**Estimated Time:** 10 hours

---

### 4. Settings Module
- [ ] Create Setting entity (if not exists)
- [ ] Create Settings module
- [ ] Create Settings service
- [ ] Create Settings controller
- [ ] Create DTOs
- [ ] Implement settings CRUD
- [ ] Implement batch update
- [ ] Implement category filtering
- [ ] Add permission checks
- [ ] Write tests

**Estimated Time:** 5 hours

---

### 5. Backup Module
- [ ] Create BackupHistory entity
- [ ] Create RestoreHistory entity
- [ ] Create Backup module
- [ ] Create Backup service
- [ ] Create Backup controller
- [ ] Create DTOs
- [ ] Implement full backup
- [ ] Implement database backup
- [ ] Implement restore functionality
- [ ] Implement backup download
- [ ] Implement backup deletion
- [ ] Add permission checks
- [ ] Write tests

**Estimated Time:** 8 hours

---

### 6. Accounts Receivable Module
- [ ] Create CustomerTransaction entity (if not exists)
- [ ] Create AccountsReceivable module
- [ ] Create AccountsReceivable service
- [ ] Create AccountsReceivable controller
- [ ] Create DTOs
- [ ] Implement receivables list
- [ ] Implement payment recording
- [ ] Implement receivables summary
- [ ] Implement overdue detection
- [ ] Add permission checks
- [ ] Write tests

**Estimated Time:** 6 hours

---

### 7. Feature Toggles Module
- [ ] Create FeatureToggle entity (if not exists)
- [ ] Create FeatureToggles module
- [ ] Create FeatureToggles service
- [ ] Create FeatureToggles controller
- [ ] Create DTOs
- [ ] Implement toggle CRUD
- [ ] Implement scope-based toggles (global/branch/role)
- [ ] Integrate with guards
- [ ] Add permission checks
- [ ] Write tests

**Estimated Time:** 5 hours

---

### 8. Audit Logs Module
- [ ] Create AuditLog entity (if not exists)
- [ ] Create AuditLogs module
- [ ] Create AuditLogs service
- [ ] Create AuditLogs controller
- [ ] Create DTOs
- [ ] Implement audit log list
- [ ] Implement filtering
- [ ] Implement search
- [ ] Implement export
- [ ] Add permission checks
- [ ] Write tests

**Estimated Time:** 4 hours

---

## 📁 Files to Create

### Repairs Module
```
src/repairs/
├── repairs.module.ts
├── repairs.controller.ts
├── repairs.service.ts
└── dto/
    ├── create-repair.dto.ts
    ├── update-repair.dto.ts
    └── change-status.dto.ts
```

### Documents Module
```
src/documents/
├── documents.module.ts
├── documents.controller.ts
├── documents.service.ts
└── dto/
    ├── create-document.dto.ts
    └── issue-document.dto.ts
```

### Reports Module
```
src/reports/
├── reports.module.ts
├── reports.controller.ts
├── reports.service.ts
└── dto/
    └── report-query.dto.ts
```

### Settings Module
```
src/settings/
├── settings.module.ts
├── settings.controller.ts
├── settings.service.ts
└── dto/
    ├── create-setting.dto.ts
    └── update-setting.dto.ts
```

### Backup Module
```
src/backup/
├── backup.module.ts
├── backup.controller.ts
├── backup.service.ts
└── dto/
    └── backup-request.dto.ts
```

### Accounts Receivable Module
```
src/accounts-receivable/
├── accounts-receivable.module.ts
├── accounts-receivable.controller.ts
├── accounts-receivable.service.ts
└── dto/
    └── record-payment.dto.ts
```

### Feature Toggles Module
```
src/feature-toggles/
├── feature-toggles.module.ts
├── feature-toggles.controller.ts
├── feature-toggles.service.ts
└── dto/
    └── toggle-setting.dto.ts
```

### Audit Logs Module
```
src/audit-logs/
├── audit-logs.module.ts
├── audit-logs.controller.ts
└── audit-logs.service.ts
```

---

## ✅ Acceptance Criteria

### Functional
- ✅ All modules implemented
- ✅ All CRUD operations working
- ✅ All integrations working
- ✅ Reports generating correctly
- ✅ Backup/Restore working
- ✅ Feature toggles working
- ✅ Audit logs working

### Non-Functional
- ✅ Code follows NestJS best practices
- ✅ Tests written (>80% coverage)
- ✅ Documentation updated
- ✅ Performance optimized

---

## 🧪 Testing Checklist

### Unit Tests
- [ ] Repairs service tests
- [ ] Documents service tests
- [ ] Reports service tests
- [ ] Settings service tests
- [ ] Backup service tests
- [ ] Accounts Receivable service tests
- [ ] Feature Toggles service tests
- [ ] Audit Logs service tests

### Integration Tests
- [ ] Repair creation → stock deduction
- [ ] Document creation → sequence generation
- [ ] Report generation
- [ ] Backup creation → restore
- [ ] Payment recording → receivables update

### E2E Tests
- [ ] Complete repair flow
- [ ] Complete document flow
- [ ] Report generation flow
- [ ] Backup → restore flow

---

## 📝 API Endpoints to Implement

### Repairs
```
GET    /api/repairs               # List repairs
GET    /api/repairs/:id          # Get repair
POST   /api/repairs               # Create repair
PUT    /api/repairs/:id          # Update repair
POST   /api/repairs/:id/change-status # Change status
POST   /api/repairs/:id/process-payment # Process payment
POST   /api/repairs/:id/cancel   # Cancel repair
```

### Documents
```
GET    /api/documents             # List documents
GET    /api/documents/:id        # Get document
POST   /api/documents             # Create document
PUT    /api/documents/:id        # Update document
POST   /api/documents/:id/issue   # Issue document
POST   /api/documents/:id/cancel  # Cancel document
```

### Reports
```
GET    /api/reports/daily        # Daily report
GET    /api/reports/monthly      # Monthly report
GET    /api/reports/yearly       # Yearly report
GET    /api/reports/sales        # Sales report
GET    /api/reports/inventory    # Inventory report
GET    /api/reports/financial    # Financial report
GET    /api/reports/export       # Export report
```

### Settings
```
GET    /api/settings             # List settings
GET    /api/settings/:id         # Get setting
POST   /api/settings             # Create setting
PUT    /api/settings/:id         # Update setting
DELETE /api/settings/:id         # Delete setting
POST   /api/settings/batch       # Batch update
```

### Backup
```
GET    /api/backup               # List backups
POST   /api/backup/full         # Create full backup
POST   /api/backup/database     # Create database backup
POST   /api/backup/restore       # Restore backup
DELETE /api/backup/:id          # Delete backup
GET    /api/backup/:id/download # Download backup
```

### Accounts Receivable
```
GET    /api/accounts-receivable  # List receivables
POST   /api/accounts-receivable/record-payment # Record payment
GET    /api/accounts-receivable/summary # Get summary
```

### Feature Toggles
```
GET    /api/feature-toggles      # List toggles
POST   /api/feature-toggles      # Set toggle
DELETE /api/feature-toggles      # Delete toggle
```

### Audit Logs
```
GET    /api/audit-logs           # List logs
GET    /api/audit-logs/:id      # Get log
GET    /api/audit-logs/export   # Export logs
```

---

## 🚨 Common Issues & Solutions

### Issue 1: Report Generation Slow
**Solution:**
- Add database indexes
- Implement caching
- Optimize queries
- Use pagination

### Issue 2: Backup Too Large
**Solution:**
- Implement compression
- Split large backups
- Cleanup old backups
- Use streaming

### Issue 3: Feature Toggle Not Working
**Solution:**
- Check scope (global/branch/role)
- Verify guard integration
- Check cache
- Verify priority

---

## 📊 Progress Tracking

### Week 9
- **Day 1:** Repairs module
- **Day 2:** Documents module
- **Day 3:** Reports module (part 1)
- **Day 4:** Reports module (part 2)
- **Day 5:** Settings module

### Week 10
- **Day 1:** Backup module
- **Day 2:** Accounts Receivable module
- **Day 3:** Feature Toggles + Audit Logs modules
- **Day 4:** Testing + Bug fixes
- **Day 5:** Phase 5 completion review

---

## 🎯 Definition of Done

Phase 5 is complete when:
- ✅ All modules implemented
- ✅ All features working
- ✅ All tests passing
- ✅ Documentation updated
- ✅ Ready for Phase 6

---

## 🔗 Related Documents

- `../docs/CODE_EXAMPLES.md` - Code examples
- `../MASTER_PLAN.md` - Overall plan
- `PHASE_4_SALES.md` - Previous phase

---

## ⏭️ Next Phase

After completing Phase 5, proceed to:
**Phase 6: Testing & Optimization** (`PHASE_6_TESTING.md`)

---

**Status:** ⏸️ Pending  
**Ready to Start:** After Phase 4 complete  
**Blockers:** None

