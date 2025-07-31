from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from database import get_db_connection
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class AdditionalChargeRequest(BaseModel):
    invoice_id: str
    charge_name: str
    charge_amount: float = Field(ge=0)
    is_taxable: bool = False
    tax_rate: float = Field(ge=0, le=100, default=0)

class AdditionalChargeResponse(BaseModel):
    id: str
    invoice_id: str
    charge_name: str
    charge_amount: float
    is_taxable: bool
    tax_rate: float
    tax_amount: float
    total_amount: float

@router.post("/", response_model=AdditionalChargeResponse)
async def add_additional_charge(charge: AdditionalChargeRequest):
    """Add additional charge to an invoice"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Calculate tax amount
        tax_amount = charge.charge_amount * (charge.tax_rate / 100) if charge.is_taxable else 0
        total_amount = charge.charge_amount + tax_amount
        
        # Insert additional charge
        cursor.execute("""
            INSERT INTO additional_charges (invoice_id, charge_name, charge_amount, is_taxable, tax_rate, tax_amount, total_amount)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            charge.invoice_id,
            charge.charge_name,
            charge.charge_amount,
            charge.is_taxable,
            charge.tax_rate,
            tax_amount,
            total_amount
        ))
        
        result = cursor.fetchone()
        if not result:
            raise HTTPException(status_code=500, detail="Failed to add additional charge")
        
        charge_id = str(result[0])
        conn.commit()
        
        return AdditionalChargeResponse(
            id=charge_id,
            invoice_id=charge.invoice_id,
            charge_name=charge.charge_name,
            charge_amount=charge.charge_amount,
            is_taxable=charge.is_taxable,
            tax_rate=charge.tax_rate,
            tax_amount=tax_amount,
            total_amount=total_amount
        )
        
    except Exception as e:
        logger.error(f"Error adding additional charge: {e}")
        if 'conn' in locals():
            conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'conn' in locals():
            conn.close()

@router.get("/{invoice_id}", response_model=List[AdditionalChargeResponse])
async def get_additional_charges(invoice_id: str):
    """Get additional charges for an invoice"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, invoice_id, charge_name, charge_amount, is_taxable, tax_rate, tax_amount, total_amount
            FROM additional_charges
            WHERE invoice_id = %s
            ORDER BY created_at
        """, (invoice_id,))
        
        rows = cursor.fetchall()
        
        charges = []
        for row in rows:
            charges.append(AdditionalChargeResponse(
                id=str(row[0]),
                invoice_id=str(row[1]),
                charge_name=row[2],
                charge_amount=float(row[3]),
                is_taxable=row[4],
                tax_rate=float(row[5]),
                tax_amount=float(row[6]),
                total_amount=float(row[7])
            ))
        
        return charges
        
    except Exception as e:
        logger.error(f"Error getting additional charges: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'conn' in locals():
            conn.close()

@router.delete("/{charge_id}")
async def delete_additional_charge(charge_id: str):
    """Delete an additional charge"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM additional_charges WHERE id = %s", (charge_id,))
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Additional charge not found")
        
        conn.commit()
        return {"message": "Additional charge deleted successfully"}
        
    except Exception as e:
        logger.error(f"Error deleting additional charge: {e}")
        if 'conn' in locals():
            conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'conn' in locals():
            conn.close()
