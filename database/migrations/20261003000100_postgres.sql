-- Fresh PostgreSQL database for Neon; no Supabase roles, Auth, or Storage required.
-- Games table
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  banner_url TEXT,
  category TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  developer_name TEXT NOT NULL,
  developer_url TEXT,
  package_name TEXT UNIQUE NOT NULL,
  version TEXT NOT NULL,
  play_count INTEGER NOT NULL DEFAULT 0,
  average_rating DECIMAL(3,2) NOT NULL DEFAULT 0,
  total_ratings INTEGER NOT NULL DEFAULT 0,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Ratings table
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(game_id, user_id)
);

-- Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Leaderboards table
CREATE TABLE leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  score BIGINT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Analytics table
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  user_id TEXT,
  session_id TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
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

-- Validate new data at the database boundary.
ALTER TABLE public.leaderboards ADD CONSTRAINT valid_score CHECK (score BETWEEN 0 AND 9007199254740991);
ALTER TABLE public.leaderboards ADD CONSTRAINT valid_score_name CHECK (length(trim(username)) BETWEEN 1 AND 30);
ALTER TABLE public.comments ADD CONSTRAINT valid_comment CHECK (length(trim(content)) BETWEEN 1 AND 2000 AND length(trim(username)) BETWEEN 1 AND 30);
ALTER TABLE public.ratings ADD CONSTRAINT valid_review CHECK (review IS NULL OR length(review) <= 2000);
ALTER TABLE public.analytics ADD CONSTRAINT valid_event CHECK (event_type IN ('play', 'complete', 'quit', 'score_submit') AND length(session_id) BETWEEN 1 AND 100);
CREATE INDEX IF NOT EXISTS idx_games_catalog ON public.games (play_count DESC, id);
CREATE INDEX IF NOT EXISTS idx_games_category_catalog ON public.games (category, play_count DESC, id);
CREATE INDEX IF NOT EXISTS idx_comments_recent ON public.comments (game_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON public.analytics (created_at);

-- Incremental rating totals avoid both full-table aggregation and lost updates
-- when players in different regions rate the same game concurrently.
ALTER TABLE public.games ADD COLUMN rating_sum bigint NOT NULL DEFAULT 0;
UPDATE public.games g SET rating_sum = COALESCE((SELECT sum(r.rating) FROM public.ratings r WHERE r.game_id = g.id), 0),
  total_ratings = (SELECT count(*) FROM public.ratings r WHERE r.game_id = g.id),
  average_rating = COALESCE((SELECT avg(r.rating) FROM public.ratings r WHERE r.game_id = g.id), 0);
CREATE OR REPLACE FUNCTION public.update_game_rating()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE delta_sum bigint; delta_count integer; target uuid;
BEGIN
  IF TG_OP = 'INSERT' THEN delta_sum := NEW.rating; delta_count := 1; target := NEW.game_id;
  ELSIF TG_OP = 'DELETE' THEN delta_sum := -OLD.rating; delta_count := -1; target := OLD.game_id;
  ELSE
    IF NEW.game_id <> OLD.game_id THEN RAISE EXCEPTION 'Rating game cannot change'; END IF;
    delta_sum := NEW.rating - OLD.rating; delta_count := 0; target := NEW.game_id;
  END IF;
  UPDATE public.games SET rating_sum = rating_sum + delta_sum,
    total_ratings = total_ratings + delta_count,
    average_rating = CASE WHEN total_ratings + delta_count = 0 THEN 0
      ELSE (rating_sum + delta_sum)::numeric / (total_ratings + delta_count) END,
    updated_at = now() WHERE id = target;
  RETURN COALESCE(NEW, OLD);
END $$;

CREATE OR REPLACE FUNCTION public.track_game_play()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF NEW.event_type = 'play' THEN
    UPDATE public.games SET play_count = play_count + 1, updated_at = now() WHERE id = NEW.game_id;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER analytics_play_count AFTER INSERT ON public.analytics FOR EACH ROW EXECUTE FUNCTION public.track_game_play();

CREATE TABLE public.request_limits (
  key text PRIMARY KEY,
  window_start timestamptz NOT NULL,
  requests integer NOT NULL
);
CREATE INDEX request_limits_expiry ON public.request_limits(window_start);
CREATE OR REPLACE FUNCTION public.consume_rate_limit(bucket_key text, max_requests integer)
RETURNS boolean LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE hits integer; current_window timestamptz := date_trunc('minute', now());
BEGIN
  IF length(bucket_key) > 100 OR max_requests < 1 OR max_requests > 1000 THEN RAISE EXCEPTION 'Invalid rate limit'; END IF;
  -- Bound cleanup work per request; expired windows never accumulate indefinitely.
  DELETE FROM public.request_limits WHERE key IN
    (SELECT key FROM public.request_limits WHERE window_start < current_window - interval '2 minutes' LIMIT 100);
  INSERT INTO public.request_limits AS limits (key, window_start, requests) VALUES (bucket_key, current_window, 1)
  ON CONFLICT (key) DO UPDATE SET window_start = current_window,
    requests = CASE WHEN limits.window_start = current_window THEN limits.requests + 1 ELSE 1 END
  RETURNING requests INTO hits;
  RETURN hits <= max_requests;
END $$;

-- Readiness verifies that the service key works and the hardened schema is installed.
CREATE OR REPLACE FUNCTION public.production_ready()
RETURNS boolean LANGUAGE sql STABLE SET search_path = '' AS $$
  SELECT EXISTS (SELECT 1 FROM pg_catalog.pg_trigger
    WHERE tgrelid = 'public.ratings'::regclass AND tgname = 'trigger_update_game_rating' AND tgenabled = 'O')
    AND EXISTS (SELECT 1 FROM pg_catalog.pg_trigger
    WHERE tgrelid = 'public.analytics'::regclass AND tgname = 'analytics_play_count' AND tgenabled = 'O')
    AND pg_catalog.to_regprocedure('public.consume_rate_limit(text,integer)') IS NOT NULL
    AND pg_catalog.has_table_privilege(current_user, 'public.games', 'SELECT')
    AND pg_catalog.has_table_privilege(current_user, 'public.ratings', 'INSERT,UPDATE,SELECT')
    AND pg_catalog.has_table_privilege(current_user, 'public.comments', 'INSERT,SELECT')
    AND pg_catalog.has_table_privilege(current_user, 'public.leaderboards', 'INSERT,SELECT')
    AND pg_catalog.has_table_privilege(current_user, 'public.analytics', 'INSERT');
$$;

CREATE TRIGGER trigger_update_game_rating
AFTER INSERT OR UPDATE OR DELETE ON public.ratings
FOR EACH ROW EXECUTE FUNCTION public.update_game_rating();
-- Function bodies use the caller's privileges; only trusted server credentials
-- connect to PostgreSQL. Browser users never receive database credentials.
REVOKE ALL ON FUNCTION public.consume_rate_limit(text, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.production_ready() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_game_rating() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.track_game_play() FROM PUBLIC;
