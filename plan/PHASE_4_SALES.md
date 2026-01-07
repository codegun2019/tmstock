# 💰 Phase 4: Sales & POS

**Duration:** Week 7-8  
**Status:** ⏸️ Pending  
**Priority:** 🔴 Critical  
**Depends on:** Phase 3

---

## 🎯 เป้าหมาย

Migrate POS and sales system: POS operations, Invoice creation, Receipt generation, Void/Refund functionality

---

## 📋 Tasks Checklist

### 1. POS Module
- [ ] Create POS module
- [ ] Create POS service
- [ ] Create POS controller
- [ ] Implement barcode scanning
- [ ] Implement quick product creation
- [ ] Implement cart management
- [ ] Add permission checks
- [ ] Write tests

**Estimated Time:** 6 hours

---

### 2. Invoices Module
- [ ] Create Invoice entity
- [ ] Create InvoiceItem entity
- [ ] Create Invoices module
- [ ] Create Invoices service
- [ ] Create Invoices controller
- [ ] Create DTOs
- [ ] Implement invoice creation
- [ ] Implement stock deduction on sale
- [ ] Implement invoice update
- [ ] Implement invoice search/filter
- [ ] Add permission checks
- [ ] Write tests

**Estimated Time:** 10 hours

---

### 3. Invoice Sequences
- [ ] Integrate InvoiceSequence service
- [ ] Implement invoice number generation
- [ ] Test sequence generation
- [ ] Write tests

**Estimated Time:** 2 hours

---

### 4. Receipt Generation
- [ ] Create receipt template
- [ ] Implement receipt generation
- [ ] Implement print functionality
- [ ] Implement reprint functionality
- [ ] Add permission checks
- [ ] Write tests

**Estimated Time:** 4 hours

---

### 5. Void/Refund Functionality
- [ ] Implement void invoice
- [ ] Implement refund invoice
- [ ] Implement stock reversal
- [ ] Implement reason requirement
- [ ] Add audit logging
- [ ] Add permission checks
- [ ] Write tests

**Estimated Time:** 6 hours

---

### 6. Payment Processing
- [ ] Implement payment recording
- [ ] Implement multiple payment methods
- [ ] Implement change calculation
- [ ] Implement customer transaction creation
- [ ] Write tests

**Estimated Time:** 4 hours

---

## 📁 Files to Create

### POS Module
```
src/pos/
├── pos.module.ts
├── pos.controller.ts
├── pos.service.ts
└── dto/
    ├── scan-barcode.dto.ts
    └── quick-create-product.dto.ts
```

### Invoices Module
```
src/invoices/
├── invoices.module.ts
├── invoices.controller.ts
├── invoices.service.ts
└── dto/
    ├── create-invoice.dto.ts
    ├── update-invoice.dto.ts
    ├── invoice-item.dto.ts
    └── void-refund.dto.ts
```

### Receipt Module
```
src/receipts/
├── receipts.module.ts
├── receipts.controller.ts
└── receipts.service.ts
```

---

## ✅ Acceptance Criteria

### Functional
- ✅ POS barcode scanning working
- ✅ Invoice creation working
- ✅ Stock deduction on sale working
- ✅ Receipt generation working
- ✅ Void/Refund working
- ✅ Stock reversal on void/refund working
- ✅ Payment processing working

### Non-Functional
- ✅ Transaction safety
- ✅ Proper error handling
- ✅ Audit logging
- ✅ Tests written (>80% coverage)

---

## 🧪 Testing Checklist

### Unit Tests
- [ ] POS service tests
- [ ] Invoices service tests
- [ ] Receipt service tests
- [ ] Void/Refund service tests

### Integration Tests
- [ ] POS flow (scan → add to cart → checkout)
- [ ] Invoice creation → stock deduction
- [ ] Void invoice → stock reversal
- [ ] Refund invoice → stock reversal

### E2E Tests
- [ ] Complete POS flow (scan → checkout → receipt)
- [ ] Void invoice flow
- [ ] Refund invoice flow

---

## 📝 API Endpoints to Implement

### POS
```
GET    /api/pos/scan              # Scan barcode
POST   /api/pos/scan              # Scan barcode (POST)
POST   /api/pos/quick-create      # Quick create product
```

### Invoices
```
GET    /api/invoices              # List invoices
GET    /api/invoices/:id          # Get invoice
POST   /api/invoices              # Create invoice
PUT    /api/invoices/:id         # Update invoice
POST   /api/invoices/:id/void     # Void invoice
POST   /api/invoices/:id/refund   # Refund invoice
```

### Receipts
```
GET    /api/receipts/:invoiceId   # Get receipt
POST   /api/receipts/:invoiceId/print # Print receipt
```

---

## 🔒 Critical Rules

### Invoice Creation
- ✅ **ต้องตัดสต็อคทันที**
- ✅ **ต้องสร้าง invoice number**
- ✅ **ต้องบันทึก payment**
- ✅ **ต้องสร้าง customer transaction (ถ้ามี)**

### Void/Refund
- ✅ **ต้องมีเหตุผล (required)**
- ✅ **ต้อง reverse stock**
- ✅ **ต้องบันทึก audit log**
- ✅ **ต้องมี permission**

---

## 🚨 Common Issues & Solutions

### Issue 1: Stock Not Deducted
**Solution:**
- Check Inventory::sale() called
- Verify transaction commit
- Check stock_moves record

### Issue 2: Invoice Number Duplicate
**Solution:**
- Check sequence generation
- Verify thread-safety
- Check database constraints

### Issue 3: Void/Refund Not Reversing Stock
**Solution:**
- Check Inventory::returnStock() called
- Verify transaction commit
- Check stock_moves record

---

## 📊 Progress Tracking

### Week 7
- **Day 1:** POS module
- **Day 2:** Invoices module (part 1)
- **Day 3:** Invoices module (part 2)
- **Day 4:** Receipt generation
- **Day 5:** Void/Refund functionality

### Week 8
- **Day 1:** Payment processing
- **Day 2:** Testing + Bug fixes
- **Day 3:** Documentation
- **Day 4:** Code review
- **Day 5:** Phase 4 completion review

---

## 🎯 Definition of Done

Phase 4 is complete when:
- ✅ POS working
- ✅ Invoice creation working
- ✅ Stock deduction working
- ✅ Receipt generation working
- ✅ Void/Refund working
- ✅ All tests passing
- ✅ Documentation updated
- ✅ Ready for Phase 5

---

## 🔗 Related Documents

- `../docs/CODE_EXAMPLES.md` - Code examples
- `../MASTER_PLAN.md` - Overall plan
- `PHASE_3_INVENTORY.md` - Previous phase

---

## ⏭️ Next Phase

After completing Phase 4, proceed to:
**Phase 5: Additional Modules** (`PHASE_5_ADDITIONAL.md`)

---

**Status:** ⏸️ Pending  
**Ready to Start:** After Phase 3 complete  
**Blockers:** None

