
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Anyone can view company profiles" ON company_profiles;
DROP POLICY IF EXISTS "Only dbarton@svg.agency can insert company profiles" ON company_profiles;
DROP POLICY IF EXISTS "Only dbarton@svg.agency can update company profiles" ON company_profiles;
DROP POLICY IF EXISTS "Only dbarton@svg.agency can delete company profiles" ON company_profiles;

-- Create new permissive policies that allow public access for reading
CREATE POLICY "Enable read access for all users" 
ON company_profiles FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for all users" 
ON company_profiles FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Enable update for all users" 
ON company_profiles FOR UPDATE 
USING (true);

CREATE POLICY "Enable delete for all users" 
ON company_profiles FOR DELETE 
USING (true);

-- Do the same for meeting2_master table
DROP POLICY IF EXISTS "Anyone can view meeting2 data" ON meeting2_master;
DROP POLICY IF EXISTS "Only dbarton@svg.agency can insert meeting2 data" ON meeting2_master;
DROP POLICY IF EXISTS "Only dbarton@svg.agency can update meeting2 data" ON meeting2_master;
DROP POLICY IF EXISTS "Only dbarton@svg.agency can delete meeting2 data" ON meeting2_master;

CREATE POLICY "Enable read access for all users" 
ON meeting2_master FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for all users" 
ON meeting2_master FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Enable update for all users" 
ON meeting2_master FOR UPDATE 
USING (true);

CREATE POLICY "Enable delete for all users" 
ON meeting2_master FOR DELETE 
USING (true);

-- Same for montecarlo_constants
DROP POLICY IF EXISTS "Anyone can view constants" ON montecarlo_constants;
DROP POLICY IF EXISTS "Only dbarton@svg.agency can insert constants" ON montecarlo_constants;
DROP POLICY IF EXISTS "Only dbarton@svg.agency can update constants" ON montecarlo_constants;
DROP POLICY IF EXISTS "Only dbarton@svg.agency can delete constants" ON montecarlo_constants;

CREATE POLICY "Enable read access for all users" 
ON montecarlo_constants FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for all users" 
ON montecarlo_constants FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Enable update for all users" 
ON montecarlo_constants FOR UPDATE 
USING (true);

CREATE POLICY "Enable delete for all users" 
ON montecarlo_constants FOR DELETE 
USING (true);
