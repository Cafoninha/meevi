-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  dog_id UUID,
  type TEXT NOT NULL, -- 'vaccine', 'feeding', 'bath', 'exercise', 'event', 'birthday'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  scheduled_for TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT fk_owner
    FOREIGN KEY (owner_id)
    REFERENCES public.owners (id)
    ON DELETE CASCADE,
    
  CONSTRAINT fk_dog
    FOREIGN KEY (dog_id)
    REFERENCES public.dogs (id)
    ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_owner_id ON public.notifications (owner_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications (is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications (created_at DESC);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own notifications"
  ON public.notifications
  FOR DELETE
  USING (auth.uid() = owner_id);
