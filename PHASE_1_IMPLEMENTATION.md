# 🚀 Phase 1: Implementation Guide - NestJS Setup

**วันที่เริ่ม:** 2025-01-XX  
**Version:** 1.0  
**Status:** 🟢 In Progress

---

## 🎯 เป้าหมาย

Setup โปรเจกต์ NestJS พร้อมโครงสร้างพื้นฐานและ core modules

---

## 📋 Step-by-Step Implementation

### Step 1: Initialize NestJS Project

```bash
# Install NestJS CLI globally (if not installed)
npm i -g @nestjs/cli

# Create new NestJS project
cd tmstock
nest new backend --package-manager npm

# Or if you want to create in current directory
nest new . --package-manager npm --skip-git
```

**Expected Result:**
- ✅ NestJS project structure created
- ✅ package.json configured
- ✅ tsconfig.json configured
- ✅ nest-cli.json configured

---

### Step 2: Install Core Dependencies

```bash
cd backend  # or current directory if created in place

# Database
npm install @nestjs/typeorm typeorm mysql2

# Authentication
npm install @nestjs/passport @nestjs/jwt passport passport-jwt
npm install @types/passport-jwt

# Validation
npm install class-validator class-transformer

# Configuration
npm install @nestjs/config

# Utilities
npm install bcrypt
npm install @types/bcrypt

# Development
npm install --save-dev @types/node
```

**Expected Result:**
- ✅ All dependencies installed
- ✅ No errors in installation

---

### Step 3: Setup Environment Variables

Create `.env` file:
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=mstock

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h

# Application
NODE_ENV=development
PORT=3000

# CORS
CORS_ORIGIN=http://localhost:5173
```

Create `.env.example`:
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=mstock

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Application
NODE_ENV=development
PORT=3000

# CORS
CORS_ORIGIN=http://localhost:5173
```

---

### Step 4: Configure TypeORM

**File: `src/app.module.ts`**
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

---

### Step 5: Create Base Entity

**File: `src/common/entities/base.entity.ts`**
```typescript
import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
```

---

### Step 6: Create Core Entities

Copy entities from `examples/entities/` to `src/entities/`:
- User.entity.ts
- Role.entity.ts
- Permission.entity.ts
- Branch.entity.ts
- AuditLog.entity.ts
- FeatureToggle.entity.ts
- RolePermission.entity.ts
- UserRole.entity.ts

---

### Step 7: Setup Authentication Module

**File: `src/auth/auth.module.ts`**
```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from '../entities/User.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
```

---

### Step 8: Create JWT Strategy

**File: `src/auth/strategies/jwt.strategy.ts`**
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/User.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user || !user.active) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
```

---

### Step 9: Create Auth Guard

**File: `src/auth/guards/jwt-auth.guard.ts`**
```typescript
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
```

---

### Step 10: Create Public Decorator

**File: `src/auth/decorators/public.decorator.ts`**
```typescript
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

---

### Step 11: Setup Global Guards

**File: `src/main.ts`**
```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global auth guard
  app.useGlobalGuards(new JwtAuthGuard(new Reflector()));

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
```

---

## ✅ Testing Checklist

### After Step 1-2
- [ ] Project created successfully
- [ ] Dependencies installed
- [ ] No errors in console

### After Step 3-4
- [ ] .env file created
- [ ] Database connection works
- [ ] Can connect to MySQL database

### After Step 5-6
- [ ] Base entity created
- [ ] Core entities copied
- [ ] Entities compile without errors

### After Step 7-11
- [ ] Auth module created
- [ ] JWT strategy works
- [ ] Auth guard works
- [ ] Public decorator works
- [ ] Server starts successfully

---

## 🧪 Test Commands

```bash
# Start development server
npm run start:dev

# Build project
npm run build

# Run tests
npm run test

# Check code quality
npm run lint
```

---

## 📝 Next Steps

After completing Phase 1:
1. Test database connection
2. Test authentication
3. Create seeders for initial data
4. Start Phase 2: Core Modules

---

**Status:** 🟢 Ready to Start

**Last Updated:** 2025-01-XX

**⭐ Follow this guide step by step!**

