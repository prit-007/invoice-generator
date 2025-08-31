#!/usr/bin/env bash
set -euo pipefail
API=${API:-http://localhost:1969}

log(){ echo "[$(date +%T)] $*"; }

req(){
  local method=$1 url=$2 body=${3:-}
  # -L follows redirects (handles 307 from /customers -> /customers/)
  if [[ -n "$body" ]]; then
    curl -sSL -w "\nHTTP_STATUS:%{http_code}\n" -H "Content-Type: application/json" -X "$method" "$url" -d "$body"
  else
    curl -sSL -w "\nHTTP_STATUS:%{http_code}\n" -H "Content-Type: application/json" -X "$method" "$url"
  fi
}

get_status(){
  # Extract the last HTTP_STATUS:NNN line safely
  printf "%s" "$1" | awk '/^HTTP_STATUS:/{print $0}' | tail -n1 | cut -d: -f2 | tr -d '\r' | tr -cd '0-9'
}

extract_id(){
  python - "$@" <<'PY'
import sys, json, re
text=sys.stdin.read()
# split status
parts=text.rsplit("HTTP_STATUS:",1)
body=parts[0].strip()
# Try regex first (robust to formatting)
m=re.search(r'"id"\s*:\s*"([0-9a-fA-F-]{36})"', body)
if m:
    print(m.group(1))
else:
    try:
        data=json.loads(body)
        print(data.get('id',''))
    except Exception:
        print('')
PY
}

# 1) Create Customer
log "Creating customer"
RESP=$(req POST "$API/customers" '{
  "name":"Acme Ltd",
  "billing_address":{
    "address_line1":"Road 1",
    "city":"City",
    "state":"ST",
    "zip_code":"123",
    "country":"IN"
  }
}')
echo "$RESP"
STATUS=$(get_status "$RESP")
if [[ "${STATUS:0:1}" != "2" ]]; then echo "[ERROR] Customer create failed (HTTP $STATUS)"; exit 1; fi
CID=$(printf "%s" "$RESP" | grep -Eo '"id"[[:space:]]*:[[:space:]]*"[0-9a-fA-F-]{36}"' | head -n1 | grep -Eo '[0-9a-fA-F-]{36}')
if [[ -z "$CID" ]]; then
  log "Customer created (id not parsed) — attempting fallback lookup"
  LIST=$(req GET "$API/customers")
  echo "$LIST"
  BODY=${LIST%%HTTP_STATUS:*}
  CID=$(printf "%s" "$BODY" | grep -Eo '"id"[[:space:]]*:[[:space:]]*"[0-9a-fA-F-]{36}"' | head -n1 | grep -Eo '[0-9a-fA-F-]{36}')
fi
if [[ -z "$CID" ]]; then echo "[ERROR] Could not resolve customer id"; exit 1; fi
log "Customer ID: $CID"

# 2) Create Product
log "Creating product"
RESP=$(req POST "$API/products" '{
  "name":"Widget",
  "price":100,
  "tax_rate":18,
  "unit":"NOS",
  "is_taxable":true
}')
echo "$RESP"
STATUS=$(get_status "$RESP")
if [[ "${STATUS:0:1}" != "2" ]]; then echo "[ERROR] Product create failed (HTTP $STATUS)"; exit 1; fi
PID=$(printf "%s" "$RESP" | grep -Eo '"id"[[:space:]]*:[[:space:]]*"[0-9a-fA-F-]{36}"' | head -n1 | grep -Eo '[0-9a-fA-F-]{36}')
if [[ -z "$PID" ]]; then
  log "Product created (id not parsed)  attempting fallback lookup"
  LIST=$(req GET "$API/products")
  echo "$LIST"
  BODY=${LIST%%HTTP_STATUS:*}
  PID=$(printf "%s" "$BODY" | grep -Eo '"id"[[:space:]]*:[[:space:]]*"[0-9a-fA-F-]{36}"' | head -n1 | grep -Eo '[0-9a-fA-F-]{36}')
fi
if [[ -z "$PID" ]]; then echo "[ERROR] Could not resolve product id"; exit 1; fi
log "Product ID: $PID"

# 3) Create Invoice
log "Creating invoice"
INVOICE_BODY=$(cat <<'JSON'
{
  "customer_id": "__CID__",
  "items": [
    {"product_id": "__PID__", "description": "Widget", "quantity": 2, "unit_price": 100, "tax_rate": 18, "discount_percentage": 0, "discount_amount": 0}
  ],
  "subtotal": 200,
  "tax_amount": 36,
  "total_amount": 236
}
JSON
)
# substitute IDs safely
INVOICE_BODY=${INVOICE_BODY/__CID__/$CID}
INVOICE_BODY=${INVOICE_BODY/__PID__/$PID}
RESP=$(req POST "$API/invoices" "$INVOICE_BODY")
echo "$RESP"
STATUS=$(get_status "$RESP")
if [[ "${STATUS:0:1}" != "2" ]]; then echo "[ERROR] Invoice create failed (HTTP $STATUS)"; exit 1; fi
INV_ID=$(printf "%s" "$RESP" | grep -Eo '"id"[[:space:]]*:[[:space:]]*"[0-9a-fA-F-]{36}"' | head -n1 | grep -Eo '[0-9a-fA-F-]{36}')
if [[ -z "$INV_ID" ]]; then log "Invoice created (id not parsed)"; else log "Invoice ID: $INV_ID"; fi

# 4) Add Invoice Item (per-item API uses discount)
log "Adding invoice item"
ITEM_BODY=$(cat <<'JSON'
{
  "invoice_id": "__INV_ID__",
  "product_id": "__PID__",
  "description": "Widget",
  "quantity": 1,
  "unit_price": 100,
  "tax_rate": 18,
  "discount": 0
}
JSON
)
ITEM_BODY=${ITEM_BODY/__INV_ID__/$INV_ID}
ITEM_BODY=${ITEM_BODY/__PID__/$PID}
RESP=$(req POST "$API/invoice-items" "$ITEM_BODY")
echo "$RESP"
STATUS=$(get_status "$RESP")
if [[ "${STATUS:0:1}" != "2" ]]; then echo "[ERROR] Invoice item create failed (HTTP $STATUS)"; exit 1; fi
ITEM_ID=$(printf "%s" "$RESP" | grep -Eo '"id"[[:space:]]*:[[:space:]]*"[0-9a-fA-F-]{36}"' | head -n1 | grep -Eo '[0-9a-fA-F-]{36}')
if [[ -z "$ITEM_ID" ]]; then log "Invoice item created (id not parsed)"; else log "Invoice Item ID: $ITEM_ID"; fi

# 5) Update Invoice Item
log "Updating invoice item"
RESP=$(req PUT "$API/invoice-items/$ITEM_ID" '{"quantity":2,"discount":5}')
echo "$RESP"

# 6) Update Invoice
log "Updating invoice"
RESP=$(req PUT "$API/invoices/$INV_ID" '{"notes":"Updated by smoke test"}')
echo "$RESP"

# 7) Create Payment (linked to invoice)
log "Creating payment"
TODAY=$(date +%F)
PAY_BODY=$(cat <<'JSON'
{
  "customer_id": "__CID__",
  "invoice_id": "__INV_ID__",
  "amount": 100,
  "date": "__TODAY__",
  "method": "bank_transfer",
  "reference": "SMOKE-REF"
}
JSON
)
PAY_BODY=${PAY_BODY/__CID__/$CID}
PAY_BODY=${PAY_BODY/__INV_ID__/$INV_ID}
PAY_BODY=${PAY_BODY/__TODAY__/$TODAY}
RESP=$(req POST "$API/payments" "$PAY_BODY")
echo "$RESP"
STATUS=$(get_status "$RESP")
if [[ "${STATUS:0:1}" != "2" ]]; then echo "[ERROR] Payment create failed (HTTP $STATUS)"; exit 1; fi
PAY_ID=$(printf "%s" "$RESP" | grep -Eo '"id"[[:space:]]*:[[:space:]]*"[0-9a-fA-F-]{36}"' | head -n1 | grep -Eo '[0-9a-fA-F-]{36}')
if [[ -z "$PAY_ID" ]]; then log "Payment created (id not parsed)"; else log "Payment ID: $PAY_ID"; fi

# 8) Search products and customers
log "Searching products"
RESP=$(req GET "$API/products?search=wid")
echo "$RESP"
log "Searching customers"
RESP=$(req GET "$API/customers?search=acme")
echo "$RESP"

# 9) Optional: cancel invoice and refund payment
log "Cancelling invoice"
RESP=$(req POST "$API/invoices/$INV_ID/cancel" '{"reason":"Smoke test"}')
echo "$RESP"
log "Refunding payment"
RESP=$(req POST "$API/payments/$PAY_ID/refund" '{"reason":"Smoke test"}')
echo "$RESP"

log "All smoke tests completed"

