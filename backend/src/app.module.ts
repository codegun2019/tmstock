import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { UnitsModule } from './units/units.module';
import { StockModule } from './stock/stock.module';
import { InvoicesModule } from './invoices/invoices.module';

@Module({
  imports: [
    // Configuration Module (Global)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // TypeORM Module
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 3306),
        username: configService.get('DB_USERNAME', 'root'),
        password: configService.get('DB_PASSWORD', ''),
        database: configService.get('DB_DATABASE', 'mstock'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
        charset: 'utf8mb4',
      }),
      inject: [ConfigService],
    }),
    // Auth Module
    AuthModule,
    // Products Module
    ProductsModule,
    // Categories Module
    CategoriesModule,
    // Units Module
    UnitsModule,
    // Stock Module
    StockModule,
    // Invoices Module
    InvoicesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
