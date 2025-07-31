from database import get_db_connection
from models.company_models import CompanySettingsResponse, CompanySettingsUpdateRequest
from typing import Optional
import logging

logger = logging.getLogger(__name__)

def get_company_settings() -> Optional[CompanySettingsResponse]:
    """Get company settings"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, company_name, address_line1, address_line2, city, state, 
                   postal_code, country, phone, email, website, gst_number, pan_number,
                   bank_name, bank_account_name, bank_account_number, bank_ifsc_code,
                   terms_and_conditions, authorized_signatory, logo_url, 
                   created_at, updated_at
            FROM company_settings 
            ORDER BY created_at DESC 
            LIMIT 1
        """)
        
        row = cursor.fetchone()
        if not row:
            return None
            
        return CompanySettingsResponse(
            id=str(row[0]),
            company_name=row[1],
            address_line1=row[2],
            address_line2=row[3],
            city=row[4],
            state=row[5],
            postal_code=row[6],
            country=row[7],
            phone=row[8],
            email=row[9],
            website=row[10],
            gst_number=row[11],
            pan_number=row[12],
            bank_name=row[13],
            bank_account_name=row[14],
            bank_account_number=row[15],
            bank_ifsc_code=row[16],
            terms_and_conditions=row[17],
            authorized_signatory=row[18],
            logo_url=row[19],
            created_at=row[20],
            updated_at=row[21]
        )
        
    except Exception as e:
        logger.error(f"Error getting company settings: {e}")
        return None
    finally:
        if 'conn' in locals():
            conn.close()

def update_company_settings(settings: CompanySettingsUpdateRequest) -> Optional[CompanySettingsResponse]:
    """Update company settings"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Build dynamic update query
        update_fields = []
        values = []
        
        for field, value in settings.dict(exclude_unset=True).items():
            if value is not None:
                update_fields.append(f"{field} = %s")
                values.append(value)
        
        if not update_fields:
            return get_company_settings()
        
        # Add updated_at
        update_fields.append("updated_at = NOW()")
        
        query = f"""
            UPDATE company_settings 
            SET {', '.join(update_fields)}
            WHERE id = (SELECT id FROM company_settings ORDER BY created_at DESC LIMIT 1)
            RETURNING id
        """
        
        cursor.execute(query, values)
        result = cursor.fetchone()
        
        if not result:
            return None
            
        conn.commit()
        return get_company_settings()
        
    except Exception as e:
        logger.error(f"Error updating company settings: {e}")
        if 'conn' in locals():
            conn.rollback()
        return None
    finally:
        if 'conn' in locals():
            conn.close()
