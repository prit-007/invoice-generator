# API Documentation

This document provides an overview of the Invoice Management API and how to use it.

## Quick Start

The API documentation is available in multiple formats:

- **Interactive Swagger UI**: `/api-docs`
- **ReDoc Documentation**: `/api-redoc`
- **Custom Documentation**: `/api-docs/`
- **OpenAPI JSON Schema**: `/api-openapi.json`

## API Resources

The API provides the following main resources:

- **Customers**: `/customers`
- **Products**: `/products`
- **Invoices**: `/invoices`
- **Invoice Items**: `/invoice-items`
- **Payments**: `/payments`

## Authentication

Currently, this API does not require authentication. For production environments, implement OAuth2 or API keys.

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of requests.

Common error codes:
- `400 Bad Request`: The request was invalid
- `404 Not Found`: The requested resource does not exist
- `422 Validation Error`: The request data failed validation
- `500 Internal Server Error`: An error occurred on the server

## Examples

See the interactive documentation at `/api-docs` for examples of API requests and responses.

## Development

### Running the API locally

```bash
cd api
uvicorn main:app --reload --port 1969
```

### Accessing the documentation

Open your browser and navigate to:
- http://localhost:1969/api-docs
