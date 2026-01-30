-- Create meeting_1_verification table
CREATE TABLE public.meeting_1_verification (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id text NOT NULL UNIQUE,
  renewal_verification jsonb,
  compliance_info jsonb,
  business_issues jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.meeting_1_verification ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (authenticated users can access)
CREATE POLICY "Authenticated users can view meeting data"
  ON public.meeting_1_verification
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert meeting data"
  ON public.meeting_1_verification
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update meeting data"
  ON public.meeting_1_verification
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete meeting data"
  ON public.meeting_1_verification
  FOR DELETE
  TO authenticated
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_meeting_1_verification_updated_at
  BEFORE UPDATE ON public.meeting_1_verification
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for sales outputs
INSERT INTO storage.buckets (id, name, public)
VALUES ('sales_outputs', 'sales_outputs', false);

-- Create storage policies for sales_outputs bucket
CREATE POLICY "Authenticated users can view sales outputs"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'sales_outputs');

CREATE POLICY "Authenticated users can upload sales outputs"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'sales_outputs');

CREATE POLICY "Authenticated users can update sales outputs"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'sales_outputs');

CREATE POLICY "Authenticated users can delete sales outputs"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'sales_outputs');