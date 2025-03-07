-- Create a default user for the application
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'kirankumarsn.n@gmail.com',
  crypt('FarmTracker2024', gen_salt('bf')),
  now(),
  now(),
  now()
)
ON CONFLICT (email) DO NOTHING;
