-- Create workers table
CREATE TABLE IF NOT EXISTS workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'on-leave')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shifts table
CREATE TABLE IF NOT EXISTS shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  hours NUMERIC(5,2) NOT NULL,
  hourly_rate NUMERIC(6,2) NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  shift_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Public workers access" ON workers;
CREATE POLICY "Public workers access"
  ON workers
  USING (true);

DROP POLICY IF EXISTS "Public shifts access" ON shifts;
CREATE POLICY "Public shifts access"
  ON shifts
  USING (true);

DROP POLICY IF EXISTS "Public payments access" ON payments;
CREATE POLICY "Public payments access"
  ON payments
  USING (true);

-- Enable realtime
alter publication supabase_realtime add table workers;
alter publication supabase_realtime add table shifts;
alter publication supabase_realtime add table payments;

-- Create view for worker stats
CREATE OR REPLACE VIEW worker_stats AS
SELECT 
  w.id,
  w.name,
  w.status,
  w.avatar_url,
  COALESCE(SUM(s.hours) FILTER (WHERE s.shift_date >= date_trunc('week', CURRENT_DATE)), 0) AS hours_this_week,
  COALESCE(SUM(s.total_amount), 0) - COALESCE(SUM(p.amount), 0) AS pending_payment
FROM 
  workers w
LEFT JOIN 
  shifts s ON w.id = s.worker_id
LEFT JOIN 
  payments p ON w.id = p.worker_id
GROUP BY 
  w.id, w.name, w.status, w.avatar_url;
