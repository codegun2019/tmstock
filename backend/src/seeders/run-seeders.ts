/**
 * Run Seeders Script
 * Usage: npm run seed
 */

import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { runSeeders } from './main.seeder';

// Load environment variables
config();

async function bootstrap() {
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'mstock',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: false,
    logging: true,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected\n');

    await runSeeders(dataSource);

    await dataSource.destroy();
    console.log('\n✅ Seeders completed. Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

bootstrap();

