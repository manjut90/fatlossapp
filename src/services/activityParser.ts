import AsyncStorage from '@react-native-async-storage/async-storage';
import { activityDatabase, ActivityEntry } from '../constants/activityDatabase';

export interface ActivityResult {
  activity_name: string;
  activity_type: string;
  duration_minutes: number;
  calories_burned: number;
  met_value: number;
  source: 'database' | 'ai';
}

// Duration word mappings
const durationWords: Record<string, number> = {
  'half': 30,
  'quarter': 15,
  'one hour': 60,
  'an hour': 60,
  'hour': 60,
  'hours': 60,
  'hr': 60,
  'hrs': 60,
  'min': 1,
  'mins': 1,
  'minute': 1,
  'minutes': 1,
};

// Extract duration in minutes from text
function extractDuration(text: string): number {
  const normalized = text.toLowerCase();

  // Match "X hour Y min" pattern
  const hourMinMatch = normalized.match(/(\d+(?:\.\d+)?)\s*h(?:our|r)s?\s*(\d+)\s*m(?:in|inute)s?/);
  if (hourMinMatch) {
    return parseInt(hourMinMatch[1]) * 60 + parseInt(hourMinMatch[2]);
  }

  // Match "X.5 hours"
  const decimalHourMatch = normalized.match(/(\d+(?:\.\d+)?)\s*h(?:our|r)s?/);
  if (decimalHourMatch) {
    return Math.round(parseFloat(decimalHourMatch[1]) * 60);
  }

  // Match "X minutes"
  const minuteMatch = normalized.match(/(\d+)\s*m(?:in|inute)s?/);
  if (minuteMatch) {
    return parseInt(minuteMatch[1]);
  }

  // Match "half hour"
  if (normalized.includes('half hour') || normalized.includes('half an hour')) return 30;
  if (normalized.includes('quarter hour')) return 15;

  // Default 30 minutes if no duration found
  return 30;
}

// Search local activity database
function searchActivityDatabase(query: string): { entry: ActivityEntry; confidence: number } | null {
  const normalized = query.toLowerCase().trim();

  // Remove duration words to get activity name
  const cleaned = normalized
    .replace(/\d+(?:\.\d+)?\s*(?:hour|hr|hours|hrs|minute|min|minutes|mins|h|m)/g, '')
    .replace(/\b(half|quarter|an|a)\s*(hour|hr|min|minute)s?\b/g, '')
    .trim();

  let bestMatch: { entry: ActivityEntry; confidence: number } | null = null;

  for (const activity of activityDatabase) {
    let confidence = 0;

    // Exact name match
    if (cleaned === activity.name.toLowerCase()) {
      confidence = 1.0;
    }
    // Alias exact match
    else if (activity.aliases.some(a => a.toLowerCase() === cleaned)) {
      confidence = 0.95;
    }
    // Name contains query
    else if (activity.name.toLowerCase().includes(cleaned) && cleaned.length > 2) {
      confidence = 0.85;
    }
    // Query contains name
    else if (cleaned.includes(activity.name.toLowerCase()) && activity.name.length > 3) {
      confidence = 0.8;
    }
    // Alias partial match
    else if (activity.aliases.some(a => {
      const alias = a.toLowerCase();
      return cleaned.includes(alias) || alias.includes(cleaned);
    }) && cleaned.length > 2) {
      confidence = 0.75;
    }
    // Word-level match
    else {
      const queryWords = cleaned.split(/\s+/).filter(w => w.length > 2);
      const nameWords = activity.name.toLowerCase().split(/\s+/);
      const aliasWords = activity.aliases.flatMap(a => a.toLowerCase().split(/\s+/));
      const allWords = [...nameWords, ...aliasWords];

      const matchCount = queryWords.filter(w => allWords.some(aw => aw.includes(w) || w.includes(aw))).length;
      if (matchCount > 0 && queryWords.length > 0) {
        confidence = (matchCount / queryWords.length) * 0.7;
      }
    }

    if (confidence > (bestMatch?.confidence ?? 0)) {
      bestMatch = { entry: activity, confidence };
    }
  }

  return bestMatch && bestMatch.confidence >= 0.6 ? bestMatch : null;
}

// Calculate calories burned using MET formula
function calculateCalories(met: number, durationMinutes: number, weightKg: number): number {
  // calories = MET × weight(kg) × duration(hours)
  return Math.round(met * weightKg * (durationMinutes / 60));
}

// Parse activity with AI fallback
async function parseActivityWithAI(description: string, weightKg: number): Promise<ActivityResult | null> {
  const cacheKey = `activity_cache_${description.toLowerCase().trim()}`;

  try {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      const calories = calculateCalories(parsed.met_value, parsed.duration_minutes, weightKg);
      return { ...parsed, calories_burned: calories, source: 'ai' };
    }
  } catch {}

  try {
    const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
    if (!apiKey) return null;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        system: 'You are a fitness expert. Given an activity description, return ONLY a JSON object with: activity_name (string), activity_type (cardio/strength/sports/yoga/daily), duration_minutes (number), met_value (number between 1-15). No extra text, just JSON.',
        messages: [{ role: 'user', content: description }],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text ?? '';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    await AsyncStorage.setItem(cacheKey, JSON.stringify(parsed));

    const calories = calculateCalories(parsed.met_value, parsed.duration_minutes, weightKg);
    return { ...parsed, calories_burned: calories, source: 'ai' };
  } catch {
    return null;
  }
}

// Main parse function
export async function parseActivity(description: string, weightKg: number = 70): Promise<ActivityResult | null> {
  const duration = extractDuration(description);
  const match = searchActivityDatabase(description);

  if (match) {
    const calories = calculateCalories(match.entry.met_value, duration, weightKg);
    return {
      activity_name: match.entry.name,
      activity_type: match.entry.category,
      duration_minutes: duration,
      calories_burned: calories,
      met_value: match.entry.met_value,
      source: 'database',
    };
  }

  // Fallback to AI
  const aiResult = await parseActivityWithAI(description, weightKg);
  if (aiResult) {
    return { ...aiResult, duration_minutes: duration };
  }

  return null;
}
