# 🚀 Phase 1: Start - Initialize NestJS Project

**วันที่เริ่ม:** 2025-01-XX  
**Status:** 🟢 In Progress

---

## 📋 ขั้นตอนการทำงาน

### Step 1: Initialize NestJS Project

```bash
# 1. ติดตั้ง NestJS CLI (ถ้ายังไม่มี)
npm i -g @nestjs/cli

# 2. สร้างโปรเจกต์ NestJS ในโฟเดอร์ปัจจุบัน
nest new . --skip-git --package-manager npm

# หรือสร้างในโฟเดอร์ใหม่
# nest new mstock-api --package-manager npm
# cd mstock-api
```

### Step 2: Install Required Packages

```bash
# Core dependencies
npm install @nestjs/typeorm typeorm mysql2
npm install @nestjs/config
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install class-validator class-transformer
npm install bcrypt
npm install @nestjs/terminus  # Health check

# Development dependencies
npm install --save-dev @types/bcrypt
npm install --save-dev @types/passport-jwt
```

### Step 3: Create .env file

```env
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
```

### Step 4: Setup Database Connection

สร้างไฟล์ `src/config/database.config.ts`:

```typescript
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: configService.get('DB_HOST'),
  port: configService.get('DB_PORT'),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_DATABASE'),
  charset: configService.get('DB_CHARSET', 'utf8mb4'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: configService.get('NODE_ENV') === 'development',
  logging: configService.get('NODE_ENV') === 'development',
});
```

### Step 5: Update app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

---

## ✅ Checklist

- [ ] NestJS project initialized
- [ ] Required packages installed
- [ ] .env file created
- [ ] Database config created
- [ ] Database connection tested
- [ ] Server starts successfully

---

## 🧪 Testing

### Test Database Connection
```bash
# Start server
npm run start:dev

# Check logs for database connection
# Should see: "Database connection established"
```

### Test Health Check
```bash
# Add health check endpoint
curl http://localhost:3000/health
```

---

## 📝 Next Steps

1. ✅ Initialize project
2. ⏳ Setup authentication
3. ⏳ Create base entities
4. ⏳ Create guards and decorators

---

**Status:** 🟢 Ready to Start

