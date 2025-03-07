-- Add RLS policies to restrict write operations to only kirankumarsn.n@gmail.com

-- Enable RLS on workers table
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;

-- Create policies for workers table
DROP POLICY IF EXISTS "Allow read access to all authenticated users" ON public.workers;
CREATE POLICY "Allow read access to all authenticated users"
  ON public.workers
  FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow write access only to admin" ON public.workers;
CREATE POLICY "Allow write access only to admin"
  ON public.workers
  USING (auth.jwt() ->> 'email' = 'kirankumarsn.n@gmail.com');

-- Enable RLS on shifts table
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

-- Create policies for shifts table
DROP POLICY IF EXISTS "Allow read access to all authenticated users" ON public.shifts;
CREATE POLICY "Allow read access to all authenticated users"
  ON public.shifts
  FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow write access only to admin" ON public.shifts;
CREATE POLICY "Allow write access only to admin"
  ON public.shifts
  USING (auth.jwt() ->> 'email' = 'kirankumarsn.n@gmail.com');

-- Enable RLS on payments table
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create policies for payments table
DROP POLICY IF EXISTS "Allow read access to all authenticated users" ON public.payments;
CREATE POLICY "Allow read access to all authenticated users"
  ON public.payments
  FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow write access only to admin" ON public.payments;
CREATE POLICY "Allow write access only to admin"
  ON public.payments
  USING (auth.jwt() ->> 'email' = 'kirankumarsn.n@gmail.com');
