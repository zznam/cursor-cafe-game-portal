-- All public mutations now pass through the server, which holds the service role.
-- Existing guest IDs remain readable; new writes use signed, server-issued UUIDs.
DROP POLICY IF EXISTS "Anyone can insert ratings" ON public.ratings;
DROP POLICY IF EXISTS "Anyone can update their ratings" ON public.ratings;
DROP POLICY IF EXISTS "Anyone can insert comments" ON public.comments;
DROP POLICY IF EXISTS "Anyone can insert leaderboard scores" ON public.leaderboards;
DROP POLICY IF EXISTS "Anyone can insert analytics" ON public.analytics;
DROP POLICY IF EXISTS "Authenticated users can upload game assets" ON storage.objects;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.games, public.ratings, public.comments, public.leaderboards, public.analytics FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.increment_play_count(text) FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.games, public.ratings, public.comments, public.leaderboards TO anon, authenticated;
GRANT ALL ON public.games, public.ratings, public.comments, public.leaderboards, public.analytics TO service_role;

-- NOT VALID preserves legacy rows while enforcing constraints on every new write.
ALTER TABLE public.leaderboards ADD CONSTRAINT valid_score CHECK (score BETWEEN 0 AND 9007199254740991) NOT VALID;
ALTER TABLE public.leaderboards ADD CONSTRAINT valid_score_name CHECK (length(trim(username)) BETWEEN 1 AND 30) NOT VALID;
ALTER TABLE public.comments ADD CONSTRAINT valid_comment CHECK (length(trim(content)) BETWEEN 1 AND 2000 AND length(trim(username)) BETWEEN 1 AND 30) NOT VALID;
ALTER TABLE public.ratings ADD CONSTRAINT valid_review CHECK (review IS NULL OR length(review) <= 2000) NOT VALID;
ALTER TABLE public.analytics ADD CONSTRAINT valid_event CHECK (event_type IN ('play', 'complete', 'quit', 'score_submit') AND length(session_id) BETWEEN 1 AND 100) NOT VALID;
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
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
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
REVOKE ALL ON FUNCTION public.update_game_rating() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.track_game_play()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF NEW.event_type = 'play' THEN
    UPDATE public.games SET play_count = play_count + 1, updated_at = now() WHERE id = NEW.game_id;
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.track_game_play() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER analytics_play_count AFTER INSERT ON public.analytics FOR EACH ROW EXECUTE FUNCTION public.track_game_play();

CREATE TABLE public.request_limits (
  key text PRIMARY KEY,
  window_start timestamptz NOT NULL,
  requests integer NOT NULL
);
CREATE INDEX request_limits_expiry ON public.request_limits(window_start);
ALTER TABLE public.request_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.request_limits FROM anon, authenticated;
CREATE OR REPLACE FUNCTION public.consume_rate_limit(bucket_key text, max_requests integer)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
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
REVOKE ALL ON FUNCTION public.consume_rate_limit(text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(text, integer) TO service_role;

-- Readiness verifies that the service key works and the hardened schema is installed.
CREATE OR REPLACE FUNCTION public.production_ready()
RETURNS boolean LANGUAGE sql STABLE SET search_path = '' AS 'SELECT true';
REVOKE ALL ON FUNCTION public.production_ready() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.production_ready() TO service_role;
