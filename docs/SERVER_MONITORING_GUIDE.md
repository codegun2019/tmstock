# 🔍 Server Monitoring Guide - NestJS Application

**วันที่สร้าง:** 2025-01-XX  
**Version:** 1.0  
**สถานะ:** 📋 Complete Monitoring Guide

---

## 🎯 Overview

เอกสารนี้แนะนำเครื่องมือและวิธีการ monitor server สำหรับ NestJS POS system

---

## 📊 Monitoring Categories

### 1. Application Performance Monitoring (APM)
### 2. Infrastructure Monitoring
### 3. Logging & Error Tracking
### 4. Health Checks & Alerts
### 5. Database Monitoring

---

## 🚀 Recommended Solutions

### Option 1: Open Source (Free) ⭐ Recommended for Start

#### 1.1 Prometheus + Grafana (Infrastructure + Metrics)
**เหมาะสำหรับ:**
- Monitor server resources (CPU, Memory, Disk, Network)
- Monitor application metrics (request rate, response time, error rate)
- Custom business metrics (sales per hour, stock movements, etc.)

**Setup:**
```bash
# Install Prometheus
# Install Grafana
# Add Prometheus data source to Grafana
```

**Features:**
- ✅ Free & Open Source
- ✅ Highly customizable dashboards
- ✅ Alert rules
- ✅ Long-term data retention
- ⚠️ Requires setup & maintenance

**Use Cases:**
- Server CPU/Memory usage
- API response times
- Request rates
- Error rates
- Database query performance

---

#### 1.2 ELK Stack (Elasticsearch + Logstash + Kibana) (Logging)
**เหมาะสำหรับ:**
- Centralized logging
- Log analysis & search
- Error tracking

**Setup:**
```bash
# Install Elasticsearch
# Install Logstash
# Install Kibana
# Configure log shipping
```

**Features:**
- ✅ Free & Open Source
- ✅ Powerful log search
- ✅ Real-time log streaming
- ✅ Log aggregation
- ⚠️ Resource intensive
- ⚠️ Complex setup

**Use Cases:**
- Application logs
- Error logs
- Access logs
- Audit logs

---

#### 1.3 Winston + Morgan (Logging in NestJS)
**เหมาะสำหรับ:**
- Application logging
- Structured logs
- Log levels

**Setup:**
```typescript
// nestjs-logger
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

const logger = WinstonModule.createLogger({
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console(),
  ],
  format: winston.format.json(),
});
```

**Features:**
- ✅ Built into NestJS
- ✅ Easy to configure
- ✅ Multiple transports (file, console, remote)
- ✅ Log rotation
- ⚠️ Need to ship logs to central system

---

### Option 2: Commercial (Paid) - Easy Setup

#### 2.1 New Relic ⭐ Recommended
**เหมาะสำหรับ:**
- Full-stack monitoring (APM + Infrastructure)
- Error tracking
- Database monitoring
- Real-time alerts

**Features:**
- ✅ Easy setup (agent-based)
- ✅ Automatic instrumentation
- ✅ Beautiful dashboards
- ✅ Mobile app
- ✅ Alert rules
- ✅ Error tracking
- ⚠️ Paid (free tier available)

**Pricing:**
- Free tier: 100 GB/month data
- Paid: ~$99/month for standard

**Use Cases:**
- Application performance
- Database queries
- Error tracking
- Server resources
- Custom business metrics

---

#### 2.2 Datadog
**เหมาะสำหรับ:**
- APM + Infrastructure + Logs
- Real-time monitoring
- Alerting

**Features:**
- ✅ All-in-one solution
- ✅ Easy setup
- ✅ Beautiful UI
- ✅ Mobile app
- ✅ Alert rules
- ⚠️ Paid (free trial)

**Pricing:**
- Free tier: Limited
- Paid: ~$15-31/host/month

---

#### 2.3 Sentry (Error Tracking)
**เหมาะสำหรับ:**
- Error tracking
- Performance monitoring
- Release tracking

**Features:**
- ✅ Excellent error tracking
- ✅ Source map support
- ✅ Release tracking
- ✅ Performance monitoring
- ✅ Free tier available
- ⚠️ Focus on errors (not infrastructure)

**Pricing:**
- Free tier: 5,000 events/month
- Paid: ~$26/month

---

### Option 3: Hybrid Approach ⭐ Best for Production

**Combine:**
1. **Prometheus + Grafana** - Infrastructure & Metrics (Free)
2. **Winston + Filebeat** - Logging (Free)
3. **Sentry** - Error Tracking (Free tier)
4. **Health Check Endpoint** - Built-in NestJS

**Benefits:**
- ✅ Cost-effective
- ✅ Full control
- ✅ Scalable
- ⚠️ More setup required

---

## 🏗️ Implementation for NestJS

### 1. Health Check Endpoint (Built-in)

**Install:**
```bash
npm install @nestjs/terminus
```

**Setup:**
```typescript
// health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
    ]);
  }
}
```

**Features:**
- ✅ Built into NestJS
- ✅ Database health check
- ✅ Memory health check
- ✅ Disk health check
- ✅ Custom health checks

---

### 2. Winston Logger (Structured Logging)

**Install:**
```bash
npm install nest-winston winston
npm install winston-daily-rotate-file
```

**Setup:**
```typescript
// app.module.ts
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

WinstonModule.forRoot({
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
    // File transport (daily rotate)
    new DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
    // Error file
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '30d',
    }),
  ],
})
```

---

### 3. Prometheus Metrics (Custom)

**Install:**
```bash
npm install @willsoto/nestjs-prometheus prom-client
```

**Setup:**
```typescript
// app.module.ts
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    PrometheusModule.register({
      defaultMetrics: {
        enabled: true,
      },
    }),
  ],
})
export class AppModule {}
```

**Custom Metrics:**
```typescript
// metrics.service.ts
import { Injectable } from '@nestjs/common';
import { Counter, Histogram } from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status'],
  });

  private readonly invoiceCreated = new Counter({
    name: 'invoices_created_total',
    help: 'Total number of invoices created',
    labelNames: ['branch_id'],
  });

  recordHttpRequest(method: string, route: string, status: number, duration: number) {
    this.httpRequestDuration.observe({ method, route, status }, duration);
  }

  recordInvoiceCreated(branchId: number) {
    this.invoiceCreated.inc({ branch_id: branchId.toString() });
  }
}
```

**Expose Metrics:**
```typescript
// metrics.controller.ts
import { Controller, Get } from '@nestjs/common';
import { register } from 'prom-client';

@Controller('metrics')
export class MetricsController {
  @Get()
  async getMetrics() {
    return register.metrics();
  }
}
```

---

### 4. Sentry Integration (Error Tracking)

**Install:**
```bash
npm install @sentry/node @sentry/tracing
```

**Setup:**
```typescript
// main.ts
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new ProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

// app.module.ts
import { SentryModule } from '@sentry/nestjs';

@Module({
  imports: [
    SentryModule.forRoot({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0,
    }),
  ],
})
export class AppModule {}
```

---

## 📋 Monitoring Checklist

### Essential Metrics
- [ ] **Server Resources**
  - CPU usage
  - Memory usage
  - Disk usage
  - Network I/O

- [ ] **Application Metrics**
  - Request rate (requests/second)
  - Response time (p50, p95, p99)
  - Error rate (4xx, 5xx)
  - Active connections

- [ ] **Database Metrics**
  - Query performance
  - Connection pool usage
  - Slow queries
  - Deadlocks

- [ ] **Business Metrics**
  - Invoices created per hour
  - Sales amount per hour
  - Stock movements per hour
  - Active users

- [ ] **Error Tracking**
  - Error count by type
  - Error rate
  - Stack traces
  - User context

---

## 🚨 Alert Rules

### Critical Alerts (Immediate Action)
1. **Server Down** - HTTP health check fails
2. **High Error Rate** - > 5% error rate for 5 minutes
3. **Database Down** - Database connection fails
4. **High CPU** - CPU > 90% for 10 minutes
5. **High Memory** - Memory > 90% for 10 minutes
6. **Disk Full** - Disk usage > 90%

### Warning Alerts (Monitor)
1. **High Response Time** - p95 > 2 seconds
2. **Low Disk Space** - Disk usage > 80%
3. **High Database Connections** - > 80% of pool
4. **Slow Queries** - Query time > 1 second

---

## 🎯 Recommended Setup for mstock POS

### Phase 1: Basic Monitoring (Start Here)
1. ✅ **Health Check Endpoint** - `/health`
2. ✅ **Winston Logger** - Structured logging
3. ✅ **Sentry** - Error tracking (free tier)

### Phase 2: Metrics & Dashboards
4. ✅ **Prometheus + Grafana** - Infrastructure metrics
5. ✅ **Custom Business Metrics** - Sales, invoices, stock

### Phase 3: Advanced (Optional)
6. ✅ **ELK Stack** - Centralized logging
7. ✅ **New Relic / Datadog** - Full APM (if budget allows)

---

## 📊 Dashboard Examples

### 1. Server Dashboard (Grafana)
- CPU usage (line chart)
- Memory usage (line chart)
- Disk usage (gauge)
- Network I/O (line chart)
- Request rate (line chart)
- Error rate (line chart)

### 2. Application Dashboard (Grafana)
- Response time (p50, p95, p99)
- Request rate by endpoint
- Error rate by endpoint
- Active users
- Database query time

### 3. Business Dashboard (Grafana)
- Sales per hour (bar chart)
- Invoices created (counter)
- Stock movements (line chart)
- Top selling products (table)
- Revenue by branch (pie chart)

---

## 🔧 Configuration Files

### .env.example
```env
# Monitoring
NODE_ENV=production
LOG_LEVEL=info

# Sentry
SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_ENVIRONMENT=production

# Prometheus
PROMETHEUS_PORT=9090

# Health Check
HEALTH_CHECK_ENABLED=true
```

---

## 📚 Resources

### Documentation
- [NestJS Monitoring](https://docs.nestjs.com/techniques/logger)
- [Prometheus](https://prometheus.io/docs/)
- [Grafana](https://grafana.com/docs/)
- [Sentry](https://docs.sentry.io/platforms/node/)
- [Winston](https://github.com/winstonjs/winston)

### Tutorials
- [NestJS + Prometheus](https://dev.to/avantar/implementing-prometheus-metrics-in-nestjs-4a67)
- [NestJS + Sentry](https://docs.sentry.io/platforms/node/guides/nestjs/)
- [Grafana Dashboards](https://grafana.com/grafana/dashboards/)

---

## ✅ Quick Start

### 1. Install Dependencies
```bash
npm install @nestjs/terminus nest-winston winston winston-daily-rotate-file
npm install @sentry/node @sentry/tracing
npm install @willsoto/nestjs-prometheus prom-client
```

### 2. Setup Health Check
```typescript
// health.module.ts
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
})
export class HealthModule {}
```

### 3. Setup Logger
```typescript
// logger.module.ts
import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
// ... winston config
```

### 4. Setup Sentry
```typescript
// main.ts
import * as Sentry from '@sentry/node';
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

---

**Status:** 📋 Complete Monitoring Guide

**Last Updated:** 2025-01-XX

**⭐ Recommended: Prometheus + Grafana (Free) + Sentry (Free tier) + Winston Logger**

