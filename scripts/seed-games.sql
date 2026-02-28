-- Seed script for sample games
-- Run this after creating the database schema

-- Insert Breakout game
INSERT INTO games (
  slug,
  title,
  description,
  thumbnail_url,
  category,
  tags,
  developer_name,
  package_name,
  version,
  featured
) VALUES (
  'breakout',
  'Breakout Classic',
  'Classic brick-breaking arcade game. Use arrow keys to move the paddle and break all the bricks! Features 5 rows of colorful bricks and addictive gameplay.',
  '/games/breakout/thumbnail.png',
  'Arcade',
  ARRAY['classic', 'arcade', 'retro', 'brick-breaker'],
  'Game Portal Team',
  'breakout',
  '1.0.0',
  true
) ON CONFLICT (slug) DO NOTHING;

-- Insert Space Shooter game
INSERT INTO games (
  slug,
  title,
  description,
  thumbnail_url,
  category,
  tags,
  developer_name,
  package_name,
  version,
  featured
) VALUES (
  'space-shooter',
  'Space Shooter',
  'Defend Earth from alien invaders! Use arrow keys to move and spacebar to shoot. Fast-paced action with endless waves of enemies.',
  '/games/space-shooter/thumbnail.png',
  'Shooter',
  ARRAY['space', 'action', 'arcade', 'shooter'],
  'Game Portal Team',
  'space-shooter',
  '1.0.0',
  true
) ON CONFLICT (slug) DO NOTHING;

-- Insert Snake game
INSERT INTO games (
  slug, title, description, thumbnail_url, category, tags, developer_name, package_name, version, featured
) VALUES (
  'snake',
  'Neon Snake',
  'Classic snake game with a neon twist. Eat food, grow longer, don''t crash! Speed increases as you grow.',
  '/games/snake/thumbnail.png',
  'Arcade',
  ARRAY['classic', 'arcade', 'retro', 'snake'],
  'Game Portal Team',
  'snake',
  '1.0.0',
  true
) ON CONFLICT (slug) DO NOTHING;

-- Insert Flappy Bird game
INSERT INTO games (
  slug, title, description, thumbnail_url, category, tags, developer_name, package_name, version, featured
) VALUES (
  'flappy-bird',
  'Neon Flap',
  'Flap through neon pipes! Tap or press space to fly. How far can you go? The gap shrinks as you score higher.',
  '/games/flappy-bird/thumbnail.png',
  'Casual',
  ARRAY['flappy', 'casual', 'one-button', 'endless'],
  'Game Portal Team',
  'flappy-bird',
  '1.0.0',
  true
) ON CONFLICT (slug) DO NOTHING;

-- Insert 2048 game
INSERT INTO games (
  slug, title, description, thumbnail_url, category, tags, developer_name, package_name, version, featured
) VALUES (
  '2048',
  '2048',
  'Slide and merge tiles to reach 2048! Use arrow keys to combine matching numbers. A brain-teasing puzzle classic.',
  '/games/2048/thumbnail.png',
  'Puzzle',
  ARRAY['puzzle', 'numbers', 'strategy', 'brain'],
  'Game Portal Team',
  '2048',
  '1.0.0',
  true
) ON CONFLICT (slug) DO NOTHING;

-- Insert Memory Match game
INSERT INTO games (
  slug, title, description, thumbnail_url, category, tags, developer_name, package_name, version, featured
) VALUES (
  'memory-match',
  'Memory Match',
  'Test your memory! Flip cards to find matching pairs. Fewer moves and faster time means a higher score.',
  '/games/memory-match/thumbnail.png',
  'Puzzle',
  ARRAY['memory', 'puzzle', 'cards', 'brain'],
  'Game Portal Team',
  'memory-match',
  '1.0.0',
  true
) ON CONFLICT (slug) DO NOTHING;

-- Insert Infinite Runner game
INSERT INTO games (
  slug, title, description, thumbnail_url, category, tags, developer_name, package_name, version, featured
) VALUES (
  'infinite-runner',
  'Neon Run',
  'Run, jump, and dodge through a neon city! Collect coins and survive as long as you can. Double jump to avoid obstacles!',
  '/games/infinite-runner/thumbnail.png',
  'Platformer',
  ARRAY['runner', 'platformer', 'endless', 'action'],
  'Game Portal Team',
  'infinite-runner',
  '1.0.0',
  true
) ON CONFLICT (slug) DO NOTHING;

-- Add some sample ratings for Breakout
INSERT INTO ratings (game_id, user_id, rating, review)
SELECT 
  g.id,
  'sample-user-1',
  5,
  'Amazing game! Brings back so many memories.'
FROM games g WHERE g.slug = 'breakout'
ON CONFLICT (game_id, user_id) DO NOTHING;

INSERT INTO ratings (game_id, user_id, rating, review)
SELECT 
  g.id,
  'sample-user-2',
  4,
  'Great classic gameplay, very addictive!'
FROM games g WHERE g.slug = 'breakout'
ON CONFLICT (game_id, user_id) DO NOTHING;

-- Add some sample ratings for Space Shooter
INSERT INTO ratings (game_id, user_id, rating, review)
SELECT 
  g.id,
  'sample-user-3',
  5,
  'Best space shooter I''ve played in a browser!'
FROM games g WHERE g.slug = 'space-shooter'
ON CONFLICT (game_id, user_id) DO NOTHING;

-- Add sample leaderboard entries for Breakout
INSERT INTO leaderboards (game_id, user_id, username, score)
SELECT 
  g.id,
  'sample-user-1',
  'ProGamer',
  15000
FROM games g WHERE g.slug = 'breakout';

INSERT INTO leaderboards (game_id, user_id, username, score)
SELECT 
  g.id,
  'sample-user-2',
  'BrickMaster',
  12500
FROM games g WHERE g.slug = 'breakout';

INSERT INTO leaderboards (game_id, user_id, username, score)
SELECT 
  g.id,
  'sample-user-3',
  'PaddlePro',
  10000
FROM games g WHERE g.slug = 'breakout';

-- Add sample leaderboard entries for Space Shooter
INSERT INTO leaderboards (game_id, user_id, username, score)
SELECT 
  g.id,
  'sample-user-4',
  'SpaceAce',
  25000
FROM games g WHERE g.slug = 'space-shooter';

INSERT INTO leaderboards (game_id, user_id, username, score)
SELECT 
  g.id,
  'sample-user-5',
  'AlienHunter',
  20000
FROM games g WHERE g.slug = 'space-shooter';

INSERT INTO leaderboards (game_id, user_id, username, score)
SELECT 
  g.id,
  'sample-user-6',
  'StarWarrior',
  18500
FROM games g WHERE g.slug = 'space-shooter';

-- Add sample comments
INSERT INTO comments (game_id, user_id, username, content)
SELECT 
  g.id,
  'sample-user-1',
  'ProGamer',
  'This game is so much fun! Can''t stop playing it.'
FROM games g WHERE g.slug = 'breakout';

INSERT INTO comments (game_id, user_id, username, content)
SELECT 
  g.id,
  'sample-user-2',
  'RetroFan',
  'Love the classic arcade feel. More games like this please!'
FROM games g WHERE g.slug = 'breakout';

INSERT INTO comments (game_id, user_id, username, content)
SELECT 
  g.id,
  'sample-user-3',
  'SpaceAce',
  'The difficulty ramps up nicely. Great challenge!'
FROM games g WHERE g.slug = 'space-shooter';

-- Verify the data
SELECT 
  g.title,
  g.play_count,
  g.average_rating,
  g.total_ratings,
  COUNT(DISTINCT l.id) as leaderboard_entries,
  COUNT(DISTINCT c.id) as comments
FROM games g
LEFT JOIN leaderboards l ON g.id = l.game_id
LEFT JOIN comments c ON g.id = c.game_id
GROUP BY g.id, g.title, g.play_count, g.average_rating, g.total_ratings;
