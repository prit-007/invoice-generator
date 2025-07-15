# Error Handling Documentation

## Overview
The Invoice Management API now includes comprehensive error handling middleware that provides detailed error responses for better debugging and user experience.

## Error Response Format
All errors now return a structured JSON response with the following format:

```json
{
  "error": "Error Type",
  "message": "Human-readable error message",
  "detail": "Additional details (if available)",
  "timestamp": "2025-07-15T16:25:37.739346",
  "path": "http://127.0.0.1:1969/endpoint"
}
```

## Error Types

### 1. Validation Errors (400 Bad Request)
**When**: Invalid input data, malformed UUIDs, missing required fields
**Example**:
```json
{
  "error": "HTTP 400",
  "message": "Invalid item ID format: invalid-uuid",
  "timestamp": "2025-07-15T16:25:47.177582",
  "path": "http://127.0.0.1:1969/invoice-items/invalid-uuid"
}
```

### 2. Resource Not Found (404 Not Found)
**When**: Requested resource doesn't exist
**Example**:
```json
{
  "error": "HTTP 404",
  "message": "Invoice item not found: 00000000-0000-0000-0000-000000000000",
  "timestamp": "2025-07-15T16:25:37.739346",
  "path": "http://127.0.0.1:1969/invoice-items/00000000-0000-0000-0000-000000000000"
}
```

### 3. Request Validation Errors (422 Unprocessable Entity)
**When**: JSON body validation fails
**Example**:
```json
{
  "error": "Validation Error",
  "message": "Request validation failed",
  "details": [
    {
      "field": "body -> quantity",
      "message": "ensure this value is greater than 0",
      "type": "value_error.number.not_gt"
    }
  ],
  "timestamp": "2025-07-15T16:25:47.177582",
  "path": "http://127.0.0.1:1969/invoice-items/"
}
```

### 4. Database Errors (500 Internal Server Error)
**When**: Database connection or query issues
**Example**:
```json
{
  "error": "Database Error",
  "message": "Database connection or query error",
  "detail": "Database query failed: ...",
  "timestamp": "2025-07-15T16:25:47.177582",
  "path": "http://127.0.0.1:1969/invoices/"
}
```

### 5. Internal Server Errors (500 Internal Server Error)
**When**: Unexpected application errors
**Example**:
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "detail": "Contact support for more details",
  "timestamp": "2025-07-15T16:25:47.177582",
  "path": "http://127.0.0.1:1969/invoices/"
}
```

## Specific Validations

### UUID Validation
- All ID parameters (customer_id, product_id, invoice_id, etc.) are validated for proper UUID format
- Invalid UUIDs return 400 Bad Request with descriptive message

### Invoice Item Validations
- `quantity`: Must be greater than 0
- `unit_price`: Must be non-negative
- `description`: Required field
- `product_id`: Must exist in products table and be active

### Soft Delete Validations
- Only customers and products support soft delete (is_active field)
- Invoices use cancellation with reason
- Payments use refund mechanism

## Logging
All errors are logged with appropriate severity levels:
- INFO: Normal operations
- WARNING: Missing resources
- ERROR: System errors and exceptions

## Request Tracking
Each request is logged with:
- Request method and URL
- Response status code
- Processing time
- Visual indicators (🟢 for success, 🔴 for errors)

## Example Usage

### Testing Error Handling
```bash
# Test invalid UUID
curl -X GET "http://127.0.0.1:1969/invoice-items/invalid-uuid"

# Test non-existent resource
curl -X GET "http://127.0.0.1:1969/invoice-items/00000000-0000-0000-0000-000000000000"

# Test validation error
curl -X POST "http://127.0.0.1:1969/invoice-items/" \
  -H "Content-Type: application/json" \
  -d '{"invoice_id": "invalid", "quantity": -1}'
```

## Best Practices
1. Always check the error response format when handling API errors
2. Use the `timestamp` field for debugging timing issues
3. The `path` field helps identify which endpoint caused the error
4. Log error details on the client side for better debugging
5. Handle different error types appropriately in your frontend application
