INSERT INTO settings (key, value) VALUES ('league_info', '') ON CONFLICT (key) DO NOTHING;
