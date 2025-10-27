ALTER TABLE teams ADD COLUMN logo TEXT;

CREATE TABLE IF NOT EXISTS social_links (
  id SERIAL PRIMARY KEY,
  platform VARCHAR(50) NOT NULL,
  url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO social_links (platform, url) VALUES 
  ('telegram', ''),
  ('discord', ''),
  ('twitch', ''),
  ('tiktok', '')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS champions (
  id SERIAL PRIMARY KEY,
  year VARCHAR(20) NOT NULL,
  team_name VARCHAR(255) NOT NULL,
  logo TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE matches ADD COLUMN home_team_logo TEXT;
ALTER TABLE matches ADD COLUMN away_team_logo TEXT;