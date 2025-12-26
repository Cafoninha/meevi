-- Create bath_records table
CREATE TABLE IF NOT EXISTS public.bath_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dog_id UUID NOT NULL REFERENCES public.dogs(id) ON DELETE CASCADE,
  bath_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.bath_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own bath records"
  ON public.bath_records
  FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own bath records"
  ON public.bath_records
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own bath records"
  ON public.bath_records
  FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own bath records"
  ON public.bath_records
  FOR DELETE
  USING (auth.uid() = owner_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_bath_records_owner_id ON public.bath_records(owner_id);
CREATE INDEX IF NOT EXISTS idx_bath_records_dog_id ON public.bath_records(dog_id);
CREATE INDEX IF NOT EXISTS idx_bath_records_bath_time ON public.bath_records(bath_time DESC);
