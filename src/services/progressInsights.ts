import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ProgressMetrics } from '../hooks/useProgressMetrics';

interface InsightsResponse {
  positives: string;
  negatives: string;
  recommendations: string;
  cached: boolean;
}

const CACHE_KEY_PREFIX = 'progress-insights';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

function getCacheKey(userId: string): string {
  const today = new Date().toISOString().split('T')[0];
  return `${CACHE_KEY_PREFIX}-${userId}-${today}`;
}

async function getCachedInsights(userId: string): Promise<InsightsResponse | null> {
  try {
    const key = getCacheKey(userId);
    const cached = await AsyncStorage.getItem(key);

    if (!cached) return null;

    const parsed = JSON.parse(cached);
    const age = Date.now() - parsed.timestamp;

    if (age > CACHE_DURATION_MS) {
      await AsyncStorage.removeItem(key);
      return null;
    }

    return { ...parsed, cached: true };
  } catch (err) {
    console.warn('Error reading cache:', err);
    return null;
  }
}

async function setCachedInsights(userId: string, insights: Omit<InsightsResponse, 'cached'>) {
  try {
    const key = getCacheKey(userId);
    await AsyncStorage.setItem(
      key,
      JSON.stringify({
        ...insights,
        timestamp: Date.now(),
      })
    );
  } catch (err) {
    console.warn('Error writing cache:', err);
  }
}

async function callClaudeAPI(
  metrics: ProgressMetrics,
  profile: any,
  detectedPositives: string[],
  detectedNegatives: string[]
): Promise<{ positives: string; negatives: string; recommendations: string }> {
  const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('Claude API key not configured');
  }

  const systemPrompt = `You are a world-class fitness coach and nutritionist with 30 years of experience.
Your role is to provide personalized, actionable insights based on user's health data.
You communicate with empathy, expertise, and practical wisdom.
Keep responses conversational but professional, inspiring but realistic.`;

  const userPrompt = `Based on the following health metrics and auto-detected patterns, provide insights:

AUTO-DETECTED PATTERNS:
Positives: ${detectedPositives.length > 0 ? detectedPositives.join(', ') : 'None yet'}
Negatives: ${detectedNegatives.length > 0 ? detectedNegatives.join(', ') : 'None yet'}

METRICS THIS WEEK:
- Calories: ${Math.round(metrics.weekComparisonMetrics.calories.current)}/day (vs ${Math.round(metrics.weekComparisonMetrics.calories.previous)}/day last week)
- Protein: ${Math.round(metrics.weekComparisonMetrics.protein.current)}g/day (goal: ${profile?.target_protein || 150}g)
- Workouts: ${metrics.weekComparisonMetrics.workout.current} days (vs ${metrics.weekComparisonMetrics.workout.previous} last week)
- Sleep: ${metrics.weekComparisonMetrics.sleep.current.toFixed(1)} hours/night (vs ${metrics.weekComparisonMetrics.sleep.previous.toFixed(1)} last week)

OVERALL PROGRESS:
- Weight loss: ${metrics.overallMetrics.weightLoss}kg in ${metrics.overallMetrics.daysElapsed} days
- Weekly loss rate: ${metrics.overallMetrics.weeklyLossRate}kg/week
- Goal progress: ${metrics.overallMetrics.percentageComplete}% complete
- Weeks remaining: ${metrics.overallMetrics.weeksRemaining}

Please provide THREE JSON sections in this exact format:

1. POSITIVES NARRATIVE (2-3 sentences celebrating what's working):
{"positives": "Your narrative here..."}

2. NEGATIVES NARRATIVE (2-3 sentences addressing challenges):
{"negatives": "Your narrative here..."}

3. RECOMMENDATIONS (3-4 actionable steps to convert negatives to positives):
{"recommendations": "Your recommendations here..."}

Respond ONLY with valid JSON objects, one per line, no additional text.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Claude API error: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const content = data.content[0]?.text || '';

  // Parse JSON responses from Claude
  const lines = content.split('\n').filter((line: string) => line.trim().startsWith('{'));

  let positivesText = '';
  let negativesText = '';
  let recommendationsText = '';

  lines.forEach((line: string) => {
    try {
      const obj = JSON.parse(line);
      if (obj.positives) positivesText = obj.positives;
      if (obj.negatives) negativesText = obj.negatives;
      if (obj.recommendations) recommendationsText = obj.recommendations;
    } catch (e) {
      console.warn('Failed to parse JSON line:', line);
    }
  });

  if (!positivesText || !negativesText || !recommendationsText) {
    throw new Error('Claude did not return expected response format');
  }

  return { positives: positivesText, negatives: negativesText, recommendations: recommendationsText };
}

export async function generateProgressInsights(
  userId: string,
  metrics: ProgressMetrics,
  profile: any
): Promise<InsightsResponse> {
  // Check cache first
  const cached = await getCachedInsights(userId);
  if (cached) {
    return cached;
  }

  try {
    const insights = await callClaudeAPI(
      metrics,
      profile,
      metrics.autoDetected.positives,
      metrics.autoDetected.negatives
    );

    // Cache the results
    await setCachedInsights(userId, insights);

    return { ...insights, cached: false };
  } catch (err) {
    console.error('Error generating insights:', err);

    // Fallback to template if API fails
    return {
      positives:
        'Keep up your consistent effort—every log you make is a step toward your goal.',
      negatives:
        'There are areas where you can dial in more focus. Use this as a learning opportunity.',
      recommendations:
        'Review your week, identify one area to improve, and focus on that. Small consistent improvements compound.',
      cached: false,
    };
  }
}

export async function clearInsightsCache(userId: string): Promise<void> {
  try {
    const key = getCacheKey(userId);
    await AsyncStorage.removeItem(key);
  } catch (err) {
    console.warn('Error clearing cache:', err);
  }
}
