# 🏗️ Target Architecture - mstock POS NestJS

**วันที่สร้าง:** 2025-01-XX  
**Version:** 5.0  
**Status:** 📋 Architecture Design

---

## 🎯 Architecture Overview

**Layered Architecture** ที่แยกความรับผิดชอบชัดเจน:

```
┌─────────────────────────────────────┐
│   Controller Layer (API)           │  ← Request/Response
├─────────────────────────────────────┤
│   Service Layer (Business Logic)   │  ← Use Cases
├─────────────────────────────────────┤
│   Repository Layer (Data Access)    │  ← Database Queries
├─────────────────────────────────────┤
│   Database (MySQL)                  │  ← Data Storage
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│   Guards/Interceptors (Cross-Cut)   │  ← Auth/RBAC/Audit
└─────────────────────────────────────┘
```

---

## 📋 Layer Responsibilities

### 1. Controller Layer
**หน้าที่:**
- รับ HTTP requests
- Validate input (DTOs)
- เรียก Service methods
- Return HTTP responses
- Handle errors

**ไม่ควรทำ:**
- ❌ Business logic
- ❌ Database queries
- ❌ Complex calculations

**Example:**
```typescript
@Controller('invoices')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class InvoicesController {
  constructor(private invoicesService: InvoicesService) {}

  @Post()
  @Permissions('pos.sale')
  async create(@Body() dto: CreateInvoiceDto, @Req() req: any) {
    // ✅ Validate DTO (automatic)
    // ✅ Call service
    return this.invoicesService.create(dto, req.user.id, req.user.branch_id);
  }
}
```

---

### 2. Service Layer (Use-case)
**หน้าที่:**
- Business logic
- Transaction management
- Service orchestration
- Validation (business rules)

**ไม่ควรทำ:**
- ❌ HTTP handling
- ❌ Direct database queries (ใช้ Repository)

**Example:**
```typescript
@Injectable()
export class InvoicesService {
  constructor(
    private invoiceRepository: Repository<Invoice>,
    private inventoryService: InventoryService, // ⭐ Inject other services
    private dataSource: DataSource,
  ) {}

  async create(dto: CreateInvoiceDto, userId: number, branchId: number) {
    // ✅ Business logic
    // ✅ Transaction management
    // ✅ Service orchestration
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      // Create invoice
      // Deduct stock
      // Update status
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    }
  }
}
```

---

### 3. Repository Layer (Data Access)
**หน้าที่:**
- Database queries
- Entity operations
- Query optimization

**ไม่ควรทำ:**
- ❌ Business logic
- ❌ Transaction management (handled by Service)

**Example:**
```typescript
// TypeORM Repository (auto-generated)
@InjectRepository(Invoice)
private invoiceRepository: Repository<Invoice>;

// Custom queries
async findWithItems(id: number): Promise<Invoice> {
  return this.invoiceRepository.findOne({
    where: { id },
    relations: ['items', 'branch', 'user'],
  });
}
```

---

### 4. Guards/Interceptors (Cross-cutting)
**หน้าที่:**
- Authentication
- Authorization (RBAC)
- Audit logging
- Request context (branch, user)

**Example:**
```typescript
// Auth Guard
@UseGuards(JwtAuthGuard)

// Permission Guard
@Permissions('pos.sale')

// Audit Interceptor (global)
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    // Auto-log every request
  }
}
```

---

### 5. DTO/Validation Layer
**หน้าที่:**
- Input validation
- Data transformation
- Type safety

**Example:**
```typescript
export class CreateInvoiceDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];

  @IsOptional()
  @IsString()
  customer_name?: string;

  @IsEnum(PaymentMethod)
  payment_method: PaymentMethod;
}
```

---

## 🛠️ Recommended Tech Stack

### Database
- **MySQL 8.0** - ใช้ของเดิม (ไม่เปลี่ยน)

### ORM
- **TypeORM** (Recommended) หรือ **Prisma**
- **เลือกอันเดียว** - ไม่ใช้ทั้งสอง

**TypeORM Advantages:**
- ✅ Mature and stable
- ✅ Good MySQL support
- ✅ Migration support
- ✅ Transaction support
- ✅ Row-level locking

**Prisma Advantages:**
- ✅ Type-safe queries
- ✅ Better DX
- ✅ Auto-generated types

**Recommendation:** TypeORM (more mature, better for complex queries)

---

### Validation
- **class-validator** - DTO validation
- **class-transformer** - Data transformation

**Example:**
```typescript
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  selling_price: number;
}
```

---

### Authentication
- **JWT + Refresh Token** (Recommended) หรือ **Session**

**JWT Advantages:**
- ✅ Stateless
- ✅ Scalable
- ✅ Better for API

**Session Advantages:**
- ✅ More secure (server-side)
- ✅ Easy to revoke

**Recommendation:** JWT + Refresh Token (better for scalability)

---

### RBAC
- **Policy-based** (permissions)
- **Guards + Decorators**

**Example:**
```typescript
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions('pos.sale', 'invoice.create')
@Controller('invoices')
export class InvoicesController {}
```

---

### Audit Logging
- **Interceptor** - Auto-log every request
- **Outbox Pattern** (Optional) - สำหรับ high-volume systems

**Example:**
```typescript
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    // Log: action, entity, user, IP, etc.
  }
}
```

---

## 📊 Module Mapping

### Core Modules
```
AuthModule
  ├─→ Login, JWT, Refresh
  └─→ Session management

UsersModule
  ├─→ Employee management
  └─→ User CRUD

RolesModule / PermissionsModule
  ├─→ RBAC management
  └─→ Permission assignment

BranchesModule
  ├─→ Branch management
  └─→ Branch context

FeatureTogglesModule
  ├─→ Feature flags
  └─→ Scope-based toggles

AuditLogsModule
  ├─→ Audit log viewing
  └─→ Audit log export
```

---

### Domain Modules
```
ProductsModule
  ├─→ Product CRUD
  ├─→ Product search
  └─→ Product media

ContactsModule
  ├─→ Customer/Supplier management
  └─→ Contact attachments

SalesModule (POS/Invoice)
  ├─→ POS operations
  ├─→ Invoice creation
  ├─→ Void/Refund
  └─→ Receipt generation

StockModule (Inventory)
  ├─→ Stock balances
  ├─→ Stock movements
  ├─→ GRN operations
  ├─→ Stock adjustments
  └─→ Stock transfers
```

---

## 🔗 Module Integration Strategy

### SalesModule ↔ StockModule Integration

**Key Point:** แยกกัน แต่เชื่อมด้วย ref_type/ref_id + service call

**SalesModule:**
```typescript
@Module({
  imports: [StockModule], // ⭐ Import StockModule
  providers: [SalesService],
  controllers: [SalesController],
})
export class SalesModule {}
```

**SalesService:**
```typescript
@Injectable()
export class SalesService {
  constructor(
    private stockService: StockService, // ⭐ Inject StockService
  ) {}

  async createInvoice(dto: CreateInvoiceDto) {
    // Create invoice
    // Call stockService.deductStock() ⭐
    await this.stockService.deductStock(
      productId,
      quantity,
      'invoice', // ⭐ ref_type
      invoiceId, // ⭐ ref_id
    );
  }
}
```

**Benefits:**
- ✅ Modules แยกกัน (loose coupling)
- ✅ เชื่อมด้วย service call (clear dependency)
- ✅ Reference linking ด้วย ref_type/ref_id (flexible)

---

## 🏛️ Architecture Patterns

### 1. Repository Pattern
**Purpose:** แยก data access logic

**Implementation:**
- TypeORM Repository (auto-generated)
- Custom Repository methods (if needed)

---

### 2. Service Pattern
**Purpose:** Business logic layer

**Implementation:**
- Service classes สำหรับแต่ละ domain
- Service injection สำหรับ cross-module calls

---

### 3. DTO Pattern
**Purpose:** Input validation และ transformation

**Implementation:**
- DTOs สำหรับทุก endpoint
- class-validator สำหรับ validation

---

### 4. Guard Pattern
**Purpose:** Authentication และ Authorization

**Implementation:**
- JwtAuthGuard สำหรับ authentication
- PermissionsGuard สำหรับ authorization

---

### 5. Interceptor Pattern
**Purpose:** Cross-cutting concerns (Audit, Transform)

**Implementation:**
- AuditLogInterceptor สำหรับ audit logging
- TransformInterceptor สำหรับ response transformation

---

## 🔒 System Integrity Patterns

### Transaction Pattern
```typescript
const queryRunner = this.dataSource.createQueryRunner();
await queryRunner.startTransaction();
try {
  // Operations
  await queryRunner.commitTransaction();
} catch (error) {
  await queryRunner.rollbackTransaction();
  throw error;
} finally {
  await queryRunner.release();
}
```

### Lock Pattern
```typescript
const balance = await queryRunner.manager
  .createQueryBuilder(StockBalance, 'balance')
  .setLock('pessimistic_write') // ⭐ Row-level lock
  .where(/* ... */)
  .getOne();
```

### Reference Linking Pattern
```typescript
// Every stock movement has reference
{
  reference_type: 'invoice', // ⭐
  reference_id: 123, // ⭐
}
```

---

## 📈 Scalability Considerations

### Database
- ✅ Connection pooling
- ✅ Query optimization
- ✅ Indexes
- ✅ Read replicas (optional)

### Caching
- ✅ Redis for session/cache
- ✅ Query result caching
- ✅ Feature toggle caching

### Performance
- ✅ Pagination
- ✅ Lazy loading
- ✅ Eager loading (when needed)
- ✅ Background jobs (for heavy operations)

---

## ✅ Architecture Benefits

### 1. Maintainability
- ✅ Clear layer separation
- ✅ Easy to understand
- ✅ Easy to modify

### 2. Testability
- ✅ Easy to mock dependencies
- ✅ Unit tests per layer
- ✅ Integration tests

### 3. Scalability
- ✅ Horizontal scaling
- ✅ Microservices-ready (if needed)
- ✅ Performance optimization

### 4. Security
- ✅ RBAC enforced
- ✅ Input validation
- ✅ Audit logging

---

## 🎯 Conclusion

**Target Architecture:**
- ✅ **Layered** - Clear separation
- ✅ **Modular** - Each feature = module
- ✅ **Type-safe** - TypeScript
- ✅ **Testable** - Dependency injection
- ✅ **Scalable** - Performance + Architecture
- ✅ **Secure** - RBAC + Audit

**Perfect for:** ธุรกรรม + สต็อค + เอกสาร + audit

---

**Status:** 📋 Architecture Design Complete

**Last Updated:** 2025-01-XX

