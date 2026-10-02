-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Games table
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  banner_url TEXT,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  developer_name TEXT NOT NULL,
  developer_url TEXT,
  package_name TEXT UNIQUE NOT NULL,
  version TEXT NOT NULL,
  play_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ratings table
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(game_id, user_id)
);

-- Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leaderboards table
CREATE TABLE leaderboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  score BIGINT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics table
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  user_id TEXT,
  session_id TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_games_slug ON games(slug);
CREATE INDEX idx_games_category ON games(category);
CREATE INDEX idx_games_featured ON games(featured);
CREATE INDEX idx_games_play_count ON games(play_count DESC);
CREATE INDEX idx_games_average_rating ON games(average_rating DESC);
CREATE INDEX idx_ratings_game_id ON ratings(game_id);
CREATE INDEX idx_comments_game_id ON comments(game_id);
CREATE INDEX idx_leaderboards_game_id ON leaderboards(game_id);
CREATE INDEX idx_leaderboards_score ON leaderboards(game_id, score DESC);
CREATE INDEX idx_analytics_game_id ON analytics(game_id);
CREATE INDEX idx_analytics_event_type ON analytics(event_type);

-- Function to update average rating
CREATE OR REPLACE FUNCTION update_game_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE games
  SET 
    average_rating = (SELECT AVG(rating) FROM ratings WHERE game_id = NEW.game_id),
    total_ratings = (SELECT COUNT(*) FROM ratings WHERE game_id = NEW.game_id),
    updated_at = NOW()
  WHERE id = NEW.game_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for rating updates
CREATE TRIGGER trigger_update_game_rating
AFTER INSERT OR UPDATE OR DELETE ON ratings
FOR EACH ROW
EXECUTE FUNCTION update_game_rating();

-- Function to increment play count
CREATE OR REPLACE FUNCTION increment_play_count(game_slug TEXT)
RETURNS void AS $$
BEGIN
  UPDATE games
  SET play_count = play_count + 1,
      updated_at = NOW()
  WHERE slug = game_slug;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (RLS)
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Policies for public read access
CREATE POLICY "Games are viewable by everyone" ON games FOR SELECT USING (true);
CREATE POLICY "Ratings are viewable by everyone" ON ratings FOR SELECT USING (true);
CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Leaderboards are viewable by everyone" ON leaderboards FOR SELECT USING (true);

-- Policies for anonymous writes (since no auth initially)
CREATE POLICY "Anyone can insert ratings" ON ratings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update their ratings" ON ratings FOR UPDATE USING (true);
CREATE POLICY "Anyone can insert comments" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert leaderboard scores" ON leaderboards FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert analytics" ON analytics FOR INSERT WITH CHECK (true);

-- Set up Storage for game assets and avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('game-assets', 'game-assets', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;

-- Storage Policies for game-assets (Public Read)
CREATE POLICY "Public Read for Game Assets" ON storage.objects FOR SELECT USING (bucket_id = 'game-assets');

-- Storage Policies for game-assets (Authenticated Uploads - admin only in real world, auth for now)
CREATE POLICY "Authenticated users can upload game assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'game-assets' AND auth.role() = 'authenticated');

-- Storage Policies for avatars (Public Read)
CREATE POLICY "Public Read for Avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

-- Storage Policies for avatars (User can upload own avatar)
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid() = owner);
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid() = owner);

