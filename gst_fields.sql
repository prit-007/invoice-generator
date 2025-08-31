-- Add GST fields & enforce 12 % (6 % CGST + 6 % SGST) on invoices
BEGIN;

ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS cgst_rate     NUMERIC(5,2)  DEFAULT 6  NOT NULL,
  ADD COLUMN IF NOT EXISTS sgst_rate     NUMERIC(5,2)  DEFAULT 6  NOT NULL,
  ADD COLUMN IF NOT EXISTS igst_rate     NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS cgst_amount   NUMERIC(12,2) DEFAULT 0  NOT NULL,
  ADD COLUMN IF NOT EXISTS sgst_amount   NUMERIC(12,2) DEFAULT 0  NOT NULL,
  ADD COLUMN IF NOT EXISTS igst_amount   NUMERIC(12,2) DEFAULT 0  NOT NULL,
  ADD COLUMN IF NOT EXISTS round_off     NUMERIC(12,2) DEFAULT 0  NOT NULL;

-- Ensure invoice_items always use 12 % tax_rate
UPDATE invoice_items SET tax_rate = 12 WHERE tax_rate IS NULL OR tax_rate = 0;

-- Backfill existing invoices
UPDATE invoices
SET
  cgst_rate   = 6,
  sgst_rate   = 6,
  cgst_amount = ROUND(COALESCE(subtotal,0) * 0.06, 2),
  sgst_amount = ROUND(COALESCE(subtotal,0) * 0.06, 2),
  tax_amount  = ROUND(COALESCE(subtotal,0) * 0.12, 2),
  total_amount= ROUND(COALESCE(subtotal,0) * 1.12, 2)
WHERE TRUE;

COMMIT;
