-- Create feeding_records table
CREATE TABLE IF NOT EXISTS feeding_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  food_brand TEXT NOT NULL,
  meal_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  portion_size TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE feeding_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own feeding records"
  ON feeding_records FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Users can insert their own feeding records"
  ON feeding_records FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own feeding records"
  ON feeding_records FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Users can delete their own feeding records"
  ON feeding_records FOR DELETE
  USING (owner_id = auth.uid());

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS feeding_records_owner_id_idx ON feeding_records(owner_id);
CREATE INDEX IF NOT EXISTS feeding_records_dog_id_idx ON feeding_records(dog_id);
CREATE INDEX IF NOT EXISTS feeding_records_meal_time_idx ON feeding_records(meal_time DESC);

COMMENT ON TABLE feeding_records IS 'Records of dog feeding times and food brands';
