from db.database import db
from models.company_models import CompanySettingsResponse, CompanySettingsUpdateRequest
from typing import Optional
import logging

logger = logging.getLogger(__name__)

def get_company_settings() -> Optional[CompanySettingsResponse]:
    """Get company settings"""
    try:
        query = """
            SELECT id, company_name, address_line1, address_line2, city, state,
                   postal_code, country, phone, email, website, gst_number, pan_number,
                   bank_name, bank_account_name, bank_account_number, bank_ifsc_code,
                   terms_and_conditions, authorized_signatory, logo_url,
                   created_at, updated_at
            FROM company_settings
            ORDER BY created_at DESC
            LIMIT 1
        """

        row = db.fetch_one(query)
        if not row:
            return None

        return CompanySettingsResponse(
            id=str(row['id']),
            company_name=row['company_name'],
            address_line1=row['address_line1'],
            address_line2=row['address_line2'],
            city=row['city'],
            state=row['state'],
            postal_code=row['postal_code'],
            country=row['country'],
            phone=row['phone'],
            email=row['email'],
            website=row['website'],
            gst_number=row['gst_number'],
            pan_number=row['pan_number'],
            bank_name=row['bank_name'],
            bank_account_name=row['bank_account_name'],
            bank_account_number=row['bank_account_number'],
            bank_ifsc_code=row['bank_ifsc_code'],
            terms_and_conditions=row['terms_and_conditions'],
            authorized_signatory=row['authorized_signatory'],
            logo_url=row['logo_url'],
            created_at=row['created_at'],
            updated_at=row['updated_at']
        )

    except Exception as e:
        logger.error(f"Error getting company settings: {e}")
        return None

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
