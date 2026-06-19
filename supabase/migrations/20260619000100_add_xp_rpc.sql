-- supabase/migrations/20260619000100_add_xp_rpc.sql

CREATE OR REPLACE FUNCTION public.award_xp(
    p_user_id uuid,
    p_amount integer,
    p_reason text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_new_xp integer;
    v_log_id uuid;
BEGIN
    -- 1. Insert into xp_logs
    INSERT INTO public.xp_logs (user_id, xp, reason, created_at)
    VALUES (p_user_id, p_amount, p_reason, now())
    RETURNING id INTO v_log_id;

    -- 2. Upsert into user_progress
    INSERT INTO public.user_progress (user_id, xp, level, streak, last_celebrated_level)
    VALUES (p_user_id, p_amount, 1, 0, 0)
    ON CONFLICT (user_id)
    DO UPDATE SET xp = user_progress.xp + p_amount
    RETURNING xp INTO v_new_xp;

    RETURN jsonb_build_object(
        'success', true,
        'xp_awarded', p_amount,
        'new_xp', v_new_xp,
        'log_id', v_log_id
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;
