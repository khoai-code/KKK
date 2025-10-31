-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}')
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create search history table
CREATE TABLE IF NOT EXISTS public.search_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_name TEXT NOT NULL,
  folder_id TEXT NOT NULL,
  searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_search UNIQUE(user_id, folder_id)
);

CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON public.search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_searched_at ON public.search_history(searched_at DESC);

-- Create cached client data table
CREATE TABLE IF NOT EXISTS public.cached_client_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  folder_id TEXT UNIQUE NOT NULL,
  client_name TEXT NOT NULL,
  table_1_data JSONB,
  table_2_data JSONB,
  table_3_data JSONB,
  table_4_data JSONB,
  ai_summary TEXT,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

CREATE INDEX IF NOT EXISTS idx_cached_client_folder_id ON public.cached_client_data(folder_id);
CREATE INDEX IF NOT EXISTS idx_cached_client_expires_at ON public.cached_client_data(expires_at);

-- Function to automatically delete expired cache
CREATE OR REPLACE FUNCTION delete_expired_cache()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.cached_client_data WHERE expires_at < NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic cache cleanup
DROP TRIGGER IF EXISTS trigger_delete_expired_cache ON public.cached_client_data;
CREATE TRIGGER trigger_delete_expired_cache
  AFTER INSERT ON public.cached_client_data
  EXECUTE FUNCTION delete_expired_cache();
