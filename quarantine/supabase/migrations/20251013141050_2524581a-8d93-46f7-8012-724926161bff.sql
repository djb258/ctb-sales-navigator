-- Create meeting_records table
CREATE TABLE public.meeting_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id text NOT NULL,
  meeting_number integer NOT NULL,
  section text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create company_profiles table
CREATE TABLE public.company_profiles (
  company_id text PRIMARY KEY,
  company_name text,
  contact_name text,
  contact_email text,
  funding_type text,
  total_employees integer,
  total_enrolled integer,
  effective_date date,
  renewal_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.meeting_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for meeting_records (dbarton@svg.agency has full access, others can read)
CREATE POLICY "Anyone can view meeting records"
  ON public.meeting_records
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only dbarton@svg.agency can insert meeting records"
  ON public.meeting_records
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' = 'dbarton@svg.agency');

CREATE POLICY "Only dbarton@svg.agency can update meeting records"
  ON public.meeting_records
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'dbarton@svg.agency');

CREATE POLICY "Only dbarton@svg.agency can delete meeting records"
  ON public.meeting_records
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'dbarton@svg.agency');

-- RLS policies for company_profiles (dbarton@svg.agency has full access, others can read)
CREATE POLICY "Anyone can view company profiles"
  ON public.company_profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only dbarton@svg.agency can insert company profiles"
  ON public.company_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' = 'dbarton@svg.agency');

CREATE POLICY "Only dbarton@svg.agency can update company profiles"
  ON public.company_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'dbarton@svg.agency');

CREATE POLICY "Only dbarton@svg.agency can delete company profiles"
  ON public.company_profiles
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'dbarton@svg.agency');

-- Create trigger for meeting_records updated_at
CREATE TRIGGER update_meeting_records_updated_at
  BEFORE UPDATE ON public.meeting_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();