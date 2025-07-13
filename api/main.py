from fastapi import FastAPI, Request
from routers import costumers

app = FastAPI()

# Middleware to track requests
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"Request: {request.method} {request.url}")
    response = await call_next(request) 
    print(f"Response status: {response.status_code}")
    return response

app.include_router(costumers.router)

@app.get("/")
def read_root():
    return {"message": "Invoice API is up and running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", port=1969, reload=True)