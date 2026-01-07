# 🚀 Deployment Guide - tmstock Backend

**วันที่สร้าง:** 2025-01-07  
**Version:** 1.0  
**Status:** Production Deployment Guide

---

## 🎯 Overview

คู่มือการ deploy tmstock Backend (NestJS) ไปยัง production environment

---

## 📋 Prerequisites

### 1. Server Requirements
- **OS:** Linux (Ubuntu 20.04+ recommended) หรือ Windows Server
- **Node.js:** v18.x หรือ v20.x
- **MySQL:** 8.0+
- **PM2:** สำหรับ process management (optional แต่แนะนำ)
- **Nginx:** สำหรับ reverse proxy (optional)

### 2. Database Setup
```bash
# Create database
mysql -u root -p
CREATE DATABASE tmstock CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'tmstock_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON tmstock.* TO 'tmstock_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 🔧 Step 1: Environment Configuration

### 1.1 Create `.env` File
```bash
cd /path/to/tmstock/backend
cp .env.example .env
```

### 1.2 Configure `.env`
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=tmstock_user
DB_PASSWORD=strong_password
DB_DATABASE=tmstock

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=production

# CORS (adjust for your frontend domain)
CORS_ORIGIN=https://yourdomain.com

# Optional: Logging
LOG_LEVEL=info
```

**⚠️ IMPORTANT:** เปลี่ยน `JWT_SECRET` เป็นค่า random ที่แข็งแรง

---

## 📦 Step 2: Install Dependencies

### 2.1 Install Node Modules
```bash
cd /path/to/tmstock/backend
npm ci --production
```

### 2.2 Build Application
```bash
npm run build
```

---

## 🗄️ Step 3: Database Migration & Seeding

### 3.1 Run Migrations (if using TypeORM migrations)
```bash
# If you have migrations
npm run migration:run
```

### 3.2 Run Seeders
```bash
npm run seed
```

**Note:** Seeders จะสร้างข้อมูลเริ่มต้น (branches, roles, users, categories)

---

## 🚀 Step 4: Start Application

### Option A: Using PM2 (Recommended)

#### 4.1 Install PM2
```bash
npm install -g pm2
```

#### 4.2 Create PM2 Ecosystem File
สร้างไฟล์ `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'tmstock-backend',
    script: './dist/main.js',
    instances: 2, // หรือ 'max' สำหรับใช้ทุก CPU core
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G'
  }]
};
```

#### 4.3 Start with PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup # สำหรับ auto-start เมื่อ server restart
```

#### 4.4 PM2 Commands
```bash
pm2 status          # Check status
pm2 logs            # View logs
pm2 restart all     # Restart all
pm2 stop all        # Stop all
pm2 delete all      # Delete all
```

### Option B: Using systemd (Linux)

#### 4.1 Create Service File
สร้างไฟล์ `/etc/systemd/system/tmstock-backend.service`:
```ini
[Unit]
Description=tmstock Backend API
After=network.target mysql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/tmstock/backend
ExecStart=/usr/bin/node dist/main.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=tmstock-backend
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

#### 4.2 Enable and Start
```bash
sudo systemctl daemon-reload
sudo systemctl enable tmstock-backend
sudo systemctl start tmstock-backend
sudo systemctl status tmstock-backend
```

---

## 🌐 Step 5: Nginx Configuration (Optional but Recommended)

### 5.1 Create Nginx Config
สร้างไฟล์ `/etc/nginx/sites-available/tmstock-api`:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to NestJS
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Swagger docs
    location /api/docs {
        proxy_pass http://localhost:3000/api/docs;
        proxy_set_header Host $host;
    }
}
```

### 5.2 Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/tmstock-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔒 Step 6: Security Hardening

### 6.1 Firewall Configuration
```bash
# Allow only necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 6.2 Database Security
- ใช้ strong password สำหรับ database user
- จำกัด database access จาก localhost เท่านั้น
- ใช้ SSL สำหรับ database connection (ถ้าเป็น remote)

### 6.3 Environment Variables
- เก็บ `.env` ไว้ใน safe location
- อย่า commit `.env` ไปยัง git
- ใช้ secrets management (เช่น AWS Secrets Manager, HashiCorp Vault)

---

## 📊 Step 7: Monitoring & Logging

### 7.1 Health Check Endpoint
```bash
curl http://localhost:3000/health
```

### 7.2 Log Files
- Application logs: `logs/` directory
- PM2 logs: `pm2 logs`
- System logs: `/var/log/syslog` (Linux)

### 7.3 Monitoring Tools
- **PM2 Monitoring:** `pm2 monit`
- **Prometheus + Grafana:** สำหรับ metrics
- **Sentry:** สำหรับ error tracking

---

## 🔄 Step 8: Update & Deployment

### 8.1 Update Process
```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
npm ci --production

# 3. Build
npm run build

# 4. Run migrations (if any)
npm run migration:run

# 5. Restart application
pm2 restart tmstock-backend
# หรือ
sudo systemctl restart tmstock-backend
```

### 8.2 Rollback Process
```bash
# 1. Checkout previous version
git checkout <previous-commit-hash>

# 2. Build and restart
npm run build
pm2 restart tmstock-backend
```

---

## 🧪 Step 9: Verification

### 9.1 Test Endpoints
```bash
# Health check
curl http://localhost:3000/health

# API docs
curl http://localhost:3000/api/docs

# Login (should return 401 without credentials)
curl http://localhost:3000/auth/login
```

### 9.2 Database Connection
```bash
# Test database connection
mysql -u tmstock_user -p tmstock -e "SELECT 1;"
```

---

## 📝 Step 10: Backup Strategy

### 10.1 Database Backup
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u tmstock_user -p tmstock > /backup/tmstock_$DATE.sql
# Keep only last 30 days
find /backup -name "tmstock_*.sql" -mtime +30 -delete
```

### 10.2 Application Backup
- Backup `.env` file
- Backup `dist/` directory (optional)
- Backup database regularly

---

## 🐛 Troubleshooting

### Issue: Application won't start
**Solution:**
```bash
# Check logs
pm2 logs tmstock-backend
# หรือ
sudo journalctl -u tmstock-backend -f

# Check port
netstat -tulpn | grep 3000

# Check database connection
mysql -u tmstock_user -p -e "SELECT 1;"
```

### Issue: 502 Bad Gateway
**Solution:**
- Check if application is running
- Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`
- Verify proxy_pass URL in Nginx config

### Issue: Database connection failed
**Solution:**
- Verify database credentials in `.env`
- Check database is running: `sudo systemctl status mysql`
- Check firewall rules
- Verify database user permissions

---

## ✅ Deployment Checklist

- [ ] Server requirements met
- [ ] Database created and configured
- [ ] `.env` file configured with production values
- [ ] Dependencies installed
- [ ] Application built successfully
- [ ] Database migrations run
- [ ] Seeders run
- [ ] Application started (PM2 or systemd)
- [ ] Health check endpoint working
- [ ] Nginx configured (if using)
- [ ] SSL certificate installed (if using HTTPS)
- [ ] Firewall configured
- [ ] Monitoring setup
- [ ] Backup strategy in place
- [ ] Documentation updated

---

## 📚 Additional Resources

- [NestJS Deployment](https://docs.nestjs.com/recipes/deployment)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx Configuration](https://nginx.org/en/docs/)

---

**Status:** Ready for Production  
**Last Updated:** 2025-01-07

