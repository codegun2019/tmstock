# 🗄️ Database Schema Analysis - mstock POS

**วันที่วิเคราะห์:** 2025-01-XX  
**Version:** 5.0  
**สถานะ:** 📋 Complete Database Analysis

---

## 🎯 Overview

**Database:** MySQL 8.0  
**Charset:** utf8mb4  
**Collation:** utf8mb4_unicode_ci  
**Engine:** InnoDB  
**Total Tables:** 31 tables  
**Migration Files:** 31 migrations

---

## 📊 Database Statistics

- **Total Tables:** 31
- **Core Tables:** 8 (users, roles, permissions, branches, products, invoices, stock_balances, stock_moves)
- **Supporting Tables:** 23 (sequences, attachments, history, etc.)
- **Foreign Keys:** 50+ relationships
- **Indexes:** 100+ indexes

---

## 📋 Table Categories

### 1. Authentication & Authorization (6 tables)
- `users` - พนักงาน/ผู้ใช้
- `roles` - บทบาท
- `permissions` - สิทธิ์
- `role_permissions` - ความสัมพันธ์ roles-permissions
- `user_roles` - ความสัมพันธ์ users-roles
- `login_attempts` - บันทึกการพยายาม login
- `feature_toggles` - Feature flags

### 2. Multi-Branch (1 table)
- `branches` - สาขา/ร้านค้า

### 3. Products & Inventory (6 tables)
- `products` - สินค้า
- `categories` - หมวดหมู่สินค้า
- `units` - หน่วยนับ
- `product_media` - รูปภาพสินค้า
- `stock_balances` - สต็อคปัจจุบัน (per product per branch)
- `stock_moves` - ประวัติการเคลื่อนไหวสต็อค

### 4. Sales & POS (3 tables)
- `invoices` - บิลขาย
- `invoice_items` - รายการสินค้าในบิล
- `invoice_sequences` - เลขลำดับบิล (daily per branch)

### 5. Contacts (3 tables)
- `contacts` - ลูกค้า/ผู้จำหน่าย
- `contact_banks` - บัญชีธนาคาร
- `contact_attachments` - ไฟล์แนบ

### 6. Repair Service (4 tables)
- `repair_orders` - ใบงานซ่อม
- `repair_items` - อะไหล่ที่ใช้
- `repair_status_history` - ประวัติสถานะ
- `repair_sequences` - เลขลำดับใบงานซ่อม

### 7. Documents Module (6 tables)
- `document_types` - ประเภทเอกสาร
- `documents` - เอกสารขาย/บัญชี
- `document_items` - รายการในเอกสาร
- `document_sequences` - เลขลำดับเอกสาร
- `document_attachments` - ไฟล์แนบ
- `document_history` - ประวัติการเปลี่ยนแปลง

### 8. GRN (Goods Receipt Note) (3 tables)
- `grn` - ใบรับสินค้า
- `grn_items` - รายการสินค้าที่รับ
- `grn_attachments` - ไฟล์แนบ
- `grn_sequences` - เลขลำดับ GRN

### 9. Stock Adjustments (4 tables)
- `stock_adjustments` - การปรับสต็อค
- `stock_adjustment_items` - รายการปรับสต็อค
- `stock_adjustment_attachments` - ไฟล์แนบ
- `stock_adjustment_sequences` - เลขลำดับ

### 10. Stock Transfers (4 tables)
- `stock_transfers` - การโอนสต็อค
- `stock_transfer_items` - รายการโอนสต็อค
- `stock_transfer_attachments` - ไฟล์แนบ
- `stock_transfer_sequences` - เลขลำดับ

### 11. System & Settings (4 tables)
- `audit_logs` - Audit trail
- `settings` - ตั้งค่าระบบ
- `backup_history` - ประวัติ backup
- `restore_history` - ประวัติ restore
- `customer_transactions` - ประวัติการทำธุรกรรมลูกค้า

### 12. Migration Tracking (1 table)
- `schema_migrations` - ติดตาม migrations

---

## 🔗 Core Tables Detail

### 1. users
**Purpose:** ข้อมูลพนักงาน/ผู้ใช้

**Key Columns:**
- `id` (PK)
- `username` (UNIQUE)
- `email` (UNIQUE)
- `password_hash`
- `full_name`
- `branch_id` (FK → branches)
- `active` (1=active, 0=suspended)

**Relationships:**
- `branch_id` → `branches.id`
- Many-to-many with `roles` via `user_roles`

**Indexes:**
- `uk_users_username`
- `uk_users_email`
- `idx_users_branch`
- `idx_users_active`

---

### 2. roles
**Purpose:** บทบาทผู้ใช้

**Key Columns:**
- `id` (PK)
- `name` (UNIQUE)
- `description`

**Relationships:**
- Many-to-many with `permissions` via `role_permissions`
- Many-to-many with `users` via `user_roles`

---

### 3. permissions
**Purpose:** สิทธิ์ต่างๆ ในระบบ

**Key Columns:**
- `id` (PK)
- `key` (UNIQUE) - e.g., "pos.sale", "product.create"
- `label` - ชื่อสิทธิ์ (ภาษาไทย)

**Relationships:**
- Many-to-many with `roles` via `role_permissions`

---

### 4. branches
**Purpose:** สาขา/ร้านค้า

**Key Columns:**
- `id` (PK)
- `code` (UNIQUE) - e.g., "BKK", "CMK"
- `name`
- `invoice_prefix` - Prefix สำหรับเลขบิล
- `active` (1=active, 0=inactive)

**Relationships:**
- One-to-many with `users`
- One-to-many with `invoices`
- One-to-many with `stock_balances`

---

### 5. products
**Purpose:** สินค้า

**Key Columns:**
- `id` (PK)
- `barcode` (UNIQUE)
- `sku` (UNIQUE, nullable)
- `name`
- `category_id` (FK → categories, nullable)
- `unit` / `unit_id` (FK → units, nullable)
- `cost_price`
- `selling_price`
- `active` (1=active, 0=inactive)
- `image_url` (legacy, use product_media instead)

**Relationships:**
- `category_id` → `categories.id`
- `unit_id` → `units.id` (if exists)
- One-to-many with `stock_balances`
- One-to-many with `stock_moves`
- One-to-many with `invoice_items`
- One-to-many with `product_media`

**Indexes:**
- `uk_products_barcode`
- `uk_products_sku`
- `idx_products_name`
- `idx_products_category`
- `idx_products_active`
- `ft_products_search` (FULLTEXT)

**Important Notes:**
- ⭐ **barcode is UNIQUE** - ใช้สำหรับสแกนใน POS
- ⭐ **sku is UNIQUE** - ใช้สำหรับ SKU code
- ⭐ **Full-text search** - รองรับการค้นหา name, description, barcode, sku

---

### 6. categories
**Purpose:** หมวดหมู่สินค้า

**Key Columns:**
- `id` (PK)
- `name`
- `slug` (UNIQUE)
- `parent_id` (FK → categories, nullable) - สำหรับ subcategories
- `display_order`
- `active`

**Relationships:**
- Self-referencing: `parent_id` → `categories.id`
- One-to-many with `products`

---

### 7. units
**Purpose:** หน่วยนับสินค้า

**Key Columns:**
- `id` (PK)
- `name` (UNIQUE) - e.g., "ชิ้น", "กล่อง", "ลัง"
- `symbol` - e.g., "pcs", "box", "carton"
- `display_order`
- `active`

**Relationships:**
- One-to-many with `products`

---

### 8. product_media
**Purpose:** รูปภาพ/สื่อสินค้า (multiple images per product)

**Key Columns:**
- `id` (PK)
- `product_id` (FK → products)
- `media_type` (ENUM: 'image', 'video', 'document')
- `file_path`
- `file_name`
- `file_size`
- `width` (pixels)
- `height` (pixels)
- `is_primary` (1=primary image)
- `display_order`

**Relationships:**
- `product_id` → `products.id`

**Indexes:**
- `idx_product_media_product`
- `idx_product_media_primary`

---

### 9. stock_balances ⭐ CRITICAL
**Purpose:** สต็อคปัจจุบัน (per product per branch)

**Key Columns:**
- `id` (PK)
- `product_id` (FK → products)
- `branch_id` (FK → branches)
- `quantity` (DECIMAL 10,2) - สต็อคปัจจุบัน
- `reserved_quantity` (DECIMAL 10,2) - สต็อคที่จองไว้
- `available_quantity` (GENERATED) - quantity - reserved_quantity
- `last_moved_at` - วันที่เคลื่อนไหวล่าสุด

**Relationships:**
- `product_id` → `products.id`
- `branch_id` → `branches.id`
- One-to-many with `stock_moves`

**Constraints:**
- ⭐ **UNIQUE (product_id, branch_id)** - สินค้า 1 ตัว = สต็อค 1 record ต่อสาขา

**Indexes:**
- `uk_stock_balances_product_branch` (UNIQUE)
- `idx_stock_balances_product`
- `idx_stock_balances_branch`

**Important Notes:**
- ⭐ **ต้องใช้ row-level lock** เมื่อ update
- ⭐ **available_quantity = quantity - reserved_quantity** (computed column)

---

### 10. stock_moves ⭐ CRITICAL
**Purpose:** ประวัติการเคลื่อนไหวสต็อค (audit trail)

**Key Columns:**
- `id` (PK)
- `product_id` (FK → products)
- `branch_id` (FK → branches)
- `move_type` (VARCHAR 20) - 'OUT', 'IN', 'ADJUST', 'TRANSFER'
- `quantity` (DECIMAL 10,2) - Positive = IN, Negative = OUT
- `balance_before` (DECIMAL 10,2) - สต็อคก่อนเคลื่อนไหว
- `balance_after` (DECIMAL 10,2) - สต็อคหลังเคลื่อนไหว
- `reference_type` (VARCHAR 50) - 'invoice', 'grn', 'adjustment', 'transfer', etc. ⭐
- `reference_id` (INT, nullable) - ID ของเอกสารต้นทาง ⭐
- `reason` (TEXT) - เหตุผล
- `created_by` (FK → users)
- `created_at`

**Relationships:**
- `product_id` → `products.id`
- `branch_id` → `branches.id`
- `created_by` → `users.id`

**Indexes:**
- `idx_stock_moves_product`
- `idx_stock_moves_branch`
- `idx_stock_moves_type`
- ⭐ **idx_stock_moves_reference** (reference_type, reference_id) - สำหรับ linking
- `idx_stock_moves_created`
- `idx_stock_moves_product_branch`

**Important Notes:**
- ⭐ **reference_type + reference_id** = สะพานลิงก์ไปยังเอกสารต้นทาง
- ⭐ **ทุกการเปลี่ยนสต็อคต้องบันทึกในตารางนี้**
- ⭐ **move_type:** OUT (ขาย), IN (รับเข้า), ADJUST (ปรับยอด), TRANSFER (โอน)

---

### 11. invoices ⭐ CRITICAL
**Purpose:** บิลขาย

**Key Columns:**
- `id` (PK)
- `invoice_no` (UNIQUE) - e.g., "BKK-20250115-0001"
- `branch_id` (FK → branches)
- `user_id` (FK → users) - แคชเชียร์
- `contact_id` (FK → contacts, nullable) - ลูกค้า (V4)
- `customer_name` (nullable) - ชื่อลูกค้า (snapshot)
- `customer_phone` (nullable)
- `subtotal` (DECIMAL 10,2)
- `discount_amount` (DECIMAL 10,2)
- `total_amount` (DECIMAL 10,2)
- `paid_amount` (DECIMAL 10,2)
- `change_amount` (DECIMAL 10,2)
- `payment_method` - 'cash', 'card', 'transfer', etc.
- `payment_details` (JSON) - รายละเอียดการชำระเงิน
- `status` (VARCHAR 20) - 'completed', 'void', 'refunded'
- `void_reason` (TEXT)
- `refund_reason` (TEXT)
- `voided_by` (FK → users)
- `voided_at`
- `refunded_by` (FK → users)
- `refunded_at`
- `notes` (TEXT)

**Relationships:**
- `branch_id` → `branches.id`
- `user_id` → `users.id`
- `contact_id` → `contacts.id` (V4)
- One-to-many with `invoice_items`
- Referenced by `stock_moves` (reference_type='invoice')

**Indexes:**
- `uk_invoices_invoice_no` (UNIQUE)
- `idx_invoices_branch`
- `idx_invoices_status`
- `idx_invoices_user`
- `idx_invoices_contact` (V4)
- `idx_invoices_created`

**Important Notes:**
- ⭐ **invoice_no is UNIQUE** - Generated from invoice_sequences
- ⭐ **status = 'completed'** = paid (ตัดสต็อคแล้ว)
- ⭐ **void/refund** = คืนสต็อค (สร้าง stock_move type='IN')

---

### 12. invoice_items
**Purpose:** รายการสินค้าในบิล

**Key Columns:**
- `id` (PK)
- `invoice_id` (FK → invoices)
- `product_id` (FK → products)
- `product_name` (VARCHAR 255) - Snapshot
- `barcode` (VARCHAR 50) - Snapshot
- `quantity` (DECIMAL 10,2)
- `unit_price` (DECIMAL 10,2) - ราคาตอนขาย
- `discount_amount` (DECIMAL 10,2)
- `subtotal` (DECIMAL 10,2)

**Relationships:**
- `invoice_id` → `invoices.id`
- `product_id` → `products.id`

**Indexes:**
- `idx_invoice_items_invoice`
- `idx_invoice_items_product`

**Important Notes:**
- ⭐ **product_name, barcode เป็น snapshot** - เก็บข้อมูลตอนขาย (ป้องกันการเปลี่ยนแปลง)
- ⭐ **ทุก item จะสร้าง stock_move type='OUT'** เมื่อสร้าง invoice

---

### 13. invoice_sequences
**Purpose:** เลขลำดับบิล (daily per branch)

**Key Columns:**
- `id` (PK)
- `branch_id` (FK → branches)
- `date` (DATE) - YYYY-MM-DD
- `sequence` (INT) - เลขลำดับปัจจุบัน
- `last_used_at` (DATETIME)

**Constraints:**
- ⭐ **UNIQUE (branch_id, date)** - 1 record ต่อสาขาต่อวัน

**Relationships:**
- `branch_id` → `branches.id`

**Important Notes:**
- ⭐ **ต้องใช้ row-level lock** เมื่อ generate sequence
- ⭐ **Reset ทุกวัน** (date เปลี่ยน)

---

### 14. contacts
**Purpose:** ลูกค้า/ผู้จำหน่าย

**Key Columns:**
- `id` (PK)
- `contact_code` (UNIQUE, nullable)
- `contact_type` (ENUM: 'individual', 'company')
- `category` (ENUM: 'customer', 'supplier', 'both')
- `business_name`
- `tax_id` (UNIQUE, nullable) - เลขผู้เสียภาษี
- `address`
- `office_phone`
- `contact_person_name`
- `contact_email`
- `contact_mobile`
- `active`

**Relationships:**
- One-to-many with `contact_banks`
- One-to-many with `contact_attachments`
- One-to-many with `invoices` (V4)
- One-to-many with `grn` (supplier)

**Indexes:**
- `uk_contacts_code` (UNIQUE)
- `uk_contacts_tax_id` (UNIQUE)
- `idx_contacts_category`
- `idx_contacts_active`

---

### 15. repair_orders
**Purpose:** ใบงานซ่อม

**Key Columns:**
- `id` (PK)
- `repair_no` (UNIQUE)
- `branch_id` (FK → branches)
- `user_id` (FK → users)
- `contact_id` (FK → contacts, nullable)
- `invoice_id` (FK → invoices, nullable) - Link to invoice (V4)
- `customer_name`
- `customer_phone`
- `device_type`, `device_brand`, `device_model`
- `problem_description`
- `status` (ENUM) - 'received', 'notified', 'waiting_notify', 'unreachable', 'completed', 'cancelled'
- `labor_cost`, `parts_cost`, `total_cost`
- `payment_status` (ENUM: 'unpaid', 'partial', 'paid')
- `images_before` (JSON) - Array of image paths
- `images_after` (JSON)
- `images_during` (JSON)

**Relationships:**
- `branch_id` → `branches.id`
- `user_id` → `users.id`
- `contact_id` → `contacts.id`
- `invoice_id` → `invoices.id` (V4)
- One-to-many with `repair_items`
- One-to-many with `repair_status_history`

**Indexes:**
- `uk_repair_orders_repair_no` (UNIQUE)
- `idx_repair_orders_status`
- `idx_repair_orders_branch`
- `idx_repair_orders_invoice` (V4)

---

### 16. repair_items
**Purpose:** อะไหล่ที่ใช้ในงานซ่อม

**Key Columns:**
- `id` (PK)
- `repair_order_id` (FK → repair_orders)
- `product_id` (FK → products, nullable) - ถ้าเป็นสินค้าจาก inventory
- `item_name`
- `quantity`
- `unit_price`
- `subtotal`
- `is_warranty` (1=warranty, ไม่คิดเงิน)

**Relationships:**
- `repair_order_id` → `repair_orders.id`
- `product_id` → `products.id`

**Important Notes:**
- ⭐ **ถ้า product_id มีค่า** = ตัดสต็อค (สร้าง stock_move type='OUT')
- ⭐ **is_warranty = 1** = ไม่คิดเงิน แต่ตัดสต็อค

---

### 17. documents
**Purpose:** เอกสารขาย/บัญชี (V4)

**Key Columns:**
- `id` (PK)
- `document_no` (UNIQUE)
- `document_type_id` (FK → document_types)
- `branch_id` (FK → branches)
- `user_id` (FK → users)
- `contact_id` (FK → contacts)
- `document_date` (DATE)
- `due_date` (DATE)
- `subtotal`, `discount_amount`, `tax_amount`, `total_amount`
- `paid_amount`
- `balance_amount` (GENERATED)
- `status` (ENUM) - 'draft', 'pending', 'approved', 'sent', 'confirmed', 'completed', 'cancelled', 'void'
- `reference_document_id` (FK → documents) - Link to other documents
- `invoice_id` (FK → invoices, nullable) - Link to POS invoice
- `repair_order_id` (FK → repair_orders, nullable) - Link to repair order

**Relationships:**
- `document_type_id` → `document_types.id`
- `branch_id` → `branches.id`
- `user_id` → `users.id`
- `contact_id` → `contacts.id`
- `reference_document_id` → `documents.id` (self-reference)
- `invoice_id` → `invoices.id`
- `repair_order_id` → `repair_orders.id`
- One-to-many with `document_items`
- One-to-many with `document_attachments`
- One-to-many with `document_history`

**Indexes:**
- `uk_documents_document_no` (UNIQUE)
- `idx_documents_type`
- `idx_documents_status`
- `idx_documents_reference`
- `idx_documents_invoice`
- `idx_documents_repair`

---

### 18. grn
**Purpose:** ใบรับสินค้า (Goods Receipt Note)

**Key Columns:**
- `id` (PK)
- `grn_no` (UNIQUE)
- `supplier_id` (FK → contacts)
- `branch_id` (FK → branches)
- `received_date` (DATE)
- `reference_no` - เลขที่เอกสารผู้จำหน่าย
- `total_amount`
- `status` (ENUM: 'draft', 'completed', 'cancelled')

**Relationships:**
- `supplier_id` → `contacts.id`
- `branch_id` → `branches.id`
- One-to-many with `grn_items`
- Referenced by `stock_moves` (reference_type='grn')

**Important Notes:**
- ⭐ **เมื่อ complete GRN** = เพิ่มสต็อค (สร้าง stock_move type='IN')
- ⭐ **สามารถ update cost_price** ของสินค้าได้

---

### 19. stock_adjustments
**Purpose:** การปรับสต็อค

**Key Columns:**
- `id` (PK)
- `adjustment_no` (UNIQUE)
- `branch_id` (FK → branches)
- `adjustment_type` (ENUM: 'increase', 'decrease', 'set_to')
- `reason` (ENUM: 'missing', 'damaged', 'count_discrepancy', 'correction', 'other')
- `status` (ENUM: 'draft', 'pending_approval', 'approved', 'rejected', 'cancelled')
- `requires_approval` (1=requires approval)

**Relationships:**
- `branch_id` → `branches.id`
- One-to-many with `stock_adjustment_items`
- Referenced by `stock_moves` (reference_type='adjustment')

**Important Notes:**
- ⭐ **ต้องมี approval** (default)
- ⭐ **เมื่อ approve** = ปรับสต็อค (สร้าง stock_move type='ADJUST')

---

### 20. stock_transfers
**Purpose:** การโอนสต็อคระหว่างสาขา

**Key Columns:**
- `id` (PK)
- `transfer_no` (UNIQUE)
- `from_branch_id` (FK → branches)
- `to_branch_id` (FK → branches)
- `status` (ENUM: 'draft', 'submitted', 'approved', 'in_transit', 'received', 'completed', 'cancelled')
- `transfer_date` (DATE)
- `received_date` (DATE)

**Relationships:**
- `from_branch_id` → `branches.id`
- `to_branch_id` → `branches.id`
- One-to-many with `stock_transfer_items`
- Referenced by `stock_moves` (reference_type='transfer')

**Important Notes:**
- ⭐ **เมื่อ complete transfer** = สร้าง stock_move 2 records:
  - From branch: type='TRANSFER', quantity=- (OUT)
  - To branch: type='TRANSFER', quantity=+ (IN)

---

### 21. audit_logs
**Purpose:** Audit trail ของทุก action

**Key Columns:**
- `id` (PK)
- `actor_user_id` (FK → users)
- `branch_id` (FK → branches)
- `action` (VARCHAR 50) - 'create', 'update', 'delete', etc.
- `entity_type` (VARCHAR 50) - 'user', 'product', 'invoice', etc.
- `entity_id` (INT)
- `description` (TEXT)
- `before_data` (JSON) - ข้อมูลก่อนเปลี่ยน
- `after_data` (JSON) - ข้อมูลหลังเปลี่ยน
- `ip_address`
- `user_agent`

**Relationships:**
- `actor_user_id` → `users.id`
- `branch_id` → `branches.id`

**Indexes:**
- `idx_audit_actor`
- `idx_audit_branch`
- `idx_audit_entity`
- `idx_audit_action`
- `idx_audit_created`

---

### 22. settings
**Purpose:** ตั้งค่าระบบ

**Key Columns:**
- `id` (PK)
- `category` (VARCHAR 50) - 'general', 'company', 'document', 'pos', 'system', 'backup'
- `key` (VARCHAR 100) - Setting key
- `value` (TEXT) - Setting value (JSON for complex data)
- `type` (ENUM: 'string', 'number', 'boolean', 'json', 'file')
- `is_public` (1=public, 0=admin only)
- `is_encrypted` (1=encrypted)

**Constraints:**
- ⭐ **UNIQUE (category, key)**

**Indexes:**
- `uk_settings_category_key` (UNIQUE)
- `idx_settings_category`

---

### 23. customer_transactions
**Purpose:** ประวัติการทำธุรกรรมลูกค้า (unified view)

**Key Columns:**
- `id` (PK)
- `contact_id` (FK → contacts)
- `transaction_type` (ENUM: 'sale', 'repair', 'payment', 'credit', 'refund')
- `reference_type` (ENUM: 'invoice', 'repair_order', 'payment', 'credit_note')
- `reference_id` (INT)
- `reference_no` (VARCHAR 50)
- `transaction_date` (DATETIME)
- `amount` (DECIMAL 10,2) - Positive = debit, Negative = credit
- `balance` (DECIMAL 10,2) - Running balance
- `due_date` (DATE) - สำหรับ credit transactions
- `payment_status` (ENUM: 'unpaid', 'partial', 'paid', 'overdue')
- `paid_amount` (DECIMAL 10,2)

**Relationships:**
- `contact_id` → `contacts.id`

**Indexes:**
- `idx_customer_transactions_contact`
- `idx_customer_transactions_type`
- `idx_customer_transactions_reference`
- `idx_customer_transactions_payment_status`

---

## 🔗 Critical Relationships

### Products ↔ Stock ↔ Sales Flow
```
products (id)
  ↓
stock_balances (product_id, branch_id, quantity)
  ↓
stock_moves (product_id, branch_id, move_type, reference_type, reference_id)
  ↓
invoices (id) / grn (id) / stock_adjustments (id) / stock_transfers (id)
```

**Key Points:**
- ⭐ **stock_balances** = สต็อคปัจจุบัน (per product per branch)
- ⭐ **stock_moves** = ประวัติการเคลื่อนไหว (audit trail)
- ⭐ **reference_type + reference_id** = ลิงก์ไปยังเอกสารต้นทาง

---

### Invoice → Stock Movement Flow
```
invoices (id, status='completed')
  ↓
invoice_items (invoice_id, product_id, quantity)
  ↓
stock_moves (reference_type='invoice', reference_id=invoice_id, move_type='OUT', quantity=-)
  ↓
stock_balances (quantity updated)
```

**Key Points:**
- ⭐ **ตัดสต็อคเฉพาะเมื่อ status='completed'**
- ⭐ **ทุก invoice_item สร้าง stock_move**

---

### GRN → Stock Movement Flow
```
grn (id, status='completed')
  ↓
grn_items (grn_id, product_id, quantity)
  ↓
stock_moves (reference_type='grn', reference_id=grn_id, move_type='IN', quantity=+)
  ↓
stock_balances (quantity updated)
```

---

### Stock Adjustment → Stock Movement Flow
```
stock_adjustments (id, status='approved')
  ↓
stock_adjustment_items (adjustment_id, product_id, adjustment_quantity)
  ↓
stock_moves (reference_type='adjustment', reference_id=adjustment_id, move_type='ADJUST', quantity=±)
  ↓
stock_balances (quantity updated)
```

---

## 📊 Index Strategy

### Primary Keys
- ทุก table มี `id` (AUTO_INCREMENT) เป็น PK

### Unique Constraints
- `users.username` (UNIQUE)
- `users.email` (UNIQUE)
- `products.barcode` (UNIQUE)
- `products.sku` (UNIQUE)
- `invoices.invoice_no` (UNIQUE)
- `stock_balances` (product_id, branch_id) (UNIQUE)
- `invoice_sequences` (branch_id, date) (UNIQUE)

### Foreign Key Indexes
- ทุก FK column มี index

### Composite Indexes
- `stock_moves` (product_id, branch_id)
- `stock_moves` (reference_type, reference_id) ⭐
- `invoice_sequences` (branch_id, date)
- `audit_logs` (entity_type, entity_id)

### Full-Text Indexes
- `products` (name, description, barcode, sku) - FULLTEXT

---

## 🔒 Constraints & Rules

### Foreign Key Constraints
- **ON DELETE CASCADE:** child records ลบเมื่อ parent ลบ
  - `role_permissions` → `roles`
  - `user_roles` → `roles`
  - `invoice_items` → `invoices`
  - `stock_balances` → `products`
  - `stock_moves` → `products`

- **ON DELETE RESTRICT:** ป้องกันการลบ parent ถ้ามี child
  - `invoices` → `branches`
  - `invoices` → `users`
  - `stock_balances` → `branches`

- **ON DELETE SET NULL:** child records set FK = NULL เมื่อ parent ลบ
  - `users.branch_id` → `branches`
  - `audit_logs.actor_user_id` → `users`

---

## 📈 Data Types

### IDs
- `INT(11)` - สำหรับ PK และ FK
- `AUTO_INCREMENT` - สำหรับ PK

### Strings
- `VARCHAR(50)` - สำหรับ codes, keys
- `VARCHAR(100)` - สำหรับ names, emails
- `VARCHAR(255)` - สำหรับ descriptions, paths
- `TEXT` - สำหรับ long text

### Numbers
- `DECIMAL(10,2)` - สำหรับเงิน, ราคา, สต็อค
- `INT(11)` - สำหรับ quantities, counts
- `TINYINT(1)` - สำหรับ flags (0/1)

### Dates
- `DATE` - สำหรับ dates
- `DATETIME` - สำหรับ timestamps
- `TIMESTAMP` - สำหรับ created_at, updated_at

### JSON
- `JSON` - สำหรับ complex data (payment_details, images arrays)

### ENUMs
- `ENUM` - สำหรับ fixed values (status, type, etc.)

---

## 🎯 Business Logic Patterns

### Pattern 1: Sequence Generation
**Tables:** `invoice_sequences`, `grn_sequences`, `repair_sequences`, etc.

**Pattern:**
- 1 record per branch per date
- UNIQUE (branch_id, date)
- Increment sequence with row-level lock
- Reset daily (date changes)

---

### Pattern 2: Stock Movement Audit Trail
**Table:** `stock_moves`

**Pattern:**
- ทุกการเปลี่ยนสต็อคต้องบันทึก
- มี balance_before และ balance_after
- มี reference_type และ reference_id สำหรับ linking
- มี reason สำหรับ audit

---

### Pattern 3: Snapshot Data
**Tables:** `invoice_items`, `grn_items`, `stock_adjustment_items`

**Pattern:**
- เก็บ product_name, barcode, sku เป็น snapshot
- ป้องกันการเปลี่ยนแปลงข้อมูลสินค้าในอนาคต

---

### Pattern 4: Status Tracking
**Tables:** `invoices`, `repair_orders`, `documents`, `grn`, `stock_adjustments`, `stock_transfers`

**Pattern:**
- มี status column (ENUM)
- มี status change history (optional)
- มี approval workflow (optional)

---

### Pattern 5: Attachment Pattern
**Tables:** `product_media`, `contact_attachments`, `grn_attachments`, `document_attachments`

**Pattern:**
- เก็บ file_path, file_name, file_size
- มี uploaded_by สำหรับ audit
- Cascade delete เมื่อ parent ลบ

---

## ⚠️ Important Notes

### 1. Stock Operations
- ⭐ **ต้องใช้ transaction** สำหรับทุก stock operation
- ⭐ **ต้องใช้ row-level lock** เมื่อ update stock_balances
- ⭐ **ต้องสร้าง stock_moves record** ทุกครั้งที่เปลี่ยนสต็อค

### 2. Reference Linking
- ⭐ **reference_type + reference_id** = สะพานลิงก์
- ⭐ **ใช้สำหรับ UX integration** (Invoice Detail → Stock Movements)

### 3. Sequence Generation
- ⭐ **ต้องใช้ row-level lock** เพื่อป้องกัน duplicate
- ⭐ **Reset ทุกวัน** (date changes)

### 4. Audit Trail
- ⭐ **ทุก action บันทึกใน audit_logs**
- ⭐ **stock_moves = audit trail สำหรับสต็อค**

### 5. Multi-Branch
- ⭐ **ทุก table ที่เกี่ยวข้องกับสต็อคต้องมี branch_id**
- ⭐ **stock_balances = per product per branch**

---

## 📚 Related Documents

- `docs/MODULE_MAPPING.md` - Module mapping
- `docs/INTEGRATION_POINTS.md` - Integration points
- `docs/KEY_POINTS_SYSTEM_INTEGRITY.md` - Critical rules

---

**Status:** 📋 Database Analysis Complete

**Last Updated:** 2025-01-XX

**⭐ Total: 31 tables, 50+ relationships, 100+ indexes**

