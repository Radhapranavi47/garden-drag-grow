-- Create shared garden items table
CREATE TABLE IF NOT EXISTS public.garden_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  x DOUBLE PRECISION NOT NULL,
  y DOUBLE PRECISION NOT NULL,
  scale DOUBLE PRECISION NOT NULL DEFAULT 1,
  angle DOUBLE PRECISION NOT NULL DEFAULT 0,
  created_by_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.garden_items ENABLE ROW LEVEL SECURITY;

-- Policies: public read/insert/delete (no auth required)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'garden_items' AND policyname = 'Public can read garden items'
  ) THEN
    CREATE POLICY "Public can read garden items"
    ON public.garden_items
    FOR SELECT
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'garden_items' AND policyname = 'Public can insert garden items'
  ) THEN
    CREATE POLICY "Public can insert garden items"
    ON public.garden_items
    FOR INSERT
    WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'garden_items' AND policyname = 'Public can delete garden items'
  ) THEN
    CREATE POLICY "Public can delete garden items"
    ON public.garden_items
    FOR DELETE
    USING (true);
  END IF;
END$$;

-- Realtime configuration
ALTER TABLE public.garden_items REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.garden_items;