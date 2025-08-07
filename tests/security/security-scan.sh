#!/bin/bash

# Enterprise Security Scanning Script for Sembalun Meditation Platform
# Performs comprehensive security assessment for production deployment

set -e

echo "🔒 Enterprise Security Scanning for Sembalun Platform"
echo "====================================================="

TARGET_URL="${1:-https://sembalun.app}"
REPORT_DIR="./security-reports"
DATE=$(date +%Y%m%d_%H%M%S)

# Create reports directory
mkdir -p "$REPORT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

echo
print_info "Target URL: $TARGET_URL"
print_info "Report Directory: $REPORT_DIR"
print_info "Timestamp: $DATE"

# 1. HTTP Security Headers Check
echo
print_info "1. Checking HTTP Security Headers..."

HEADERS_REPORT="$REPORT_DIR/security-headers-$DATE.txt"
curl -I "$TARGET_URL" > "$HEADERS_REPORT" 2>/dev/null || {
    print_error "Failed to fetch headers from $TARGET_URL"
    exit 1
}

print_status "Headers saved to $HEADERS_REPORT"

# Check specific security headers
declare -a SECURITY_HEADERS=(
    "Strict-Transport-Security"
    "X-Frame-Options"
    "X-Content-Type-Options"
    "X-XSS-Protection"
    "Content-Security-Policy"
    "Referrer-Policy"
    "Permissions-Policy"
)

echo "Security Headers Status:" > "$HEADERS_REPORT.analysis"
for header in "${SECURITY_HEADERS[@]}"; do
    if grep -qi "$header" "$HEADERS_REPORT"; then
        echo "✅ $header: PRESENT" >> "$HEADERS_REPORT.analysis"
        print_status "$header header found"
    else
        echo "❌ $header: MISSING" >> "$HEADERS_REPORT.analysis"
        print_warning "$header header missing"
    fi
done

# 2. SSL/TLS Configuration Check
echo
print_info "2. Checking SSL/TLS Configuration..."

SSL_REPORT="$REPORT_DIR/ssl-config-$DATE.txt"

if command_exists "openssl"; then
    # Get SSL certificate info
    echo | openssl s_client -servername "$(echo "$TARGET_URL" | sed 's|https://||')" -connect "$(echo "$TARGET_URL" | sed 's|https://||'):443" 2>/dev/null | openssl x509 -text > "$SSL_REPORT" 2>/dev/null || {
        print_warning "Could not retrieve SSL certificate details"
    }
    
    # Check SSL protocols and ciphers
    echo | openssl s_client -cipher 'ECDHE+AESGCM:ECDHE+CHACHA20:DHE+AESGCM:DHE+CHACHA20:!aNULL:!MD5:!DSS' -servername "$(echo "$TARGET_URL" | sed 's|https://||')" -connect "$(echo "$TARGET_URL" | sed 's|https://||'):443" 2>/dev/null | grep -E "(Protocol|Cipher)" >> "$SSL_REPORT" || true
    
    print_status "SSL configuration saved to $SSL_REPORT"
else
    print_warning "OpenSSL not found, skipping SSL checks"
fi

# 3. Content Security Policy Analysis
echo
print_info "3. Analyzing Content Security Policy..."

CSP_REPORT="$REPORT_DIR/csp-analysis-$DATE.txt"
CSP_HEADER=$(curl -I "$TARGET_URL" 2>/dev/null | grep -i "content-security-policy" | head -1)

if [[ -n "$CSP_HEADER" ]]; then
    echo "$CSP_HEADER" > "$CSP_REPORT"
    
    # Analyze CSP directives
    echo "CSP Analysis:" >> "$CSP_REPORT"
    if echo "$CSP_HEADER" | grep -q "default-src"; then
        echo "✅ default-src directive found" >> "$CSP_REPORT"
    else
        echo "⚠️ default-src directive missing" >> "$CSP_REPORT"
    fi
    
    if echo "$CSP_HEADER" | grep -q "script-src"; then
        echo "✅ script-src directive found" >> "$CSP_REPORT"
    else
        echo "⚠️ script-src directive missing" >> "$CSP_REPORT"
    fi
    
    if echo "$CSP_HEADER" | grep -q "'unsafe-eval'"; then
        echo "⚠️ unsafe-eval found in CSP" >> "$CSP_REPORT"
    fi
    
    if echo "$CSP_HEADER" | grep -q "'unsafe-inline'"; then
        echo "⚠️ unsafe-inline found in CSP" >> "$CSP_REPORT"
    fi
    
    print_status "CSP analysis saved to $CSP_REPORT"
else
    echo "❌ No Content-Security-Policy header found" > "$CSP_REPORT"
    print_warning "No CSP header found"
fi

# 4. Check for Common Vulnerabilities
echo
print_info "4. Checking for Common Web Vulnerabilities..."

VULN_REPORT="$REPORT_DIR/vulnerability-check-$DATE.txt"
echo "Vulnerability Scan Results for $TARGET_URL" > "$VULN_REPORT"
echo "=============================================" >> "$VULN_REPORT"
echo >> "$VULN_REPORT"

# Check for server information disclosure
echo "Server Information:" >> "$VULN_REPORT"
SERVER_HEADER=$(curl -I "$TARGET_URL" 2>/dev/null | grep -i "server:")
if [[ -n "$SERVER_HEADER" ]]; then
    echo "$SERVER_HEADER" >> "$VULN_REPORT"
    if echo "$SERVER_HEADER" | grep -qi "apache\|nginx\|iis"; then
        echo "⚠️ Server version may be disclosed" >> "$VULN_REPORT"
    fi
else
    echo "✅ Server header not disclosed" >> "$VULN_REPORT"
fi

# Check for powered-by headers
POWERED_BY=$(curl -I "$TARGET_URL" 2>/dev/null | grep -i "x-powered-by:")
if [[ -n "$POWERED_BY" ]]; then
    echo "$POWERED_BY" >> "$VULN_REPORT"
    echo "⚠️ X-Powered-By header found" >> "$VULN_REPORT"
else
    echo "✅ No X-Powered-By header found" >> "$VULN_REPORT"
fi

# Check robots.txt
echo >> "$VULN_REPORT"
echo "Robots.txt Check:" >> "$VULN_REPORT"
ROBOTS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$TARGET_URL/robots.txt")
if [[ "$ROBOTS_STATUS" == "200" ]]; then
    echo "✅ robots.txt exists (status: $ROBOTS_STATUS)" >> "$VULN_REPORT"
    curl -s "$TARGET_URL/robots.txt" | head -20 >> "$VULN_REPORT"
else
    echo "⚠️ robots.txt not found (status: $ROBOTS_STATUS)" >> "$VULN_REPORT"
fi

# Check sitemap
echo >> "$VULN_REPORT"
echo "Sitemap Check:" >> "$VULN_REPORT"
SITEMAP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$TARGET_URL/sitemap.xml")
if [[ "$SITEMAP_STATUS" == "200" ]]; then
    echo "✅ sitemap.xml exists (status: $SITEMAP_STATUS)" >> "$VULN_REPORT"
else
    echo "ℹ️ sitemap.xml not found (status: $SITEMAP_STATUS)" >> "$VULN_REPORT"
fi

print_status "Vulnerability check saved to $VULN_REPORT"

# 5. PWA Security Check
echo
print_info "5. Checking PWA Security Configuration..."

PWA_REPORT="$REPORT_DIR/pwa-security-$DATE.txt"
echo "PWA Security Analysis for $TARGET_URL" > "$PWA_REPORT"
echo "======================================" >> "$PWA_REPORT"

# Check manifest.json
MANIFEST_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$TARGET_URL/manifest.json")
if [[ "$MANIFEST_STATUS" == "200" ]]; then
    echo "✅ PWA manifest found (status: $MANIFEST_STATUS)" >> "$PWA_REPORT"
    
    # Download and analyze manifest
    MANIFEST_CONTENT=$(curl -s "$TARGET_URL/manifest.json")
    echo "Manifest content:" >> "$PWA_REPORT"
    echo "$MANIFEST_CONTENT" | head -20 >> "$PWA_REPORT"
    
    # Check for security-relevant manifest fields
    if echo "$MANIFEST_CONTENT" | grep -q "display.*standalone"; then
        echo "✅ Standalone display mode configured" >> "$PWA_REPORT"
    fi
    
    if echo "$MANIFEST_CONTENT" | grep -q "start_url"; then
        echo "✅ Start URL configured" >> "$PWA_REPORT"
    fi
    
else
    echo "❌ PWA manifest not found (status: $MANIFEST_STATUS)" >> "$PWA_REPORT"
fi

# Check service worker
SW_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$TARGET_URL/sw.js")
if [[ "$SW_STATUS" == "200" ]]; then
    echo "✅ Service worker found (status: $SW_STATUS)" >> "$PWA_REPORT"
    
    # Check service worker headers
    SW_HEADERS=$(curl -I "$TARGET_URL/sw.js" 2>/dev/null)
    if echo "$SW_HEADERS" | grep -q "Cache-Control.*no-cache"; then
        echo "✅ Service worker has appropriate cache headers" >> "$PWA_REPORT"
    else
        echo "⚠️ Service worker cache headers should be reviewed" >> "$PWA_REPORT"
    fi
else
    echo "❌ Service worker not found (status: $SW_STATUS)" >> "$PWA_REPORT"
fi

print_status "PWA security check saved to $PWA_REPORT"

# 6. Performance Security Check
echo
print_info "6. Checking Performance-Related Security..."

PERF_REPORT="$REPORT_DIR/performance-security-$DATE.txt"
echo "Performance Security Analysis" > "$PERF_REPORT"
echo "=============================" >> "$PERF_REPORT"

# Check response times (DoS resilience indicator)
echo "Response Time Analysis:" >> "$PERF_REPORT"
RESPONSE_TIME=$(curl -o /dev/null -s -w "%{time_total}" "$TARGET_URL")
echo "Main page response time: ${RESPONSE_TIME}s" >> "$PERF_REPORT"

if (( $(echo "$RESPONSE_TIME > 3" | bc -l) )); then
    echo "⚠️ Slow response time may indicate performance issues" >> "$PERF_REPORT"
else
    echo "✅ Response time within acceptable range" >> "$PERF_REPORT"
fi

# Check for compression
COMPRESSION=$(curl -H "Accept-Encoding: gzip, deflate, br" -I "$TARGET_URL" 2>/dev/null | grep -i "content-encoding")
if [[ -n "$COMPRESSION" ]]; then
    echo "✅ Compression enabled: $COMPRESSION" >> "$PERF_REPORT"
else
    echo "⚠️ No compression detected" >> "$PERF_REPORT"
fi

print_status "Performance security check saved to $PERF_REPORT"

# 7. Generate Summary Report
echo
print_info "7. Generating Security Summary..."

SUMMARY_REPORT="$REPORT_DIR/security-summary-$DATE.txt"
echo "SEMBALUN ENTERPRISE SECURITY ASSESSMENT SUMMARY" > "$SUMMARY_REPORT"
echo "===============================================" >> "$SUMMARY_REPORT"
echo "Target: $TARGET_URL" >> "$SUMMARY_REPORT"
echo "Date: $(date)" >> "$SUMMARY_REPORT"
echo >> "$SUMMARY_REPORT"

# Count issues
TOTAL_ISSUES=$(grep -c "❌\|⚠️" "$REPORT_DIR"/*-$DATE.txt* 2>/dev/null || echo "0")
CRITICAL_ISSUES=$(grep -c "❌" "$REPORT_DIR"/*-$DATE.txt* 2>/dev/null || echo "0")
WARNINGS=$(grep -c "⚠️" "$REPORT_DIR"/*-$DATE.txt* 2>/dev/null || echo "0")

echo "SECURITY SCORE:" >> "$SUMMARY_REPORT"
echo "Critical Issues: $CRITICAL_ISSUES" >> "$SUMMARY_REPORT"
echo "Warnings: $WARNINGS" >> "$SUMMARY_REPORT"
echo "Total Issues: $TOTAL_ISSUES" >> "$SUMMARY_REPORT"
echo >> "$SUMMARY_REPORT"

# Security rating
if [[ $CRITICAL_ISSUES -eq 0 && $WARNINGS -le 2 ]]; then
    echo "SECURITY RATING: ✅ EXCELLENT" >> "$SUMMARY_REPORT"
    SECURITY_STATUS="EXCELLENT"
elif [[ $CRITICAL_ISSUES -eq 0 && $WARNINGS -le 5 ]]; then
    echo "SECURITY RATING: ✅ GOOD" >> "$SUMMARY_REPORT"
    SECURITY_STATUS="GOOD"
elif [[ $CRITICAL_ISSUES -le 2 ]]; then
    echo "SECURITY RATING: ⚠️ NEEDS IMPROVEMENT" >> "$SUMMARY_REPORT"
    SECURITY_STATUS="NEEDS IMPROVEMENT"
else
    echo "SECURITY RATING: ❌ POOR" >> "$SUMMARY_REPORT"
    SECURITY_STATUS="POOR"
fi

echo >> "$SUMMARY_REPORT"
echo "RECOMMENDATIONS:" >> "$SUMMARY_REPORT"

if [[ $CRITICAL_ISSUES -gt 0 ]]; then
    echo "1. Address all critical security issues immediately" >> "$SUMMARY_REPORT"
fi

if [[ $WARNINGS -gt 0 ]]; then
    echo "2. Review and fix security warnings" >> "$SUMMARY_REPORT"
fi

echo "3. Regular security monitoring recommended" >> "$SUMMARY_REPORT"
echo "4. Consider implementing additional security measures" >> "$SUMMARY_REPORT"
echo "5. Schedule periodic security assessments" >> "$SUMMARY_REPORT"

print_status "Security summary saved to $SUMMARY_REPORT"

# Final output
echo
echo "🔒 ENTERPRISE SECURITY SCAN COMPLETE"
echo "===================================="
echo "Target: $TARGET_URL"
echo "Security Rating: $SECURITY_STATUS"
echo "Critical Issues: $CRITICAL_ISSUES"
echo "Warnings: $WARNINGS"
echo "Reports saved to: $REPORT_DIR"
echo

# Set exit code based on critical issues
if [[ $CRITICAL_ISSUES -gt 0 ]]; then
    print_error "Critical security issues found! Please review reports."
    exit 1
else
    print_status "No critical security issues found."
    exit 0
fi