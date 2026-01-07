# 📦 Phase 3: Inventory & Stock Management

**Duration:** Week 5-6  
**Status:** ⏸️ Pending  
**Priority:** 🔴 Critical  
**Depends on:** Phase 2

---

## 🎯 เป้าหมาย

Migrate inventory system: Stock balances, Stock movements, Sequence generators, GRN, Stock Adjustment, Stock Transfer

---

## 📋 Tasks Checklist

### 1. Inventory Core Module
- [ ] Create StockBalance entity
- [ ] Create StockMove entity
- [ ] Create Inventory module
- [ ] Create Inventory service
- [ ] Create Inventory controller
- [ ] Implement move() method (core stock movement)
- [ ] Implement sale() method
- [ ] Implement receive() method
- [ ] Implement adjust() method
- [ ] Implement transfer() method
- [ ] Implement returnStock() method
- [ ] Implement repairUsage() method
- [ ] Add transaction support
- [ ] Add negative stock guard
- [ ] Write tests

**Estimated Time:** 10 hours

---

### 2. Stock Movements View
- [ ] Create stock movements endpoint
- [ ] Implement filtering
- [ ] Implement pagination
- [ ] Add move type filtering
- [ ] Add date range filtering
- [ ] Write tests

**Estimated Time:** 3 hours

---

### 3. Sequence Generators
- [ ] Create Sequences module
- [ ] Create InvoiceSequence service
- [ ] Create GRNSequence service
- [ ] Create StockAdjustmentSequence service
- [ ] Create StockTransferSequence service
- [ ] Create DocumentSequence service
- [ ] Create RepairSequence service
- [ ] Implement thread-safe sequence generation
- [ ] Implement daily reset
- [ ] Write tests

**Estimated Time:** 8 hours

---

### 4. GRN Module (Goods Receipt Note)
- [ ] Create GRN entity
- [ ] Create GRNItem entity
- [ ] Create GRNAttachment entity
- [ ] Create GRNSequence entity
- [ ] Create GRN module
- [ ] Create GRN service
- [ ] Create GRN controller
- [ ] Create DTOs
- [ ] Implement GRN creation
- [ ] Implement stock update on GRN
- [ ] Implement cost price update
- [ ] Implement GRN cancellation
- [ ] Implement file upload
- [ ] Add permission checks
- [ ] Write tests

**Estimated Time:** 10 hours

---

### 5. Stock Adjustment Module
- [ ] Create StockAdjustment entity
- [ ] Create StockAdjustmentItem entity
- [ ] Create StockAdjustmentAttachment entity
- [ ] Create StockAdjustmentSequence entity
- [ ] Create StockAdjustment module
- [ ] Create StockAdjustment service
- [ ] Create StockAdjustment controller
- [ ] Create DTOs
- [ ] Implement adjustment creation
- [ ] Implement approval workflow
- [ ] Implement stock update on approval
- [ ] Implement adjustment types (increase/decrease/set_to)
- [ ] Implement file upload
- [ ] Add detailed audit logging
- [ ] Add permission checks
- [ ] Write tests

**Estimated Time:** 10 hours

---

### 6. Stock Transfer Module
- [ ] Create StockTransfer entity
- [ ] Create StockTransferItem entity
- [ ] Create StockTransferSequence entity
- [ ] Create StockTransfer module
- [ ] Create StockTransfer service
- [ ] Create StockTransfer controller
- [ ] Create DTOs
- [ ] Implement transfer creation
- [ ] Implement approval workflow
- [ ] Implement stock update on transfer
- [ ] Implement transfer status tracking
- [ ] Add permission checks
- [ ] Write tests

**Estimated Time:** 8 hours

---

## 📁 Files to Create

### Inventory Module
```
src/inventory/
├── inventory.module.ts
├── inventory.controller.ts
├── inventory.service.ts
└── dto/
    ├── move-stock.dto.ts
    ├── receive-stock.dto.ts
    ├── adjust-stock.dto.ts
    └── transfer-stock.dto.ts
```

### Sequences Module
```
src/sequences/
├── sequences.module.ts
├── invoice-sequence.service.ts
├── grn-sequence.service.ts
├── stock-adjustment-sequence.service.ts
├── stock-transfer-sequence.service.ts
├── document-sequence.service.ts
└── repair-sequence.service.ts
```

### GRN Module
```
src/grn/
├── grn.module.ts
├── grn.controller.ts
├── grn.service.ts
└── dto/
    ├── create-grn.dto.ts
    └── grn-item.dto.ts
```

### Stock Adjustment Module
```
src/stock-adjustment/
├── stock-adjustment.module.ts
├── stock-adjustment.controller.ts
├── stock-adjustment.service.ts
└── dto/
    ├── create-adjustment.dto.ts
    └── adjustment-item.dto.ts
```

### Stock Transfer Module
```
src/stock-transfer/
├── stock-transfer.module.ts
├── stock-transfer.controller.ts
├── stock-transfer.service.ts
└── dto/
    ├── create-transfer.dto.ts
    └── transfer-item.dto.ts
```

---

## ✅ Acceptance Criteria

### Functional
- ✅ Stock movements working correctly
- ✅ Stock balances updated correctly
- ✅ Sequence generation working (thread-safe)
- ✅ GRN creation and stock update working
- ✅ Stock adjustment with approval workflow working
- ✅ Stock transfer between branches working
- ✅ Negative stock guard working
- ✅ Transaction rollback working

### Non-Functional
- ✅ Thread-safe sequence generation
- ✅ Proper transaction handling
- ✅ Detailed audit logging
- ✅ Performance optimized
- ✅ Tests written (>80% coverage)

---

## 🧪 Testing Checklist

### Unit Tests
- [ ] Inventory service tests
- [ ] Sequence generator tests
- [ ] GRN service tests
- [ ] Stock Adjustment service tests
- [ ] Stock Transfer service tests

### Integration Tests
- [ ] Stock movement flow (sale → receive → adjust)
- [ ] Sequence generation (concurrent requests)
- [ ] GRN creation → stock update
- [ ] Stock adjustment → approval → stock update
- [ ] Stock transfer → approval → stock update

### E2E Tests
- [ ] Create GRN → verify stock updated
- [ ] Create adjustment → approve → verify stock updated
- [ ] Create transfer → approve → verify stock updated

---

## 📝 API Endpoints to Implement

### Inventory
```
GET    /api/inventory/balance        # Get stock balance
GET    /api/inventory/moves          # Get stock movements
POST   /api/inventory/receive        # Receive stock
POST   /api/inventory/adjust         # Adjust stock
POST   /api/inventory/transfer       # Transfer stock
POST   /api/inventory/approve        # Approve stock move
```

### Sequences
```
GET    /api/sequences/invoice/generate    # Generate invoice number
GET    /api/sequences/grn/generate       # Generate GRN number
GET    /api/sequences/adjustment/generate # Generate adjustment number
GET    /api/sequences/transfer/generate  # Generate transfer number
```

### GRN
```
GET    /api/grn                 # List GRNs
GET    /api/grn/:id            # Get GRN
POST   /api/grn                # Create GRN
POST   /api/grn/:id/cancel     # Cancel GRN
POST   /api/grn/:id/attachments # Upload attachment
```

### Stock Adjustment
```
GET    /api/stock-adjustments          # List adjustments
GET    /api/stock-adjustments/:id      # Get adjustment
POST   /api/stock-adjustments          # Create adjustment
POST   /api/stock-adjustments/:id/approve # Approve adjustment
POST   /api/stock-adjustments/:id/reject  # Reject adjustment
```

### Stock Transfer
```
GET    /api/stock-transfers            # List transfers
GET    /api/stock-transfers/:id        # Get transfer
POST   /api/stock-transfers            # Create transfer
POST   /api/stock-transfers/:id/approve # Approve transfer
POST   /api/stock-transfers/:id/receive # Receive transfer
```

---

## 🔒 Critical Rules

### Stock Movement Ledger
- ✅ **ทุกการเปลี่ยนสต็อคต้องผ่าน Inventory::move()**
- ✅ **ห้ามแก้ stock_balances โดยตรง**
- ✅ **ทุก movement สร้าง stock_moves record**

### Sequence Generation
- ✅ **Thread-safe (row-level locking)**
- ✅ **Daily reset**
- ✅ **Unique numbers**

### Approval Workflow
- ✅ **GRN/Adjustment/Transfer ต้อง approve ก่อนตัดสต็อค**
- ✅ **บันทึก approver info**
- ✅ **Audit log ละเอียด**

---

## 🚨 Common Issues & Solutions

### Issue 1: Race Condition in Sequence Generation
**Solution:**
- Use row-level locking (SELECT ... FOR UPDATE)
- Use transactions
- Test with concurrent requests

### Issue 2: Stock Balance Not Updated
**Solution:**
- Check transaction commit
- Verify Inventory::move() called
- Check stock_moves record created

### Issue 3: Negative Stock Allowed
**Solution:**
- Check negative stock guard
- Verify allow_negative flag
- Check feature toggle

---

## 📊 Progress Tracking

### Week 5
- **Day 1:** Inventory core module
- **Day 2:** Sequence generators
- **Day 3:** GRN module (part 1)
- **Day 4:** GRN module (part 2)
- **Day 5:** Stock Adjustment module (part 1)

### Week 6
- **Day 1:** Stock Adjustment module (part 2)
- **Day 2:** Stock Transfer module
- **Day 3:** Testing + Bug fixes
- **Day 4:** Documentation
- **Day 5:** Phase 3 completion review

---

## 🎯 Definition of Done

Phase 3 is complete when:
- ✅ All inventory modules implemented
- ✅ Stock movements working correctly
- ✅ Sequence generators working (thread-safe)
- ✅ GRN/Adjustment/Transfer working
- ✅ All tests passing
- ✅ Documentation updated
- ✅ Ready for Phase 4

---

## 🔗 Related Documents

- `../docs/CODE_EXAMPLES.md` - Code examples
- `../MASTER_PLAN.md` - Overall plan
- `PHASE_2_CORE_MODULES.md` - Previous phase

---

## ⏭️ Next Phase

After completing Phase 3, proceed to:
**Phase 4: Sales & POS** (`PHASE_4_SALES.md`)

---

**Status:** ⏸️ Pending  
**Ready to Start:** After Phase 2 complete  
**Blockers:** None

