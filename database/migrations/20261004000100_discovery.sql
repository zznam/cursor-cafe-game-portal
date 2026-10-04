-- Additive catalog discovery fields. Seed metadata after applying this migration.
ALTER TABLE public.games ADD COLUMN mood text CHECK (mood IN ('Relaxed', 'Focused', 'Energetic'));
ALTER TABLE public.games ADD COLUMN session_minutes integer CHECK (session_minutes BETWEEN 1 AND 120);
ALTER TABLE public.games ADD COLUMN touch boolean NOT NULL DEFAULT false;
CREATE INDEX idx_games_discovery ON public.games(mood, session_minutes, touch);
