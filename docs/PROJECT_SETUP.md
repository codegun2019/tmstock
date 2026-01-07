# 🚀 NestJS Project Setup Guide

**วันที่สร้าง:** 2025-01-XX  
**Version:** 5.0  
**สถานะ:** 📋 Setup Instructions

---

## 📋 Prerequisites

### Required Software
- ✅ Node.js 20.x or higher
- ✅ npm 10.x or higher
- ✅ MySQL 8.0 or higher
- ✅ Git

### Optional Software
- ✅ Redis (for session/caching)
- ✅ Docker (for containerization)

---

## 🏗️ Step 1: Initialize NestJS Project

```bash
# Install NestJS CLI globally
npm i -g @nestjs/cli

# Create new NestJS project
nest new mstock-nestjs

# Navigate to project
cd mstock-nestjs

# Install dependencies
npm install
```

---

## 📦 Step 2: Install Required Packages

```bash
# Core dependencies
npm install @nestjs/typeorm typeorm mysql2
npm install @nestjs/config
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install @nestjs/serve-static
npm install class-validator class-transformer
npm install bcrypt
npm install multer @types/multer
npm install uuid

# Development dependencies
npm install --save-dev @types/bcrypt
npm install --save-dev @types/passport-jwt
npm install --save-dev @types/uuid

# Optional: Redis
npm install @nestjs/cache-manager cache-manager cache-manager-redis-store
npm install redis
```

---

## ⚙️ Step 3: Project Configuration

### 3.1 Create `.env` file

```bash
# .env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=root
DB_DATABASE=mstock
DB_CHARSET=utf8mb4

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=7d

# Application
APP_PORT=3000
APP_URL=http://localhost:3000
NODE_ENV=development

# CSRF
CSRF_SECRET=your-csrf-secret-key

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DEST=./public/uploads

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 3.2 Update `nest-cli.json`

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true,
    "assets": [
      {
        "include": "../public/**/*",
        "outDir": "dist"
      }
    ]
  }
}
```

### 3.3 Update `tsconfig.json`

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false,
    "paths": {
      "@/*": ["src/*"],
      "@common/*": ["src/common/*"],
      "@config/*": ["src/config/*"],
      "@database/*": ["src/database/*"]
    }
  }
}
```

---

## 🗄️ Step 4: Database Configuration

### 4.1 Create `src/config/database.config.ts`

```typescript
import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_DATABASE || 'mstock',
    charset: process.env.DB_CHARSET || 'utf8mb4',
    entities: [__dirname + '/../database/entities/**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../database/migrations/**/*{.ts,.js}'],
    synchronize: false, // Never true in production!
    logging: process.env.NODE_ENV === 'development',
    timezone: '+07:00', // Asia/Bangkok
    extra: {
      connectionLimit: 10,
    },
  }),
);
```

### 4.2 Update `src/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './config/database.config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    
    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'),
      }),
      inject: [ConfigService],
    }),
    
    // Your modules here
  ],
})
export class AppModule {}
```

---

## 🔐 Step 5: Authentication Setup

### 5.1 Create `src/config/auth.config.ts`

```typescript
import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
  refreshToken: {
    secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  bcrypt: {
    rounds: 10,
  },
  rateLimit: {
    maxAttempts: 5,
    windowMs: 10 * 60 * 1000, // 10 minutes
  },
}));
```

### 5.2 Create `src/auth/auth.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('auth.jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('auth.jwt.expiresIn'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

---

## 📁 Step 6: Create Directory Structure

```bash
# Create directories
mkdir -p src/common/decorators
mkdir -p src/common/guards
mkdir -p src/common/interceptors
mkdir -p src/common/middleware
mkdir -p src/common/pipes
mkdir -p src/common/filters

mkdir -p src/config

mkdir -p src/database/entities
mkdir -p src/database/migrations
mkdir -p src/database/seeds

mkdir -p src/auth/strategies
mkdir -p src/auth/dto

mkdir -p src/users/dto
mkdir -p src/roles/dto
mkdir -p src/branches/dto
mkdir -p src/products/dto
mkdir -p src/inventory/dto
mkdir -p src/invoices/dto
mkdir -p src/pos/dto
mkdir -p src/repairs/dto
mkdir -p src/documents/dto
mkdir -p src/contacts/dto
mkdir -p src/reports/dto
mkdir -p src/settings/dto
mkdir -p src/backup/dto
mkdir -p src/accounts-receivable/dto
mkdir -p src/feature-toggles/dto
mkdir -p src/audit-logs/dto

mkdir -p src/sequences

mkdir -p public/uploads/tmp
mkdir -p public/uploads/products
mkdir -p public/uploads/contacts
mkdir -p public/uploads/repairs
mkdir -p public/uploads/documents
```

---

## 🎯 Step 7: Create Base Entity

### 7.1 Create `src/database/entities/base.entity.ts`

```typescript
import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', nullable: true })
  updated_at: Date | null;
}
```

---

## 🔧 Step 8: Create Common Guards

### 8.1 Create `src/common/guards/auth.guard.ts`

```typescript
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Authentication required');
    }
    return user;
  }
}
```

### 8.2 Create `src/common/guards/roles.guard.ts`

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.roles) {
      return false;
    }

    return requiredRoles.some((role) => user.roles.includes(role));
  }
}
```

---

## 📝 Step 9: Create Common Decorators

### 9.1 Create `src/common/decorators/roles.decorator.ts`

```typescript
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
```

### 9.2 Create `src/common/decorators/permissions.decorator.ts`

```typescript
import { SetMetadata } from '@nestjs/common';

export const Permissions = (...permissions: string[]) =>
  SetMetadata('permissions', permissions);
```

### 9.3 Create `src/common/decorators/public.decorator.ts`

```typescript
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

---

## 🚀 Step 10: Update Main Application

### 10.1 Update `src/main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Static files
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/',
  });

  // Views (if using server-side rendering)
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  const port = process.env.APP_PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
}

bootstrap();
```

---

## ✅ Step 11: Verify Setup

### 11.1 Test Database Connection

```bash
# Run migrations (after creating entities)
npm run migration:run

# Or test connection
npm run start:dev
```

### 11.2 Check Logs

```bash
# Should see:
# 🚀 Application is running on: http://localhost:3000
# Database connection successful
```

---

## 📋 Next Steps

1. ✅ Create database entities (from existing schema)
2. ✅ Create authentication module
3. ✅ Create RBAC guards
4. ✅ Create first business module (Users)
5. ✅ Test API endpoints

---

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check MySQL is running
mysql -u root -p

# Check .env file
cat .env

# Check database exists
mysql -u root -p -e "SHOW DATABASES;"
```

### Port Already in Use
```bash
# Change port in .env
APP_PORT=3001
```

### TypeORM Entity Not Found
```bash
# Check entity path in database.config.ts
# Check entities are exported correctly
```

---

**Status:** ✅ Setup Complete

**Ready for:** Entity creation and module development

