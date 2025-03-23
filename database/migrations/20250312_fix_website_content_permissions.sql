-- Drop existing policies
DROP POLICY IF EXISTS "Allow users to read website content" ON website_content;
DROP POLICY IF EXISTS "Allow public to read website content" ON website_content;
DROP POLICY IF EXISTS "Allow users to modify website content" ON website_content;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON website_content TO anon, authenticated;
GRANT ALL ON website_content TO authenticated;

-- Re-create RLS policies with proper permissions
ALTER TABLE website_content ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read website content
CREATE POLICY "Allow users to read website content"
  ON website_content
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow public access to website content
CREATE POLICY "Allow public to read website content"
  ON website_content
  FOR SELECT
  TO anon
  USING (true);

-- Allow authenticated users to modify website content
CREATE POLICY "Allow users to modify website content"
  ON website_content
  FOR ALL
  TO authenticated
  USING (true);

-- Ensure the search function has proper permissions
GRANT EXECUTE ON FUNCTION search_website_content(TEXT) TO authenticated, anon;