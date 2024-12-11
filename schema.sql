/** 
* USERS
* Note: This table contains user data. Users should only be able to view and update their own data.
*/
-- Drop existing tables and triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_user_deleted();
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

-- Create trigger function for new users
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

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create trigger function for deleted users
CREATE OR REPLACE FUNCTION public.handle_user_deleted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Log the deletion
    RAISE NOTICE 'User deleted: %', old.id;
    
    -- The actual deletion of the users record will happen automatically
    -- due to the ON DELETE CASCADE constraint
    
    -- Perform any additional cleanup here if needed
    -- For example, you might want to delete user-specific data from other tables
    
    RETURN old;
END;
$$;

-- Create trigger for deleted users
CREATE TRIGGER on_auth_user_deleted
    BEFORE DELETE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_deleted();

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
  vocabulary_themes TEXT[],
  checklist TEXT[],
  lang text not null
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
COMMENT ON COLUMN challenges.checklist IS 'Array of checklist items for the challenge';

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
  difficulty_level difficulty_level_enum DEFAULT 'B1',
  word_count integer not null,
  paragraph_count integer not null,
  time_spent integer not null, -- in minutes
  performance_score decimal(3,1) not null,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  feedback text
);
alter table challenge_attempts enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view their own attempts" on challenge_attempts;
drop policy if exists "Users can create their own attempts" on challenge_attempts;
drop policy if exists "Users can delete their own attempts" on challenge_attempts;

-- Create a single policy that allows all operations
create policy "Allow all operations on challenge_attempts"
  on challenge_attempts
  for all
  using (true)
  with check (true);

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
  attempt_id uuid references challenge_attempts on delete cascade not null,
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
  current_streak integer default 0,
  longest_streak integer default 0,
  total_exercises_completed integer default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table user_progress enable row level security;
create policy "Allow all operations on user_progress" 
  on user_progress for all 
  using (true);

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

-- Create view for challenge attempts with related information
CREATE OR REPLACE VIEW challenge_attempt_details AS
SELECT 
    ca.id as attempt_id,
    ca.user_id,
    ca.challenge_id,
    ca.content,
    ca.difficulty_level,
    ca.word_count,
    ca.paragraph_count,
    ca.time_spent,
    ca.performance_score,
    ca.completed_at,
    ca.feedback,
    c.title as challenge_title,
    cf.name as format_name,
    cf.description as format_description
FROM challenge_attempts ca
LEFT JOIN challenges c ON ca.challenge_id = c.id
LEFT JOIN challenge_formats cf ON c.format_id = cf.id;

-- Security is inherited from the underlying tables
-- challenge_attempts already has RLS enabled with user_id check
-- challenges and challenge_formats have public read access

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

-- View for weekly challenge attempts statistics
CREATE OR REPLACE VIEW weekly_challenge_stats AS
WITH weekly_stats AS (
  SELECT 
    user_id,
    CASE 
      WHEN date_trunc('week', completed_at) = date_trunc('week', CURRENT_TIMESTAMP) THEN 'this_week'
      WHEN date_trunc('week', completed_at) = date_trunc('week', CURRENT_TIMESTAMP - interval '1 week') THEN 'last_week'
    END AS week_period,
    COUNT(*) as attempts_count
  FROM challenge_attempts
  WHERE completed_at >= date_trunc('week', CURRENT_TIMESTAMP - interval '1 week')
    AND completed_at < date_trunc('week', CURRENT_TIMESTAMP + interval '1 week')
  GROUP BY user_id, week_period
)
SELECT 
  user_id,
  COALESCE((SELECT attempts_count FROM weekly_stats w WHERE w.user_id = ws.user_id AND week_period = 'this_week'), 0) as this_week_attempts,
  COALESCE((SELECT attempts_count FROM weekly_stats w WHERE w.user_id = ws.user_id AND week_period = 'last_week'), 0) as last_week_attempts,
  COALESCE((SELECT attempts_count FROM weekly_stats w WHERE w.user_id = ws.user_id AND week_period = 'this_week'), 0) - 
  COALESCE((SELECT attempts_count FROM weekly_stats w WHERE w.user_id = ws.user_id AND week_period = 'last_week'), 0) as weekly_change
FROM weekly_stats ws
GROUP BY user_id;

-- Grant select permission on the view to authenticated users
GRANT SELECT ON weekly_challenge_stats TO authenticated;

-- Grant usage on schema to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;

-- Drop dependent objects first
DROP TABLE IF EXISTS exercise_content CASCADE;
DROP TABLE IF EXISTS exercises CASCADE;
DROP TYPE IF EXISTS exercise_type;

-- Recreate exercise_type enum with normalized values
CREATE TYPE exercise_type AS ENUM (
    'fill-in-the-blanks',
    'matching',
    'conjugation-tables',
    'question-formation',
    'dialogue-sorting',
    'multiple-choice',
    'sentence-transformation',
    'drag-and-drop',
    'guess-the-idiom',
    'word-sorting',
    'sentence-reordering',
    'role-playing',
    'verb-conjugation-table',
    'sentence-splitting',
    'sentence-correction',
    'word-building'
);

-- Create exercises table
CREATE TABLE IF NOT EXISTS public.exercises (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    topic VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    exercise_types exercise_type[] NOT NULL,
    difficulty_level VARCHAR(20) DEFAULT 'A1',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    grammar_category VARCHAR(100) NOT NULL,
    order_index INTEGER,
    prerequisites uuid[], -- References other exercise IDs that should be completed first
    lang VARCHAR(50) DEFAULT 'German'
);

-- New table for exercise content
CREATE TABLE IF NOT EXISTS public.exercise_content (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    exercise_id uuid REFERENCES exercises(id) ON DELETE CASCADE,
    topic VARCHAR(255) NOT NULL,
    content jsonb NOT NULL, -- Specific exercise content (conjugations, questions, etc.)
    exercise_type exercise_type NOT NULL, -- Single type per content
    order_index INTEGER, -- Order within the exercise
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(exercise_id, order_index) -- Ensure unique ordering within an exercise
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_exercise_content_exercise_id ON exercise_content(exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_content_type ON exercise_content(exercise_type);
CREATE INDEX IF NOT EXISTS idx_exercise_content_topic ON exercise_content(topic);

-- Add comments for better documentation
COMMENT ON TABLE exercise_content IS 'Stores individual content items for exercises';
COMMENT ON COLUMN exercise_content.content IS 'JSON content specific to exercise type (e.g., conjugations, questions)';
COMMENT ON COLUMN exercise_content.exercise_type IS 'Type of exercise (e.g., conjugation-tables, multiple-choice)';
COMMENT ON COLUMN exercise_content.order_index IS 'Order of content within the exercise';

-- Trigger for updating timestamps
CREATE TRIGGER update_exercise_content_updated_at
    BEFORE UPDATE ON exercise_content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_exercises_topic ON exercises(topic);
CREATE INDEX IF NOT EXISTS idx_exercises_grammar_category ON exercises(grammar_category);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON exercises(difficulty_level);

-- Enable RLS
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Create new policy for all operations
CREATE POLICY "Allow all operations on exercises" 
  ON exercises FOR ALL 
  USING (true);

-- Enable RLS for exercise_content
ALTER TABLE exercise_content ENABLE ROW LEVEL SECURITY;

-- Create new policy for all operations on exercise_content
CREATE POLICY "Allow all operations on exercise_content" 
  ON exercise_content FOR ALL 
  USING (true);

-- Add comments
COMMENT ON TABLE exercises IS 'Stores German language exercises with their topics and types';
COMMENT ON COLUMN exercises.topic IS 'Main topic of the exercise';
COMMENT ON COLUMN exercises.description IS 'Detailed description of what the exercise covers';
COMMENT ON COLUMN exercises.exercise_types IS 'Array of exercise types available for this topic';
COMMENT ON COLUMN exercises.difficulty_level IS 'Difficulty level of the exercise (beginner, intermediate, advanced)';
COMMENT ON COLUMN exercises.grammar_category IS 'Main grammar category the exercise belongs to';
COMMENT ON COLUMN exercises.prerequisites IS 'Array of exercise IDs that should be completed before this one';

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for timestamp
CREATE TRIGGER update_exercises_updated_at
    BEFORE UPDATE ON exercises
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert initial exercises
INSERT INTO public.exercises (
    topic,
    description,
    exercise_types,
    grammar_category,
    order_index
) VALUES 
    (
        'Conjugate verbs (regular and irregular)',
        'Learn how to conjugate both regular and irregular verbs in the present tense.',
        ARRAY['fill-in-the-blanks', 'matching', 'conjugation-tables']::exercise_type[],
        'Verb Conjugation',
        1
    ),
    (
        'W-Questions (Wer, Was, Wo, etc.)',
        'Understand and form open-ended questions using interrogatives.',
        ARRAY['question-formation', 'dialogue-sorting', 'multiple-choice']::exercise_type[],
        'Question Formation',
        2
    ),
    (
        'Yes/No Questions',
        'Practice forming and answering yes/no questions.',
        ARRAY['multiple-choice', 'sentence-transformation', 'dialogue-sorting']::exercise_type[],
        'Question Formation',
        3
    ),
    (
        'Definite Articles (der, die, das)',
        'Learn the correct usage of definite articles with nouns.',
        ARRAY['matching', 'fill-in-the-blanks', 'drag-and-drop']::exercise_type[],
        'Articles',
        4
    ),
    (
        'Indefinite Articles (ein, eine)',
        'Learn how to use indefinite articles with nouns.',
        ARRAY['fill-in-the-blanks', 'multiple-choice', 'gap-fill']::exercise_type[],
        'Articles',
        5
    ),
    (
        'Negative Article (kein, keine)',
        'Practice negating sentences using the correct form of ''kein''.',
        ARRAY['sentence-transformation', 'gap-fill', 'dialogue-sorting']::exercise_type[],
        'Articles',
        6
    ),
    (
        'Plural Forms of Nouns',
        'Learn the plural forms of common German nouns.',
        ARRAY['drag-and-drop', 'matching', 'word-sorting']::exercise_type[],
        'Nouns',
        7
    ),
    (
        'Verb Position in Sentences',
        'Understand the correct placement of verbs in main and subordinate clauses.',
        ARRAY['sentence-reordering', 'fill-in-the-blanks', 'sentence-transformation']::exercise_type[],
        'Sentence Structure',
        8
    ),
    (
        'Accusative Case',
        'Learn to use the accusative case with articles and direct objects.',
        ARRAY['gap-fill', 'multiple-choice', 'fill-in-the-blanks']::exercise_type[],
        'Cases',
        9
    ),
    (
        'Modal Verbs: ''können'' (can)',
        'Practice the conjugation and usage of ''können'' to express ability.',
        ARRAY['dialogue-sorting', 'sentence-transformation', 'conjugation-tables']::exercise_type[],
        'Modal Verbs',
        10
    ),
    (
        'Modal Verbs: ''mögen'' (like) and ''möchten'' (would like)',
        'Learn how to use ''mögen'' and ''möchten'' to express preferences and wishes.',
        ARRAY['dialogue-sorting', 'gap-fill', 'multiple-choice']::exercise_type[],
        'Modal Verbs',
        11
    ),
    (
        'Verbs with Vowel Change (e.g., fahren, sehen)',
        'Understand and practice verbs that change their stem vowels in conjugation.',
        ARRAY['conjugation-tables', 'fill-in-the-blanks', 'matching']::exercise_type[],
        'Verb Conjugation',
        12
    ),
    (
        'Separable Verbs (e.g., aufstehen, anrufen)',
        'Learn how separable verbs are used in sentences and conjugated.',
        ARRAY['sentence-splitting', 'matching', 'gap-fill']::exercise_type[],
        'Verb Types',
        13
    ),
    (
        'Non-Separable Verbs (e.g., besuchen, verstehen)',
        'Practice using non-separable verbs correctly in sentences.',
        ARRAY['sentence-correction', 'fill-in-the-blanks', 'multiple-choice']::exercise_type[],
        'Verb Types',
        14
    ),
    (
        'Sentence Bracket (e.g., modal verbs with infinitives)',
        'Learn how modal verbs create a sentence bracket with the infinitive at the end.',
        ARRAY['fill-in-the-blanks', 'gap-fill', 'dialogue-sorting']::exercise_type[],
        'Sentence Structure',
        15
    ),
    (
        'Temporal Prepositions (e.g., am, im, um)',
        'Understand how to use prepositions to express time.',
        ARRAY['multiple-choice', 'matching', 'fill-in-the-blanks']::exercise_type[],
        'Prepositions',
        16
    ),
    (
        'Compound Nouns (e.g., Haus + Tür = Haustür)',
        'Learn how to form and understand compound nouns.',
        ARRAY['word-building', 'matching', 'drag-and-drop']::exercise_type[],
        'Nouns',
        17
    ),
    (
        'Perfect Tense with ''haben''',
        'Practice forming sentences in the perfect tense with ''haben''.',
        ARRAY['sentence-transformation', 'fill-in-the-blanks', 'dialogue-sorting']::exercise_type[],
        'Perfect Tense',
        18
    ),
    (
        'Perfect Tense with ''sein''',
        'Learn when and how to use ''sein'' to form the perfect tense.',
        ARRAY['gap-fill', 'multiple-choice', 'dialogue-sorting']::exercise_type[],
        'Perfect Tense',
        19
    ),
    (
        'Perfect Tense with ''haben'' and ''sein''',
        'Understand the distinction between ''haben'' and ''sein'' in perfect tense usage.',
        ARRAY['dialogue-sorting', 'gap-fill', 'sentence-transformation']::exercise_type[],
        'Perfect Tense',
        20
    );

-- Migration: Move data from exercises.content to exercise_content
CREATE OR REPLACE FUNCTION migrate_exercise_content()
RETURNS void AS $$
DECLARE
    exercise_record RECORD;
    content_index integer;
BEGIN
    -- Loop through each exercise
    FOR exercise_record IN SELECT id, content, topic, exercise_types FROM exercises WHERE content IS NOT NULL
    LOOP
        content_index := 0;
        -- Loop through each content item in the array
        FOR i IN 1..array_length(exercise_record.content, 1)
        LOOP
            -- Insert into new exercise_content table
            INSERT INTO exercise_content (
                exercise_id,
                topic,
                content,
                exercise_type,
                order_index
            )
            SELECT
                exercise_record.id,
                exercise_record.topic,
                exercise_record.content[i],
                -- Extract exercise_type from content or use first type from exercise_types
                COALESCE(
                    (exercise_record.content[i]->>'exercise_type')::exercise_type,
                    exercise_record.exercise_types[1]
                ),
                content_index;

            content_index := content_index + 1;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute migration
SELECT migrate_exercise_content();

-- After verifying the migration, you can remove the content column
-- ALTER TABLE exercises DROP COLUMN content;

-- Create user exercise progress table
CREATE TABLE IF NOT EXISTS public.user_exercise_progress (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    exercise_id uuid REFERENCES exercises(id) ON DELETE CASCADE,
    score INTEGER CHECK (score >= 0 AND score <= 100),
    completed_at TIMESTAMPTZ DEFAULT now(),
    attempts INTEGER DEFAULT 1,
    last_attempt_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, exercise_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_exercise_progress_user ON user_exercise_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_exercise_progress_exercise ON user_exercise_progress(exercise_id);

-- Enable RLS
ALTER TABLE user_exercise_progress ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Allow all operations on user_exercise_progress" 
    ON user_exercise_progress FOR ALL 
    USING (true);

-- Add comments
COMMENT ON TABLE user_exercise_progress IS 'Tracks user progress and scores for each exercise';
COMMENT ON COLUMN user_exercise_progress.score IS 'Score achieved in the exercise (0-100)';
COMMENT ON COLUMN user_exercise_progress.attempts IS 'Number of times the user has attempted this exercise';
COMMENT ON COLUMN user_exercise_progress.last_attempt_at IS 'Timestamp of the most recent attempt';