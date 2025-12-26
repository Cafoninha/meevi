-- Create exercise_records table
CREATE TABLE IF NOT EXISTS public.exercise_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dog_id UUID NOT NULL REFERENCES public.dogs(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL,
  exercise_type TEXT NOT NULL,
  duration TEXT NOT NULL,
  notes TEXT,
  exercise_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_exercise_records_dog_id ON public.exercise_records(dog_id);
CREATE INDEX IF NOT EXISTS idx_exercise_records_owner_id ON public.exercise_records(owner_id);
CREATE INDEX IF NOT EXISTS idx_exercise_records_exercise_time ON public.exercise_records(exercise_time DESC);

-- Enable Row Level Security
ALTER TABLE public.exercise_records ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own exercise records" ON public.exercise_records;
DROP POLICY IF EXISTS "Users can insert their own exercise records" ON public.exercise_records;
DROP POLICY IF EXISTS "Users can update their own exercise records" ON public.exercise_records;
DROP POLICY IF EXISTS "Users can delete their own exercise records" ON public.exercise_records;

-- Create RLS policies
CREATE POLICY "Users can view their own exercise records"
  ON public.exercise_records FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own exercise records"
  ON public.exercise_records FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own exercise records"
  ON public.exercise_records FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own exercise records"
  ON public.exercise_records FOR DELETE
  USING (auth.uid() = owner_id);
