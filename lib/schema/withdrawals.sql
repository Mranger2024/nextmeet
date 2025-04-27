-- Create withdrawals table
CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  payment_method VARCHAR(50) NOT NULL,
  payment_details TEXT NOT NULL,
  notes TEXT,
  processor_id UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS withdrawals_user_id_idx ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS withdrawals_status_idx ON withdrawals(status);

-- Create RLS policies
-- Enable RLS on the table
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

-- Policy for users to view only their own withdrawals
CREATE POLICY user_select_own_withdrawals ON withdrawals 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy for users to insert their own withdrawals
CREATE POLICY user_insert_own_withdrawals ON withdrawals 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Policy for admins to view all withdrawals
CREATE POLICY admin_select_all_withdrawals ON withdrawals 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Policy for admins to update any withdrawal
CREATE POLICY admin_update_all_withdrawals ON withdrawals 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));