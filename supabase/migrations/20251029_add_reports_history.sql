-- Create reports_history table
CREATE TABLE IF NOT EXISTS public.reports_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_name TEXT NOT NULL,
  folder_id TEXT NOT NULL,
  report_type TEXT NOT NULL, -- 'full', 'summary', etc.
  report_content TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  file_name TEXT,
  CONSTRAINT valid_report_type CHECK (report_type IN ('full', 'summary', 'custom'))
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_reports_history_user_id ON public.reports_history(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_history_folder_id ON public.reports_history(folder_id);
CREATE INDEX IF NOT EXISTS idx_reports_history_generated_at ON public.reports_history(generated_at DESC);

-- Enable Row Level Security
ALTER TABLE public.reports_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own reports
CREATE POLICY "Users can view their own reports"
  ON public.reports_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own reports
CREATE POLICY "Users can insert their own reports"
  ON public.reports_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reports
CREATE POLICY "Users can delete their own reports"
  ON public.reports_history
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create a function to clean up old reports (older than 90 days)
CREATE OR REPLACE FUNCTION delete_old_reports()
RETURNS void AS $$
BEGIN
  DELETE FROM public.reports_history
  WHERE generated_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment on table
COMMENT ON TABLE public.reports_history IS 'Stores history of AI-generated reports for users';
