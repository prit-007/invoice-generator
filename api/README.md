# Invoice Management API Setup Guide

## 📋 Overview

This is a comprehensive FastAPI-based invoice management system with the following structure:

## 🗂️ Project Structure

```
api/
├── db/
│   └── database.py          # Database connection & utilities
├── models/
│   ├── customer.py          # Customer model (deprecated)
│   ├── customer_models.py   # Customer request/response models
│   ├── product.py           # Product model (deprecated)
│   ├── product_models.py    # Product request/response models
│   ├── invoice.py           # Invoice model (deprecated)
│   ├── invoice_models.py    # Invoice request/response models
│   ├── payment.py           # Payment model (deprecated)
│   ├── payment_models.py    # Payment request/response models
│   └── invoice_item_models.py # Invoice item models
├── routers/
│   ├── customers.py         # Customer API endpoints
│   ├── products.py          # Product API endpoints
│   ├── invoices.py          # Invoice API endpoints
│   └── payments.py          # Payment API endpoints
├── services/
│   ├── customer_service.py  # Customer business logic
│   ├── product_service.py   # Product business logic
│   ├── invoice_service.py   # Invoice business logic
│   ├── payment_service.py   # Payment business logic
│   └── invoice_item_service.py # Invoice item business logic
├── main.py                  # FastAPI application entry point
├── requirements.txt         # Python dependencies
├── .env                     # Environment variables (create this!)
├── .env.example            # Environment variables template
└── test_db_connection.py   # Database connection test
```

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd api
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create a `.env` file in the `api` directory:

```env
# Supabase Database Configuration
user=postgres.hgpcbqpyeifcovivzpur
password=your-actual-password-here
host=aws-0-ap-south-1.pooler.supabase.com
port=6543
dbname=postgres
```

### 3. Test Database Connection

```bash
python test_db_connection.py
```

### 4. Start the Server

```bash
python main.py
```

Or using uvicorn directly:

```bash
uvicorn main:app --host 127.0.0.1 --port 1969 --reload
```

## 📊 Database Schema

The application uses the following Supabase tables:
- `customers` - Customer information
- `products` - Product catalog
- `invoices` - Invoice records
- `invoice_items` - Invoice line items
- `payments` - Payment records

## 🔗 API Endpoints

### Customers
- `GET /customers/` - Get all customers
- `GET /customers/{customer_id}` - Get specific customer
- `POST /customers/` - Create new customer
- `PUT /customers/{customer_id}` - Update customer
- `DELETE /customers/{customer_id}` - Delete customer

### Products
- `GET /products/` - Get all products
- `GET /products/{product_id}` - Get specific product
- `POST /products/` - Create new product
- `PUT /products/{product_id}` - Update product
- `DELETE /products/{product_id}` - Delete product

### Invoices
- `GET /invoices/` - Get all invoices
- `GET /invoices/{invoice_id}` - Get specific invoice
- `POST /invoices/` - Create new invoice
- `PUT /invoices/{invoice_id}` - Update invoice
- `DELETE /invoices/{invoice_id}` - Delete invoice

### Payments
- `GET /payments/` - Get all payments
- `GET /payments/{payment_id}` - Get specific payment
- `POST /payments/` - Create new payment
- `PUT /payments/{payment_id}` - Update payment
- `DELETE /payments/{payment_id}` - Delete payment

## 🛠️ Features

✅ **Completed:**
- Database connection with Supabase
- Pydantic models for request/response validation
- CRUD operations for all entities
- FastAPI routers with proper error handling
- Middleware for request logging
- Automatic API documentation

## 🔍 API Documentation

Once the server is running, visit:
- Swagger UI: `http://127.0.0.1:1969/docs`
- ReDoc: `http://127.0.0.1:1969/redoc`

## 🧪 Testing

To test the API, you can use:
- The built-in FastAPI docs interface
- Postman or similar API testing tools
- curl commands

Example curl to create a customer:

```bash
curl -X POST "http://127.0.0.1:1969/customers/" \
-H "Content-Type: application/json" \
-d '{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "billing_address": {
    "line1": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipcode": "10001"
  }
}'
```

## 🔧 Next Steps

1. **Set up your .env file** with actual Supabase credentials
2. **Test the database connection** using the test script
3. **Run the server** and test the API endpoints
4. **Create sample data** to test the complete workflow

## 📝 Notes

- All models use Pydantic for validation
- Database operations use raw SQL with psycopg2
- Error handling is implemented at the router level
- Request tracking middleware logs all API calls
- The API follows REST conventions
