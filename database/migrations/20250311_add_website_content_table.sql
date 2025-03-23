-- Migration to add website_content table for AI chatbot knowledge base

-- Create the website_content table
CREATE TABLE IF NOT EXISTS public.website_content (
  id TEXT PRIMARY KEY,
  path TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  type TEXT NOT NULL CHECK (type IN ('page', 'feature', 'faq', 'pricing', 'other')),
  metadata JSONB
);

-- Add indexes for faster searching
CREATE INDEX IF NOT EXISTS website_content_path_idx ON public.website_content (path);
CREATE INDEX IF NOT EXISTS website_content_type_idx ON public.website_content (type);

-- Set up RLS (Row Level Security) policies
ALTER TABLE public.website_content ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read website content
CREATE POLICY "Allow users to read website content"
  ON public.website_content
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow public access to website content (if needed)
CREATE POLICY "Allow public to read website content"
  ON public.website_content
  FOR SELECT
  TO anon
  USING (true);

-- Allow authenticated users to modify website content
CREATE POLICY "Allow users to modify website content"
  ON public.website_content
  FOR ALL
  TO authenticated
  USING (true);

-- Add function to search website content
CREATE OR REPLACE FUNCTION search_website_content(search_query TEXT)
RETURNS SETOF public.website_content
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT *
  FROM public.website_content
  WHERE
    to_tsvector('english', title || ' ' || content) @@ plainto_tsquery('english', search_query)
  ORDER BY ts_rank(
    to_tsvector('english', title || ' ' || content),
    plainto_tsquery('english', search_query)
  ) DESC;
$$;