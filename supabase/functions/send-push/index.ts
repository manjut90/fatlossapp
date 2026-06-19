import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const { user_id, user_ids, title, body, data: customData } = await req.json();

    const targetUserIds = user_ids || (user_id ? [user_id] : []);
    if (targetUserIds.length === 0) {
      return new Response(JSON.stringify({ error: "user_id or user_ids is required" }), {
        status: 400,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    if (!title || !body) {
      return new Response(JSON.stringify({ error: "title and body are required" }), {
        status: 400,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch tokens for target users
    const { data: pushTokens, error: fetchError } = await supabase
      .from("push_tokens")
      .select("token, user_id")
      .in("user_id", targetUserIds);

    if (fetchError) {
      throw fetchError;
    }

    if (!pushTokens || pushTokens.length === 0) {
      return new Response(JSON.stringify({ success: true, message: "No push tokens found for users" }), {
        status: 200,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // Build messages for Expo
    const messages = pushTokens.map((t) => ({
      to: t.token,
      sound: "default",
      title,
      body,
      data: customData || {},
    }));

    // Send to Expo Push API
    // Expo allows sending up to 100 messages at once
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "accept": "application/json",
      },
      body: JSON.stringify(messages),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Expo Push API error: ${response.status} - ${errText}`);
    }

    const expoResult = await response.json();
    const tickets = expoResult.data || [];

    // Check tickets for failures
    const failedTokens: string[] = [];
    tickets.forEach((ticket: any, idx: number) => {
      if (ticket.status === "error") {
        console.error(`❌ Push failed for token ${pushTokens[idx].token}:`, ticket.message);
        if (ticket.details?.error === "DeviceNotRegistered") {
          failedTokens.push(pushTokens[idx].token);
        }
      }
    });

    // Clean up stale tokens
    if (failedTokens.length > 0) {
      console.log(`🧹 Cleaning up ${failedTokens.length} stale push tokens...`);
      const { error: deleteError } = await supabase
        .from("push_tokens")
        .delete()
        .in("token", failedTokens);
      if (deleteError) {
        console.error("❌ Error deleting stale push tokens:", deleteError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        sentCount: messages.length - failedTokens.length,
        failedCount: failedTokens.length,
      }),
      {
        status: 200,
        headers: { ...CORS, "Content-Type": "application/json" },
      }
    );

  } catch (err) {
    console.error("Error sending push notification:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
