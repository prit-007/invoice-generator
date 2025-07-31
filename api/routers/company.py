from fastapi import APIRouter, HTTPException
from models.company_models import CompanySettingsResponse, CompanySettingsUpdateRequest
from services.company_service import get_company_settings, update_company_settings
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/settings", response_model=CompanySettingsResponse)
async def get_company_settings_endpoint():
    """Get company settings"""
    try:
        settings = get_company_settings()
        if not settings:
            raise HTTPException(status_code=404, detail="Company settings not found")
        return settings
    except Exception as e:
        logger.error(f"Error getting company settings: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/settings", response_model=CompanySettingsResponse)
async def update_company_settings_endpoint(settings: CompanySettingsUpdateRequest):
    """Update company settings"""
    try:
        updated_settings = update_company_settings(settings)
        if not updated_settings:
            raise HTTPException(status_code=500, detail="Failed to update company settings")
        return updated_settings
    except Exception as e:
        logger.error(f"Error updating company settings: {e}")
        raise HTTPException(status_code=500, detail=str(e))
