import { useHealth } from '../context/HealthContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

export default function useCoachChat() {
  const { healthData } = useHealth();
  const { profile } = useAuth();

  const buildSystemPrompt = () => {
    const name = profile?.full_name?.split(' ')[0] || 'there';
    const goal = profile?.goal || 'fat loss';
    const weight = profile?.weight_kg || 70;
    const targetCalories = profile?.target_calories || 2000;
    const targetProtein = profile?.target_protein || 150;

    const {
      todayCalories = 0,
      todayProtein = 0,
      todayCarbs = 0,
      todayFats = 0,
      todayFiber = 0,
      todayWater = 0,
      todayWorkout = false,
      todaySleep = 0,
      dailyScore = 0,
      streak = 0,
    } = healthData || {};

    return `You are Neo, a world-class AI fitness and nutrition coach. You are warm, motivating, direct and knowledgeable. You speak like a real human coach — not a robot. You use the user's name naturally. You give specific, actionable advice based on their real data.

USER PROFILE:
- Name: ${name}
- Goal: ${goal}
- Weight: ${weight} kg
- Daily calorie target: ${targetCalories} kcal
- Daily protein target: ${targetProtein}g

TODAY'S DATA:
- Calories eaten: ${todayCalories} / ${targetCalories} kcal
- Protein: ${todayProtein}g / ${targetProtein}g
- Carbs: ${todayCarbs}g
- Fats: ${todayFats}g
- Fiber: ${todayFiber}g
- Water: ${todayWater} ml
- Workout done: ${todayWorkout ? 'Yes' : 'Not yet'}
- Sleep last night: ${todaySleep} hours
- Daily score: ${dailyScore}%
- Current streak: ${streak} days

YOUR RULES:
1. Always use the user's real data when giving advice
2. Be specific and concise — max 3-4 sentences
3. Use emojis naturally
4. Never say you are an AI — you ARE their coach
5. Always end with one specific action they can take right now`;
  };

  const processMessage = async (
    text: string,
    conversationHistory: { role: string; content: string }[] = []
  ): Promise<string> => {
    try {
      if (!process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY) {
        return buildFallbackReply(text);
      }

      const claudeKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
      const messages = [
        ...conversationHistory.slice(-6).map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
        { role: 'user', content: text },
      ];
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': claudeKey || '',
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 400,
          system: buildSystemPrompt(),
          messages,
        }),
      });
      if (!res.ok) { return buildFallbackReply(text); }
      const data = await res.json();
      const reply = data?.content?.[0]?.text?.trim() || '';
      if (!reply) return buildFallbackReply(text);

      // Save conversation to Supabase
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) {
          await supabase.from('ai_coach_logs').insert([
            { user_id: user.id, role: 'user', message: text },
            { user_id: user.id, role: 'assistant', message: reply },
          ]);
        }
      } catch (e) {
        console.log('Failed to save chat log:', e);
      }

      return reply;
    } catch (error) {
      console.error('Error processing message:', error);
      return buildFallbackReply(text);
    }
  };

  const buildFallbackReply = (text: string): string => {
    const lower = text.toLowerCase();
    const name = profile?.full_name?.split(' ')[0] || '';
    const { todayCalories = 0, todayProtein = 0, todayWorkout = false } = healthData || {};
    const targetCalories = profile?.target_calories || 2000;
    const targetProtein = profile?.target_protein || 150;

    if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey')) {
      return `Hey ${name}! 👋 You're at ${todayCalories} kcal today. ${todayWorkout ? 'Great job getting that workout in!' : 'Still waiting on that workout 💪'} What can I help you with?`;
    }

    if (lower.includes('doing') || lower.includes('progress') || lower.includes('score')) {
      const remaining = targetCalories - todayCalories;
      const proteinLeft = targetProtein - todayProtein;
      return `Here's where you stand ${name} 📊 You've had ${todayCalories} kcal and ${todayProtein}g protein today. ${remaining > 0 ? `${remaining} kcal left to eat.` : 'Calories on target!'} ${proteinLeft > 0 ? `Need ${proteinLeft}g more protein.` : 'Protein goal hit! 🎯'}`;
    }

    if (lower.includes('protein') || lower.includes('macros')) {
      const remaining = targetProtein - todayProtein;
      return remaining > 0
        ? `You've had ${todayProtein}g protein today ${name}. You need ${remaining}g more. Try chicken breast, eggs or a protein shake 🥩`
        : `Amazing — you've already hit your ${targetProtein}g protein goal today! 🎯`;
    }

    if (lower.includes('calorie') || lower.includes('food') || lower.includes('eat')) {
      const remaining = targetCalories - todayCalories;
      return remaining > 0
        ? `You've eaten ${todayCalories} kcal so far ${name}. You have ${remaining} kcal left for today.`
        : `You've hit your calorie target at ${todayCalories} kcal! Focus on protein and water now 💧`;
    }

    if (lower.includes('workout') || lower.includes('gym') || lower.includes('exercise')) {
      return todayWorkout
        ? `Workout done ✅ Recovery is key now — eat enough protein and sleep well tonight 😴`
        : `No workout logged yet ${name}. Even a 20 min walk counts! Go get it 🏃`;
    }

    if (lower.includes('water') || lower.includes('hydration')) {
      return `Hydration is crucial for fat loss ${name}. Aim for 2.5L today. Keep a water bottle with you at all times 💧`;
    }

    if (lower.includes('sleep')) {
      return `Sleep is when your body recovers and burns fat ${name}. Aim for 7-8 hours and try to sleep before midnight 😴`;
    }

    return `I'm here to help ${name}! Ask me about your nutrition, workouts, hydration or sleep. You can also tell me what you ate and I'll track it 👊`;
  };

  return { processMessage };
}