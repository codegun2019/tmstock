# 🚨 Critical Bugs & Solutions - Complete Guide

**วันที่สร้าง:** 2025-01-XX  
**Version:** 5.0  
**สถานะ:** 📋 Complete Critical Bugs Analysis

---

## 🎯 Overview

วิเคราะห์บัคที่สำคัญที่สุดและแนวทางแก้ไขเพื่อป้องกันไม่ให้เกิดปัญหาใน NestJS

**Priority Order:**
1. 🔴 **Concurrency / Race Condition** (บัคอันดับ 1)
2. 🟠 **Transaction Nesting**
3. 🟠 **Data Integrity**
4. 🟡 **Authorization / RBAC**
5. 🟡 **Input Validation**
6. 🟡 **File Upload Security**
7. 🟡 **Audit & Anti-fraud**
8. 🟡 **Status Machine Bugs**
9. 🟡 **Reporting Consistency**
10. 🔵 **Observability / Debuggability**

---

## 🔴 1. Concurrency / Race Condition (บัคอันดับ 1)

### อาการ

#### อาการ 1.1: สต็อคติดลบทั้งที่มี hard check
```
Cashier A: Check stock = 10 → OK
Cashier B: Check stock = 10 → OK
Cashier A: Deduct 8 → Stock = 2
Cashier B: Deduct 8 → Stock = -6 ❌
```

#### อาการ 1.2: 2 แคชเชียร์กด PAID พร้อมกันแล้วตัดซ้ำ
```
Cashier A: Click PAID → Stock deducted
Cashier B: Click PAID → Stock deducted again ❌
Result: Stock deducted twice
```

#### อาการ 1.3: Refund ซ้ำแล้วสต็อคเพิ่มซ้ำ
```
User: Click REFUND → Stock returned
User: Click REFUND again → Stock returned again ❌
Result: Stock returned twice
```

---

### จุดต้องทำ

#### ✅ Solution 1.1: Row-level Locking ตอนตัดจริง
```typescript
// ❌ WRONG: Check then update (race condition)
const balance = await this.stockRepo.findOne({ productId, branchId });
if (balance.quantity < requiredQuantity) {
  throw new BadRequestException('Insufficient stock');
}
balance.quantity -= requiredQuantity;
await this.stockRepo.save(balance);

// ✅ CORRECT: Lock then check then update
const queryRunner = this.dataSource.createQueryRunner();
await queryRunner.startTransaction();

try {
  // ⭐ Lock row BEFORE checking
  const balance = await queryRunner.manager
    .createQueryBuilder(StockBalance, 'balance')
    .setLock('pessimistic_write') // ⭐ SELECT ... FOR UPDATE
    .where('balance.product_id = :productId', { productId })
    .andWhere('balance.branch_id = :branchId', { branchId })
    .getOne();

  if (!balance) {
    throw new NotFoundException('Stock balance not found');
  }

  // ⭐ Check AFTER lock
  if (balance.quantity < requiredQuantity) {
    throw new BadRequestException(
      `Insufficient stock. Available: ${balance.quantity}, Required: ${requiredQuantity}`
    );
  }

  // ⭐ Update in same transaction
  balance.quantity -= requiredQuantity;
  await queryRunner.manager.save(balance);

  // ⭐ Create movement in same transaction
  await queryRunner.manager.save(StockMovement, {
    product_id: productId,
    branch_id: branchId,
    move_type: 'OUT',
    quantity: -requiredQuantity,
    balance_before: balance.quantity + requiredQuantity,
    balance_after: balance.quantity,
    reference_type: 'invoice',
    reference_id: invoiceId,
  });

  await queryRunner.commitTransaction();
} catch (error) {
  await queryRunner.rollbackTransaction();
  throw error;
} finally {
  await queryRunner.release();
}
```

---

#### ✅ Solution 1.2: Idempotency - กด Pay ซ้ำต้องไม่ตัดซ้ำ
```typescript
// ✅ CORRECT: Check status before processing
async payInvoice(invoiceId: number, userId: number) {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.startTransaction();

  try {
    // ⭐ Lock invoice row
    const invoice = await queryRunner.manager
      .createQueryBuilder(Invoice, 'invoice')
      .setLock('pessimistic_write')
      .where('invoice.id = :id', { id: invoiceId })
      .getOne();

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // ⭐ Idempotency check: If already paid, return success
    if (invoice.status === 'PAID') {
      await queryRunner.rollbackTransaction();
      return {
        success: true,
        message: 'Invoice already paid',
        invoice: invoice,
        idempotent: true, // ⭐ Indicate this was idempotent
      };
    }

    // ⭐ Check allowed status transition
    if (!['DRAFT', 'HOLD'].includes(invoice.status)) {
      throw new BadRequestException(
        `Cannot pay invoice with status: ${invoice.status}`
      );
    }

    // ⭐ Deduct stock (with locking)
    for (const item of invoice.items) {
      await this.deductStockWithLock(
        queryRunner,
        item.product_id,
        item.quantity,
        invoice.branch_id,
        invoiceId
      );
    }

    // ⭐ Update invoice status
    invoice.status = 'PAID';
    invoice.paid_at = new Date();
    invoice.paid_by = userId;
    await queryRunner.manager.save(invoice);

    await queryRunner.commitTransaction();
    return { success: true, invoice };
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}
```

---

#### ✅ Solution 1.3: Unique Constraint ป้องกัน Duplicate Movements
```typescript
// ⭐ Database Migration: Add unique constraint
// ALTER TABLE stock_movements 
// ADD UNIQUE KEY unique_movement (ref_type, ref_id, product_id, move_type);

// ✅ CORRECT: Check for existing movement before creating
async createStockMovement(dto: CreateStockMovementDto) {
  // ⭐ Check if movement already exists
  const existing = await this.stockMovementRepo.findOne({
    where: {
      reference_type: dto.reference_type,
      reference_id: dto.reference_id,
      product_id: dto.product_id,
      move_type: dto.move_type,
    },
  });

  if (existing) {
    // ⭐ Idempotent: Return existing movement
    return {
      success: true,
      message: 'Movement already exists',
      movement: existing,
      idempotent: true,
    };
  }

  // ⭐ Create new movement
  const movement = await this.stockMovementRepo.save(dto);
  return { success: true, movement };
}
```

---

### แนวป้องกัน

#### ✅ Pattern 1: Idempotent Payment
```typescript
@Post(':id/pay')
async payInvoice(
  @Param('id') invoiceId: number,
  @Body() dto: PayInvoiceDto,
  @CurrentUser() user: User,
) {
  // ⭐ Always check status first
  const invoice = await this.invoiceService.findOne(invoiceId);
  
  if (invoice.status === 'PAID') {
    return {
      success: true,
      message: 'Invoice already paid',
      invoice,
      idempotent: true,
    };
  }

  // ⭐ Process payment with locking
  return await this.invoiceService.payInvoice(invoiceId, user.id);
}
```

#### ✅ Pattern 2: Unique Constraint for Movements
```sql
-- Migration: Add unique constraint
ALTER TABLE stock_movements 
ADD CONSTRAINT unique_pos_movement 
UNIQUE (ref_type, ref_id, product_id, move_type)
WHERE ref_type IN ('POS', 'POS_REFUND');
```

---

## 🟠 2. Transaction Nesting / "There is already an active transaction"

### อาการ

#### อาการ 2.1: Transaction ซ้อนใน service หลายชั้น
```typescript
// ❌ WRONG: Nested transactions
async createInvoice() {
  await this.dataSource.transaction(async (manager) => {
    // Create invoice
    await this.inventoryService.deductStock(); // ⚠️ This opens another transaction!
  });
}

async deductStock() {
  await this.dataSource.transaction(async (manager) => {
    // ⚠️ Nested transaction error!
  });
}
```

---

### จุดต้องระวัง

- เปิด transaction ซ้อนใน service หลายชั้น
- Repository บางตัวเปิด transaction เองอีก
- Deadlock risk

---

### แนวทางที่ถูก

#### ✅ Solution 2.1: "เปิด/ปิด transaction" ให้มีเจ้าของคนเดียว
```typescript
// ✅ CORRECT: Use-case service owns transaction
@Injectable()
export class InvoiceService {
  constructor(
    private dataSource: DataSource,
    private inventoryService: InventoryService,
  ) {}

  async createInvoice(dto: CreateInvoiceDto, userId: number) {
    // ⭐ Use-case service owns transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      // Create invoice
      const invoice = await queryRunner.manager.save(Invoice, {
        ...dto,
        user_id: userId,
      });

      // ⭐ Pass queryRunner to child service
      for (const item of dto.items) {
        await this.inventoryService.deductStockWithTransaction(
          queryRunner, // ⭐ Pass transaction manager
          item.product_id,
          item.quantity,
          invoice.branch_id,
          invoice.id,
        );
      }

      await queryRunner.commitTransaction();
      return invoice;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

// ✅ CORRECT: Child service accepts transaction manager
@Injectable()
export class InventoryService {
  async deductStockWithTransaction(
    queryRunner: QueryRunner, // ⭐ Accept transaction manager
    productId: number,
    quantity: number,
    branchId: number,
    referenceId: number,
  ) {
    // ⭐ Use provided transaction manager (don't create new one)
    const balance = await queryRunner.manager
      .createQueryBuilder(StockBalance, 'balance')
      .setLock('pessimistic_write')
      .where('balance.product_id = :productId', { productId })
      .andWhere('balance.branch_id = :branchId', { branchId })
      .getOne();

    // Check and update...
    balance.quantity -= quantity;
    await queryRunner.manager.save(balance);
  }
}
```

---

#### ✅ Solution 2.2: Transaction Helper Pattern
```typescript
// ✅ CORRECT: Transaction helper to prevent nesting
@Injectable()
export class TransactionHelper {
  constructor(private dataSource: DataSource) {}

  async execute<T>(
    callback: (manager: EntityManager) => Promise<T>,
  ): Promise<T> {
    // ⭐ Check if already in transaction
    const queryRunner = this.dataSource.createQueryRunner();
    const isTransactionActive = queryRunner.isTransactionActive;

    if (isTransactionActive) {
      // ⭐ Already in transaction, use existing manager
      return await callback(queryRunner.manager);
    }

    // ⭐ Start new transaction
    await queryRunner.startTransaction();
    try {
      const result = await callback(queryRunner.manager);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
```

---

## 🟠 3. Data Integrity (Foreign keys / Ref linking)

### อาการ

- Movement ชี้เอกสารผิด (ref_type/ref_id หลุด)
- ลบเอกสารแล้ว movement orphan
- รายงานเพี้ยนเพราะ join ไม่ครบ

---

### แนวป้องกัน

#### ✅ Solution 3.1: ref_type เป็น Enum/Const กลาง
```typescript
// ✅ CORRECT: Use enum instead of string
export enum ReferenceType {
  INVOICE = 'invoice',
  INVOICE_REFUND = 'invoice_refund',
  GRN = 'grn',
  STOCK_ADJUSTMENT = 'stock_adjustment',
  STOCK_TRANSFER = 'stock_transfer',
  REPAIR = 'repair',
}

@Entity()
export class StockMovement {
  @Column({
    type: 'enum',
    enum: ReferenceType, // ⭐ Enum instead of string
  })
  reference_type: ReferenceType;

  @Column()
  reference_id: number;

  // ⭐ Composite foreign key
  @ManyToOne(() => Invoice, { nullable: true })
  @JoinColumn([
    { name: 'reference_type', referencedColumnName: 'type' },
    { name: 'reference_id', referencedColumnName: 'id' },
  ])
  invoice?: Invoice;
}
```

---

#### ✅ Solution 3.2: Soft Delete แทน Hard Delete
```typescript
// ✅ CORRECT: Use soft delete
@Entity()
export class Invoice {
  @Column({ default: false })
  deleted: boolean;

  @Column({ nullable: true })
  deleted_at: Date;

  @Column({ nullable: true })
  deleted_by: number;

  // ⭐ Soft delete method
  async softDelete(userId: number) {
    this.deleted = true;
    this.deleted_at = new Date();
    this.deleted_by = userId;
    await this.save();
  }
}

// ⭐ Query with soft delete filter
async findOne(id: number) {
  return await this.invoiceRepo.findOne({
    where: { id, deleted: false },
  });
}
```

---

#### ✅ Solution 3.3: Foreign Key Constraints
```sql
-- ✅ CORRECT: Add foreign key constraints
ALTER TABLE stock_movements
ADD CONSTRAINT fk_movement_invoice
FOREIGN KEY (reference_id) REFERENCES invoices(id)
ON DELETE RESTRICT -- ⭐ Prevent deletion if movements exist
WHERE reference_type = 'invoice';

-- ⭐ Or use ON DELETE SET NULL if soft delete
ALTER TABLE stock_movements
ADD CONSTRAINT fk_movement_invoice
FOREIGN KEY (reference_id) REFERENCES invoices(id)
ON DELETE SET NULL
WHERE reference_type = 'invoice';
```

---

## 🟡 4. Authorization / RBAC (ช่องโหว่ที่คนมักลืม)

### อาการ

- พนักงานเข้าหน้าปรับยอดได้เพราะรู้ URL
- ยิง API ปรับ stock ได้ตรง ๆ
- สาขาอื่นแอบเห็นข้อมูล

---

### ต้องทำ

#### ✅ Solution 4.1: Auth + Permission Guard ทุก Endpoint
```typescript
// ✅ CORRECT: Use guards on all endpoints
@Controller('api/inventory')
@UseGuards(JwtAuthGuard, PermissionGuard) // ⭐ Auth + Permission
export class InventoryController {
  @Post('adjust')
  @RequirePermission('inventory.adjust') // ⭐ Specific permission
  async adjustStock(@Body() dto: AdjustStockDto) {
    return await this.inventoryService.adjust(dto);
  }
}

// ✅ CORRECT: Permission Guard
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.get<string>(
      'permission',
      context.getHandler(),
    );

    if (!requiredPermission) {
      return true; // No permission required
    }

    const user = context.switchToHttp().getRequest().user;
    if (!user) {
      return false;
    }

    // ⭐ Check permission
    return await this.permissionService.hasPermission(
      user.id,
      requiredPermission,
    );
  }
}
```

---

#### ✅ Solution 4.2: Branch Scope Guard
```typescript
// ✅ CORRECT: Branch scope guard
@Injectable()
export class BranchScopeGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const branchId = request.body?.branch_id || request.params?.branch_id;

    if (!branchId) {
      return true; // No branch specified
    }

    // ⭐ Check if user has access to this branch
    if (user.branch_id !== branchId && !user.is_admin) {
      throw new ForbiddenException(
        'You do not have access to this branch',
      );
    }

    return true;
  }
}

// ✅ CORRECT: Use branch scope guard
@Post('adjust')
@UseGuards(JwtAuthGuard, PermissionGuard, BranchScopeGuard)
async adjustStock(@Body() dto: AdjustStockDto) {
  // ⭐ Guard ensures user can only adjust their own branch
  return await this.inventoryService.adjust(dto);
}
```

---

#### ✅ Solution 4.3: Feature Toggle Server-Side
```typescript
// ✅ CORRECT: Feature toggle check in service
@Injectable()
export class InventoryService {
  constructor(
    private featureToggleService: FeatureToggleService,
  ) {}

  async adjustStock(dto: AdjustStockDto) {
    // ⭐ Check feature toggle server-side
    if (!await this.featureToggleService.isEnabled('inventory.adjust')) {
      throw new ForbiddenException('Feature is disabled');
    }

    // Process adjustment...
  }
}

// ✅ CORRECT: Feature toggle guard
@Injectable()
export class FeatureToggleGuard implements CanActivate {
  constructor(private featureToggleService: FeatureToggleService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const featureKey = this.reflector.get<string>(
      'feature',
      context.getHandler(),
    );

    if (!featureKey) {
      return true;
    }

    const isEnabled = await this.featureToggleService.isEnabled(featureKey);
    if (!isEnabled) {
      throw new ForbiddenException(`Feature ${featureKey} is disabled`);
    }

    return true;
  }
}
```

---

## 🟡 5. Input Validation & Injection

### อาการ

- qty ติดลบ / qty เป็น string / overflow
- barcode แปลก ๆ ทำ query เพี้ยน
- SQL injection ถ้าใช้ query string ตรง ๆ

---

### ต้องทำ

#### ✅ Solution 5.1: Validation DTO
```typescript
// ✅ CORRECT: Comprehensive DTO validation
export class AdjustStockDto {
  @IsInt()
  @Min(1)
  product_id: number;

  @IsInt()
  @Min(1)
  branch_id: number;

  @IsNumber()
  @Min(0) // ⭐ Prevent negative
  @Max(999999) // ⭐ Prevent overflow
  quantity: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Matches(/^[A-Z0-9\-]+$/) // ⭐ Barcode format validation
  barcode?: string;
}

// ✅ CORRECT: Use DTO in controller
@Post('adjust')
async adjustStock(@Body() dto: AdjustStockDto) {
  // ⭐ Validation happens automatically via ValidationPipe
  return await this.inventoryService.adjust(dto);
}
```

---

#### ✅ Solution 5.2: Parameterized Query Only
```typescript
// ❌ WRONG: String concatenation
const sql = `SELECT * FROM products WHERE barcode = '${barcode}'`;

// ✅ CORRECT: Parameterized query (TypeORM does this automatically)
const product = await this.productRepo.findOne({
  where: { barcode }, // ⭐ TypeORM uses parameterized query
});

// ✅ CORRECT: QueryBuilder with parameters
const products = await this.productRepo
  .createQueryBuilder('product')
  .where('product.barcode = :barcode', { barcode }) // ⭐ Parameterized
  .getMany();
```

---

#### ✅ Solution 5.3: Decimal Normalization
```typescript
// ✅ CORRECT: Use Decimal type for money/quantities
import { Decimal } from 'decimal.js';

@Entity()
export class InvoiceItem {
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2, // ⭐ 2 decimal places
  })
  unit_price: Decimal;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  quantity: Decimal;

  // ⭐ Calculate with Decimal
  get subtotal(): Decimal {
    return this.unit_price.mul(this.quantity);
  }
}
```

---

## 🟡 6. File Upload Security

### อาการ

- โยนไฟล์ php/exe ปลอมเป็นรูป
- path traversal ../../
- DOS: อัปโหลดไฟล์ใหญ่/เยอะ

---

### ต้องทำ

#### ✅ Solution 6.1: MIME Type Validation
```typescript
// ✅ CORRECT: Validate MIME type
import * as fileType from 'file-type';
import * as sharp from 'sharp';

@Post('upload')
async uploadFile(@UploadedFile() file: Express.Multer.File) {
  // ⭐ Check MIME type
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  const fileTypeResult = await fileType.fromBuffer(file.buffer);

  if (!fileTypeResult || !allowedMimes.includes(fileTypeResult.mime)) {
    throw new BadRequestException('Invalid file type');
  }

  // ⭐ Verify it's actually an image by trying to decode
  try {
    await sharp(file.buffer).metadata();
  } catch (error) {
    throw new BadRequestException('File is not a valid image');
  }

  // ⭐ Generate safe filename
  const safeFilename = `${uuidv4()}.${fileTypeResult.ext}`;
  const filePath = path.join(uploadDir, safeFilename);

  // ⭐ Save file
  await fs.writeFile(filePath, file.buffer);

  return { filename: safeFilename };
}
```

---

#### ✅ Solution 6.2: File Size & Count Limits
```typescript
// ✅ CORRECT: Multer configuration with limits
const multerOptions: MulterOptions = {
  limits: {
    fileSize: 5 * 1024 * 1024, // ⭐ 5MB max
    files: 10, // ⭐ Max 10 files
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestException('Invalid file type'), false);
    }
  },
};

@Post('upload')
@UseInterceptors(
  FileInterceptor('file', multerOptions), // ⭐ Use configured multer
)
async uploadFile(@UploadedFile() file: Express.Multer.File) {
  // File is already validated
}
```

---

#### ✅ Solution 6.3: Store Outside Public Directory
```typescript
// ✅ CORRECT: Store files outside public directory
const uploadDir = path.join(process.cwd(), 'storage', 'uploads');

// ⭐ Serve files through endpoint (not direct access)
@Get('file/:filename')
async getFile(@Param('filename') filename: string) {
  // ⭐ Validate filename (prevent path traversal)
  if (!/^[a-zA-Z0-9\-_\.]+$/.test(filename)) {
    throw new BadRequestException('Invalid filename');
  }

  const filePath = path.join(uploadDir, filename);
  
  // ⭐ Check if file exists
  if (!await fs.pathExists(filePath)) {
    throw new NotFoundException('File not found');
  }

  // ⭐ Return file with proper headers
  const file = await fs.readFile(filePath);
  return new StreamableFile(file);
}
```

---

## 🟡 7. Audit & Anti-fraud

### อาการ

- พนักงานปรับยอดมั่วแล้วเถียงว่าไม่ได้ทำ
- Refund แล้วของไม่กลับเข้าสต็อค (หรือกลับซ้ำ)

---

### ต้องทำ

#### ✅ Solution 7.1: Comprehensive Audit Log
```typescript
// ✅ CORRECT: Audit log entity
@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  actor_user_id: number;

  @Column()
  action: string; // 'adjust', 'refund', 'void', etc.

  @Column()
  entity_type: string; // 'invoice', 'stock', etc.

  @Column()
  entity_id: number;

  @Column('json', { nullable: true })
  before_json: any; // ⭐ Before state

  @Column('json', { nullable: true })
  after_json: any; // ⭐ After state

  @Column()
  branch_id: number;

  @Column()
  ip_address: string;

  @Column()
  user_agent: string;

  @Column()
  created_at: Date;
}

// ✅ CORRECT: Audit interceptor
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const method = request.method;
    const url = request.url;

    // ⭐ Get before state
    const beforeState = await this.getEntityState(request);

    // ⭐ Execute operation
    const response = await next.handle().toPromise();

    // ⭐ Get after state
    const afterState = await this.getEntityState(request);

    // ⭐ Log audit
    await this.auditLogService.log({
      actor_user_id: user.id,
      action: method.toLowerCase(),
      entity_type: this.getEntityType(url),
      entity_id: request.params.id,
      before_json: beforeState,
      after_json: afterState,
      branch_id: user.branch_id,
      ip_address: request.ip,
      user_agent: request.headers['user-agent'],
    });

    return response;
  }
}
```

---

#### ✅ Solution 7.2: Required Reason for Risky Actions
```typescript
// ✅ CORRECT: Require reason for adjustments
export class AdjustStockDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string; // ⭐ Required

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileDto)
  attachments?: FileDto[]; // ⭐ Optional attachments
}

@Post('adjust')
@UseGuards(JwtAuthGuard, PermissionGuard)
async adjustStock(@Body() dto: AdjustStockDto) {
  // ⭐ Reason is validated in DTO
  return await this.inventoryService.adjust(dto);
}
```

---

## 🟡 8. Status Machine Bugs

### อาการ

- สถานะกระโดดผิด (DRAFT → REFUNDED)
- Paid แล้วกลับไป draft ได้
- Cancel หลัง paid แล้วไม่ restore

---

### ต้องทำ

#### ✅ Solution 8.1: State Transition Table
```typescript
// ✅ CORRECT: Define allowed transitions
export enum InvoiceStatus {
  DRAFT = 'draft',
  HOLD = 'hold',
  PAID = 'paid',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

const ALLOWED_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  [InvoiceStatus.DRAFT]: [InvoiceStatus.PAID, InvoiceStatus.CANCELLED],
  [InvoiceStatus.HOLD]: [InvoiceStatus.PAID, InvoiceStatus.CANCELLED],
  [InvoiceStatus.PAID]: [InvoiceStatus.REFUNDED],
  [InvoiceStatus.REFUNDED]: [], // ⭐ Terminal state
  [InvoiceStatus.CANCELLED]: [], // ⭐ Terminal state
};

@Injectable()
export class InvoiceService {
  async changeStatus(
    invoiceId: number,
    newStatus: InvoiceStatus,
    userId: number,
  ) {
    const invoice = await this.invoiceRepo.findOne({ where: { id: invoiceId } });

    // ⭐ Check allowed transition
    const allowedStatuses = ALLOWED_TRANSITIONS[invoice.status];
    if (!allowedStatuses.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${invoice.status} to ${newStatus}`
      );
    }

    // ⭐ Handle stock operations based on transition
    if (invoice.status === InvoiceStatus.PAID && newStatus === InvoiceStatus.REFUNDED) {
      // ⭐ Return stock
      await this.returnStockForInvoice(invoice);
    }

    if (invoice.status === InvoiceStatus.DRAFT && newStatus === InvoiceStatus.CANCELLED) {
      // ⭐ No stock to return (wasn't deducted)
    }

    // ⭐ Update status
    invoice.status = newStatus;
    await this.invoiceRepo.save(invoice);

    return invoice;
  }
}
```

---

## 🟡 9. Reporting Consistency

### อาการ

- รายงานสต็อคไม่ตรงกับหน้าสินค้า
- ยอดขายกับ stock_out ไม่ match

---

### แนวทาง

#### ✅ Solution 9.1: Single Source of Truth
```typescript
// ✅ CORRECT: Use product_stocks for balance
async getStockBalance(productId: number, branchId: number) {
  const balance = await this.stockBalanceRepo.findOne({
    where: { product_id: productId, branch_id: branchId },
  });

  return {
    quantity: balance.quantity, // ⭐ Source of truth
    available_quantity: balance.available_quantity,
  };
}

// ✅ CORRECT: Use stock_movements for history
async getStockHistory(productId: number, branchId: number) {
  return await this.stockMovementRepo.find({
    where: { product_id: productId, branch_id: branchId },
    order: { created_at: 'DESC' },
  });
}

// ✅ CORRECT: Calculate sales from movements
async getSalesReport(startDate: Date, endDate: Date) {
  return await this.stockMovementRepo
    .createQueryBuilder('movement')
    .select('SUM(movement.quantity)', 'total_out')
    .where('movement.reference_type = :type', { type: 'invoice' })
    .andWhere('movement.move_type = :moveType', { moveType: 'OUT' })
    .andWhere('movement.created_at BETWEEN :start AND :end', {
      start: startDate,
      end: endDate,
    })
    .getRawOne();
}
```

---

## 🔵 10. Observability / Debuggability

### ต้องมีตั้งแต่วันแรก

#### ✅ Solution 10.1: Request ID
```typescript
// ✅ CORRECT: Request ID middleware
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-id'] || uuidv4();
    req['requestId'] = requestId;
    res.setHeader('X-Request-ID', requestId);
    next();
  }
}
```

---

#### ✅ Solution 10.2: Structured Logging
```typescript
// ✅ CORRECT: Structured logging
import { Logger } from '@nestjs/common';

@Injectable()
export class AppLogger extends Logger {
  logTransactionFailure(
    requestId: string,
    operation: string,
    error: Error,
    rollbackReason: string,
  ) {
    this.error(
      JSON.stringify({
        requestId,
        operation,
        error: error.message,
        rollbackReason,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      }),
    );
  }
}
```

---

#### ✅ Solution 10.3: Error Codes
```typescript
// ✅ CORRECT: Error codes enum
export enum ErrorCode {
  STOCK_NOT_ENOUGH = 'STOCK_NOT_ENOUGH',
  ALREADY_PAID = 'ALREADY_PAID',
  INVALID_STATUS_TRANSITION = 'INVALID_STATUS_TRANSITION',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
}

// ✅ CORRECT: Use error codes in exceptions
throw new BadRequestException({
  code: ErrorCode.STOCK_NOT_ENOUGH,
  message: 'Insufficient stock',
  details: {
    available: balance.quantity,
    required: requiredQuantity,
  },
});
```

---

## ✅ Checklist ก่อนปล่อย (สั้นแต่โหด)

### Critical Tests

- [ ] **Pay ซ้ำ 2 ครั้ง → Stock ต้องลดครั้งเดียว**
  ```typescript
  // Test: Pay invoice twice
  await invoiceService.payInvoice(invoiceId, userId);
  await invoiceService.payInvoice(invoiceId, userId);
  // Assert: Stock deducted once, invoice status = PAID
  ```

- [ ] **Refund ซ้ำ → Stock ต้องเพิ่มครั้งเดียว**
  ```typescript
  // Test: Refund invoice twice
  await invoiceService.refundInvoice(invoiceId, userId);
  await invoiceService.refundInvoice(invoiceId, userId);
  // Assert: Stock returned once
  ```

- [ ] **Stock ไม่พอ → ต้องไม่ตัดอะไรเลย (rollback)**
  ```typescript
  // Test: Insufficient stock
  // Assert: Invoice not created, stock not deducted, transaction rolled back
  ```

- [ ] **User สาขา A ยิงของสาขา B → ต้องโดน 403**
  ```typescript
  // Test: Cross-branch access
  // Assert: 403 Forbidden
  ```

- [ ] **Feature toggle ปิด → API ต้องปิดจริง**
  ```typescript
  // Test: Disabled feature
  // Assert: 403 Forbidden (not just UI hidden)
  ```

- [ ] **อัปโหลดไฟล์ปลอม → ต้องโดน reject**
  ```typescript
  // Test: Upload PHP file as image
  // Assert: 400 Bad Request
  ```

- [ ] **Report ยอดขายรายวัน = sum(movements OUT ของ POS)**
  ```typescript
  // Test: Sales report consistency
  // Assert: Report matches sum of movements
  ```

---

## 📋 Implementation Priority

### Phase 1: Critical (ทำก่อน)
1. ✅ Transaction + Lock pattern ให้เป็นมาตรฐานทั้งโปรเจกต์
2. ✅ Idempotency สำหรับ payment/refund
3. ✅ Row-level locking สำหรับ stock operations

### Phase 2: Security (ทำต่อ)
4. ✅ Guard (Auth/RBAC/Branch Scope) ให้ครบ
5. ✅ Input validation DTOs
6. ✅ File upload security

### Phase 3: Quality (ทำต่อ)
7. ✅ Error codes + logging ให้ FE debug ง่าย
8. ✅ Audit logging
9. ✅ State machine validation

### Phase 4: Features (ทำต่อ)
10. ✅ GRN / Adjust / POS pay/refund

---

## 📚 Related Documents

- `docs/SECURITY_AND_BUGS_ANALYSIS.md` - Security & Bugs Analysis
- `docs/CONCURRENCY_NOTES.md` - Concurrency Handling
- `docs/IDEMPOTENCY_RULES.md` - Idempotency Rules
- `docs/KEY_POINTS_SYSTEM_INTEGRITY.md` - System Integrity

---

**Status:** 📋 Critical Bugs & Solutions Complete

**Last Updated:** 2025-01-XX

**⭐ Critical: Follow all solutions to prevent bugs**

