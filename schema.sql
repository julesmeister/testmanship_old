/** 
* USERS
* Note: This table contains user data. Users should only be able to view and update their own data.
*/
-- Drop existing tables and triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.users CASCADE;

-- Recreate users table with correct schema
CREATE TABLE public.users (
    id uuid NOT NULL PRIMARY KEY,
    full_name text DEFAULT '',
    avatar_url text DEFAULT '',
    credits bigint DEFAULT 0,
    trial_credits bigint DEFAULT 3,
    billing_address jsonb DEFAULT NULL,
    payment_method jsonb DEFAULT NULL,
    target_language_id uuid REFERENCES supported_languages DEFAULT NULL,
    native_language_id uuid REFERENCES supported_languages DEFAULT NULL,
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Can view own user data." ON users;
DROP POLICY IF EXISTS "Can update own user data." ON users;
DROP POLICY IF EXISTS "Can insert own user data." ON users;

-- Create new policies with service role bypass
CREATE POLICY "Can view own user data." 
    ON users FOR SELECT 
    USING (auth.uid() = id OR auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Can update own user data." 
    ON users FOR UPDATE 
    USING (auth.uid() = id OR auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Can insert own user data." 
    ON users FOR INSERT 
    WITH CHECK (auth.uid() = id OR auth.jwt()->>'role' = 'service_role');

-- Create trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.users (id)
    VALUES (new.id)
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$;

-- Create trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE users ADD COLUMN updated_at timestamptz DEFAULT now();
    END IF;
END $$;

-- Create enum for difficulty levels
create type difficulty_level as enum ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');

-- Challenge formats table
create table challenge_formats (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  difficulty_level difficulty_level not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table challenge_formats enable row level security;
create policy "Challenge formats are viewable by everyone." 
  on challenge_formats for select 
  using (true);

-- Challenges table
create table challenges (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  instructions text not null,
  difficulty_level difficulty_level not null,
  format_id uuid references challenge_formats not null,
  created_by uuid references auth.users not null,
  time_allocation integer not null default 30,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  word_count INTEGER,
  grammar_focus TEXT[],
  vocabulary_themes TEXT[]
);
alter table challenges enable row level security;
create policy "Challenges are viewable by everyone." 
  on challenges for select 
  using (true);
drop policy if exists "Users can create challenges" on challenges;
create policy "Users can create challenges" 
  on challenges for insert 
  with check (
    auth.role() = 'authenticated' OR 
    auth.uid() IS NOT NULL
  );
create policy "Users can update their own challenges." 
  on challenges for update 
  using (auth.uid() = created_by);

-- Add comments for the new columns
COMMENT ON COLUMN challenges.word_count IS 'Expected word count range for the challenge';
COMMENT ON COLUMN challenges.grammar_focus IS 'Array of grammar points to focus on';
COMMENT ON COLUMN challenges.vocabulary_themes IS 'Array of vocabulary themes to incorporate';

-- Function to update the updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Trigger to automatically update the updated_at column
create trigger update_challenges_updated_at
    before update on challenges
    for each row
    execute function update_updated_at_column();

-- Insert default challenge formats
INSERT INTO challenge_formats (name, description, difficulty_level) VALUES
-- A1 Formats
('Personal Information', 'Write about basic personal information', 'A1'),
('Daily Routine', 'Describe your daily activities', 'A1'),
('Simple Description', 'Describe a person, place, or thing', 'A1'),
-- A2 Formats
('Short Story', 'Write a simple story about past events', 'A2'),
('Informal Email', 'Write a basic email to a friend', 'A2'),
('Simple Opinion', 'Express basic opinions on familiar topics', 'A2'),
-- B1 Formats
('Blog Post', 'Write a blog post about personal experiences', 'B1'),
('Formal Letter', 'Write a formal letter for common purposes', 'B1'),
('Review', 'Write a review of a movie, book, or product', 'B1'),
-- B2 Formats
('Essay', 'Write an essay expressing and supporting opinions', 'B2'),
('Report', 'Write a report analyzing data or situations', 'B2'),
('Article', 'Write an article for a magazine or website', 'B2'),
-- C1 Formats
('Academic Essay', 'Write an academic essay with research', 'C1'),
('Proposal', 'Write a detailed proposal for a project', 'C1'),
('Critical Review', 'Write a critical analysis of media or literature', 'C1'),
-- C2 Formats
('Research Paper', 'Write an in-depth research paper', 'C2'),
('Technical Report', 'Write a detailed technical report', 'C2'),
('Academic Thesis', 'Write a thesis-style academic paper', 'C2');

-- User Challenge Attempts table
create table challenge_attempts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  challenge_id uuid references challenges not null,
  content text not null,
  word_count integer not null,
  paragraph_count integer not null,
  time_spent integer not null, -- in minutes
  performance_score decimal(3,1) not null,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  feedback text
);
alter table challenge_attempts enable row level security;
create policy "Users can view their own attempts." 
  on challenge_attempts for select 
  using (auth.uid() = user_id);
create policy "Users can create their own attempts." 
  on challenge_attempts for insert 
  with check (auth.uid() = user_id);

-- Skill Analysis table
create table skill_metrics (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  category text not null,
  skill_name text not null,
  proficiency_level decimal(3,1) not null,
  last_assessed timestamp with time zone default timezone('utc'::text, now()) not null,
  improvement_rate decimal(3,1), -- percentage improvement over last 30 days
  constraint unique_user_skill unique (user_id, category, skill_name)
);
alter table skill_metrics enable row level security;
create policy "Users can view their own skill metrics." 
  on skill_metrics for select 
  using (auth.uid() = user_id);

-- Writing Performance Metrics table
create table performance_metrics (
  id uuid default gen_random_uuid() primary key,
  attempt_id uuid references challenge_attempts not null,
  user_id uuid references auth.users not null,
  metric_name text not null,
  metric_value decimal(5,2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table performance_metrics enable row level security;
create policy "Users can view their own performance metrics." 
  on performance_metrics for select 
  using (auth.uid() = user_id);

-- User Progress Summary table
create table user_progress (
  user_id uuid references auth.users primary key,
  total_challenges_completed integer default 0,
  total_words_written integer default 0,
  total_time_spent integer default 0, -- in minutes
  average_performance decimal(3,1),
  strongest_skills text[],
  weakest_skills text[],
  preferred_topics text[],
  last_active_level difficulty_level,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table user_progress enable row level security;
create policy "Users can view their own progress." 
  on user_progress for select 
  using (auth.uid() = user_id);

-- Function to update user progress after each challenge attempt
create or replace function update_user_progress()
returns trigger as $$
begin
  -- Insert or update user progress
  insert into user_progress (
    user_id,
    total_challenges_completed,
    total_words_written,
    total_time_spent,
    updated_at
  )
  values (
    new.user_id,
    1,
    new.word_count,
    new.time_spent,
    now()
  )
  on conflict (user_id) do update
  set
    total_challenges_completed = user_progress.total_challenges_completed + 1,
    total_words_written = user_progress.total_words_written + new.word_count,
    total_time_spent = user_progress.total_time_spent + new.time_spent,
    average_performance = (
      select avg(performance_score)
      from challenge_attempts
      where user_id = new.user_id
    ),
    updated_at = now();

  return new;
end;
$$ language plpgsql security definer;

-- Trigger to update user progress after each challenge attempt
create trigger after_challenge_attempt_insert
  after insert on challenge_attempts
  for each row
  execute function update_user_progress();

-- Common writing errors tracking
create table writing_errors (
  id uuid default gen_random_uuid() primary key,
  attempt_id uuid references challenge_attempts not null,
  user_id uuid references auth.users not null,
  error_type text not null,
  error_category text not null, -- grammar, vocabulary, structure, etc.
  frequency integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table writing_errors enable row level security;
create policy "Users can view their own writing errors." 
  on writing_errors for select 
  using (auth.uid() = user_id);

-- View for user performance trends
create view user_performance_trends as
select 
  user_id,
  date_trunc('week', completed_at) as week,
  avg(performance_score) as avg_score,
  avg(word_count) as avg_words,
  avg(time_spent) as avg_time,
  count(*) as challenges_completed
from challenge_attempts
group by user_id, date_trunc('week', completed_at);

-- Add comments for documentation
COMMENT ON TABLE challenge_attempts IS 'Stores individual challenge attempts by users';
COMMENT ON TABLE skill_metrics IS 'Tracks user proficiency in specific writing skills';
COMMENT ON TABLE performance_metrics IS 'Detailed performance metrics for each challenge attempt';
COMMENT ON TABLE user_progress IS 'Aggregated user progress and statistics';
COMMENT ON TABLE writing_errors IS 'Tracks common writing errors for personalized feedback'

CREATE TABLE supported_languages (
  id uuid default gen_random_uuid() primary key,
  code text not null unique,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add some default supported languages
INSERT INTO supported_languages (code, name) VALUES
('en', 'English'),
('es', 'Spanish'),
('fr', 'French'),
('de', 'German'),
('it', 'Italian'),
('pt', 'Portuguese'),
('nl', 'Dutch'),
('ru', 'Russian'),
('zh', 'Chinese'),
('ja', 'Japanese'),
('ko', 'Korean');

CREATE VIEW weekly_performance_trends AS
SELECT 
    date_trunc('week', completed_at) as week,
    AVG(performance_score) as avg_score,
    AVG(word_count) as avg_words,
    AVG(time_spent) as avg_time,
    COUNT(*) as challenges_completed
FROM challenge_attempts
GROUP BY date_trunc('week', completed_at)
ORDER BY week DESC;

-- Function to update user language with proper permissions
CREATE OR REPLACE FUNCTION public.update_user_language(user_id UUID, language_id UUID)
RETURNS jsonb
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    result jsonb;
BEGIN
    -- Verify the user has permission to update this record
    IF auth.uid() <> user_id THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Not authorized'
        );
    END IF;

    -- Verify the language exists
    IF NOT EXISTS (SELECT 1 FROM supported_languages WHERE id = language_id) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid language ID'
        );
    END IF;

    -- Update the user's language preference
    UPDATE users
    SET target_language_id = language_id
    WHERE id = user_id
    RETURNING jsonb_build_object(
        'id', id,
        'target_language_id', target_language_id
    ) INTO result;

    IF result IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User not found'
        );
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'data', result
    );
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error in update_user_language: %', SQLERRM;
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.update_user_language TO authenticated;