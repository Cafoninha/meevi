-- Create owners table
CREATE TABLE IF NOT EXISTS public.owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create dogs table
CREATE TABLE IF NOT EXISTS public.dogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  breed TEXT DEFAULT 'Spitz Alemão',
  owner_id UUID NOT NULL REFERENCES public.owners(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dogs ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since we don't have authentication yet)
-- Allow all operations for now
CREATE POLICY "Allow public read access on owners" ON public.owners FOR SELECT USING (true);
CREATE POLICY "Allow public insert on owners" ON public.owners FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on owners" ON public.owners FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on owners" ON public.owners FOR DELETE USING (true);

CREATE POLICY "Allow public read access on dogs" ON public.dogs FOR SELECT USING (true);
CREATE POLICY "Allow public insert on dogs" ON public.dogs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on dogs" ON public.dogs FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on dogs" ON public.dogs FOR DELETE USING (true);
