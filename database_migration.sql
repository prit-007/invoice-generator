-- =====================================================
-- RUBY ENTERPRISE INVOICE SYSTEM - DATABASE MIGRATION
-- =====================================================

-- 1. CREATE COMPANY SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'INDIA',
  phone TEXT,
  email TEXT,
  website TEXT,
  gst_number TEXT,
  pan_number TEXT,
  bank_name TEXT,
  bank_account_name TEXT,
  bank_account_number TEXT,
  bank_ifsc_code TEXT,
  terms_and_conditions TEXT,
  authorized_signatory TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CREATE ADDITIONAL CHARGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.additional_charges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
  charge_name TEXT NOT NULL,
  charge_amount NUMERIC(12,2) NOT NULL,
  is_taxable BOOLEAN DEFAULT FALSE,
  tax_rate NUMERIC(5,2) DEFAULT 0,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ALTER INVOICES TABLE - ADD NEW COLUMNS
-- =====================================================
-- Transport and logistics details
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS po_number TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS po_date DATE;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS transport_name TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS lr_number TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS vehicle_number TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS eway_bill_number TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS eway_bill_date DATE;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS total_quantity NUMERIC(10,2);

-- GST breakdown
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS cgst_rate NUMERIC(5,2) DEFAULT 0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS sgst_rate NUMERIC(5,2) DEFAULT 0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS igst_rate NUMERIC(5,2) DEFAULT 0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS cgst_amount NUMERIC(12,2) DEFAULT 0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS sgst_amount NUMERIC(12,2) DEFAULT 0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS igst_amount NUMERIC(12,2) DEFAULT 0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS round_off NUMERIC(12,2) DEFAULT 0;

-- Additional charges and supply details
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS packaging_forwarding NUMERIC(12,2) DEFAULT 0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS other_charges JSONB;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS place_of_supply TEXT;

-- 4. ALTER INVOICE ITEMS TABLE - ADD NEW COLUMNS
-- =====================================================
ALTER TABLE public.invoice_items ADD COLUMN IF NOT EXISTS hsn_sac_code TEXT;
ALTER TABLE public.invoice_items ADD COLUMN IF NOT EXISTS discount_percentage NUMERIC(5,2) DEFAULT 0;
ALTER TABLE public.invoice_items ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(12,2) DEFAULT 0;
ALTER TABLE public.invoice_items ADD COLUMN IF NOT EXISTS taxable_amount NUMERIC(12,2);
ALTER TABLE public.invoice_items ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(12,2);
ALTER TABLE public.invoice_items ADD COLUMN IF NOT EXISTS line_total NUMERIC(12,2);

-- 5. CREATE INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_additional_charges_invoice ON public.additional_charges (invoice_id);
CREATE INDEX IF NOT EXISTS idx_company_settings_created ON public.company_settings (created_at DESC);

-- 6. INSERT DEFAULT COMPANY SETTINGS (RUBY ENTERPRISE)
-- =====================================================
INSERT INTO public.company_settings (
  company_name, address_line1, address_line2, city, state, postal_code,
  phone, gst_number, pan_number, bank_name, bank_account_name,
  bank_account_number, bank_ifsc_code, terms_and_conditions, authorized_signatory
) VALUES (
  'RUBY ENTERPRISE',
  'SHOP-2, SURVEY NO. 35/2, PLOT NO-7, RUBY ENTERPRISE,',
  'B/H TULIP PARTY PLOT, NR POONAM DUMPER,N.H 8-B,',
  'VAVDI, RAJKOT',
  'GUJARAT',
  '360004',
  '+91 94272 53431',
  '24ADRPT0090R1ZQ',
  'ADRPT0090R',
  'HDFC Bank Ltd.',
  'RUBY ENTERPRISE',
  '50200082252861',
  'HDFC0009028',
  '1) "SUBJECT TO "RAJKOT"JURIDICTION ONLY. E.& O.E"',
  'RUBY ENTERPRISE'
) ON CONFLICT DO NOTHING;

-- 7. UPDATE EXISTING INVOICES WITH DEFAULT VALUES
-- =====================================================
UPDATE public.invoices SET 
  cgst_rate = 6.0,
  sgst_rate = 6.0,
  igst_rate = 0.0,
  place_of_supply = '24'
WHERE cgst_rate IS NULL;

-- 8. SAMPLE ADDITIONAL CHARGES DATA
-- =====================================================
-- Add "PACKAGING AND FORWARDING" charge to existing invoices (optional)
INSERT INTO public.additional_charges (
  invoice_id, charge_name, charge_amount, is_taxable, tax_rate, tax_amount, total_amount
) 
SELECT 
  id as invoice_id,
  'PACKAGING AND FORWARDING' as charge_name,
  200.00 as charge_amount,
  false as is_taxable,
  0.0 as tax_rate,
  0.0 as tax_amount,
  200.00 as total_amount
FROM public.invoices 
WHERE status != 'cancelled'
ON CONFLICT DO NOTHING;

-- 9. ENABLE ROW LEVEL SECURITY FOR NEW TABLES
-- =====================================================
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.additional_charges ENABLE ROW LEVEL SECURITY;

-- 10. GRANT PERMISSIONS (if needed)
-- =====================================================
-- GRANT ALL ON public.company_settings TO your_user;
-- GRANT ALL ON public.additional_charges TO your_user;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- This migration adds:
-- 1. Company settings table with RUBY ENTERPRISE data
-- 2. Additional charges table for "PACKAGING AND FORWARDING" etc.
-- 3. Extended invoice fields for transport, GST, etc.
-- 4. Enhanced invoice items with HSN codes and detailed calculations
-- 5. Sample data and indexes
-- =====================================================
