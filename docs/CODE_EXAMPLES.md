# 📚 NestJS Migration Examples

**วันที่สร้าง:** 2025-01-XX  
**Version:** 5.0  
**สถานะ:** 📋 Code Examples

---

## 📋 Table of Contents

1. [Database Entities](#database-entities)
2. [Auth Module](#auth-module)
3. [Users Module](#users-module)
4. [Products Module](#products-module)
5. [Inventory Module](#inventory-module)
6. [Common Utilities](#common-utilities)

---

## 🗄️ Database Entities

### User Entity

```typescript
// src/database/entities/user.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Branch } from './branch.entity';
import { Role } from './role.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password_hash: string;

  @Column({ type: 'varchar', length: 255 })
  full_name: string;

  @Column({ type: 'tinyint', default: 1 })
  active: number;

  @Column({ type: 'int', nullable: true })
  branch_id: number | null;

  @ManyToOne(() => Branch, { nullable: true })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch | null;

  @ManyToMany(() => Role)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];

  @Column({ type: 'datetime', nullable: true })
  last_login_at: Date | null;

  @Column({ type: 'varchar', length: 45, nullable: true })
  last_login_ip: string | null;
}
```

### Role Entity

```typescript
// src/database/entities/role.entity.ts
import { Entity, Column, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Permission } from './permission.entity';

@Entity('roles')
export class Role extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ManyToMany(() => Permission)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: Permission[];
}
```

### Permission Entity

```typescript
// src/database/entities/permission.entity.ts
import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('permissions')
export class Permission extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  key: string;

  @Column({ type: 'varchar', length: 255 })
  label: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;
}
```

### Branch Entity

```typescript
// src/database/entities/branch.entity.ts
import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('branches')
export class Branch extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  invoice_prefix: string | null;

  @Column({ type: 'tinyint', default: 1 })
  active: number;
}
```

### Product Entity

```typescript
// src/database/entities/product.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Category } from './category.entity';
import { Unit } from './unit.entity';
import { ProductMedia } from './product-media.entity';

@Entity('products')
export class Product extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  barcode: string | null;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  sku: string | null;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cost_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  selling_price: number;

  @Column({ type: 'int', nullable: true })
  category_id: number | null;

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: Category | null;

  @Column({ type: 'int', nullable: true })
  unit_id: number | null;

  @ManyToOne(() => Unit, { nullable: true })
  @JoinColumn({ name: 'unit_id' })
  unit: Unit | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image_url: string | null;

  @Column({ type: 'tinyint', default: 1 })
  active: number;

  @OneToMany(() => ProductMedia, (media) => media.product)
  media: ProductMedia[];
}
```

---

## 🔐 Auth Module

### Auth Service

```typescript
// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { username, active: 1 },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid username or password');
    }

    // Remove password from response
    const { password_hash, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto, ipAddress: string) {
    const user = await this.validateUser(loginDto.username, loginDto.password);

    // Update last login
    await this.userRepository.update(user.id, {
      last_login_at: new Date(),
      last_login_ip: ipAddress,
    });

    const payload = {
      sub: user.id,
      username: user.username,
      roles: user.roles?.map((r) => r.name) || [],
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        branch_id: user.branch_id,
        roles: user.roles?.map((r) => r.name) || [],
      },
    };
  }

  async validateToken(payload: any) {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub, active: 1 },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
```

### Auth Controller

```typescript
// src/auth/auth.controller.ts
import { Controller, Post, Body, UseGuards, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: any,
  ) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    return this.authService.login(loginDto, ipAddress);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: any) {
    return {
      user: req.user,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout() {
    // JWT is stateless, so logout is handled client-side
    return { message: 'Logged out successfully' };
  }
}
```

### JWT Strategy

```typescript
// src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('auth.jwt.secret'),
    });
  }

  async validate(payload: any) {
    const user = await this.authService.validateToken(payload);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
```

### Login DTO

```typescript
// src/auth/dto/login.dto.ts
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
```

---

## 👥 Users Module

### Users Service

```typescript
// src/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(filters?: any) {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .leftJoinAndSelect('user.branch', 'branch');

    if (filters?.search) {
      queryBuilder.where(
        '(user.username LIKE :search OR user.full_name LIKE :search OR user.email LIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    if (filters?.active !== undefined) {
      queryBuilder.andWhere('user.active = :active', { active: filters.active });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles', 'branch'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      ...createUserDto,
      password_hash: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
    return { message: 'User deleted successfully' };
  }
}
```

### Users Controller

```typescript
// src/users/users.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/auth.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../common/guards/permissions.guard';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Permissions('user.read')
  findAll(@Query() filters: any) {
    return this.usersService.findAll(filters);
  }

  @Get(':id')
  @Permissions('user.read')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Post()
  @Permissions('user.create')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id')
  @Permissions('user.update')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @Permissions('user.delete')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
```

---

## 📦 Products Module

### Products Service

```typescript
// src/products/products.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../database/entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async findAll(filters?: any) {
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.unit', 'unit');

    if (filters?.search) {
      queryBuilder.where(
        '(product.name LIKE :search OR product.barcode LIKE :search OR product.sku LIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    if (filters?.category_id) {
      queryBuilder.andWhere('product.category_id = :categoryId', {
        categoryId: filters.category_id,
      });
    }

    if (filters?.active !== undefined) {
      queryBuilder.andWhere('product.active = :active', {
        active: filters.active,
      });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'unit', 'media'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async findByBarcode(barcode: string) {
    const product = await this.productRepository.findOne({
      where: { barcode, active: 1 },
      relations: ['category', 'unit'],
    });

    return product;
  }

  async create(createProductDto: CreateProductDto) {
    // Check barcode uniqueness
    if (createProductDto.barcode) {
      const existing = await this.productRepository.findOne({
        where: { barcode: createProductDto.barcode },
      });
      if (existing) {
        throw new ConflictException('Barcode already exists');
      }
    }

    // Check SKU uniqueness
    if (createProductDto.sku) {
      const existing = await this.productRepository.findOne({
        where: { sku: createProductDto.sku },
      });
      if (existing) {
        throw new ConflictException('SKU already exists');
      }
    }

    const product = this.productRepository.create(createProductDto);
    return this.productRepository.save(product);
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id);

    // Check barcode uniqueness (if changed)
    if (updateProductDto.barcode && updateProductDto.barcode !== product.barcode) {
      const existing = await this.productRepository.findOne({
        where: { barcode: updateProductDto.barcode },
      });
      if (existing) {
        throw new ConflictException('Barcode already exists');
      }
    }

    Object.assign(product, updateProductDto);
    return this.productRepository.save(product);
  }

  async remove(id: number) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
    return { message: 'Product deleted successfully' };
  }
}
```

---

## 📊 Inventory Module

### Inventory Service

```typescript
// src/inventory/inventory.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { StockBalance } from '../database/entities/stock-balance.entity';
import { StockMove } from '../database/entities/stock-move.entity';
import { MoveStockDto } from './dto/move-stock.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(StockBalance)
    private stockBalanceRepository: Repository<StockBalance>,
    @InjectRepository(StockMove)
    private stockMoveRepository: Repository<StockMove>,
    private dataSource: DataSource,
  ) {}

  async move(moveStockDto: MoveStockDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get or create stock balance
      let balance = await queryRunner.manager.findOne(StockBalance, {
        where: {
          product_id: moveStockDto.product_id,
          branch_id: moveStockDto.branch_id,
        },
      });

      if (!balance) {
        balance = queryRunner.manager.create(StockBalance, {
          product_id: moveStockDto.product_id,
          branch_id: moveStockDto.branch_id,
          quantity: 0,
        });
      }

      const balanceBefore = balance.quantity;
      const balanceAfter = balanceBefore + moveStockDto.quantity;

      // Check negative stock (if not allowed)
      if (balanceAfter < 0 && !moveStockDto.allow_negative) {
        throw new BadRequestException('Insufficient stock');
      }

      // Update balance
      balance.quantity = balanceAfter;
      balance.last_moved_at = new Date();
      await queryRunner.manager.save(balance);

      // Create stock move record
      const stockMove = queryRunner.manager.create(StockMove, {
        product_id: moveStockDto.product_id,
        branch_id: moveStockDto.branch_id,
        move_type: moveStockDto.move_type,
        quantity: moveStockDto.quantity,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        reference_type: moveStockDto.reference_type,
        reference_id: moveStockDto.reference_id,
        reason: moveStockDto.reason,
        created_by: moveStockDto.created_by,
      });

      await queryRunner.manager.save(stockMove);

      await queryRunner.commitTransaction();

      return {
        success: true,
        balance: balance,
        move: stockMove,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async sale(productId: number, quantity: number, invoiceId: number, userId: number, branchId: number) {
    return this.move({
      product_id: productId,
      branch_id: branchId,
      move_type: 'OUT',
      quantity: -quantity, // Negative for sale
      reference_type: 'invoice',
      reference_id: invoiceId,
      reason: 'Sale',
      created_by: userId,
      allow_negative: false,
    });
  }

  async receive(productId: number, quantity: number, reason: string, userId: number, branchId: number) {
    return this.move({
      product_id: productId,
      branch_id: branchId,
      move_type: 'IN',
      quantity: quantity, // Positive for receive
      reference_type: 'receive',
      reference_id: null,
      reason: reason,
      created_by: userId,
      allow_negative: false,
    });
  }
}
```

---

## 🛠️ Common Utilities

### Permissions Guard

```typescript
// src/common/guards/permissions.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.roles) {
      return false;
    }

    // Get all permissions from user's roles
    const userPermissions = new Set<string>();
    user.roles.forEach((role: any) => {
      role.permissions?.forEach((permission: any) => {
        userPermissions.add(permission.key);
      });
    });

    // Check if user has all required permissions
    return requiredPermissions.every((permission) =>
      userPermissions.has(permission),
    );
  }
}
```

### Audit Log Interceptor

```typescript
// src/common/interceptors/audit-log.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../database/entities/audit-log.entity';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user } = request;

    return next.handle().pipe(
      tap(async (response) => {
        // Log important actions
        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
          await this.auditLogRepository.save({
            action: method,
            entity_type: this.getEntityType(url),
            entity_id: body?.id || null,
            description: `${method} ${url}`,
            before_data: JSON.stringify(body),
            after_data: JSON.stringify(response),
            user_id: user?.id || null,
            branch_id: user?.branch_id || null,
            ip_address: request.ip,
            user_agent: request.headers['user-agent'],
          });
        }
      }),
    );
  }

  private getEntityType(url: string): string {
    const parts = url.split('/').filter(Boolean);
    return parts[parts.length - 1] || 'unknown';
  }
}
```

---

## 📝 Notes

### Key Differences from PHP

1. **Type Safety**: TypeScript provides compile-time type checking
2. **Dependency Injection**: NestJS uses decorators for DI
3. **Async/Await**: Native async support (no callbacks)
4. **ORM**: TypeORM instead of raw SQL
5. **Validation**: class-validator decorators
6. **Guards**: Replaces middleware pattern

### Migration Tips

1. **Start Small**: Migrate one module at a time
2. **Test Thoroughly**: Write tests for each module
3. **Keep Database**: Use existing schema initially
4. **Parallel Running**: Run both systems during migration
5. **Documentation**: Document all changes

---

**Status:** ✅ Examples Complete

**Ready for:** Implementation

