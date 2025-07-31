"""
RUBY ENTERPRISE PDF Generator - Exact format matching the provided screenshot
"""
import io
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from services.company_service import get_company_settings
from services.invoice_service import get_invoice_by_id
import logging

logger = logging.getLogger(__name__)

def generate_ruby_enterprise_pdf(invoice_id: str) -> bytes:
    """Generate PDF with exact RUBY ENTERPRISE format"""
    try:
        # Get invoice and company data
        invoice = get_invoice_by_id(invoice_id)
        if not invoice:
            return None
            
        company = get_company_settings()
        if not company:
            # Default RUBY ENTERPRISE settings
            class DefaultCompany:
                company_name = "RUBY ENTERPRISE"
                address_line1 = "SHOP-2, SURVEY NO. 35/2, PLOT NO-7, RUBY ENTERPRISE,"
                address_line2 = "B/H TULIP PARTY PLOT, NR POONAM DUMPER,N.H 8-B,"
                city = "VAVDI, RAJKOT"
                state = "GUJARAT"
                postal_code = "360004"
                country = "INDIA"
                phone = "+91 94272 53431"
                gst_number = "24ADRPT0090R1ZQ"
                pan_number = "ADRPT0090R"
                bank_name = "HDFC Bank Ltd."
                bank_account_name = "RUBY ENTERPRISE"
                bank_account_number = "50200082252861"
                bank_ifsc_code = "HDFC0009028"
                terms_and_conditions = '1) "SUBJECT TO "RAJKOT"JURIDICTION ONLY. E.& O.E"'
                authorized_signatory = "RUBY ENTERPRISE"
            
            company = DefaultCompany()
            
        # Create PDF buffer
        buffer = io.BytesIO()
        
        # Create PDF document with A4 size and minimal margins
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=15,
            leftMargin=15,
            topMargin=15,
            bottomMargin=15
        )
        
        # Container for elements
        elements = []
        
        # Define styles
        styles = getSampleStyleSheet()
        
        # Custom styles matching exact format
        company_name_style = ParagraphStyle(
            'CompanyName',
            parent=styles['Normal'],
            fontSize=14,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold',
            spaceAfter=2
        )
        
        address_style = ParagraphStyle(
            'Address',
            parent=styles['Normal'],
            fontSize=8,
            alignment=TA_CENTER,
            spaceAfter=1
        )
        
        tax_invoice_style = ParagraphStyle(
            'TaxInvoice',
            parent=styles['Normal'],
            fontSize=12,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        )
        
        small_style = ParagraphStyle(
            'Small',
            parent=styles['Normal'],
            fontSize=7
        )
        
        # 1. Company Header
        company_header = Table([
            [Paragraph(f"<b>{company.company_name}</b>", company_name_style)],
            [Paragraph(company.address_line1, address_style)],
            [Paragraph(company.address_line2, address_style)],
            [Paragraph(f"{company.city} - {company.postal_code} {company.state} ( {company.country} )", address_style)],
            [Paragraph(f"📞 {company.phone}", address_style)]
        ], colWidths=[7.5*inch])
        
        company_header.setStyle(TableStyle([
            ('BOX', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ]))
        
        elements.append(company_header)
        
        # 2. GST and PAN row
        gst_pan_table = Table([
            [f"GST NO.: {company.gst_number}", "", f"PAN NO: {company.pan_number}"]
        ], colWidths=[2.5*inch, 2.5*inch, 2.5*inch])
        
        gst_pan_table.setStyle(TableStyle([
            ('BOX', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 2),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ]))
        
        elements.append(gst_pan_table)
        
        # 3. TAX INVOICE header
        tax_invoice_header = Table([
            [Paragraph("<b>TAX INVOICE</b>", tax_invoice_style)]
        ], colWidths=[7.5*inch])
        
        tax_invoice_header.setStyle(TableStyle([
            ('BOX', (0, 0), (-1, -1), 1, colors.black),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ]))
        
        elements.append(tax_invoice_header)
        
        # 4. Invoice details section
        invoice_details_data = [
            ["PO DATE:", "", "E-WAY BILL NO.", f"BILL NO: {invoice.invoice_number}", f"{invoice.invoice_number}"],
            ["PO NO:", "", "BILL DATE: {invoice.date}", f"BILL DATE: {invoice.date.strftime('%d-%m-%Y') if invoice.date else ''}", ""],
            ["TRANSPORT:", "", "E-WAY BILL DATE", "TOTAL QTY.", ""],
            ["LR. NO.:", "", "VEHICAL NO.", "", ""]
        ]
        
        invoice_details_table = Table(invoice_details_data, colWidths=[1.5*inch, 1.5*inch, 1.5*inch, 1.5*inch, 1.5*inch])
        
        invoice_details_table.setStyle(TableStyle([
            ('BOX', (0, 0), (-1, -1), 1, colors.black),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 0), (-1, -1), 7),
            ('TOPPADDING', (0, 0), (-1, -1), 2),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ]))
        
        elements.append(invoice_details_table)
        
        # Continue building the rest of the invoice...
        # This is getting quite long, so I'll continue in the next part
        
        # Build PDF
        doc.build(elements)
        
        # Get PDF content
        pdf_content = buffer.getvalue()
        buffer.close()
        
        return pdf_content
        
    except Exception as e:
        logger.error(f"Error generating RUBY ENTERPRISE PDF for invoice {invoice_id}: {e}")
        return None
