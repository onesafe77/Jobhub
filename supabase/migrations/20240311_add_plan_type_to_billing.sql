-- Add plan_type to billing_history
ALTER TABLE public.billing_history 
ADD COLUMN IF NOT EXISTS plan_type TEXT CHECK (plan_type IN ('lite', 'pro'));
