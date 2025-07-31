"""
API Documentation Module

This module provides API documentation templates, examples, and additional resources 
to enhance the auto-generated Swagger/OpenAPI documentation.
"""

from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
import os
import json

# Create a router specifically for documentation pages
router = APIRouter(
    prefix="/api-docs",
    tags=["Documentation"]
)

# Check if templates directory exists, if not create it
TEMPLATES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "templates")
if not os.path.exists(TEMPLATES_DIR):
    os.makedirs(TEMPLATES_DIR)

# Initialize templates
try:
    templates = Jinja2Templates(directory=TEMPLATES_DIR)
except Exception as e:
    print(f"Error initializing templates: {e}")
    # Fallback
    templates = None

# Create API documentation dictionary
API_DOCS = {
    "overview": {
        "title": "Invoice Management API",
        "version": "1.0.0",
        "description": "A comprehensive RESTful API for managing invoices, customers, products, and payments."
    },
    "authentication": {
        "title": "Authentication",
        "description": "Currently, this API does not require authentication. For production environments, implement OAuth2 or API keys.",
        "examples": {
            "api_key": "Authorization: ApiKey YOUR_API_KEY",
            "oauth2": "Authorization: Bearer YOUR_ACCESS_TOKEN"
        }
    },
    "resources": [
        {
            "name": "Customers",
            "description": "Manage customer accounts, contact information, and addresses",
            "endpoints": [
                {"method": "GET", "path": "/customers", "description": "List all active customers"},
                {"method": "GET", "path": "/customers/all", "description": "List all customers including inactive ones"},
                {"method": "GET", "path": "/customers/{id}", "description": "Get a specific customer by ID"},
                {"method": "POST", "path": "/customers", "description": "Create a new customer"},
                {"method": "PUT", "path": "/customers/{id}", "description": "Update an existing customer"},
                {"method": "DELETE", "path": "/customers/{id}", "description": "Deactivate a customer"}
            ]
        },
        {
            "name": "Products",
            "description": "Manage product catalog, pricing, and inventory information",
            "endpoints": [
                {"method": "GET", "path": "/products", "description": "List all active products"},
                {"method": "GET", "path": "/products/all", "description": "List all products including inactive ones"},
                {"method": "GET", "path": "/products/{id}", "description": "Get a specific product by ID"},
                {"method": "POST", "path": "/products", "description": "Create a new product"},
                {"method": "PUT", "path": "/products/{id}", "description": "Update an existing product"},
                {"method": "DELETE", "path": "/products/{id}", "description": "Deactivate a product"}
            ]
        },
        {
            "name": "Invoices",
            "description": "Create and manage invoices with line items and calculations",
            "endpoints": [
                {"method": "GET", "path": "/invoices", "description": "List all invoices"},
                {"method": "GET", "path": "/invoices/{id}", "description": "Get a specific invoice with items"},
                {"method": "POST", "path": "/invoices", "description": "Create a new invoice with items"},
                {"method": "PUT", "path": "/invoices/{id}", "description": "Update an existing invoice"},
                {"method": "POST", "path": "/invoices/{id}/cancel", "description": "Cancel an invoice"}
            ]
        },
        {
            "name": "Invoice Items",
            "description": "Manage individual line items within invoices",
            "endpoints": [
                {"method": "GET", "path": "/invoice-items/invoice/{id}", "description": "List all items for an invoice"},
                {"method": "GET", "path": "/invoice-items/{id}", "description": "Get a specific invoice item"},
                {"method": "POST", "path": "/invoice-items", "description": "Add a new item to an invoice"},
                {"method": "PUT", "path": "/invoice-items/{id}", "description": "Update an existing invoice item"}
            ]
        },
        {
            "name": "Payments",
            "description": "Process and track payments against invoices",
            "endpoints": [
                {"method": "GET", "path": "/payments", "description": "List all payments"},
                {"method": "GET", "path": "/payments/{id}", "description": "Get a specific payment"},
                {"method": "POST", "path": "/payments", "description": "Record a new payment"},
                {"method": "PUT", "path": "/payments/{id}", "description": "Update an existing payment"},
                {"method": "POST", "path": "/payments/{id}/refund", "description": "Process a payment refund"}
            ]
        }
    ],
    "examples": {
        "customer_create": {
            "title": "Create Customer",
            "request": {
                "method": "POST",
                "endpoint": "/customers",
                "body": {
                    "name": "Acme Corporation",
                    "contact": "John Doe",
                    "email": "john@acmecorp.com",
                    "phone": "+1-555-123-4567",
                    "billing_address": {
                        "address_line1": "123 Business Ave",
                        "address_line2": "Suite 200",
                        "city": "Metropolis",
                        "state": "NY",
                        "zip_code": "10001",
                        "country": "USA"
                    },
                    "gst_no": "GST12345678",
                    "place_of_supply": "New York",
                    "payment_terms": 30
                }
            },
            "response": {
                "status": 201,
                "body": {
                    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                    "name": "Acme Corporation",
                    "contact": "John Doe",
                    "email": "john@acmecorp.com",
                    "phone": "+1-555-123-4567",
                    "billing_address": {
                        "address_line1": "123 Business Ave",
                        "address_line2": "Suite 200",
                        "city": "Metropolis",
                        "state": "NY",
                        "zip_code": "10001",
                        "country": "USA"
                    },
                    "shipping_address": None,
                    "gst_no": "GST12345678",
                    "place_of_supply": "New York",
                    "payment_terms": 30,
                    "credit_limit": None,
                    "is_active": True,
                    "created_at": "2025-07-23T10:30:00.000Z",
                    "updated_at": "2025-07-23T10:30:00.000Z"
                }
            }
        },
        "invoice_create": {
            "title": "Create Invoice",
            "request": {
                "method": "POST",
                "endpoint": "/invoices",
                "body": {
                    "customer_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                    "invoice_date": "2025-07-23",
                    "due_date": "2025-08-22",
                    "notes": "Monthly services invoice",
                    "items": [
                        {
                            "product_id": "5ea85f64-5717-4562-b3fc-2c963f66afa7",
                            "quantity": 2,
                            "unit_price": 100.00,
                            "description": "Custom Product Description"
                        },
                        {
                            "product_id": "7fa85f64-5717-4562-b3fc-2c963f66afa8",
                            "quantity": 1,
                            "unit_price": 50.00
                        }
                    ]
                }
            },
            "response": {
                "status": 201,
                "body": {
                    "id": "8fa85f64-5717-4562-b3fc-2c963f66afa9",
                    "invoice_number": "INV-2025-0001",
                    "customer_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                    "customer": {
                        "name": "Acme Corporation",
                        "email": "john@acmecorp.com",
                        "gst_no": "GST12345678"
                    },
                    "invoice_date": "2025-07-23",
                    "due_date": "2025-08-22",
                    "status": "draft",
                    "notes": "Monthly services invoice",
                    "subtotal": 250.00,
                    "tax_amount": 45.00,
                    "total_amount": 295.00,
                    "items": [
                        {
                            "id": "9fa85f64-5717-4562-b3fc-2c963f66afaa",
                            "product_id": "5ea85f64-5717-4562-b3fc-2c963f66afa7",
                            "quantity": 2,
                            "unit_price": 100.00,
                            "description": "Custom Product Description",
                            "amount": 200.00,
                            "tax_rate": 18.00,
                            "tax_amount": 36.00
                        },
                        {
                            "id": "1fa85f64-5717-4562-b3fc-2c963f66afab",
                            "product_id": "7fa85f64-5717-4562-b3fc-2c963f66afa8",
                            "quantity": 1,
                            "unit_price": 50.00,
                            "description": "Standard Product",
                            "amount": 50.00,
                            "tax_rate": 18.00,
                            "tax_amount": 9.00
                        }
                    ],
                    "created_at": "2025-07-23T10:35:00.000Z",
                    "updated_at": "2025-07-23T10:35:00.000Z"
                }
            }
        }
    },
    "errors": [
        {
            "code": 400,
            "title": "Bad Request",
            "description": "The request was invalid or cannot be served. The exact error is indicated in the response body."
        },
        {
            "code": 401,
            "title": "Unauthorized",
            "description": "Authentication credentials are missing or invalid."
        },
        {
            "code": 403,
            "title": "Forbidden",
            "description": "The authenticated user does not have permission to access the requested resource."
        },
        {
            "code": 404,
            "title": "Not Found",
            "description": "The requested resource does not exist."
        },
        {
            "code": 422,
            "title": "Validation Error",
            "description": "The request data failed validation. Details about specific fields are included in the response."
        },
        {
            "code": 500,
            "title": "Internal Server Error",
            "description": "An error occurred on the server. Contact support for assistance."
        }
    ],
    "best_practices": [
        {
            "title": "Pagination",
            "description": "When retrieving lists of resources, use the limit and offset query parameters to paginate results."
        },
        {
            "title": "Error Handling",
            "description": "Check the error response for details about what went wrong. Error responses include a status code, error title, and message."
        },
        {
            "title": "Idempotency",
            "description": "For POST requests, consider using an idempotency key in the X-Idempotency-Key header to prevent duplicate operations."
        },
        {
            "title": "Rate Limiting",
            "description": "The API includes rate limiting. Check the X-RateLimit-* headers in responses to monitor your usage."
        }
    ]
}

@router.get("/", response_class=HTMLResponse)
async def api_docs_home(request: Request):
    """
    Main documentation page
    """
    if templates:
        try:
            return templates.TemplateResponse("api_docs.html", {"request": request, "docs": API_DOCS})
        except Exception as e:
            # Fallback to JSON response
            print(f"Error rendering template: {e}")
    
    # Fallback HTML response
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Invoice Management API Documentation</title>
        <style>
            body {{
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
            }}
            h1 {{
                color: #2c3e50;
                border-bottom: 1px solid #eee;
                padding-bottom: 10px;
            }}
            h2 {{
                color: #3498db;
                margin-top: 30px;
            }}
            h3 {{
                color: #2c3e50;
            }}
            .endpoint {{
                background-color: #f8f9fa;
                padding: 15px;
                margin: 10px 0;
                border-radius: 5px;
                border-left: 4px solid #3498db;
            }}
            .method {{
                font-weight: bold;
                margin-right: 10px;
            }}
            .get {{ color: #3498db; }}
            .post {{ color: #27ae60; }}
            .put {{ color: #f39c12; }}
            .delete {{ color: #e74c3c; }}
            pre {{
                background-color: #f8f9fa;
                padding: 10px;
                border-radius: 5px;
                overflow-x: auto;
            }}
            .example {{
                background-color: #f8f9fa;
                padding: 20px;
                margin: 20px 0;
                border-radius: 5px;
            }}
            .error {{
                background-color: #fdedec;
                padding: 15px;
                margin: 10px 0;
                border-radius: 5px;
                border-left: 4px solid #e74c3c;
            }}
            .note {{
                background-color: #eafaf1;
                padding: 15px;
                margin: 15px 0;
                border-radius: 5px;
                border-left: 4px solid #27ae60;
            }}
            table {{
                width: 100%;
                border-collapse: collapse;
                margin: 15px 0;
            }}
            th, td {{
                padding: 10px;
                text-align: left;
                border-bottom: 1px solid #ddd;
            }}
            th {{
                background-color: #f2f2f2;
            }}
            a {{
                color: #3498db;
                text-decoration: none;
            }}
            a:hover {{
                text-decoration: underline;
            }}
        </style>
    </head>
    <body>
        <h1>{API_DOCS["overview"]["title"]} v{API_DOCS["overview"]["version"]}</h1>
        <p>{API_DOCS["overview"]["description"]}</p>
        
        <div class="note">
            <p>For interactive API documentation with request builders and live examples, visit:</p>
            <ul>
                <li><a href="/api-docs">Swagger UI Documentation</a></li>
                <li><a href="/api-redoc">ReDoc Documentation</a></li>
                <li><a href="/api-openapi.json">OpenAPI JSON Schema</a></li>
            </ul>
        </div>
        
        <h2>Authentication</h2>
        <p>{API_DOCS["authentication"]["description"]}</p>
        <pre><code>{API_DOCS["authentication"]["examples"]["api_key"]}</code></pre>
        <pre><code>{API_DOCS["authentication"]["examples"]["oauth2"]}</code></pre>
        
        <h2>API Resources</h2>
    """
    
    # Add resources
    for resource in API_DOCS["resources"]:
        html_content += f"""
        <h3>{resource["name"]}</h3>
        <p>{resource["description"]}</p>
        <table>
            <tr>
                <th>Method</th>
                <th>Endpoint</th>
                <th>Description</th>
            </tr>
        """
        
        for endpoint in resource["endpoints"]:
            method_class = endpoint["method"].lower()
            html_content += f"""
            <tr>
                <td class="method {method_class}">{endpoint["method"]}</td>
                <td><code>{endpoint["path"]}</code></td>
                <td>{endpoint["description"]}</td>
            </tr>
            """
            
        html_content += "</table>"
    
    # Add examples
    html_content += "<h2>Examples</h2>"
    
    for example_key, example in API_DOCS["examples"].items():
        html_content += f"""
        <div class="example">
            <h3>{example["title"]}</h3>
            <h4>Request</h4>
            <p><strong>{example["request"]["method"]}</strong> <code>{example["request"]["endpoint"]}</code></p>
            <pre><code>{json.dumps(example["request"].get("body", {}), indent=2)}</code></pre>
            
            <h4>Response</h4>
            <p><strong>Status:</strong> {example["response"]["status"]}</p>
            <pre><code>{json.dumps(example["response"]["body"], indent=2)}</code></pre>
        </div>
        """
    
    # Add errors
    html_content += "<h2>Error Codes</h2>"
    
    for error in API_DOCS["errors"]:
        html_content += f"""
        <div class="error">
            <h3>{error["code"]} - {error["title"]}</h3>
            <p>{error["description"]}</p>
        </div>
        """
    
    # Add best practices
    html_content += "<h2>Best Practices</h2><ul>"
    
    for practice in API_DOCS["best_practices"]:
        html_content += f"""
        <li>
            <strong>{practice["title"]}</strong>: {practice["description"]}
        </li>
        """
    
    html_content += "</ul>"
    
    # Close HTML
    html_content += """
    </body>
    </html>
    """
    
    return HTMLResponse(content=html_content)

@router.get("/examples", response_class=HTMLResponse)
async def api_examples(request: Request):
    """
    API usage examples page
    """
    # Implementation similar to the home page but focused on examples
    return HTMLResponse(content="API Examples Page - See /api-docs for full documentation")

@router.get("/errors", response_class=HTMLResponse)
async def api_errors(request: Request):
    """
    API error reference page
    """
    # Implementation similar to the home page but focused on error codes and handling
    return HTMLResponse(content="API Error Reference - See /api-docs for full documentation")
