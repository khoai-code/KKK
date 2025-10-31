-- Create search_history table for storing user's recent searches
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_folder_id TEXT NOT NULL,
  client_name TEXT NOT NULL,
  searched_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_search UNIQUE(user_id, client_folder_id)
);

-- Create index for faster lookups and ordering by recent searches
CREATE INDEX IF NOT EXISTS idx_search_history_user_time ON search_history(user_id, searched_at DESC);

-- Enable Row Level Security
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view their own search history
CREATE POLICY "Users can view their own search history" ON search_history
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own search history
CREATE POLICY "Users can insert their own search history" ON search_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own search history (for timestamp updates)
CREATE POLICY "Users can update their own search history" ON search_history
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own search history
CREATE POLICY "Users can delete their own search history" ON search_history
  FOR DELETE USING (auth.uid() = user_id);
