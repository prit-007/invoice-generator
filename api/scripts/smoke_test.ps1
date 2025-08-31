Param(
  [string]$ApiUrl = "http://localhost:1969"
)

function Write-Log($msg){ Write-Host ("[{0}] {1}" -f (Get-Date -Format HH:mm:ss), $msg) }
$CommonParams = @{ MaximumRedirection = 5 }

# 1) Create Customer
Write-Log "Creating customer"
$customer = Invoke-RestMethod @CommonParams -Method Post "$ApiUrl/customers" -ContentType "application/json" -Body (@{
  name = "Acme Ltd";
  billing_address = @{ address_line1="Road 1"; city="City"; state="ST"; zip_code="123"; country="IN" }
} | ConvertTo-Json -Depth 6)
$customerId = $customer.id
if (-not $customerId) { throw "Customer create failed: $($customer | ConvertTo-Json -Depth 6)" }
Write-Log "Customer ID: $customerId"

# 2) Create Product
Write-Log "Creating product"
$product = Invoke-RestMethod @CommonParams -Method Post "$ApiUrl/products" -ContentType "application/json" -Body (@{
  name = "Widget"; price = 100; tax_rate = 18; unit = "NOS"; is_taxable = $true
} | ConvertTo-Json)
$productId = $product.id
if (-not $productId) { throw "Product create failed: $($product | ConvertTo-Json -Depth 6)" }
Write-Log "Product ID: $productId"

# 3) Create Invoice
Write-Log "Creating invoice"
$invBody = @{
  customer_id = $customerId;
  items = @(@{ product_id=$productId; description="Widget"; quantity=2; unit_price=100; tax_rate=18; discount_percentage=0; discount_amount=0 });
  subtotal = 200; tax_amount = 36; total_amount = 236
} | ConvertTo-Json -Depth 6
$invoice = Invoke-RestMethod @CommonParams -Method Post "$ApiUrl/invoices" -ContentType "application/json" -Body $invBody
$invoiceId = $invoice.id
if (-not $invoiceId) { throw "Invoice create failed: $($invoice | ConvertTo-Json -Depth 6)" }
Write-Log "Invoice ID: $invoiceId"

# 4) Add Invoice Item (per-item API uses discount)
Write-Log "Adding invoice item"
$itemBody = @{
  invoice_id = $invoiceId; product_id = $productId; description = "Widget";
  quantity = 1; unit_price = 100; tax_rate = 18; discount = 0
} | ConvertTo-Json
$item = Invoke-RestMethod @CommonParams -Method Post "$ApiUrl/invoice-items" -ContentType "application/json" -Body $itemBody
$itemId = $item.id
if (-not $itemId) { throw "Invoice item create failed: $($item | ConvertTo-Json -Depth 6)" }
Write-Log "Invoice Item ID: $itemId"

# 5) Update Invoice Item
Write-Log "Updating invoice item"
$itemU = Invoke-RestMethod @CommonParams -Method Put "$ApiUrl/invoice-items/$itemId" -ContentType "application/json" -Body (@{ quantity=2; discount=5 } | ConvertTo-Json)

# 6) Update Invoice
Write-Log "Updating invoice"
$invU = Invoke-RestMethod @CommonParams -Method Put "$ApiUrl/invoices/$invoiceId" -ContentType "application/json" -Body (@{ notes = "Updated by smoke test" } | ConvertTo-Json)

# 7) Create Payment
Write-Log "Creating payment"
$today = (Get-Date -Format yyyy-MM-dd)
$payBody = @{
  customer_id = $customerId; invoice_id = $invoiceId; amount = 100; date = $today; method = "bank_transfer"; reference = "SMOKE-REF"
} | ConvertTo-Json
$payment = Invoke-RestMethod @CommonParams -Method Post "$ApiUrl/payments" -ContentType "application/json" -Body $payBody
$paymentId = $payment.id
if (-not $paymentId) { throw "Payment create failed: $($payment | ConvertTo-Json -Depth 6)" }
Write-Log "Payment ID: $paymentId"

# 8) Search endpoints
Write-Log "Searching products"
$null = Invoke-RestMethod @CommonParams -Method Get "$ApiUrl/products?search=wid"
Write-Log "Searching customers"
$null = Invoke-RestMethod @CommonParams -Method Get "$ApiUrl/customers?search=acme"

# 9) Optional: cancel and refund
Write-Log "Cancelling invoice"
$invC = Invoke-RestMethod @CommonParams -Method Post "$ApiUrl/invoices/$invoiceId/cancel" -ContentType "application/json" -Body (@{ reason="Smoke test" } | ConvertTo-Json)
Write-Log "Refunding payment"
$payR = Invoke-RestMethod @CommonParams -Method Post "$ApiUrl/payments/$paymentId/refund" -ContentType "application/json" -Body (@{ reason="Smoke test" } | ConvertTo-Json)

Write-Log "All smoke tests completed successfully"

