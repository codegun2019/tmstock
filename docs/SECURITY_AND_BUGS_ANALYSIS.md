# 🔒 Security & Bugs Analysis - Critical Points

**วันที่วิเคราะห์:** 2025-01-XX  
**Version:** 5.0  
**สถานะ:** 📋 Complete Security & Bugs Analysis

---

## 🎯 Overview

วิเคราะห์ความปลอดภัย, บัค, และจุดที่ต้องระวังเพื่อให้พัฒนาแบบไม่สะดุด

**Categories:**
1. 🔒 Security Vulnerabilities
2. 🐛 Common Bugs & Edge Cases
3. ⚠️ Critical Points to Watch
4. ✅ Best Practices & Solutions

---

## 🔒 Security Vulnerabilities

### 1. Authentication & Authorization

#### ⚠️ Issue 1.1: Session Timeout Not Enforced Properly
**Current State:**
```php
// Auth.php - Session timeout check
$sessionTimeout = 3600; // 1 hour
if (time() - $_SESSION['login_time'] > $sessionTimeout) {
    self::logout();
    return false;
}
```

**Problems:**
- ✅ Session timeout exists but may not be checked on every request
- ⚠️ Session hijacking risk if session ID is exposed
- ⚠️ No session regeneration after login

**Solution (NestJS):**
```typescript
// Use JWT with refresh tokens
// Set short expiration (15 min) for access token
// Use refresh token (7 days) for re-authentication
// Regenerate session ID after login
```

---

#### ⚠️ Issue 1.2: Password Reset Shows Plain Text Password
**Current State:**
```php
// UsersController.php - resetPassword()
$newPassword = $this->userModel->resetPassword($id);
// Returns plain text password to admin
```

**Problems:**
- ⚠️ Plain text password returned in response
- ⚠️ Password shown in browser/console
- ⚠️ No forced password change on first login

**Solution (NestJS):**
```typescript
// Generate secure random password
// Send password via secure channel (email)
// Force password change on first login
// Never return password in API response
```

---

#### ⚠️ Issue 1.3: Rate Limiting Only on Login
**Current State:**
```php
// Auth.php - Rate limiting only for login
private static function isRateLimited($username, $ipAddress = null) {
    // Only checks login_attempts table
}
```

**Problems:**
- ⚠️ No rate limiting on other sensitive endpoints
- ⚠️ No rate limiting on API endpoints
- ⚠️ No protection against brute force on other operations

**Solution (NestJS):**
```typescript
// Use @Throttle() decorator on all sensitive endpoints
// Implement rate limiting middleware
// Use Redis for distributed rate limiting
// Different limits for different operations
```

---

### 2. Input Validation & Sanitization

#### ⚠️ Issue 2.1: Inconsistent Input Validation
**Current State:**
```php
// Some controllers validate, some don't
$barcode = trim($_GET['barcode'] ?? $_POST['barcode'] ?? '');
// No type checking, no length validation
```

**Problems:**
- ⚠️ No centralized validation
- ⚠️ Type coercion issues (string to int)
- ⚠️ No length limits enforced
- ⚠️ SQL injection risk if not using prepared statements

**Solution (NestJS):**
```typescript
// Use class-validator DTOs
// Validate all inputs at controller level
// Use transform pipes for type conversion
// Enforce length limits in DTOs
```

**Example:**
```typescript
export class CreateInvoiceDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];

  @IsOptional()
  @IsString()
  @MaxLength(100)
  customer_name?: string;
}
```

---

#### ⚠️ Issue 2.2: XSS Vulnerability in Output
**Current State:**
```php
// Some views use htmlspecialchars(), some don't
echo $product['name']; // Potential XSS
```

**Problems:**
- ⚠️ Inconsistent escaping
- ⚠️ User-generated content not sanitized
- ⚠️ JSON responses may contain unsanitized data

**Solution (NestJS):**
```typescript
// Use class-transformer to sanitize outputs
// Use helmet.js for XSS protection headers
// Sanitize all user inputs before storing
// Use template engine that auto-escapes
```

---

#### ⚠️ Issue 2.3: File Upload Security
**Current State:**
```php
// ProductsController.php - uploadMedia()
// No file type validation
// No file size limits
// No virus scanning
```

**Problems:**
- ⚠️ No MIME type validation
- ⚠️ No file size limits
- ⚠️ No virus scanning
- ⚠️ Path traversal risk

**Solution (NestJS):**
```typescript
// Use multer with file type validation
// Enforce file size limits
// Scan files with antivirus
// Store files outside web root
// Use UUID for file names
```

---

### 3. SQL Injection & Database Security

#### ✅ Good: Using Prepared Statements
**Current State:**
```php
// Database.php - Uses PDO prepared statements
$stmt = $this->pdo->prepare($sql);
$stmt->execute($params);
```

**Status:** ✅ Protected against SQL injection

**Solution (NestJS):**
```typescript
// TypeORM uses parameterized queries by default
// Always use QueryBuilder or Repository methods
// Never use raw SQL with string concatenation
```

---

#### ⚠️ Issue 3.1: No Row-Level Security
**Current State:**
```php
// No branch-level data isolation
// Users can access data from other branches
```

**Problems:**
- ⚠️ No multi-tenancy isolation
- ⚠️ Branch data not filtered by default
- ⚠️ Users can access unauthorized data

**Solution (NestJS):**
```typescript
// Use QueryBuilder with branch_id filter
// Implement global scope for branch filtering
// Use guards to enforce branch access
```

---

### 4. CSRF Protection

#### ✅ Good: CSRF Token Implementation
**Current State:**
```php
// CSRF.php - Proper CSRF token generation
$_SESSION['csrf_token'] = bin2hex(random_bytes(32));
// Uses hash_equals() for comparison
```

**Status:** ✅ CSRF protection exists

**Solution (NestJS):**
```typescript
// Use @nestjs/csrf package
// Enable CSRF protection for state-changing operations
// Use SameSite cookies
```

---

### 5. API Security

#### ⚠️ Issue 5.1: No API Authentication
**Current State:**
```php
// All API endpoints use session-based auth
// No API keys or tokens
```

**Problems:**
- ⚠️ No API key support
- ⚠️ No token-based authentication
- ⚠️ Session-based auth not suitable for mobile/SPA

**Solution (NestJS):**
```typescript
// Use JWT for API authentication
// Support API keys for external integrations
// Use refresh tokens for long-lived sessions
```

---

#### ⚠️ Issue 5.2: No Request Size Limits
**Current State:**
```php
// No limits on POST body size
// No limits on file upload size
```

**Problems:**
- ⚠️ DoS risk from large requests
- ⚠️ Memory exhaustion risk
- ⚠️ No request timeout

**Solution (NestJS):**
```typescript
// Use body-parser with size limits
// Set max request size (e.g., 10MB)
// Set request timeout
// Use rate limiting
```

---

## 🐛 Common Bugs & Edge Cases

### 1. Stock Management Bugs

#### 🐛 Bug 1.1: Race Condition in Stock Deduction
**Current State:**
```php
// Invoice.php - create()
// No row-level locking
$this->inventory->sale($product['id'], $item['quantity'], $invoiceId, $branchId);
```

**Problems:**
- 🐛 Concurrent sales can cause negative stock
- 🐛 Stock check and update not atomic
- 🐛 No locking mechanism

**Solution (NestJS):**
```typescript
// Use pessimistic locking
const balance = await queryRunner.manager
  .createQueryBuilder(StockBalance, 'balance')
  .setLock('pessimistic_write')
  .where('balance.product_id = :productId', { productId })
  .andWhere('balance.branch_id = :branchId', { branchId })
  .getOne();

// Check and update in same transaction
if (balance.quantity < requiredQuantity) {
  throw new BadRequestException('Insufficient stock');
}
balance.quantity -= requiredQuantity;
await queryRunner.manager.save(balance);
```

---

#### 🐛 Bug 1.2: Stock Deducted Before Payment Confirmed
**Current State:**
```php
// Invoice.php - create()
// Stock deducted immediately, not on payment
$this->inventory->sale($product['id'], $item['quantity'], $invoiceId, $branchId);
```

**Problems:**
- 🐛 Stock deducted for unpaid invoices
- 🐛 Stock not returned if payment fails
- 🐛 No payment status check

**Solution (NestJS):**
```typescript
// Only deduct stock when payment_status = 'paid'
if (dto.payment_status === 'paid') {
  await this.inventoryService.sale(...);
}
```

---

#### 🐛 Bug 1.3: Stock Not Returned on Void/Refund
**Current State:**
```php
// Invoice.php - void()
// May not return stock properly
```

**Problems:**
- 🐛 Stock not returned on void
- 🐛 Stock not returned on refund
- 🐛 No check if stock was deducted

**Solution (NestJS):**
```typescript
// Check if invoice was paid before returning stock
if (invoice.status === 'completed' && invoice.paid_amount > 0) {
  // Return stock
  await this.inventoryService.return(...);
}
```

---

### 2. Transaction Bugs

#### 🐛 Bug 2.1: Transaction Not Rolled Back on Error
**Current State:**
```php
// Some code uses transactions, some doesn't
// Rollback may not happen in all error cases
```

**Problems:**
- 🐛 Partial updates on error
- 🐛 Data inconsistency
- 🐛 No transaction wrapper

**Solution (NestJS):**
```typescript
// Always use transactions for multi-step operations
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

#### 🐛 Bug 2.2: Nested Transactions Not Handled
**Current State:**
```php
// No support for nested transactions
// Calling transaction inside transaction causes issues
```

**Problems:**
- 🐛 Nested transactions not supported
- 🐛 Deadlock risk
- 🐛 No savepoint support

**Solution (NestJS):**
```typescript
// Use QueryRunner for nested transactions
// Use savepoints for nested operations
// Or refactor to avoid nesting
```

---

### 3. Data Integrity Bugs

#### 🐛 Bug 3.1: Orphaned Records
**Current State:**
```php
// No foreign key constraints enforced
// No cascade delete
```

**Problems:**
- 🐛 Orphaned invoice_items if invoice deleted
- 🐛 Orphaned stock_moves if product deleted
- 🐛 Data inconsistency

**Solution (NestJS):**
```typescript
// Use foreign key constraints
// Use cascade options in TypeORM
// Use soft deletes instead of hard deletes
```

---

#### 🐛 Bug 3.2: Duplicate Invoice Numbers
**Current State:**
```php
// InvoiceSequence.php - Uses row-level locking
// But may still have race conditions
```

**Problems:**
- 🐛 Race condition in sequence generation
- 🐛 Duplicate invoice numbers possible
- 🐛 No unique constraint

**Solution (NestJS):**
```typescript
// Use database-level unique constraint
// Use pessimistic locking for sequence generation
// Use database sequences or auto-increment
```

---

### 4. Error Handling Bugs

#### 🐛 Bug 4.1: Errors Exposed to Users
**Current State:**
```php
// Some errors show full stack trace
echo json_encode(['success' => false, 'message' => $e->getMessage()]);
```

**Problems:**
- 🐛 Stack traces exposed
- 🐛 Database errors exposed
- 🐛 No error logging

**Solution (NestJS):**
```typescript
// Use global exception filter
// Log errors to file/logging service
// Return generic error messages to users
// Only show details in development
```

---

#### 🐛 Bug 4.2: No Error Recovery
**Current State:**
```php
// Errors cause complete failure
// No retry mechanism
// No partial success handling
```

**Problems:**
- 🐛 No retry on transient errors
- 🐛 No partial success handling
- 🐛 No error recovery

**Solution (NestJS):**
```typescript
// Use retry mechanism for transient errors
// Use circuit breaker pattern
// Implement idempotent operations
```

---

### 5. Concurrency Bugs

#### 🐛 Bug 5.1: Lost Updates
**Current State:**
```php
// No optimistic locking
// No version checking
```

**Problems:**
- 🐛 Lost updates on concurrent edits
- 🐛 No conflict detection
- 🐛 Data overwritten silently

**Solution (NestJS):**
```typescript
// Use optimistic locking with version field
@Entity()
export class Product {
  @Version()
  version: number;
}

// Check version before update
if (product.version !== dto.version) {
  throw new ConflictException('Product was modified');
}
```

---

#### 🐛 Bug 5.2: Deadlocks
**Current State:**
```php
// No deadlock detection
// No retry on deadlock
```

**Problems:**
- 🐛 Deadlocks cause failures
- 🐛 No automatic retry
- 🐛 No deadlock detection

**Solution (NestJS):**
```typescript
// Detect deadlock errors
// Retry on deadlock (up to 3 times)
// Use consistent lock ordering
// Keep transactions short
```

---

## ⚠️ Critical Points to Watch

### 1. Stock Operations ⭐ CRITICAL

#### ⚠️ Point 1.1: Stock Deduction Must Be Atomic
**Rule:** Stock deduction must be in a single transaction with invoice creation

**Checklist:**
- [ ] Use transaction for invoice creation + stock deduction
- [ ] Use row-level locking for stock check
- [ ] Check stock availability before deduction
- [ ] Rollback on any error
- [ ] Only deduct stock when payment_status = 'paid'

---

#### ⚠️ Point 1.2: Stock Return Must Match Deduction
**Rule:** Stock return must match original deduction quantity

**Checklist:**
- [ ] Check invoice status before returning stock
- [ ] Return exact quantity that was deducted
- [ ] Create stock movement with correct reference
- [ ] Use transaction for return operation

---

#### ⚠️ Point 1.3: Concurrent Sales Must Not Cause Negative Stock
**Rule:** Multiple concurrent sales must not cause negative stock

**Checklist:**
- [ ] Use pessimistic locking (SELECT ... FOR UPDATE)
- [ ] Check stock availability after lock
- [ ] Update stock in same transaction
- [ ] Handle lock timeout gracefully

---

### 2. Payment Operations ⭐ CRITICAL

#### ⚠️ Point 2.1: Payment Status Must Be Checked
**Rule:** Stock deduction only happens when payment is confirmed

**Checklist:**
- [ ] Check payment_status before stock deduction
- [ ] Handle unpaid invoices separately
- [ ] Return stock if payment fails
- [ ] Prevent double payment

---

#### ⚠️ Point 2.2: Idempotency for Payment
**Rule:** Payment operations must be idempotent

**Checklist:**
- [ ] Check if already paid before processing
- [ ] Use idempotency keys for payment requests
- [ ] Prevent double deduction
- [ ] Return same result for duplicate requests

---

### 3. Data Validation ⭐ CRITICAL

#### ⚠️ Point 3.1: All Inputs Must Be Validated
**Rule:** All user inputs must be validated before processing

**Checklist:**
- [ ] Validate all DTOs with class-validator
- [ ] Check required fields
- [ ] Validate data types
- [ ] Check length limits
- [ ] Validate business rules

---

#### ⚠️ Point 3.2: Output Must Be Sanitized
**Rule:** All outputs must be sanitized to prevent XSS

**Checklist:**
- [ ] Escape HTML in all outputs
- [ ] Sanitize JSON responses
- [ ] Use template engine with auto-escaping
- [ ] Validate file uploads

---

### 4. Error Handling ⭐ CRITICAL

#### ⚠️ Point 4.1: Errors Must Be Logged
**Rule:** All errors must be logged for debugging

**Checklist:**
- [ ] Log all exceptions
- [ ] Include context (user, request, stack trace)
- [ ] Use structured logging
- [ ] Don't expose errors to users

---

#### ⚠️ Point 4.2: Transactions Must Be Rolled Back on Error
**Rule:** All transactions must be rolled back on error

**Checklist:**
- [ ] Use try-catch for all transactions
- [ ] Rollback on any error
- [ ] Release query runner in finally block
- [ ] Handle rollback errors

---

### 5. Security ⭐ CRITICAL

#### ⚠️ Point 5.1: Authentication Must Be Enforced
**Rule:** All protected endpoints must check authentication

**Checklist:**
- [ ] Use @UseGuards(AuthGuard) on all protected routes
- [ ] Check permissions for each operation
- [ ] Validate JWT tokens
- [ ] Handle expired tokens

---

#### ⚠️ Point 5.2: Authorization Must Be Enforced
**Rule:** All operations must check user permissions

**Checklist:**
- [ ] Check permissions before operations
- [ ] Use RBAC for access control
- [ ] Check branch access
- [ ] Prevent privilege escalation

---

## ✅ Best Practices & Solutions

### 1. Security Best Practices

#### ✅ Practice 1.1: Use JWT for Authentication
```typescript
// Use JWT with short expiration
@UseGuards(JwtAuthGuard)
@Controller('api/invoices')
export class InvoicesController {
  // Protected endpoints
}
```

---

#### ✅ Practice 1.2: Use DTOs for Validation
```typescript
export class CreateInvoiceDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];

  @IsOptional()
  @IsString()
  @MaxLength(100)
  customer_name?: string;

  @IsNumber()
  @Min(0)
  paid_amount: number;
}
```

---

#### ✅ Practice 1.3: Use Transactions for Critical Operations
```typescript
async createInvoice(dto: CreateInvoiceDto) {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.startTransaction();

  try {
    // Create invoice
    const invoice = await queryRunner.manager.save(...);
    
    // Deduct stock
    await this.deductStock(...);
    
    await queryRunner.commitTransaction();
    return invoice;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}
```

---

### 2. Bug Prevention Best Practices

#### ✅ Practice 2.1: Use TypeScript for Type Safety
```typescript
// TypeScript catches type errors at compile time
interface Invoice {
  id: number;
  invoice_no: string;
  status: 'draft' | 'completed' | 'voided';
  total_amount: number;
}
```

---

#### ✅ Practice 2.2: Use Unit Tests
```typescript
describe('InvoiceService', () => {
  it('should deduct stock when creating paid invoice', async () => {
    // Test stock deduction
  });

  it('should not deduct stock for unpaid invoice', async () => {
    // Test unpaid invoice
  });

  it('should handle concurrent sales', async () => {
    // Test race condition
  });
});
```

---

#### ✅ Practice 2.3: Use Integration Tests
```typescript
describe('Invoice E2E', () => {
  it('should create invoice and deduct stock', async () => {
    // Test full flow
  });
});
```

---

### 3. Code Quality Best Practices

#### ✅ Practice 3.1: Use Linting
```typescript
// Use ESLint for code quality
// Use Prettier for formatting
// Use Husky for pre-commit hooks
```

---

#### ✅ Practice 3.2: Use Code Reviews
```typescript
// Review all code changes
// Check for security issues
// Check for bugs
// Check for performance issues
```

---

#### ✅ Practice 3.3: Use Error Monitoring
```typescript
// Use Sentry or similar for error monitoring
// Track errors in production
// Alert on critical errors
// Analyze error patterns
```

---

## 📋 Security Checklist

### Authentication
- [ ] JWT tokens with short expiration
- [ ] Refresh tokens for long-lived sessions
- [ ] Password hashing with bcrypt/argon2
- [ ] Rate limiting on login
- [ ] Session timeout enforcement
- [ ] Password reset via secure channel

### Authorization
- [ ] RBAC implementation
- [ ] Permission checks on all operations
- [ ] Branch-level access control
- [ ] Prevent privilege escalation

### Input Validation
- [ ] DTOs with class-validator
- [ ] Type checking
- [ ] Length limits
- [ ] Business rule validation

### Output Sanitization
- [ ] HTML escaping
- [ ] JSON sanitization
- [ ] XSS protection headers
- [ ] Template auto-escaping

### Database Security
- [ ] Prepared statements (TypeORM)
- [ ] Row-level security
- [ ] Foreign key constraints
- [ ] Unique constraints

### API Security
- [ ] Rate limiting
- [ ] Request size limits
- [ ] CORS configuration
- [ ] API key support (if needed)

### File Upload Security
- [ ] File type validation
- [ ] File size limits
- [ ] Virus scanning
- [ ] Secure storage

### Error Handling
- [ ] Error logging
- [ ] Generic error messages
- [ ] Stack trace only in development
- [ ] Error monitoring

---

## 📋 Bug Prevention Checklist

### Stock Operations
- [ ] Use transactions for stock operations
- [ ] Use row-level locking
- [ ] Check stock availability before deduction
- [ ] Only deduct stock when paid
- [ ] Return stock on void/refund

### Payment Operations
- [ ] Check payment status before stock deduction
- [ ] Implement idempotency
- [ ] Prevent double payment
- [ ] Handle payment failures

### Data Integrity
- [ ] Use foreign key constraints
- [ ] Use unique constraints
- [ ] Use transactions for multi-step operations
- [ ] Use soft deletes

### Concurrency
- [ ] Use pessimistic locking for stock
- [ ] Use optimistic locking for updates
- [ ] Handle deadlocks
- [ ] Keep transactions short

### Error Handling
- [ ] Use try-catch for all operations
- [ ] Rollback transactions on error
- [ ] Log all errors
- [ ] Handle errors gracefully

---

## 🚨 Critical Rules Summary

### Rule 1: Stock Deduction Rules ⭐
1. Only deduct stock when payment_status = 'paid'
2. Use row-level locking before deduction
3. Check stock availability after lock
4. Deduct stock in same transaction as invoice creation
5. Return stock on void/refund if was deducted

### Rule 2: Transaction Rules ⭐
1. Use transactions for all multi-step operations
2. Rollback on any error
3. Release query runner in finally block
4. Keep transactions short
5. Use consistent lock ordering

### Rule 3: Security Rules ⭐
1. Validate all inputs
2. Sanitize all outputs
3. Check authentication on all protected routes
4. Check permissions for all operations
5. Log all errors

### Rule 4: Error Handling Rules ⭐
1. Log all errors with context
2. Don't expose errors to users
3. Use generic error messages
4. Handle errors gracefully
5. Retry on transient errors

---

## 📚 Related Documents

- `docs/KEY_POINTS_SYSTEM_INTEGRITY.md` - System Integrity Rules
- `docs/CONCURRENCY_NOTES.md` - Concurrency Handling
- `docs/IDEMPOTENCY_RULES.md` - Idempotency Rules
- `docs/API_CONTRACTS.md` - API Contracts

---

**Status:** 📋 Security & Bugs Analysis Complete

**Last Updated:** 2025-01-XX

**⭐ Critical: Follow all rules to prevent security issues and bugs**

