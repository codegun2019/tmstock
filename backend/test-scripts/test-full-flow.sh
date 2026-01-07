#!/bin/bash

# Full System Integration Test Script
# Usage: ./test-full-flow.sh

BASE_URL="http://localhost:3000"
TOKEN=""

echo "🧪 Starting Full System Integration Test..."
echo ""

# Phase 1: Login
echo "📝 Phase 1: Authentication"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')
if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  exit 1
fi

echo "✅ Login successful"
echo "Token: ${TOKEN:0:20}..."
echo ""

# Phase 2: Create Product
echo "📦 Phase 2: Product Management"
PRODUCT_RESPONSE=$(curl -s -X POST "$BASE_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "barcode": "1234567890123",
    "category_id": 1,
    "unit_id": 1,
    "price": 100.00,
    "cost": 50.00,
    "active": 1
  }')

PRODUCT_ID=$(echo $PRODUCT_RESPONSE | jq -r '.id')
if [ "$PRODUCT_ID" == "null" ] || [ -z "$PRODUCT_ID" ]; then
  echo "❌ Product creation failed"
  exit 1
fi

echo "✅ Product created: ID $PRODUCT_ID"
echo ""

# Phase 3: Add Stock
echo "📊 Phase 3: Stock Management"
STOCK_RESPONSE=$(curl -s -X POST "$BASE_URL/stock/add" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"product_id\": $PRODUCT_ID,
    \"branch_id\": 1,
    \"quantity\": 100,
    \"reference_type\": \"GRN\",
    \"reference_id\": 1,
    \"reason\": \"Initial stock\"
  }")

echo "✅ Stock added"
echo ""

# Phase 4: Create Invoice
echo "🧾 Phase 4: Invoice Management"
INVOICE_RESPONSE=$(curl -s -X POST "$BASE_URL/invoices" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"branch_id\": 1,
    \"customer_name\": \"Test Customer\",
    \"items\": [
      {
        \"product_id\": $PRODUCT_ID,
        \"quantity\": 2,
        \"unit_price\": 100.00
      }
    ],
    \"payment_method\": \"cash\"
  }")

INVOICE_ID=$(echo $INVOICE_RESPONSE | jq -r '.id')
INVOICE_NO=$(echo $INVOICE_RESPONSE | jq -r '.invoice_no')
echo "✅ Invoice created: $INVOICE_NO (ID: $INVOICE_ID)"
echo ""

# Phase 5: Pay Invoice
echo "💰 Phase 5: Pay Invoice (CRITICAL TEST)"
PAY_RESPONSE=$(curl -s -X POST "$BASE_URL/invoices/$INVOICE_ID/pay" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "paid_amount": 200.00,
    "payment_method": "cash"
  }')

INVOICE_STATUS=$(echo $PAY_RESPONSE | jq -r '.status')
if [ "$INVOICE_STATUS" != "completed" ]; then
  echo "❌ Invoice payment failed. Status: $INVOICE_STATUS"
  exit 1
fi

echo "✅ Invoice paid successfully. Status: $INVOICE_STATUS"
echo ""

# Phase 6: Verify Stock Deduction
echo "🔍 Phase 6: Verify Stock Deduction"
STOCK_BALANCE=$(curl -s -X GET "$BASE_URL/stock/balance?product_id=$PRODUCT_ID&branch_id=1" \
  -H "Authorization: Bearer $TOKEN")

QUANTITY=$(echo $STOCK_BALANCE | jq -r '.quantity')
if [ "$QUANTITY" != "98" ]; then
  echo "❌ Stock deduction failed. Expected: 98, Got: $QUANTITY"
  exit 1
fi

echo "✅ Stock deducted correctly. Remaining: $QUANTITY"
echo ""

# Phase 7: Verify Cash Transaction
echo "💵 Phase 7: Verify Cash Transaction"
CASH_TXN=$(curl -s -X GET "$BASE_URL/cash/transactions/reference/POS/$INVOICE_ID" \
  -H "Authorization: Bearer $TOKEN")

CASH_AMOUNT=$(echo $CASH_TXN | jq -r '.[0].amount')
if [ "$CASH_AMOUNT" != "200.00" ]; then
  echo "❌ Cash transaction not created correctly. Amount: $CASH_AMOUNT"
  exit 1
fi

echo "✅ Cash transaction created. Amount: $CASH_AMOUNT"
echo ""

# Summary
echo "🎉 All tests passed!"
echo ""
echo "Summary:"
echo "- Product ID: $PRODUCT_ID"
echo "- Invoice ID: $INVOICE_ID"
echo "- Invoice No: $INVOICE_NO"
echo "- Stock Remaining: $QUANTITY"
echo "- Cash Transaction Amount: $CASH_AMOUNT"
echo ""

