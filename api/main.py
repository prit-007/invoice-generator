from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import traceback
import logging
from datetime import datetime
from routers import customers, products, invoices, payments, invoice_items, dashboard, additional_charges, company
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import docs
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Invoice Management API",
    description="""
    ## Invoice Management System API
    
    A comprehensive RESTful API for managing invoices, customers, products, and payments.
    This API provides full CRUD operations for all entities and supports advanced features
    like filtering, pagination, and comprehensive error handling.
    
    ### Features
    
    * **Customer Management**: Complete customer lifecycle management with billing/shipping addresses
    * **Product Management**: Product catalog with inventory tracking and pricing
    * **Invoice Management**: Create, manage, and track invoices with line items
    * **Payment Management**: Process and track payments against invoices
    * **Advanced Filtering**: Filter entities by various criteria
    * **Error Handling**: Comprehensive error responses with detailed information
    * **Validation**: Input validation with detailed error messages
    
    ### Authentication
    
    Currently, this API does not require authentication. In production environments,
    appropriate authentication and authorization mechanisms should be implemented.
    
    ### Rate Limiting
    
    No rate limiting is currently implemented. Consider implementing rate limiting
    for production use.
    
    ### Support
    
    For support and questions, please contact the development team.
    """,
    version="1.0.0",
    terms_of_service="http://localhost:1969/terms/",
    contact={
        "name": "Invoice API Support Team",
        "url": "http://localhost:1969/contact/",
        "email": "support@invoice-api.com",
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT",
    },
    docs_url="/api-docs",  # Custom docs URL
    redoc_url="/api-redoc",  # Alternative docs URL
    openapi_url="/api-openapi.json"  # OpenAPI schema URL
)

# Add CORS middleware
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Global exception handler for validation errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    error_details = []
    for error in exc.errors():
        error_details.append({
            "field": " -> ".join(str(x) for x in error["loc"]),
            "message": error["msg"],
            "type": error["type"]
        })
    
    logger.error(f"Validation error on {request.method} {request.url}: {error_details}")
    
    return JSONResponse(
        status_code=422,
        content={
            "error": "Validation Error",
            "message": "Request validation failed",
            "details": error_details,
            "timestamp": datetime.now().isoformat(),
            "path": str(request.url)
        }
    )

# Global exception handler for HTTP exceptions
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    logger.error(f"HTTP error on {request.method} {request.url}: {exc.status_code} - {exc.detail}")
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": f"HTTP {exc.status_code}",
            "message": exc.detail,
            "timestamp": datetime.now().isoformat(),
            "path": str(request.url)
        }
    )

# Global exception handler for all other exceptions
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    error_trace = traceback.format_exc()
    logger.error(f"Unhandled exception on {request.method} {request.url}: {str(exc)}\n{error_trace}")
    
    # Different error messages for different exception types
    if "psycopg2" in str(type(exc)) or "database" in str(exc).lower():
        error_message = "Database connection or query error"
        error_type = "Database Error"
    elif "uuid" in str(exc).lower() or "invalid" in str(exc).lower():
        error_message = "Invalid ID format or parameter"
        error_type = "Invalid Parameter"
    elif "not found" in str(exc).lower():
        error_message = "Requested resource not found"
        error_type = "Resource Not Found"
    elif "permission" in str(exc).lower() or "forbidden" in str(exc).lower():
        error_message = "Access denied"
        error_type = "Permission Error"
    else:
        error_message = "An unexpected error occurred"
        error_type = "Internal Server Error"
    
    return JSONResponse(
        status_code=500,
        content={
            "error": error_type,
            "message": error_message,
            "detail": str(exc) if app.debug else "Contact support for more details",
            "timestamp": datetime.now().isoformat(),
            "path": str(request.url)
        }
    )

# Enhanced request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = datetime.now()
    
    # Log request details
    logger.info(f"🔵 {request.method} {request.url}")
    
    try:
        response = await call_next(request)
        
        # Calculate response time
        process_time = (datetime.now() - start_time).total_seconds()
        
        # Log response details
        status_emoji = "🟢" if response.status_code < 400 else "🔴"
        logger.info(f"{status_emoji} {request.method} {request.url} - {response.status_code} ({process_time:.3f}s)")
        
        return response
        
    except Exception as e:
        process_time = (datetime.now() - start_time).total_seconds()
        logger.error(f"🔴 {request.method} {request.url} - ERROR ({process_time:.3f}s): {str(e)}")
        raise

# Include routers
app.include_router(customers.router)
app.include_router(products.router)
app.include_router(invoices.router)
app.include_router(payments.router)
app.include_router(invoice_items.router)
app.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
app.include_router(additional_charges.router, prefix="/additional-charges", tags=["additional-charges"])
app.include_router(company.router, prefix="/company", tags=["company"])
app.include_router(docs.router)  # Custom API documentation

# Mount static files
static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/")
def read_root():
    return {"message": "Invoice API is up and running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=1969, reload=True)