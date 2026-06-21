-- Drop old daily_missions table if it exists
DROP TABLE IF EXISTS public.daily_missions CASCADE;

-- Create daily_missions table
CREATE TABLE public.daily_missions (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date date NOT NULL,
    coach_message text,
    missions_json jsonb NOT NULL,
    xp_reward integer NOT NULL DEFAULT 50,
    completed_count integer NOT NULL DEFAULT 0,
    total_count integer NOT NULL DEFAULT 3,
    generated_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT daily_missions_user_id_date_key UNIQUE (user_id, date)
);

-- Create mission_completions table
CREATE TABLE public.mission_completions (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mission_id uuid NOT NULL REFERENCES public.daily_missions(id) ON DELETE CASCADE,
    mission_type text NOT NULL, -- 'movement', 'nutrition', 'recovery'
    completed_at timestamp with time zone DEFAULT now(),
    xp_awarded integer NOT NULL,
    CONSTRAINT mission_completions_mission_id_mission_type_key UNIQUE (mission_id, mission_type)
);

-- Create user_constraints table
CREATE TABLE public.user_constraints (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    constraint_type text NOT NULL, -- e.g. 'injury', 'limitation'
    excluded_categories text[] NOT NULL DEFAULT '{}', -- e.g. '{"running", "jumping"}'
    notes text,
    created_at timestamp with time zone DEFAULT now()
);

-- Create mission_generation_context table
CREATE TABLE public.mission_generation_context (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    completion_rate numeric NOT NULL DEFAULT 0.0,
    consistency_score integer NOT NULL DEFAULT 0,
    best_completion_time text,
    difficulty_tolerance text NOT NULL DEFAULT 'Easy', -- 'Easy', 'Medium', 'Hard'
    last_generated_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);

-- Extend public.profiles with new columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS injuries_limitations text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS schedule_pref text CHECK (schedule_pref IN ('morning', 'evening', 'flexible')) DEFAULT 'flexible';

-- Enable Row Level Security (RLS)
ALTER TABLE public.daily_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_constraints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_generation_context ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can manage their own daily missions" ON public.daily_missions;
DROP POLICY IF EXISTS "Users can manage their own mission completions" ON public.mission_completions;
DROP POLICY IF EXISTS "Users can manage their own constraints" ON public.user_constraints;
DROP POLICY IF EXISTS "Users can manage their own generation context" ON public.mission_generation_context;

-- Create RLS Policies
CREATE POLICY "Users can manage their own daily missions"
    ON public.daily_missions FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own mission completions"
    ON public.mission_completions FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own constraints"
    ON public.user_constraints FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own generation context"
    ON public.mission_generation_context FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_missions_user_date ON public.daily_missions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_mission_completions_user ON public.mission_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_constraints_user ON public.user_constraints(user_id);
CREATE INDEX IF NOT EXISTS idx_mission_gen_context_user ON public.mission_generation_context(user_id);
