import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const FALLBACKS = [
  {
    missions: [
      { title: "10-Min Walk", description: "Walk after your next meal.", category: "movement", xp: 50 },
      { title: "Drink 1.5L Water", description: "Hit 1.5L before 6pm.", category: "hydration", xp: 30 },
    ],
    coach_message: "Simple day. Two small wins. That's all I need from you.",
  },
  {
    missions: [
      { title: "Protein First", description: "Start your next meal with protein before anything else.", category: "nutrition", xp: 50 },
      { title: "Drink 2L Water", description: "2 litres today. Track every glass.", category: "hydration", xp: 30 },
    ],
    coach_message: "Nutrition and hydration. The unsexy stuff that actually works.",
  },
  {
    missions: [
      { title: "15-Min Walk", description: "Walk for 15 minutes. No phone.", category: "movement", xp: 50 },
      { title: "No Liquid Calories", description: "Water, black coffee, or black tea only today.", category: "nutrition", xp: 50 },
    ],
    coach_message: "Movement and clean fuel. You know what to do.",
  },
];

function getFallback(date: string) {
  const day = new Date(date).getDay();
  return FALLBACKS[day % FALLBACKS.length];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const { user_id, date } = await req.json();
    if (!user_id || !date) {
      return new Response(
        JSON.stringify({ error: "user_id and date required" }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Return existing mission if already generated today
    const { data: existing } = await supabase
      .from("daily_missions")
      .select("*")
      .eq("user_id", user_id)
      .eq("date", date)
      .single();

    if (existing) {
      return new Response(JSON.stringify(existing), {
        status: 200,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // Read user profile — confirmed table: profiles
    const { data: profile } = await supabase
  .from("profiles")
  .select("full_name, goal, goals, activity_level, training_experience")
  .eq("id", user_id)
  .single();
  const userGoal =
  profile?.goal ||
  profile?.goals?.[0] ||
  "general fitness";

    // Read last 48h activity + sleep for context
    const since = new Date(date);
    since.setDate(since.getDate() - 2);
    const sinceISO = since.toISOString();

    const [{ data: activity }, { data: sleep }] = await Promise.all([
      supabase.from("activity_logs").select("calories_burned").eq("user_id", user_id).gte("created_at", sinceISO).limit(3),
      supabase.from("sleep_logs").select("hours").eq("user_id", user_id).gte("created_at", sinceISO).limit(1),
    ]);

    // Build prompt
    const prompt = `You are a personal health coach. Generate exactly 2 daily missions.

User: ${profile?.full_name ?? "User"}
Goal: ${userGoal}
Activity level: ${profile?.activity_level ?? "moderate"}
Experience: ${profile?.training_experience ?? "beginner"}
Recent activity (48h): ${JSON.stringify(activity ?? [])}
Last sleep (hours): ${sleep?.[0]?.hours ?? "unknown"}

Rules:
- Missions completable in under 30 minutes
- Categories: movement, hydration, or nutrition only
- Match difficulty to experience level
- Coach message: 1-2 sentences, direct, no fluff

Respond with RAW JSON only. No markdown. No explanation.
{
  "missions": [
    {"title":"string","description":"string","category":"movement|hydration|nutrition","xp":50},
    {"title":"string","description":"string","category":"movement|hydration|nutrition","xp":30}
  ],
  "coach_message": "string"
}`;

    // Call OpenAI with fallback
    let missionData = getFallback(date);

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          max_tokens: 300,
          temperature: 0.7,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (res.ok) {
        const ai = await res.json();
        const raw = ai.choices[0].message.content
          .replace(/```json|```/g, "")
          .trim();
        missionData = JSON.parse(raw);
      }
    } catch (e) {
      console.error("OpenAI failed, using fallback:", e);
    }

    // Insert into daily_missions
    const { data: inserted, error } = await supabase
      .from("daily_missions")
      .insert({
        user_id,
        date,
        missions: missionData.missions,
        coach_message: missionData.coach_message,
        completed_missions: [],
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(inserted), {
      status: 201,
      headers: { ...CORS, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});