"""
RUBY ENTERPRISE PDF Generator - Compact Professional Format with Clear Section Divisions
"""
import io
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import inch, mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)

def generate_ruby_enterprise_pdf(invoice_id: str) -> bytes:
    """Generate dynamic professional PDF using real invoice data"""
    try:
        # Get invoice and company data
        from services.invoice_service import get_invoice_by_id
        from services.company_service import get_company_settings
        from services.customer_service import get_customer_by_id

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

        # Get customer data
        customer = get_customer_by_id(invoice.customer_id)

        # Get additional charges
        additional_charges = 0
        try:
            from db.database import db
            charges_query = "SELECT total_amount FROM additional_charges WHERE invoice_id = %s"
            charges_result = db.fetch_all(charges_query, (invoice.id,))
            for charge in charges_result:
                additional_charges += float(charge['total_amount'])
        except Exception as e:
            logger.warning(f"Could not load additional charges: {e}")
            additional_charges = 0
        # Create PDF buffer
        buffer = io.BytesIO()

        # Create PDF document with tight margins for compact look
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=12*mm,
            leftMargin=12*mm,
            topMargin=10*mm,
            bottomMargin=10*mm
        )

        # Container for elements
        elements = []

        # Define compact professional styles
        styles = getSampleStyleSheet()
        
        # Compact styles for tight layout
        company_name_style = ParagraphStyle(
            'CompanyName',
            parent=styles['Normal'],
            fontSize=14,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold',
            spaceAfter=1,
            spaceBefore=1
        )

        address_style = ParagraphStyle(
            'Address',
            parent=styles['Normal'],
            fontSize=8,
            alignment=TA_CENTER,
            leading=9
        )

        tax_invoice_style = ParagraphStyle(
            'TaxInvoice',
            parent=styles['Normal'],
            fontSize=12,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold',
            spaceAfter=2,
            spaceBefore=2
        )

        field_label_style = ParagraphStyle(
            'FieldLabel',
            parent=styles['Normal'],
            fontSize=7,
            fontName='Helvetica-Bold',
            leading=8
        )

        field_value_style = ParagraphStyle(
            'FieldValue',
            parent=styles['Normal'],
            fontSize=7,
            leading=8
        )

        item_text_style = ParagraphStyle(
            'ItemText',
            parent=styles['Normal'],
            fontSize=7,
            leading=8
        )
        
        # Calculate available width
        page_width = A4[0] - 24*mm

        # Create main container with all sections
        main_sections = []

        # ===== SECTION 1: COMPANY HEADER =====
        company_data = [
            [Paragraph("RUBY ENTERPRISE", company_name_style)],
            [Paragraph("SHOP-2, SURVEY NO. 35/2, PLOT NO-7, RUBY ENTERPRISE,", address_style)],
            [Paragraph("B/H TULIP PARTY PLOT, NR POONAM DUMPER,N.H 8-B,", address_style)],
            [Paragraph("VAVDI, RAJKOT - 360004 GUJARAT ( INDIA )", address_style)],
            [Paragraph("+91 94272 53431", address_style)]
        ]

        company_table = Table(company_data, colWidths=[page_width])
        company_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            ('LEFTPADDING', (0, 0), (-1, -1), 5),
            ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ]))
        main_sections.append([company_table])

        # ===== SECTION 2: GST & PAN (with section line) =====
        gst_pan_data = [
            [Paragraph("GST NO.: 24ADRPT0090R1ZQ", field_label_style), 
             Paragraph("PAN NO: ADRPT0090R", field_label_style)]
        ]

        gst_pan_table = Table(gst_pan_data, colWidths=[page_width/2, page_width/2])
        gst_pan_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, 0), 'LEFT'),
            ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('LEFTPADDING', (0, 0), (-1, -1), 5),
            ('RIGHTPADDING', (0, 0), (-1, -1), 5),
            # Section divider line above
            ('LINEABOVE', (0, 0), (-1, 0), 0.8, colors.black),
        ]))
        main_sections.append([gst_pan_table])

        # ===== SECTION 3: TAX INVOICE HEADER =====
        tax_invoice_data = [
            [Paragraph("TAX INVOICE", tax_invoice_style)]
        ]

        tax_invoice_table = Table(tax_invoice_data, colWidths=[page_width])
        tax_invoice_table.setStyle(TableStyle([
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            ('LEFTPADDING', (0, 0), (-1, -1), 5),
            ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ]))
        main_sections.append([tax_invoice_table])

        # ===== SECTION 4: INVOICE DETAILS (DYNAMIC) =====
        invoice_date = invoice.date.strftime('%d-%m-%Y') if invoice.date else ''
        po_date = invoice.po_date.strftime('%d-%m-%Y') if invoice.po_date else ''
        eway_bill_date = invoice.eway_bill_date.strftime('%d-%m-%Y') if invoice.eway_bill_date else ''

        invoice_details_data = [
            [
                Paragraph("PO DATE:", field_label_style), "",
                Paragraph("E-WAY BILL NO.", field_label_style), "",
                Paragraph("BILL NO:", field_label_style),
                Paragraph(invoice.invoice_number or "", field_value_style)
            ],
            [
                Paragraph("PO NO:", field_label_style), "",
                Paragraph("BILL DATE:", field_label_style),
                Paragraph(invoice_date, field_value_style), "", ""
            ],
            [
                Paragraph("TRANSPORT:", field_label_style), "",
                Paragraph("E-WAY BILL DATE", field_label_style), "",
                Paragraph("TOTAL QTY.", field_label_style), ""
            ],
            [
                Paragraph("LR. NO.:", field_label_style), "",
                Paragraph("VEHICAL NO.", field_label_style), "", "", ""
            ]
        ]

        detail_col_widths = [page_width*0.15, page_width*0.1, page_width*0.2, page_width*0.15, page_width*0.2, page_width*0.2]
        invoice_details_table = Table(invoice_details_data, colWidths=detail_col_widths)

        invoice_details_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 2),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
            ('LEFTPADDING', (0, 0), (-1, -1), 5),
            ('RIGHTPADDING', (0, 0), (-1, -1), 3),
            # Section divider line above
            ('LINEABOVE', (0, 0), (-1, 0), 0.8, colors.black),
            # Very subtle vertical separators
            ('LINEAFTER', (0, 0), (0, -1), 0.2, colors.lightgrey),
            ('LINEAFTER', (2, 0), (2, -1), 0.2, colors.lightgrey),
            ('LINEAFTER', (4, 0), (4, -1), 0.2, colors.lightgrey),
        ]))
        main_sections.append([invoice_details_table])

        # ===== SECTION 5: CUSTOMER DETAILS (DYNAMIC) =====
        # Parse customer address
        billing_address = {}
        shipping_address = {}

        if customer and hasattr(customer, 'billing_address'):
            if isinstance(customer.billing_address, str):
                import json
                try:
                    billing_address = json.loads(customer.billing_address)
                except:
                    billing_address = {}
            else:
                billing_address = customer.billing_address or {}

        if hasattr(invoice, 'shipping_details') and invoice.shipping_details:
            if isinstance(invoice.shipping_details, str):
                import json
                try:
                    shipping_address = json.loads(invoice.shipping_details)
                except:
                    shipping_address = billing_address
            else:
                shipping_address = invoice.shipping_details or billing_address
        else:
            shipping_address = billing_address

        customer_name = customer.name if customer else invoice.customer_name or "N/A"

        customer_data = [
            [
                Paragraph("BILL TO :", field_label_style),
                Paragraph("SHIP TO:", field_label_style)
            ],
            [
                Paragraph(f"M/S. {customer_name}", field_value_style),
                Paragraph(f"M/S. {customer_name}", field_value_style)
            ],
            [
                Paragraph(billing_address.get('address', ''), field_value_style),
                Paragraph(shipping_address.get('address', ''), field_value_style)
            ],
            [
                Paragraph(f"{billing_address.get('city', '')} - {billing_address.get('pincode', '')}", field_value_style),
                Paragraph(f"{shipping_address.get('city', '')} - {shipping_address.get('pincode', '')}", field_value_style)
            ],
            [
                Paragraph(f"{billing_address.get('state', '')}, {billing_address.get('country', '')}", field_value_style),
                Paragraph(f"{shipping_address.get('state', '')}, {shipping_address.get('country', '')}", field_value_style)
            ],
            [
                Paragraph(f"PLACE TO SUPPLY: {invoice.place_of_supply or billing_address.get('state', '')}", field_value_style),
                Paragraph(f"PLACE TO SUPPLY: {invoice.place_of_supply or shipping_address.get('state', '')}", field_value_style)
            ],
            [
                Paragraph(f"GST NO: {customer.gst_no if customer and customer.gst_no else 'N/A'}", field_value_style),
                Paragraph(f"GST NO: {customer.gst_no if customer and customer.gst_no else 'N/A'}", field_value_style)
            ]
        ]

        customer_table = Table(customer_data, colWidths=[page_width/2, page_width/2])
        customer_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 2),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
            ('LEFTPADDING', (0, 0), (-1, -1), 5),
            ('RIGHTPADDING', (0, 0), (-1, -1), 5),
            # Section divider line above
            ('LINEABOVE', (0, 0), (-1, 0), 0.8, colors.black),
            # Very subtle center separator
            ('LINEAFTER', (0, 0), (0, -1), 0.2, colors.lightgrey),
        ]))
        main_sections.append([customer_table])

        # ===== SECTION 6: ITEMS HEADER (with strong section line) =====
        items_header_data = [
            [
                Paragraph("SR NO", field_label_style),
                Paragraph("PRODUCT NAME", field_label_style),
                Paragraph("HSN/SAC", field_label_style),
                Paragraph("GST RATE", field_label_style),
                Paragraph("QTY/NOS", field_label_style),
                Paragraph("RATE", field_label_style),
                Paragraph("AMOUNT", field_label_style)
            ]
        ]

        item_col_widths = [
            page_width*0.08,   # SR NO
            page_width*0.38,   # PRODUCT NAME (wider for content)
            page_width*0.1,    # HSN/SAC
            page_width*0.1,    # GST RATE
            page_width*0.1,    # QTY/NOS
            page_width*0.12,   # RATE
            page_width*0.12    # AMOUNT
        ]

        items_header_table = Table(items_header_data, colWidths=item_col_widths)
        items_header_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            ('LEFTPADDING', (0, 0), (-1, -1), 2),
            ('RIGHTPADDING', (0, 0), (-1, -1), 2),
            # Strong section divider line above
            ('LINEABOVE', (0, 0), (-1, 0), 0.8, colors.black),
            # Subtle column separators
            ('LINEAFTER', (0, 0), (5, 0), 0.2, colors.lightgrey),
            # Strong line below header
            ('LINEBELOW', (0, 0), (-1, 0), 0.5, colors.black),
        ]))
        main_sections.append([items_header_table])

        # ===== SECTION 7: ITEMS DATA (DYNAMIC) =====
        items_data = []
        total_qty = 0

        # Add real invoice items
        for idx, item in enumerate(invoice.items, 1):
            total_qty += float(item.quantity)

            # Format item description
            description = item.description or "N/A"
            if hasattr(item, 'product_name') and item.product_name:
                description = item.product_name

            items_data.append([
                Paragraph(str(idx), item_text_style),
                Paragraph(description, item_text_style),
                Paragraph(item.hsn_sac_code or "", item_text_style),
                Paragraph(f"{float(item.tax_rate):.0f}%", item_text_style),
                Paragraph(f"{float(item.quantity):.0f}", item_text_style),
                Paragraph(f"{float(item.unit_price):.2f}", item_text_style),
                Paragraph(f"{float(item.line_total):.2f}", item_text_style)
            ])

        # Add additional charges as separate items if any
        if additional_charges > 0:
            items_data.append([
                Paragraph(str(len(invoice.items) + 1), item_text_style),
                Paragraph("PACKAGING AND FORWARDING", item_text_style),
                Paragraph("", item_text_style),
                Paragraph("18%", item_text_style),
                Paragraph("1", item_text_style),
                Paragraph(f"{additional_charges:.2f}", item_text_style),
                Paragraph(f"{additional_charges:.2f}", item_text_style)
            ])
            total_qty += 1

        # Add empty rows for compact look (fewer rows)
        empty_rows_needed = max(0, 6 - len(items_data))
        for _ in range(empty_rows_needed):
            items_data.append(["", "", "", "", "", "", ""])

        # Total row
        items_data.append([
            "", "", "", "",
            Paragraph("TOTAL NOS.", field_label_style),
            Paragraph(f"{int(total_qty)}", field_value_style),
            ""
        ])

        items_table = Table(items_data, colWidths=item_col_widths)
        items_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, -1), 'CENTER'),  # SR NO
            ('ALIGN', (1, 0), (1, -1), 'LEFT'),    # PRODUCT NAME
            ('ALIGN', (2, 0), (2, -1), 'CENTER'),  # HSN/SAC
            ('ALIGN', (3, 0), (3, -1), 'CENTER'),  # GST RATE
            ('ALIGN', (4, 0), (4, -1), 'CENTER'),  # QTY/NOS
            ('ALIGN', (5, 0), (5, -1), 'RIGHT'),   # RATE
            ('ALIGN', (6, 0), (6, -1), 'RIGHT'),   # AMOUNT
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 2),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
            ('LEFTPADDING', (0, 0), (-1, -1), 2),
            ('RIGHTPADDING', (0, 0), (-1, -1), 2),
            # Very subtle column separators
            ('LINEAFTER', (0, 0), (5, -1), 0.15, colors.lightgrey),
            # Line above total row
            ('LINEABOVE', (0, -1), (-1, -1), 0.3, colors.grey),
        ]))
        main_sections.append([items_table])

        # ===== SECTION 8: TOTALS & BANK DETAILS (DYNAMIC) =====
        # Calculate dynamic totals
        subtotal = float(invoice.subtotal or 0)
        tax_amount = float(invoice.tax_amount or 0)
        total_amount = float(invoice.total_amount or 0)

        # Calculate GST breakdown (assuming equal CGST/SGST split for intra-state)
        cgst_amount = tax_amount / 2
        sgst_amount = tax_amount / 2

        # Convert amount to words (simplified)
        def amount_to_words(amount):
            # This is a simplified version - you might want to use a proper library
            amount_int = int(amount)
            if amount_int < 1000:
                return f"{amount_int} ONLY"
            elif amount_int < 100000:
                thousands = amount_int // 1000
                remainder = amount_int % 1000
                if remainder == 0:
                    return f"{thousands} THOUSAND ONLY"
                else:
                    return f"{thousands} THOUSAND {remainder} ONLY"
            else:
                return f"{amount_int} ONLY"

        amount_words = amount_to_words(total_amount).upper()

        totals_data = [
            [
                Paragraph(f"AMOUNT IN WORD: {amount_words}", field_value_style),
                "",
                Paragraph("SUB TOTAL", field_label_style),
                Paragraph(f"{subtotal:,.2f}", field_value_style)
            ],
            [
                "", "",
                Paragraph("TAX", field_label_style),
                Paragraph(f"{tax_amount:.2f}", field_value_style)
            ],
            [
                Paragraph("BANK DETAIL:", field_label_style),
                Paragraph("CGST 6%", field_label_style),
                Paragraph(f"{cgst_amount:.2f}", field_value_style),
                Paragraph("ROUND OFF", field_label_style),
                Paragraph("0.00", field_value_style)
            ],
            [
                Paragraph(f"BANK NAME : {company.bank_name}", field_value_style),
                Paragraph("SGST 6%", field_label_style),
                Paragraph(f"{sgst_amount:.2f}", field_value_style),
                Paragraph("TOTAL", field_label_style),
                Paragraph(f"{total_amount:,.2f}", field_value_style)
            ],
            [
                Paragraph(f"ACCOUNT NAME: {company.bank_account_name}", field_value_style),
                Paragraph("IGST 12%", field_label_style),
                "", "", ""
            ],
            [
                Paragraph(f"AC NO: {company.bank_account_number} & IFSC CODE: {company.bank_ifsc_code}", field_value_style),
                Paragraph("TOTAL GST", field_label_style),
                Paragraph(f"{tax_amount:.2f}", field_value_style),
                "", ""
            ]
        ]

        totals_col_widths = [page_width*0.32, page_width*0.16, page_width*0.14, page_width*0.19, page_width*0.19]
        totals_table = Table(totals_data, colWidths=totals_col_widths)
        totals_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ALIGN', (2, 0), (-1, -1), 'RIGHT'),
            ('TOPPADDING', (0, 0), (-1, -1), 2),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
            ('LEFTPADDING', (0, 0), (-1, -1), 5),
            ('RIGHTPADDING', (0, 0), (-1, -1), 5),
            # Strong section divider line above
            ('LINEABOVE', (0, 0), (-1, 0), 0.8, colors.black),
        ]))
        main_sections.append([totals_table])

        # ===== SECTION 9: TERMS & SIGNATURE (with section line) =====
        terms_data = [
            [
                Paragraph("Terms & Condition :", field_label_style),
                Paragraph("RUBY ENTERPRISE", field_label_style)
            ],
            [
                Paragraph('1) "SUBJECT TO "RAJKOT"JURIDICTION ONLY. E.& O.E"', field_value_style),
                ""
            ],
            [
                "", ""
            ],
            [
                "",
                Paragraph("Authorised Signatory", field_value_style)
            ]
        ]

        terms_table = Table(terms_data, colWidths=[page_width*0.65, page_width*0.35])
        terms_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('VALIGN', (1, -1), (1, -1), 'BOTTOM'),
            ('ALIGN', (1, 0), (1, -1), 'CENTER'),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('LEFTPADDING', (0, 0), (-1, -1), 5),
            ('RIGHTPADDING', (0, 0), (-1, -1), 5),
            # Strong section divider line above
            ('LINEABOVE', (0, 0), (-1, 0), 0.8, colors.black),
        ]))
        main_sections.append([terms_table])

        # ===== CREATE MAIN TABLE =====
        main_table = Table(main_sections, colWidths=[page_width])
        main_table.setStyle(TableStyle([
            # Strong outer border
            ('BOX', (0, 0), (-1, -1), 1.2, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 0),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ]))

        elements.append(main_table)

        # Build PDF
        doc.build(elements)

        # Get PDF content
        pdf_content = buffer.getvalue()
        buffer.close()

        return pdf_content
        
    except Exception as e:
        logger.error(f"Error generating RUBY ENTERPRISE PDF: {e}")
        return None