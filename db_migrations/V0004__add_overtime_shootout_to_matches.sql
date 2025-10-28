-- Add overtime and shootout columns to matches table
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS overtime BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS shootout BOOLEAN DEFAULT false;