# 📊 Module Mapping - PHP → NestJS

**วันที่สร้าง:** 2025-01-XX  
**Version:** 5.0  
**Status:** 📋 Module Mapping Reference

---

## 🎯 Overview

Mapping จาก PHP Controllers/Models → NestJS Modules

**สำคัญ:** Modules แยกกัน แต่เชื่อมด้วย service injection + ref_type/ref_id

---

## 📋 Core Modules

### AuthModule
**PHP Equivalent:** `AuthController`, `Auth.php`

**NestJS Structure:**
```
AuthModule
├── AuthController
│   ├── POST /auth/login
│   ├── POST /auth/logout
│   └── GET /auth/me
├── AuthService
│   ├── validateUser()
│   ├── login()
│   └── validateToken()
└── Strategies/
    └── JwtStrategy
```

**Dependencies:**
- UsersModule (for user validation)
- JwtModule

**Exports:**
- AuthService (for other modules)

---

### UsersModule
**PHP Equivalent:** `UsersController`, `User.php`

**NestJS Structure:**
```
UsersModule
├── UsersController
│   ├── GET /users
│   ├── GET /users/:id
│   ├── POST /users
│   ├── PUT /users/:id
│   └── DELETE /users/:id
├── UsersService
│   ├── findAll()
│   ├── findOne()
│   ├── create()
│   ├── update()
│   └── remove()
└── DTOs/
    ├── CreateUserDto
    └── UpdateUserDto
```

**Dependencies:**
- RolesModule (for role assignment)
- BranchesModule (for branch assignment)

**Exports:**
- UsersService (for AuthModule)

---

### RolesModule
**PHP Equivalent:** `RolesController`, `Role.php`

**NestJS Structure:**
```
RolesModule
├── RolesController
│   ├── GET /roles
│   ├── GET /roles/:id
│   ├── POST /roles
│   ├── PUT /roles/:id
│   └── POST /roles/:id/permissions
├── RolesService
│   ├── findAll()
│   ├── findOne()
│   ├── create()
│   ├── update()
│   └── assignPermissions()
└── DTOs/
    └── AssignPermissionsDto
```

**Dependencies:**
- PermissionsModule

**Exports:**
- RolesService (for UsersModule)

---

### BranchesModule
**PHP Equivalent:** `BranchController`, `Branch.php`

**NestJS Structure:**
```
BranchesModule
├── BranchesController
│   ├── GET /branches
│   ├── GET /branches/:id
│   ├── POST /branches
│   ├── PUT /branches/:id
│   └── POST /branches/set-context
├── BranchesService
│   ├── findAll()
│   ├── findOne()
│   ├── create()
│   └── update()
└── DTOs/
    └── CreateBranchDto
```

**Dependencies:**
- None (standalone)

**Exports:**
- BranchesService (for other modules)

---

## 📦 Domain Modules

### ProductsModule
**PHP Equivalent:** `ProductsController`, `Product.php`

**NestJS Structure:**
```
ProductsModule
├── ProductsController
│   ├── GET /products
│   ├── GET /products/:id
│   ├── GET /products/:id/detail ⭐
│   ├── POST /products
│   ├── PUT /products/:id
│   └── GET /products/search
├── ProductsService
│   ├── findAll() // ⭐ Includes stock_quantity
│   ├── findOne() // ⭐ Includes stock_quantity
│   ├── findByBarcode() // ⭐ Includes stock_quantity
│   ├── getDetail() // ⭐ Stock + Sales + Movements
│   ├── create()
│   └── update()
└── DTOs/
    ├── CreateProductDto
    └── ProductResponseDto // ⭐ Includes stock_quantity
```

**Dependencies:**
- StockModule ⭐ (for stock queries)
- CategoriesModule (for category validation)
- UnitsModule (for unit validation)

**Exports:**
- ProductsService (for POSModule, SalesModule)

**Integration Points:**
- ⭐ **ต้อง inject StockService** เพื่อ query stock
- ⭐ **ทุก method ที่ return product ต้อง include stock_quantity**

---

### StockModule (Inventory)
**PHP Equivalent:** `InventoryController`, `Inventory.php`

**NestJS Structure:**
```
StockModule
├── StockController
│   ├── GET /stock/balance
│   ├── GET /stock/movements
│   ├── GET /stock/movements/:id ⭐
│   ├── POST /stock/receive
│   ├── POST /stock/adjust
│   └── POST /stock/transfer
├── StockService (InventoryService)
│   ├── move() ⭐ Core method
│   ├── sale() ⭐ For invoices
│   ├── receive() ⭐ For GRN
│   ├── returnStock() ⭐ For refunds
│   ├── adjust() ⭐ For adjustments
│   ├── getBalance() ⭐ For products
│   └── getMoves() ⭐ With reference linking
└── DTOs/
    ├── MoveStockDto
    └── StockMovementResponseDto // ⭐ Includes ref_type/ref_id
```

**Dependencies:**
- ProductsModule (for product validation)
- BranchesModule (for branch validation)
- FeatureTogglesModule (for negative stock check)

**Exports:**
- StockService ⭐ **CRITICAL - Used by Products, Sales**

**Integration Points:**
- ⭐ **ทุก movement ต้องมี reference_type และ reference_id**
- ⭐ **getMoves() ต้อง return reference info สำหรับ linking**

---

### SalesModule (POS/Invoice)
**PHP Equivalent:** `InvoiceController`, `PosController`, `Invoice.php`

**NestJS Structure:**
```
SalesModule
├── SalesController (POS)
│   ├── GET /pos/scan
│   └── POST /pos/quick-create
├── InvoicesController
│   ├── GET /invoices
│   ├── GET /invoices/:id
│   ├── GET /invoices/:id/detail ⭐
│   ├── POST /invoices
│   ├── POST /invoices/:id/void
│   └── POST /invoices/:id/refund
├── InvoicesService
│   ├── create() // ⭐ Calls stockService.sale()
│   ├── findOne()
│   ├── getDetail() // ⭐ Includes stock_movements
│   ├── void() // ⭐ Calls stockService.returnStock()
│   └── refund() // ⭐ Calls stockService.returnStock()
└── DTOs/
    ├── CreateInvoiceDto
    └── InvoiceDetailResponseDto // ⭐ Includes stock_movements
```

**Dependencies:**
- ProductsModule ⭐ (for product scan)
- StockModule ⭐ (for stock deduction/return)
- InvoiceSequenceModule (for invoice number)

**Exports:**
- InvoicesService (for other modules)

**Integration Points:**
- ⭐ **create() ต้องเรียก stockService.sale()**
- ⭐ **void()/refund() ต้องเรียก stockService.returnStock()**
- ⭐ **getDetail() ต้อง include stock_movements**

---

### ContactsModule
**PHP Equivalent:** `ContactsController`, `Contact.php`

**NestJS Structure:**
```
ContactsModule
├── ContactsController
│   ├── GET /contacts
│   ├── GET /contacts/:id
│   ├── POST /contacts
│   └── PUT /contacts/:id
├── ContactsService
│   ├── findAll()
│   ├── findOne()
│   ├── create()
│   └── update()
└── DTOs/
    └── CreateContactDto
```

**Dependencies:**
- None (standalone)

**Exports:**
- ContactsService (for SalesModule)

---

## 🔗 Module Integration Map

### ProductsModule ↔ StockModule
```
ProductsModule
  ↓ (imports)
StockModule
  ↓ (injects)
StockService
  ↓ (uses)
getBalance(productId, branchId)
  ↓ (returns)
stock_quantity
```

**Flow:**
- ProductsService injects StockService
- ProductsService.getDetail() calls StockService.getBalance()
- Product response includes stock_quantity

---

### SalesModule ↔ StockModule
```
SalesModule
  ↓ (imports)
StockModule
  ↓ (injects)
StockService
  ↓ (uses)
sale() / returnStock()
  ↓ (creates)
StockMove (with ref_type='invoice', ref_id=invoiceId)
```

**Flow:**
- InvoicesService injects StockService
- InvoicesService.create() calls StockService.sale()
- StockService.sale() creates movement with reference

---

### SalesModule ↔ ProductsModule
```
SalesModule
  ↓ (imports)
ProductsModule
  ↓ (injects)
ProductsService
  ↓ (uses)
findByBarcode() (includes stock)
```

**Flow:**
- POSController injects ProductsService
- POSController.scan() calls ProductsService.findByBarcode()
- Response includes product + stock_quantity

---

## 📊 Module Dependency Graph

```
AuthModule
  └─→ UsersModule

UsersModule
  └─→ RolesModule, BranchesModule

ProductsModule
  └─→ StockModule ⭐, CategoriesModule, UnitsModule

SalesModule
  └─→ ProductsModule ⭐, StockModule ⭐, InvoiceSequenceModule

StockModule
  └─→ ProductsModule, BranchesModule, FeatureTogglesModule
```

**⭐ = Critical integration points**

---

## 🔄 Cross-Module Communication

### Service Injection Pattern
```typescript
// ProductsModule imports StockModule
@Module({
  imports: [StockModule], // ⭐ Import
  providers: [ProductsService],
})
export class ProductsModule {}

// ProductsService injects StockService
@Injectable()
export class ProductsService {
  constructor(
    private stockService: StockService, // ⭐ Inject
  ) {}
}
```

### Reference Linking Pattern
```typescript
// StockService creates movement with reference
await this.stockService.sale(
  productId,
  quantity,
  invoiceId, // ⭐ reference_id
  branchId,
  userId,
);
// Creates: { reference_type: 'invoice', reference_id: invoiceId }

// SalesService queries movements by reference
const movements = await this.stockService.getMoves({
  reference_type: 'invoice',
  reference_id: invoiceId,
});
```

---

## ✅ Module Checklist

### Core Modules
- [ ] AuthModule
- [ ] UsersModule
- [ ] RolesModule
- [ ] PermissionsModule
- [ ] BranchesModule
- [ ] FeatureTogglesModule
- [ ] AuditLogsModule

### Domain Modules
- [ ] ProductsModule ⭐ (with StockModule integration)
- [ ] CategoriesModule
- [ ] UnitsModule
- [ ] ContactsModule
- [ ] StockModule ⭐ (exports StockService)
- [ ] SalesModule ⭐ (with StockModule + ProductsModule integration)
- [ ] GRNModule (if exists)
- [ ] StockAdjustmentModule (if exists)
- [ ] StockTransferModule (if exists)
- [ ] RepairsModule
- [ ] DocumentsModule
- [ ] ReportsModule
- [ ] SettingsModule
- [ ] BackupModule
- [ ] AccountsReceivableModule

---

## 🎯 Key Integration Rules

### Rule 1: Service Injection
- ✅ Modules แยกกัน (loose coupling)
- ✅ เชื่อมด้วย service injection (clear dependency)
- ✅ Export services ที่ modules อื่นใช้

### Rule 2: Reference Linking
- ✅ ทุก stock movement มี reference_type และ reference_id
- ✅ Reference เป็นสะพานลิงก์ระหว่าง modules
- ✅ Frontend ใช้ reference เพื่อ generate links

### Rule 3: Stock Integration
- ✅ ProductsModule injects StockModule
- ✅ SalesModule injects StockModule
- ✅ ทุก product query includes stock_quantity

---

## 📚 Related Documents

- `docs/TARGET_ARCHITECTURE.md` - Architecture details
- `docs/INTEGRATION_POINTS.md` - Integration points
- `INTEGRATION_SUMMARY.md` - Integration summary

---

**Status:** 📋 Module Mapping Complete

**Last Updated:** 2025-01-XX

