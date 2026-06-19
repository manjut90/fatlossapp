-- supabase/migrations/20260619000000_baseline.sql

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username text UNIQUE,
    full_name text,
    avatar_url text,
    goal text,
    goals text[],
    fitness_level text,
    workout_preference text,
    motivation_type text,
    streak integer DEFAULT 0,
    xp integer DEFAULT 0,
    popularity text DEFAULT 'bronze',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    onboarding_completed boolean DEFAULT false,
    gender text,
    height integer,
    current_weight integer,
    target_weight integer,
    activity_level text,
    sleep_hours text,
    training_experience text,
    work_style text,
    health_conditions text[],
    bio text,
    birthday text,
    location text,
    social_instagram text,
    social_twitter text
);

-- 2. User Progress Table
CREATE TABLE IF NOT EXISTS public.user_progress (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    xp integer DEFAULT 0,
    level integer DEFAULT 1,
    streak integer DEFAULT 0,
    last_celebrated_level integer DEFAULT 0,
    last_checkin_date date,
    created_at timestamp with time zone DEFAULT now()
);

-- 3. XP Logs Table
CREATE TABLE IF NOT EXISTS public.xp_logs (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    xp integer NOT NULL,
    reason text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- 4. Push Tokens Table
CREATE TABLE IF NOT EXISTS public.push_tokens (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token text UNIQUE NOT NULL,
    platform text,
    created_at timestamp with time zone DEFAULT now()
);

-- 5. Daily Missions Table
CREATE TABLE IF NOT EXISTS public.daily_missions (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date date NOT NULL,
    missions jsonb NOT NULL,
    coach_message text,
    completed_missions integer[] DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT daily_missions_user_id_date_key UNIQUE (user_id, date)
);

-- 6. Activity Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_name text NOT NULL,
    activity_type text,
    duration integer NOT NULL,
    calories_burned numeric,
    met_value numeric,
    created_at timestamp with time zone DEFAULT now()
);

-- 7. Hydration Logs Table
CREATE TABLE IF NOT EXISTS public.hydration_logs (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount numeric NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- 8. Sleep Logs Table
CREATE TABLE IF NOT EXISTS public.sleep_logs (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    hours numeric NOT NULL,
    sleep_quality text,
    bedtime text,
    created_at timestamp with time zone DEFAULT now()
);

-- 9. Food Logs Table
CREATE TABLE IF NOT EXISTS public.food_logs (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    meal_name text NOT NULL,
    calories numeric,
    protein numeric,
    carbs numeric,
    fats numeric,
    fiber numeric,
    meal_type text,
    created_at timestamp with time zone DEFAULT now()
);

-- 10. Posts Table
CREATE TABLE IF NOT EXISTS public.posts (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content text,
    media_url text,
    likes_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);

-- 11. Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- 12. Comment Reactions Table
CREATE TABLE IF NOT EXISTS public.comment_reactions (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id uuid NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT comment_reactions_comment_id_user_id_key UNIQUE (comment_id, user_id)
);

-- 13. Reactions Table
CREATE TABLE IF NOT EXISTS public.reactions (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type text DEFAULT 'like',
    CONSTRAINT reactions_post_id_user_id_key UNIQUE (post_id, user_id)
);

-- 14. Bookmarks Table
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT bookmarks_post_id_user_id_key UNIQUE (post_id, user_id)
);

-- 15. Stories Table
CREATE TABLE IF NOT EXISTS public.stories (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    media_url text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- 16. Story Replies Table
CREATE TABLE IF NOT EXISTS public.story_replies (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id uuid NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- 17. AI Coach Logs Table
CREATE TABLE IF NOT EXISTS public.ai_coach_logs (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role text NOT NULL CHECK (role = ANY (ARRAY['user'::text, 'assistant'::text])),
    message text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- 18. Streaks Table
CREATE TABLE IF NOT EXISTS public.streaks (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    current_streak integer DEFAULT 0,
    longest_streak integer DEFAULT 0,
    last_checkin_date date,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 19. User Badges Table
CREATE TABLE IF NOT EXISTS public.user_badges (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_type text NOT NULL,
    earned_at timestamp with time zone DEFAULT now()
);

-- 20. Notification Schedule Table
CREATE TABLE IF NOT EXISTS public.notification_schedule (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    type text NOT NULL,
    message text NOT NULL,
    scheduled_time time with time zone NOT NULL,
    is_active boolean DEFAULT true,
    last_sent_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);

-- 21. User Stats Table
CREATE TABLE IF NOT EXISTS public.user_stats (
    user_id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    xp integer DEFAULT 0,
    level integer DEFAULT 1,
    streak integer DEFAULT 0,
    updated_at timestamp with time zone DEFAULT now()
);

-- 22. Post Reactions Table
CREATE TABLE IF NOT EXISTS public.post_reactions (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
    emoji text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT post_reactions_post_id_user_id_key UNIQUE (post_id, user_id)
);

-- 23. Notification Logs Table
CREATE TABLE IF NOT EXISTS public.notification_logs (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    notification_type text,
    mission_date date,
    sent_at timestamp with time zone DEFAULT now()
);

-- 24. Friendships Table
CREATE TABLE IF NOT EXISTS public.friendships (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    addressee_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    status text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT friendships_requester_id_addressee_id_key UNIQUE (requester_id, addressee_id)
);
