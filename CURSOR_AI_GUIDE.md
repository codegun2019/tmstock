# 🤖 Cursor AI Guide - NestJS Migration

**วันที่สร้าง:** 2025-01-XX  
**Version:** 5.0  
**สถานะ:** 📋 AI Assistant Guide

---

## 🎯 วัตถุประสงค์

เอกสารนี้สำหรับ **Cursor AI** เพื่อใช้เป็น reference ในการเขียนโค้ด NestJS migration

---

## 📚 เอกสารที่ต้องอ่านก่อนเริ่มเขียนโค้ด

### 1. Master Documents (อ่านก่อน)
1. **MASTER_PLAN.md** - ดูภาพรวมและ roadmap
2. **INTEGRATION_SUMMARY.md** ⭐ - ดู integration points สำคัญ
3. **docs/INTEGRATION_POINTS.md** ⭐ - ดูรายละเอียด integration

### 2. Phase Plans (อ่านตาม phase ที่กำลังทำ)
1. **plan/PHASE_1_SETUP.md** - Phase 1: Setup
2. **plan/PHASE_2_CORE_MODULES_DETAILED.md** ⭐ - Phase 2: Core Modules (Detailed)
3. **plan/PHASE_3_INVENTORY_DETAILED.md** ⭐ - Phase 3: Inventory (Detailed)
4. **plan/PHASE_4_SALES_DETAILED.md** ⭐ - Phase 4: Sales (Detailed)
5. **plan/PHASE_5_ADDITIONAL.md** - Phase 5: Additional
6. **plan/PHASE_6_TESTING.md** - Phase 6: Testing

### 3. Code Examples
1. **docs/CODE_EXAMPLES.md** - ตัวอย่างโค้ดสำหรับ reference

---

## 🔗 Critical Integration Points (ต้องจำ)

### 1. Products ↔ Inventory ⭐
**Rule:** ProductsService ต้อง inject InventoryService และ return stock_quantity

**Pattern:**
```typescript
// ProductsService
constructor(
  private inventoryService: InventoryService, // ⭐ Inject
) {}

async findOne(id: number, branchId: number) {
  const product = await this.productRepository.findOne({ where: { id } });
  const balance = await this.inventoryService.getBalance(id, branchId); // ⭐
  return { ...product, stock_quantity: balance?.quantity || 0 }; // ⭐
}
```

---

### 2. POS ↔ Products ↔ Inventory ⭐
**Rule:** POS Controller injects ProductsService, ProductsService injects InventoryService

**Pattern:**
```typescript
// POS Controller
constructor(private productsService: ProductsService) {} // ⭐

@Get('scan')
async scan(@Query('barcode') barcode: string, @Req() req: any) {
  const branchId = req.user.branch_id; // ⭐ Get branch
  const product = await this.productsService.findByBarcode(barcode, branchId);
  return { success: true, product }; // ⭐ Includes stock_quantity
}
```

---

### 3. Invoice ↔ Inventory ⭐
**Rule:** InvoicesService injects InventoryService, ใช้ transaction, ตัดสต็อคทันที

**Pattern:**
```typescript
// InvoicesService
constructor(
  private inventoryService: InventoryService, // ⭐ Inject
  private dataSource: DataSource,
) {}

async create(dto: CreateInvoiceDto, userId: number, branchId: number) {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.startTransaction(); // ⭐ Transaction

  try {
    const invoice = await queryRunner.manager.save(/* ... */);
    
    for (const item of dto.items) {
      await queryRunner.manager.save(/* invoice item */);
      await this.inventoryService.sale(/* ... */); // ⭐ Deduct stock
    }
    
    await queryRunner.commitTransaction(); // ⭐ Commit
    return invoice;
  } catch (error) {
    await queryRunner.rollbackTransaction(); // ⭐ Rollback
    throw error;
  }
}
```

---

## 📋 Step-by-Step Workflow

### เมื่อได้รับคำสั่งให้สร้าง Module

#### Step 1: อ่าน Phase Plan
- อ่าน phase plan ที่เกี่ยวข้อง
- ดู tasks checklist
- ดู integration points
- ดู code examples

#### Step 2: ตรวจสอบ Dependencies
- ดูว่า module นี้ต้อง inject อะไรบ้าง
- ดูว่า module นี้ต้อง export อะไรบ้าง
- ดูว่า module อื่นต้องใช้ module นี้หรือไม่

#### Step 3: สร้าง Entities
- สร้าง entity files
- กำหนด relations
- กำหนด indexes

#### Step 4: สร้าง Service
- Inject repositories และ services ที่จำเป็น
- Implement methods ตาม phase plan
- **สำคัญ:** ตรวจสอบ integration points

#### Step 5: สร้าง Controller
- Inject service
- สร้าง endpoints ตาม phase plan
- เพิ่ม guards และ decorators

#### Step 6: สร้าง DTOs
- Create DTOs
- Update DTOs
- Response DTOs

#### Step 7: สร้าง Module
- Import dependencies
- Export service (ถ้าจำเป็น)
- Register providers และ controllers

#### Step 8: Test
- Unit tests
- Integration tests
- Manual tests

---

## ✅ Checklist สำหรับทุก Module

### Entities
- [ ] Extends BaseEntity
- [ ] Relations ถูกต้อง
- [ ] Indexes ครบถ้วน
- [ ] Column types ถูกต้อง

### Services
- [ ] Inject repositories/services ที่จำเป็น
- [ ] **ตรวจสอบ integration points** ⭐
- [ ] Methods ครบตาม phase plan
- [ ] Error handling
- [ ] Transaction handling (ถ้าจำเป็น)

### Controllers
- [ ] Inject service
- [ ] Endpoints ครบตาม phase plan
- [ ] Guards และ decorators
- [ ] DTOs validation

### Modules
- [ ] Import dependencies
- [ ] Export service (ถ้าจำเป็น)
- [ ] Register providers และ controllers

---

## 🚨 Common Mistakes to Avoid

### Mistake 1: ลืม Inject InventoryService ใน ProductsService
**❌ Wrong:**
```typescript
constructor(
  @InjectRepository(Product) private productRepository: Repository<Product>,
  // Missing InventoryService!
) {}
```

**✅ Correct:**
```typescript
constructor(
  @InjectRepository(Product) private productRepository: Repository<Product>,
  private inventoryService: InventoryService, // ⭐ Must inject
) {}
```

---

### Mistake 2: ลืม Return Stock Quantity
**❌ Wrong:**
```typescript
async findOne(id: number) {
  const product = await this.productRepository.findOne({ where: { id } });
  return product; // Missing stock_quantity!
}
```

**✅ Correct:**
```typescript
async findOne(id: number, branchId: number) {
  const product = await this.productRepository.findOne({ where: { id } });
  const balance = await this.inventoryService.getBalance(id, branchId); // ⭐
  return { ...product, stock_quantity: balance?.quantity || 0 }; // ⭐
}
```

---

### Mistake 3: ลืมใช้ Transaction ใน Invoice Creation
**❌ Wrong:**
```typescript
async create(dto: CreateInvoiceDto) {
  const invoice = await this.invoiceRepository.save(/* ... */);
  for (const item of dto.items) {
    await this.inventoryService.sale(/* ... */); // No transaction!
  }
  return invoice;
}
```

**✅ Correct:**
```typescript
async create(dto: CreateInvoiceDto) {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.startTransaction(); // ⭐ Transaction

  try {
    const invoice = await queryRunner.manager.save(/* ... */);
    for (const item of dto.items) {
      await this.inventoryService.sale(/* ... */);
    }
    await queryRunner.commitTransaction(); // ⭐ Commit
    return invoice;
  } catch (error) {
    await queryRunner.rollbackTransaction(); // ⭐ Rollback
    throw error;
  }
}
```

---

### Mistake 4: ลืม Export InventoryService
**❌ Wrong:**
```typescript
@Module({
  providers: [InventoryService],
  // Missing exports!
})
export class InventoryModule {}
```

**✅ Correct:**
```typescript
@Module({
  providers: [InventoryService],
  exports: [InventoryService], // ⭐ Must export for other modules
})
export class InventoryModule {}
```

---

## 📝 Code Templates

### Service Template (with Integration)
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Entity } from '../database/entities/entity.entity';
import { InventoryService } from '../inventory/inventory.service'; // ⭐ If needed

@Injectable()
export class EntityService {
  constructor(
    @InjectRepository(Entity)
    private entityRepository: Repository<Entity>,
    private inventoryService: InventoryService, // ⭐ If needed
    private dataSource: DataSource, // ⭐ If transaction needed
  ) {}

  async findAll(filters?: any) {
    // Implementation
  }

  async findOne(id: number) {
    // Implementation
    // ⭐ If product-related: include stock_quantity
  }

  async create(dto: CreateDto) {
    // Implementation
    // ⭐ If invoice-related: use transaction + deduct stock
  }
}
```

### Controller Template (with Guards)
```typescript
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { EntityService } from './entity.service';

@Controller('entities')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class EntityController {
  constructor(private entityService: EntityService) {}

  @Get()
  @Permissions('entity.read')
  findAll() {
    return this.entityService.findAll();
  }

  @Post()
  @Permissions('entity.create')
  create(@Body() dto: CreateDto) {
    return this.entityService.create(dto);
  }
}
```

---

## 🔍 Quick Reference

### เมื่อต้องการ query stock
```typescript
// Use InventoryService.getBalance()
const balance = await this.inventoryService.getBalance(productId, branchId);
const stockQuantity = balance?.quantity || 0;
```

### เมื่อต้องการตัดสต็อค
```typescript
// Use InventoryService.sale()
await this.inventoryService.sale(productId, quantity, invoiceId, branchId, userId);
```

### เมื่อต้องการคืนสต็อค
```typescript
// Use InventoryService.returnStock()
await this.inventoryService.returnStock(productId, quantity, invoiceId, branchId, userId, reason);
```

### เมื่อต้องการใช้ transaction
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

---

## 📚 Related Documents

- `INTEGRATION_SUMMARY.md` - Quick integration reference
- `docs/INTEGRATION_POINTS.md` - Detailed integration points
- `plan/PHASE_*_DETAILED.md` - Detailed phase plans

---

## ✅ Before Writing Code

1. ✅ อ่าน phase plan ที่เกี่ยวข้อง
2. ✅ ตรวจสอบ integration points
3. ✅ ดู code examples
4. ✅ เข้าใจ dependencies
5. ✅ เข้าใจ flow

---

**Status:** 📋 AI Assistant Guide

**Last Updated:** 2025-01-XX

