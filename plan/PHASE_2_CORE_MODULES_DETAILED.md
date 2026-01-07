# 👥 Phase 2: Core Business Modules (Detailed)

**Duration:** Week 3-4  
**Status:** ⏸️ Pending  
**Priority:** 🔴 Critical  
**Depends on:** Phase 1

---

## 🎯 เป้าหมาย

Migrate core business logic modules: Users, Roles, Permissions, Branches, Products, Categories, Units, Contacts

**สำคัญ:** ทุก module ต้องโยงกันและทำงานร่วมกันได้

---

## 🔗 System Integration Points

### 1. Products ↔ Inventory Integration
**ความสำคัญ:** สินค้าต้องแสดงสต็อคได้ทันที

**Integration Flow:**
```
Product Entity
  ↓ (has many)
StockBalance Entity (per branch)
  ↓ (has many)
StockMove Entity (movement history)
```

**Implementation:**
- Product entity มี relation กับ StockBalance
- Product service ต้อง inject InventoryService
- Product response DTO ต้องรวม stock_quantity
- Product detail endpoint ต้องแสดง stock by branch

---

### 2. Products ↔ Categories ↔ Units Integration
**ความสำคัญ:** สินค้าต้องมี category และ unit

**Integration Flow:**
```
Product Entity
  ↓ (belongs to)
Category Entity
  ↓ (has many)
Product Entity

Product Entity
  ↓ (belongs to)
Unit Entity
  ↓ (has many)
Product Entity
```

**Implementation:**
- Product entity มี relation กับ Category และ Unit
- Product DTOs ต้อง validate category_id และ unit_id
- Product service ต้อง validate category/unit exists

---

### 3. Products ↔ POS Integration
**ความสำคัญ:** POS ต้องสแกนสินค้าและแสดงสต็อคได้

**Integration Flow:**
```
POS Controller
  ↓ (calls)
Products Service (scan barcode)
  ↓ (returns)
Product + StockBalance
  ↓ (used by)
POS Cart
```

**Implementation:**
- POS service ต้อง inject ProductsService และ InventoryService
- POS scan endpoint ต้อง return product + current stock
- POS cart ต้องแสดง stock availability

---

### 4. Users ↔ Roles ↔ Permissions Integration
**ความสำคัญ:** User ต้องมี roles และ permissions

**Integration Flow:**
```
User Entity
  ↓ (many-to-many)
Role Entity
  ↓ (many-to-many)
Permission Entity
```

**Implementation:**
- User entity มี relation กับ Role
- Role entity มี relation กับ Permission
- Auth service ต้อง load roles และ permissions
- Guards ต้อง check permissions

---

### 5. Users ↔ Branches Integration
**ความสำคัญ:** User ต้องมี branch และ branch context

**Integration Flow:**
```
User Entity
  ↓ (belongs to)
Branch Entity
  ↓ (has many)
User Entity

BranchContext Middleware
  ↓ (sets)
Request.branch_id
  ↓ (used by)
All Services
```

**Implementation:**
- User entity มี relation กับ Branch
- BranchContext middleware ต้อง set branch_id
- Services ต้อง use branch_id จาก context

---

## 📋 Tasks Checklist (Detailed)

### 1. Users Module

#### 1.1 Create User Entity
**File:** `src/database/entities/user.entity.ts`

**Requirements:**
- [ ] Extends BaseEntity
- [ ] Has username, email, password_hash, full_name
- [ ] Has active flag
- [ ] Has branch_id (nullable, FK to branches)
- [ ] Has many-to-many relation with Role
- [ ] Has belongs-to relation with Branch
- [ ] Has last_login_at, last_login_ip

**Relations:**
```typescript
@ManyToOne(() => Branch, { nullable: true })
branch: Branch | null;

@ManyToMany(() => Role)
@JoinTable({ name: 'user_roles' })
roles: Role[];
```

**Estimated Time:** 1 hour

---

#### 1.2 Create Users Service
**File:** `src/users/users.service.ts`

**Methods Required:**
- [ ] `findAll(filters)` - List users with filters
- [ ] `findOne(id)` - Get user with relations (roles, branch)
- [ ] `create(dto)` - Create user with password hashing
- [ ] `update(id, dto)` - Update user
- [ ] `remove(id)` - Delete user (soft delete)
- [ ] `suspend(id)` - Suspend user (set active = 0)
- [ ] `activate(id)` - Activate user (set active = 1)
- [ ] `assignRole(userId, roleId)` - Assign role to user
- [ ] `removeRole(userId, roleId)` - Remove role from user

**Dependencies:**
- Inject UserRepository
- Inject RoleRepository (for role assignment)
- Use bcrypt for password hashing

**Integration Points:**
- Must load roles and permissions when getting user
- Must validate branch_id exists
- Must check permissions before operations

**Estimated Time:** 3 hours

---

#### 1.3 Create Users Controller
**File:** `src/users/users.controller.ts`

**Endpoints Required:**
```typescript
GET    /api/users              // List users (with filters)
GET    /api/users/:id          // Get user (with roles, branch)
POST   /api/users              // Create user
PUT    /api/users/:id          // Update user
DELETE /api/users/:id          // Delete user
POST   /api/users/:id/suspend  // Suspend user
POST   /api/users/:id/activate // Activate user
POST   /api/users/:id/roles    // Assign role
DELETE /api/users/:id/roles/:roleId // Remove role
```

**Guards Required:**
- JwtAuthGuard (all endpoints)
- PermissionsGuard with 'user.read' (GET)
- PermissionsGuard with 'user.create' (POST)
- PermissionsGuard with 'user.update' (PUT)
- PermissionsGuard with 'user.delete' (DELETE)

**DTOs Required:**
- CreateUserDto (username, email, password, full_name, branch_id, role_ids)
- UpdateUserDto (partial of CreateUserDto)
- UserResponseDto (exclude password_hash)

**Estimated Time:** 2 hours

---

### 2. Products Module (Detailed)

#### 2.1 Create Product Entity
**File:** `src/database/entities/product.entity.ts`

**Requirements:**
- [ ] Extends BaseEntity
- [ ] Has barcode (unique, nullable)
- [ ] Has sku (unique, nullable)
- [ ] Has name, description
- [ ] Has cost_price, selling_price
- [ ] Has category_id (FK to categories)
- [ ] Has unit_id (FK to units)
- [ ] Has image_url
- [ ] Has active flag

**Relations:**
```typescript
@ManyToOne(() => Category, { nullable: true })
category: Category | null;

@ManyToOne(() => Unit, { nullable: true })
unit: Unit | null;

@OneToMany(() => ProductMedia, (media) => media.product)
media: ProductMedia[];

@OneToMany(() => StockBalance, (balance) => balance.product)
stockBalances: StockBalance[];
```

**Important:** Product entity ต้องมี relation กับ StockBalance เพื่อให้ query stock ได้

**Estimated Time:** 1.5 hours

---

#### 2.2 Create ProductMedia Entity
**File:** `src/database/entities/product-media.entity.ts`

**Requirements:**
- [ ] Extends BaseEntity
- [ ] Has product_id (FK to products)
- [ ] Has file_path, file_name
- [ ] Has file_size, width, height
- [ ] Has is_primary flag
- [ ] Has display_order

**Relations:**
```typescript
@ManyToOne(() => Product, (product) => product.media)
product: Product;
```

**Estimated Time:** 1 hour

---

#### 2.3 Create Products Service
**File:** `src/products/products.service.ts`

**Dependencies:**
- Inject ProductRepository
- Inject CategoryRepository (for validation)
- Inject UnitRepository (for validation)
- Inject InventoryService (for stock queries) ⭐ **สำคัญ**

**Methods Required:**
- [ ] `findAll(filters)` - List products with filters
  - Must include stock_quantity (from InventoryService)
  - Must filter by category, active status
  - Must support search by name, barcode, sku
- [ ] `findOne(id)` - Get product with relations
  - Must include category, unit, media
  - Must include stock_quantity by branch ⭐
- [ ] `findByBarcode(barcode)` - Find by barcode
  - Must include stock_quantity ⭐
  - Must only return active products
- [ ] `create(dto)` - Create product
  - Must validate barcode/SKU uniqueness
  - Must validate category_id exists
  - Must validate unit_id exists
- [ ] `update(id, dto)` - Update product
  - Must validate barcode/SKU uniqueness (if changed)
  - Must validate category_id/unit_id exists
- [ ] `remove(id)` - Delete product (soft delete)
- [ ] `search(query)` - Search products
  - Must include stock_quantity ⭐

**Integration Points:**
- ⭐ **ต้อง inject InventoryService** เพื่อ query stock
- ⭐ **ทุก method ที่ return product ต้อง include stock_quantity**
- ⭐ **findByBarcode() ใช้ใน POS - ต้อง return stock**

**Example Code:**
```typescript
async findOne(id: number, branchId?: number): Promise<ProductResponseDto> {
  const product = await this.productRepository.findOne({
    where: { id },
    relations: ['category', 'unit', 'media'],
  });

  if (!product) {
    throw new NotFoundException(`Product with ID ${id} not found`);
  }

  // ⭐ Get stock quantity from InventoryService
  let stockQuantity = 0;
  if (branchId) {
    const balance = await this.inventoryService.getBalance(
      product.id,
      branchId,
    );
    stockQuantity = balance?.quantity || 0;
  }

  return {
    ...product,
    stock_quantity: stockQuantity, // ⭐ Include stock
  };
}
```

**Estimated Time:** 4 hours

---

#### 2.4 Create Products Controller
**File:** `src/products/products.controller.ts`

**Endpoints Required:**
```typescript
GET    /api/products                    // List products (with stock)
GET    /api/products/:id               // Get product (with stock)
POST   /api/products                   // Create product
PUT    /api/products/:id               // Update product
DELETE /api/products/:id               // Delete product
GET    /api/products/search             // Search products (with stock)
POST   /api/products/:id/media         // Upload media
DELETE /api/products/:id/media/:mediaId // Delete media
```

**Important Endpoints:**
- ⭐ `GET /api/products` - **ต้อง include stock_quantity**
- ⭐ `GET /api/products/:id` - **ต้อง include stock_quantity by branch**
- ⭐ `GET /api/products/search` - **ต้อง include stock_quantity**

**Guards Required:**
- JwtAuthGuard (all endpoints)
- PermissionsGuard with 'product.read' (GET)
- PermissionsGuard with 'product.create' (POST)
- PermissionsGuard with 'product.update' (PUT)
- PermissionsGuard with 'product.delete' (DELETE)

**Branch Context:**
- ⭐ **ทุก endpoint ที่ return stock ต้องใช้ branch_id จาก context**

**DTOs Required:**
- CreateProductDto (name, barcode, sku, cost_price, selling_price, category_id, unit_id)
- UpdateProductDto (partial of CreateProductDto)
- ProductResponseDto (include stock_quantity) ⭐

**Estimated Time:** 2.5 hours

---

### 3. POS Integration with Products & Inventory

#### 3.1 POS Scan Endpoint
**File:** `src/pos/pos.controller.ts`

**Endpoint:**
```typescript
GET /api/pos/scan?barcode=xxx
POST /api/pos/scan (body: { barcode })
```

**Flow:**
```
1. Receive barcode from request
2. Call ProductsService.findByBarcode(barcode)
   ↓
3. ProductsService queries product + stock
   ↓
4. Return product with stock_quantity
```

**Response:**
```typescript
{
  success: true,
  product: {
    id: 1,
    barcode: "1234567890",
    name: "สินค้า A",
    selling_price: 100.00,
    stock_quantity: 50, // ⭐ From InventoryService
    unit: "ชิ้น"
  }
}
```

**If Product Not Found:**
```typescript
{
  success: false,
  not_found: true,
  barcode: "1234567890"
}
```

**Dependencies:**
- Inject ProductsService
- ProductsService must inject InventoryService

**Estimated Time:** 2 hours

---

#### 3.2 POS Quick Create Product
**File:** `src/pos/pos.controller.ts`

**Endpoint:**
```typescript
POST /api/pos/quick-create
```

**Flow:**
```
1. Receive product data (barcode, name, prices)
2. Call ProductsService.create(dto)
   ↓
3. ProductsService creates product
   ↓
4. Return product with stock_quantity = 0
```

**Dependencies:**
- Inject ProductsService
- Must check permission 'product.quick_create' or 'product.create'

**Estimated Time:** 1 hour

---

## 🔄 Integration Flow Diagrams

### Flow 1: POS Scan Product → Show Stock
```
User scans barcode
  ↓
POS Controller.scan()
  ↓
Products Service.findByBarcode(barcode)
  ↓
  ├─→ ProductRepository.findOne() [Get product]
  └─→ InventoryService.getBalance(productId, branchId) [Get stock] ⭐
  ↓
Return product + stock_quantity
  ↓
POS displays product with stock
```

### Flow 2: Create Invoice → Deduct Stock
```
POS creates invoice
  ↓
Invoices Service.create()
  ↓
For each item:
  ├─→ Create invoice_item
  └─→ InventoryService.sale(productId, quantity, invoiceId) ⭐
      ↓
      └─→ InventoryService.move() [Deduct stock]
          ↓
          ├─→ UPDATE stock_balances (quantity - qty)
          └─→ INSERT stock_moves (move_type='OUT')
  ↓
Commit transaction
```

### Flow 3: View Product → Show Stock by Branch
```
User views product detail
  ↓
Products Controller.findOne(id)
  ↓
Products Service.findOne(id, branchId)
  ↓
  ├─→ ProductRepository.findOne() [Get product]
  └─→ InventoryService.getBalance(productId, branchId) [Get stock] ⭐
  ↓
Return product + stock_quantity
```

---

## 📊 Database Relationships

### Product ↔ StockBalance Relationship
```sql
-- Product has many StockBalances (one per branch)
products (id)
  ↓
stock_balances (product_id, branch_id, quantity)
  ↓
stock_moves (product_id, branch_id, move_type, quantity)
```

**TypeORM Relations:**
```typescript
// Product Entity
@OneToMany(() => StockBalance, (balance) => balance.product)
stockBalances: StockBalance[];

// StockBalance Entity
@ManyToOne(() => Product, (product) => product.stockBalances)
product: Product;
```

---

## ✅ Acceptance Criteria (Detailed)

### Products Module
- ✅ Product entity has relations (Category, Unit, StockBalance)
- ✅ ProductsService injects InventoryService
- ✅ All product endpoints return stock_quantity
- ✅ findByBarcode() returns stock_quantity
- ✅ Product search includes stock_quantity

### POS Integration
- ✅ POS scan returns product + stock_quantity
- ✅ POS quick create works
- ✅ Stock quantity updates in real-time

### Integration Points
- ✅ Products ↔ Inventory: Working
- ✅ Products ↔ Categories: Working
- ✅ Products ↔ Units: Working
- ✅ Products ↔ POS: Working

---

## 🧪 Testing Checklist (Detailed)

### Products Service Tests
- [ ] `findAll()` includes stock_quantity
- [ ] `findOne()` includes stock_quantity by branch
- [ ] `findByBarcode()` includes stock_quantity
- [ ] `search()` includes stock_quantity
- [ ] Stock quantity is 0 for new products
- [ ] Stock quantity updates after inventory operations

### POS Integration Tests
- [ ] Scan barcode returns product + stock
- [ ] Scan non-existent barcode returns not_found
- [ ] Quick create product works
- [ ] Stock quantity displayed correctly in POS

### Integration Tests
- [ ] Create product → Check stock = 0
- [ ] Receive stock → Check product stock updated
- [ ] Sell product → Check stock deducted
- [ ] View product → Check stock displayed

---

## 📝 Code Examples

### Products Service with Inventory Integration
```typescript
@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private inventoryService: InventoryService, // ⭐ Inject InventoryService
  ) {}

  async findByBarcode(
    barcode: string,
    branchId?: number,
  ): Promise<ProductWithStockDto | null> {
    const product = await this.productRepository.findOne({
      where: { barcode, active: 1 },
      relations: ['category', 'unit'],
    });

    if (!product) {
      return null;
    }

    // ⭐ Get stock quantity
    let stockQuantity = 0;
    if (branchId) {
      const balance = await this.inventoryService.getBalance(
        product.id,
        branchId,
      );
      stockQuantity = balance?.quantity || 0;
    }

    return {
      ...product,
      stock_quantity: stockQuantity, // ⭐ Include stock
    };
  }
}
```

### POS Controller with Products Integration
```typescript
@Controller('pos')
export class PosController {
  constructor(
    private productsService: ProductsService, // ⭐ Inject ProductsService
  ) {}

  @Get('scan')
  async scan(@Query('barcode') barcode: string, @Req() req: any) {
    const branchId = req.user.branch_id; // ⭐ Get branch from context

    const product = await this.productsService.findByBarcode(
      barcode,
      branchId, // ⭐ Pass branchId
    );

    if (!product) {
      return {
        success: false,
        not_found: true,
        barcode,
      };
    }

    return {
      success: true,
      product, // ⭐ Includes stock_quantity
    };
  }
}
```

---

## 🚨 Common Issues & Solutions

### Issue 1: Stock Quantity Not Showing
**Solution:**
- Check InventoryService is injected
- Check branchId is passed
- Check InventoryService.getBalance() is called
- Verify stock_balances table has data

### Issue 2: POS Scan Not Returning Stock
**Solution:**
- Check ProductsService.findByBarcode() includes stock
- Check branchId is passed from POS controller
- Check InventoryService is working

### Issue 3: Stock Not Updating After Sale
**Solution:**
- Check InventoryService.sale() is called
- Check transaction is committed
- Check stock_moves record is created
- Check stock_balances is updated

---

## 📊 Progress Tracking

### Day 1: Users + Roles
- Morning: User entity + service
- Afternoon: Users controller + Roles module

### Day 2: Permissions + Branches
- Morning: Permissions module
- Afternoon: Branches module + Branch context

### Day 3: Products (Part 1)
- Morning: Product entity + ProductMedia entity
- Afternoon: Products service (CRUD only)

### Day 4: Products (Part 2) + Inventory Integration ⭐
- Morning: Products service (add InventoryService integration)
- Afternoon: Products controller + POS integration

### Day 5: Categories + Units + Contacts
- Morning: Categories + Units modules
- Afternoon: Contacts module

---

## 🎯 Definition of Done

Phase 2 is complete when:
- ✅ All modules implemented
- ✅ **Products ↔ Inventory integration working** ⭐
- ✅ **POS ↔ Products ↔ Inventory integration working** ⭐
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
- `PHASE_3_INVENTORY.md` - Next phase (Inventory details)

---

## ⏭️ Next Phase

After completing Phase 2, proceed to:
**Phase 3: Inventory & Stock Management** (`PHASE_3_INVENTORY.md`)

**Important:** Phase 3 จะสร้าง InventoryService ที่ ProductsService ใช้

---

**Status:** ⏸️ Pending  
**Ready to Start:** After Phase 1 complete  
**Blockers:** None

**⭐ Key Integration Points:**
- Products ↔ Inventory (stock display)
- POS ↔ Products ↔ Inventory (scan + stock)
- Products ↔ Categories ↔ Units (relationships)

