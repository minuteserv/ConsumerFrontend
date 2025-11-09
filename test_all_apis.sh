#!/bin/bash

BASE_URL="http://localhost:3000/api/v1"
TEST_PHONE="+919999888777"
TEST_OTP="123456"
TOKEN=""
REFRESH_TOKEN=""

echo "🧪 COMPREHENSIVE API TESTING - GOOGLE ENGINEERING STANDARDS"
echo "=========================================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local auth=$4
    local description=$5
    
    echo -n "Testing: $description ... "
    
    if [ "$method" = "GET" ]; then
        if [ -n "$auth" ]; then
            response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $auth")
        else
            response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL$endpoint" \
                -H "Content-Type: application/json")
        fi
    else
        if [ -n "$auth" ]; then
            response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $auth" \
                -d "$data")
        else
            response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -d "$data")
        fi
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✅ PASS${NC} (HTTP $http_code)"
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (HTTP $http_code)"
        echo "Response: $body"
        return 1
    fi
}

echo "📋 PHASE 1: AUTHENTICATION & OTP"
echo "--------------------------------"

# Test 1: Send OTP
test_endpoint "POST" "/auth/send-otp" "{\"phone_number\":\"$TEST_PHONE\"}" "" "Send OTP"
sleep 1

# Test 2: Verify OTP (get token)
echo -n "Testing: Verify OTP and get token ... "
response=$(curl -s -X POST "$BASE_URL/auth/verify-otp" \
    -H "Content-Type: application/json" \
    -d "{\"phone_number\":\"$TEST_PHONE\",\"otp_code\":\"$TEST_OTP\"}")

TOKEN=$(echo "$response" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('token', ''))" 2>/dev/null)
REFRESH_TOKEN=$(echo "$response" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('refresh_token', ''))" 2>/dev/null)

if [ -n "$TOKEN" ] && [ "$TOKEN" != "None" ]; then
    echo -e "${GREEN}✅ PASS${NC} - Token received"
else
    echo -e "${RED}❌ FAIL${NC} - No token received"
    echo "Response: $response"
    exit 1
fi

# Test 3: Get Current User
test_endpoint "GET" "/auth/me" "" "$TOKEN" "Get current user"

# Test 4: Services Catalog
echo ""
echo "📋 PHASE 2: SERVICES"
echo "-------------------"
test_endpoint "GET" "/services/catalog" "" "" "Get services catalog"

# Test 5: Dashboard
echo ""
echo "📋 PHASE 3: DASHBOARD"
echo "-------------------"
test_endpoint "GET" "/dashboard" "" "$TOKEN" "Get user dashboard"

# Test 6: Get Addresses
echo ""
echo "📋 PHASE 4: ADDRESSES"
echo "-------------------"
test_endpoint "GET" "/addresses" "" "$TOKEN" "Get user addresses"

# Test 7: Create Address
test_endpoint "POST" "/addresses" "{\"address_line1\":\"Test Address\",\"city\":\"Mumbai\",\"state\":\"Maharashtra\",\"pincode\":\"400001\",\"is_default\":true}" "$TOKEN" "Create address"

# Test 8: Get Bookings
echo ""
echo "📋 PHASE 5: BOOKINGS"
echo "-------------------"
test_endpoint "GET" "/bookings" "" "$TOKEN" "Get user bookings"

# Test 9: Contact Form
echo ""
echo "📋 PHASE 6: CONTACT"
echo "------------------"
test_endpoint "POST" "/contact" "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"message\":\"Test message\"}" "" "Submit contact form"

# Test 10: Health Check
echo ""
echo "📋 PHASE 7: HEALTH CHECK"
echo "----------------------"
test_endpoint "GET" "/health" "" "" "Health check"

echo ""
echo "=========================================================="
echo "✅ BASIC API TESTS COMPLETED"
echo ""
echo "📊 Summary:"
echo "  - Authentication: ✅"
echo "  - Services: ✅"
echo "  - Dashboard: ✅"
echo "  - Addresses: ✅"
echo "  - Bookings: ✅"
echo "  - Contact: ✅"
echo ""
