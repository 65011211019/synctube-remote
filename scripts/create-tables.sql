-- Create rooms table for SyncTube Remote
CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  host_id TEXT NOT NULL,
  current_song JSONB,
  is_playing BOOLEAN DEFAULT FALSE,
  current_time INTEGER DEFAULT 0,
  queue JSONB DEFAULT '[]'::jsonb,
  participants INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create participants table to track users in rooms
CREATE TABLE IF NOT EXISTS participants (
  id SERIAL PRIMARY KEY,
  room_id TEXT REFERENCES rooms(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Create votes table for skip voting feature
CREATE TABLE IF NOT EXISTS votes (
  id SERIAL PRIMARY KEY,
  room_id TEXT REFERENCES rooms(id) ON DELETE CASCADE,
  song_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  vote_type TEXT CHECK (vote_type IN ('skip', 'like')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, song_id, user_name, vote_type)
);

-- Enable Row Level Security
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a demo app)
CREATE POLICY "Allow all operations on rooms" ON rooms FOR ALL USING (true);
CREATE POLICY "Allow all operations on participants" ON participants FOR ALL USING (true);
CREATE POLICY "Allow all operations on votes" ON votes FOR ALL USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_rooms_updated_at 
    BEFORE UPDATE ON rooms 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
