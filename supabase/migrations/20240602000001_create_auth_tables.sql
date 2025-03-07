-- Create a trigger function to sync auth.users to public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a users table to store user information
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable row level security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view their own user data" ON public.users;
CREATE POLICY "Users can view their own user data"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own user data" ON public.users;
CREATE POLICY "Users can update their own user data"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- Create a function to check if a user is authorized
CREATE OR REPLACE FUNCTION public.is_authorized_user(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN user_email = 'kirankumarsn.n@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
