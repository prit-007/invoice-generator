-- Enable Row-Level Security for all tables
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create sequence for invoice numbers
CREATE SEQUENCE invoice_number_seq START 1;

-- 🏢 COMPANY SETTINGS TABLE
CREATE TABLE public.company_settings (
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

-- Insert default company settings
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
);

-- 🧑‍💼 CUSTOMERS TABLE
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact TEXT,
  email TEXT,
  phone TEXT,
  billing_address JSONB NOT NULL,
  shipping_address JSONB,
  gst_no TEXT,
  place_of_supply TEXT,
  payment_terms INT DEFAULT 15,
  credit_limit NUMERIC(12,2),
  company_type TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Create index for customer search
CREATE INDEX idx_customers_name ON public.customers (name);
CREATE INDEX idx_customers_email ON public.customers (email);
CREATE INDEX idx_customers_phone ON public.customers (phone);

-- 📦 PRODUCTS TABLE
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  hsn_sac_code TEXT,
  price NUMERIC(12,2) NOT NULL,
  tax_rate NUMERIC(5,2) DEFAULT 18,
  unit TEXT DEFAULT 'NOS',
  is_taxable BOOLEAN DEFAULT TRUE,
  category TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for product search
CREATE INDEX idx_products_name ON public.products (name);
CREATE INDEX idx_products_hsn_sac ON public.products (hsn_sac_code);

-- 🧾 INVOICES TABLE
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE DEFAULT 'INV-' || to_char(nextval('invoice_number_seq'), 'FM000000'),
  customer_id UUID REFERENCES public.customers(id) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'sent', 'paid', 'partially_paid', 'overdue', 'cancelled')),

  -- Basic amounts
  subtotal NUMERIC(12,2) NOT NULL,
  tax_amount NUMERIC(12,2) NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL,
  amount_paid NUMERIC(12,2) DEFAULT 0,
  balance_due NUMERIC(12,2) GENERATED ALWAYS AS (total_amount - amount_paid) STORED,

  -- Transport and logistics details
  po_number TEXT,
  po_date DATE,
  transport_name TEXT,
  lr_number TEXT,
  vehicle_number TEXT,
  eway_bill_number TEXT,
  eway_bill_date DATE,
  total_quantity NUMERIC(10,2),

  -- GST breakdown
  cgst_rate NUMERIC(5,2) DEFAULT 0,
  sgst_rate NUMERIC(5,2) DEFAULT 0,
  igst_rate NUMERIC(5,2) DEFAULT 0,
  cgst_amount NUMERIC(12,2) DEFAULT 0,
  sgst_amount NUMERIC(12,2) DEFAULT 0,
  igst_amount NUMERIC(12,2) DEFAULT 0,
  round_off NUMERIC(12,2) DEFAULT 0,

  -- Additional charges
  packaging_forwarding NUMERIC(12,2) DEFAULT 0,
  other_charges JSONB, -- For flexible additional charges

  -- Address details
  shipping_details JSONB,
  place_of_supply TEXT,

  -- Standard fields
  notes TEXT,
  terms TEXT,
  invoice_type TEXT DEFAULT 'sales',
  is_template BOOLEAN DEFAULT FALSE,
  cancel_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for invoice queries
CREATE INDEX idx_invoices_customer ON public.invoices (customer_id);
CREATE INDEX idx_invoices_status ON public.invoices (status);
CREATE INDEX idx_invoices_date ON public.invoices (date);
CREATE INDEX idx_invoices_due_date ON public.invoices (due_date);

-- 📄 INVOICE ITEMS TABLE
CREATE TABLE public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id),
  description TEXT NOT NULL,
  hsn_sac_code TEXT,
  quantity NUMERIC(10,2) NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL,
  tax_rate NUMERIC(5,2) NOT NULL,
  discount_percentage NUMERIC(5,2) DEFAULT 0,
  discount_amount NUMERIC(12,2) DEFAULT 0,
  taxable_amount NUMERIC(12,2) NOT NULL,
  tax_amount NUMERIC(12,2) NOT NULL,
  line_total NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for invoice items
CREATE INDEX idx_invoice_items_invoice ON public.invoice_items (invoice_id);
CREATE INDEX idx_invoice_items_product ON public.invoice_items (product_id);

-- 💰 ADDITIONAL CHARGES TABLE
CREATE TABLE public.additional_charges (
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

-- Create index for additional charges
CREATE INDEX idx_additional_charges_invoice ON public.additional_charges (invoice_id);

-- 💰 PAYMENTS TABLE
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id),
  customer_id UUID REFERENCES public.customers(id) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  method TEXT NOT NULL 
    CHECK (method IN ('cash', 'cheque', 'bank_transfer', 'upi', 'card', 'other')),
  reference TEXT,
  notes TEXT,
  is_refund BOOLEAN DEFAULT FALSE,
  is_advance BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for payments
CREATE INDEX idx_payments_invoice ON public.payments (invoice_id);
CREATE INDEX idx_payments_customer ON public.payments (customer_id);
CREATE INDEX idx_payments_date ON public.payments (date);

-- Create function to update invoice status based on payments
CREATE OR REPLACE FUNCTION public.update_invoice_status()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.invoices i
    SET 
      amount_paid = (
        SELECT COALESCE(SUM(p.amount), 0)
        FROM public.payments p
        WHERE p.invoice_id = NEW.invoice_id
          AND p.is_refund = FALSE
      ),
      status = CASE
        WHEN i.total_amount <= (
          SELECT COALESCE(SUM(p.amount), 0)
          FROM public.payments p
          WHERE p.invoice_id = NEW.invoice_id
            AND p.is_refund = FALSE
        ) THEN 'paid'
        WHEN (
          SELECT COALESCE(SUM(p.amount), 0)
          FROM public.payments p
          WHERE p.invoice_id = NEW.invoice_id
            AND p.is_refund = FALSE
        ) > 0 THEN 'partially_paid'
        WHEN i.due_date < CURRENT_DATE THEN 'overdue'
        ELSE 'sent'
      END
    WHERE i.id = NEW.invoice_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for payments
CREATE TRIGGER trg_payment_update_invoice
AFTER INSERT OR UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_invoice_status();

-- Create function to update invoice totals when items change
CREATE OR REPLACE FUNCTION public.update_invoice_totals()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
    UPDATE public.invoices i
    SET 
      subtotal = (
        SELECT COALESCE(SUM(ii.amount), 0)
        FROM public.invoice_items ii
        WHERE ii.invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)
      ),
      tax_amount = (
        SELECT COALESCE(SUM(ii.amount * ii.tax_rate/100), 0)
        FROM public.invoice_items ii
        WHERE ii.invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)
      ),
      total_amount = (
        SELECT COALESCE(SUM(ii.amount * (1 + ii.tax_rate/100)), 0)
        FROM public.invoice_items ii
        WHERE ii.invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)
      )
    WHERE i.id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for invoice items
CREATE TRIGGER trg_invoice_items_update_totals
AFTER INSERT OR UPDATE OR DELETE ON public.invoice_items
FOR EACH ROW
EXECUTE FUNCTION public.update_invoice_totals();

-- Create function to update customer stats
CREATE OR REPLACE FUNCTION public.update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
    UPDATE public.customers c
    SET 
      updated_at = NOW()
    WHERE c.id = COALESCE(NEW.customer_id, OLD.customer_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for invoices affecting customers
CREATE TRIGGER trg_invoices_update_customer
AFTER INSERT OR UPDATE OR DELETE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.update_customer_stats();

-- Create trigger for payments affecting customers
CREATE TRIGGER trg_payments_update_customer
AFTER INSERT OR UPDATE OR DELETE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_customer_stats();