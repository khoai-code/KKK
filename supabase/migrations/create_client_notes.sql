-- Create client_notes table for storing user notes per client
CREATE TABLE IF NOT EXISTS client_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_folder_id TEXT NOT NULL,
  client_name TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_client UNIQUE(user_id, client_folder_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_client_notes_user_client ON client_notes(user_id, client_folder_id);

-- Enable Row Level Security
ALTER TABLE client_notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view their own notes
CREATE POLICY "Users can view their own notes" ON client_notes
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own notes
CREATE POLICY "Users can insert their own notes" ON client_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own notes
CREATE POLICY "Users can update their own notes" ON client_notes
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own notes
CREATE POLICY "Users can delete their own notes" ON client_notes
  FOR DELETE USING (auth.uid() = user_id);
