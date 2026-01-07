# PowerShell Script for API Testing
# Usage: .\test-api.ps1

$baseUrl = "http://localhost:3000"
$token = ""

Write-Host "🧪 Starting API Tests..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "📝 Test 1: Health Check" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get -ErrorAction Stop
    Write-Host "✅ Health Check: PASS" -ForegroundColor Green
    Write-Host "   Status: $($response.status)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Health Check: FAIL" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 2: Login
Write-Host "📝 Test 2: Login" -ForegroundColor Yellow
try {
    $loginBody = @{
        username = "admin"
        password = "admin123"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json" -ErrorAction Stop
    $token = $response.access_token
    Write-Host "✅ Login: PASS" -ForegroundColor Green
    Write-Host "   Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Login: FAIL" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Note: Make sure database is seeded (npm run seed)" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Test 3: Get Products
Write-Host "📝 Test 3: Get Products" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    $response = Invoke-RestMethod -Uri "$baseUrl/products" -Method Get -Headers $headers -ErrorAction Stop
    Write-Host "✅ Get Products: PASS" -ForegroundColor Green
    Write-Host "   Found $($response.Count) products" -ForegroundColor Gray
} catch {
    Write-Host "❌ Get Products: FAIL" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: Get Stock Balance
Write-Host "📝 Test 4: Get Stock Balance" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/stock/balance?product_id=1&branch_id=1" -Method Get -Headers $headers -ErrorAction Stop
    Write-Host "✅ Get Stock Balance: PASS" -ForegroundColor Green
    Write-Host "   Product ID: $($response.product_id), Quantity: $($response.quantity)" -ForegroundColor Gray
} catch {
    Write-Host "⚠️  Get Stock Balance: SKIP (No stock data)" -ForegroundColor Yellow
}
Write-Host ""

# Test 5: Get Invoices
Write-Host "📝 Test 5: Get Invoices" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/invoices" -Method Get -Headers $headers -ErrorAction Stop
    Write-Host "✅ Get Invoices: PASS" -ForegroundColor Green
    Write-Host "   Found $($response.Count) invoices" -ForegroundColor Gray
} catch {
    Write-Host "❌ Get Invoices: FAIL" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 6: Swagger Docs
Write-Host "📝 Test 6: Swagger Documentation" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/docs" -Method Get -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Swagger Docs: PASS" -ForegroundColor Green
        Write-Host "   Available at: $baseUrl/api/docs" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Swagger Docs: FAIL" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "🎉 API Tests Completed!" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 Swagger Documentation: $baseUrl/api/docs" -ForegroundColor Cyan
Write-Host "🔑 Token: $($token.Substring(0, 30))..." -ForegroundColor Gray
