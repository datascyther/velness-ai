-- =============================================================================
-- Velness — Development Seed Data
-- =============================================================================
-- Loads sample programs, lessons, and exercises so the app has content to
-- display during development and testing.
--
-- WARNING: This seed is loaded via `supabase db reset`. It does NOT touch
-- user-owned tables (profiles, journeys, progress, etc.).
-- =============================================================================

-- Sample exercises -----------------------------------------------------------
insert into public.exercises (id, lesson_id, title, description, type, duration, position, content) values
  ('e0000000-0000-0000-0000-000000000001', null, 'Deep Breathing', 'A calming deep breathing exercise to reduce anxiety.', 'breathing', 300, 0, '{"pattern": "box", "inhale": 4, "hold": 4, "exhale": 4, "cycles": 10}'),
  ('e0000000-0000-0000-0000-000000000002', null, 'Morning Gratitude', 'Write down three things you are grateful for today.', 'journal', 600, 1, '{"prompts": ["What made you smile today?", "Who are you grateful for?", "What went well?"]}'),
  ('e0000000-0000-0000-0000-000000000003', null, 'Body Scan Meditation', 'A guided body scan to release tension.', 'guided', 900, 2, '{"audio_url": null, "steps": ["Settle in", "Scan feet", "Scan legs", "Scan torso", "Scan arms", "Scan face", "Whole body awareness"]}'),
  ('e0000000-0000-0000-0000-000000000004', null, 'Focus Game', 'An ADHD-friendly focus exercise.', 'adhd_game', 480, 3, '{"type": "color_match", "difficulty": "easy", "rounds": 10}')
on conflict (id) do nothing;
