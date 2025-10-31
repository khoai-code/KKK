#!/bin/bash

# Test script to reproduce Cloudflare Access issue with ClickHouse
# This demonstrates the intermittent 403 errors happening in production

echo "=========================================="
echo "ClickHouse Cloudflare Access Test"
echo "=========================================="
echo ""

# Load environment variables
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
else
    echo "ERROR: .env.local file not found!"
    exit 1
fi

# Check required variables
if [ -z "$CLICKHOUSE_API_URL" ] || [ -z "$CLICKHOUSE_AUTH_BASIC" ] || [ -z "$CLICKHOUSE_CF_CLIENT_ID" ] || [ -z "$CLICKHOUSE_CF_CLIENT_SECRET" ]; then
    echo "ERROR: Missing required environment variables!"
    echo "Required: CLICKHOUSE_API_URL, CLICKHOUSE_AUTH_BASIC, CLICKHOUSE_CF_CLIENT_ID, CLICKHOUSE_CF_CLIENT_SECRET"
    exit 1
fi

echo "Testing ClickHouse connection..."
echo "URL: $CLICKHOUSE_API_URL"
echo "CF Client ID: ${CLICKHOUSE_CF_CLIENT_ID:0:20}..."
echo ""

# Simple test query
TEST_QUERY="SELECT 1 AS test FORMAT JSON"

echo "Sending test query: $TEST_QUERY"
echo ""
echo "=========================================="
echo "Response:"
echo "=========================================="

# Make the request with all the same headers our app uses
response=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" -X POST "$CLICKHOUSE_API_URL" \
  -H "Authorization: Basic $CLICKHOUSE_AUTH_BASIC" \
  -H "Content-Type: text/plain" \
  -H "CF-Access-Client-Id: $CLICKHOUSE_CF_CLIENT_ID" \
  -H "CF-Access-Client-Secret: $CLICKHOUSE_CF_CLIENT_SECRET" \
  -d "$TEST_QUERY")

# Extract HTTP status
http_status=$(echo "$response" | grep "HTTP_STATUS" | cut -d':' -f2)
response_body=$(echo "$response" | sed '/HTTP_STATUS/d')

echo "$response_body"
echo ""
echo "=========================================="
echo "HTTP Status: $http_status"
echo "=========================================="
echo ""

# Analyze response
if [ "$http_status" = "200" ]; then
    echo "✅ SUCCESS: ClickHouse responded correctly"
    echo ""
    echo "Expected response: {\"data\":[{\"test\":1}]}"
    echo "Actual response:"
    echo "$response_body" | head -n 5
elif [ "$http_status" = "403" ]; then
    echo "❌ FAILURE: Cloudflare Access Challenge (403 Forbidden)"
    echo ""
    echo "This is the infrastructure issue blocking our application!"
    echo ""
    if echo "$response_body" | grep -q "Just a moment"; then
        echo "Response is a Cloudflare challenge page (HTML)"
        echo "This means:"
        echo "  - Service token authentication is NOT working"
        echo "  - Cloudflare Access is blocking the request"
        echo "  - Infrastructure team needs to whitelist this service token"
        echo ""

        # Extract Cloudflare Ray ID if present
        ray_id=$(echo "$response_body" | grep -o "cRay: '[^']*'" | cut -d"'" -f2)
        if [ ! -z "$ray_id" ]; then
            echo "Cloudflare Ray ID: $ray_id"
            echo "(Infrastructure team can search Cloudflare logs with this ID)"
        fi
    fi
else
    echo "❌ FAILURE: Unexpected HTTP status $http_status"
    echo ""
    echo "Response body (first 500 chars):"
    echo "$response_body" | head -c 500
fi

echo ""
echo "=========================================="
echo "Test Complete"
echo "=========================================="
echo ""
echo "To fix this issue, the infrastructure team needs to:"
echo "1. Verify service token $CLICKHOUSE_CF_CLIENT_ID is valid"
echo "2. Update Cloudflare Access policy to allow this service token"
echo "3. Ensure no rate limiting is applied to service token requests"
echo ""
echo "See CLOUDFLARE_ISSUE_REPORT.md for full details"
echo ""

# Run the test multiple times to show intermittency
echo "Running 5 additional tests to demonstrate intermittency..."
echo ""

success_count=0
fail_count=0

for i in {1..5}; do
    echo -n "Test $i/5: "

    test_response=$(curl -s -w "%{http_code}" -o /dev/null -X POST "$CLICKHOUSE_API_URL" \
      -H "Authorization: Basic $CLICKHOUSE_AUTH_BASIC" \
      -H "Content-Type: text/plain" \
      -H "CF-Access-Client-Id: $CLICKHOUSE_CF_CLIENT_ID" \
      -H "CF-Access-Client-Secret: $CLICKHOUSE_CF_CLIENT_SECRET" \
      -d "$TEST_QUERY")

    if [ "$test_response" = "200" ]; then
        echo "✅ SUCCESS (200)"
        ((success_count++))
    else
        echo "❌ FAILED ($test_response)"
        ((fail_count++))
    fi

    # Small delay between requests
    sleep 1
done

echo ""
echo "=========================================="
echo "Summary of 5 tests:"
echo "  ✅ Successful: $success_count"
echo "  ❌ Failed: $fail_count"
echo "  Success rate: $((success_count * 20))%"
echo "=========================================="
echo ""

if [ $fail_count -gt 0 ]; then
    echo "⚠️  Intermittent failures detected!"
    echo "This confirms Cloudflare Access is inconsistently blocking requests."
    echo "Please share this output with the infrastructure team."
else
    echo "✅ All tests passed!"
    echo "The Cloudflare Access issue may have been resolved,"
    echo "or you got lucky with this batch of requests."
fi

echo ""
