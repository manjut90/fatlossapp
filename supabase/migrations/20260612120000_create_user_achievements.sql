-- supabase/migrations/20260612120000_create_user_achievements.sql

CREATE TABLE public.user_achievements (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id text NOT NULL,
    unlocked_at timestamp with time zone NOT NULL DEFAULT now(),
    metadata jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT user_achievements_pkey PRIMARY KEY (id),
    CONSTRAINT user_achievements_user_id_achievement_id_key UNIQUE (user_id, achievement_id)
);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow individual read access"
ON public.user_achievements
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Allow individual insert access"
ON public.user_achievements
FOR INSERT
WITH CHECK (auth.uid() = user_id);