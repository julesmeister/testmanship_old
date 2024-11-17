/** 
* USERS
* Note: This table contains user data. Users should only be able to view and update their own data.
*/
create table users (
  -- UUID from auth.users
  id uuid references auth.users not null primary key,
  full_name text,
  avatar_url text,
  credits bigint DEFAULT 0,
  trial_credits bigint DEFAULT 3,
  -- The customer's billing address, stored in JSON format.
  billing_address jsonb,
  -- Stores your customer's payment instruments.
  payment_method jsonb
);
alter table users enable row level security;
create policy "Can view own user data." on users for select using (auth.uid() = id);
create policy "Can update own user data." on users for update using (auth.uid() = id);

/**
* This trigger automatically creates a user entry when a new user signs up via Supabase Auth.
*/ 
create function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.users (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


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
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
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
