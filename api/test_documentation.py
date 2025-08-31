"""
API Documentation Testing Script

This script validates that the API documentation is properly set up.
Run this script to ensure the documentation endpoints are working correctly.
"""

import requests
import sys
import os
import webbrowser

# Configuration
API_BASE_URL = "http://localhost:1969"
DOCUMENTATION_PATHS = [
    "/api-docs",
    "/api-redoc",
    "/api-openapi.json",
    "/api-docs/"
]

def test_documentation_endpoints():
    """Test if the API documentation endpoints are accessible"""
    print("Testing API documentation endpoints...")
    print("-" * 50)
    
    all_passed = True
    for path in DOCUMENTATION_PATHS:
        url = f"{API_BASE_URL}{path}"
        try:
            response = requests.get(url)
            status = response.status_code
            if status == 200:
                print(f"✅ {url} - SUCCESS ({status})")
            else:
                print(f"❌ {url} - FAILED ({status})")
                all_passed = False
        except Exception as e:
            print(f"❌ {url} - ERROR: {str(e)}")
            all_passed = False
    
    print("-" * 50)
    if all_passed:
        print("All documentation endpoints are working correctly!")
        return True
    else:
        print("Some documentation endpoints failed. Check if the API server is running.")
        return False

def open_documentation():
    """Open the API documentation in the default web browser"""
    url = f"{API_BASE_URL}/api-docs"
    print(f"Opening API documentation: {url}")
    webbrowser.open(url)

if __name__ == "__main__":
    print("API Documentation Test Script")
    print("=" * 50)
    
    if len(sys.argv) > 1 and sys.argv[1] == "--open":
        open_documentation()
    else:
        success = test_documentation_endpoints()
        if success:
            print("\nRun this script with --open flag to open the documentation in your browser:")
            print(f"python {os.path.basename(__file__)} --open")
