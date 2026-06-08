import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  FoodCategory,
  searchableFoods,
} from '../constants/foodDatabase';

type MealType =
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'snack';

type NumberWordMap =
  Record<string, number>;

export type NutritionTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
};

export type ParsedMealItem = {
  id: string;
  name: string;
  serving_size: string;
  quantity: number;
  confidence: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
};

export type ParsedMealResult = {
  items: ParsedMealItem[];
  totals: NutritionTotals;
  source: 'database' | 'ai';
};

type ClaudeMeal = {
  meal_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  meal_type: MealType;
};

const SYSTEM_PROMPT =
  'You are a nutrition expert. When given a meal description, return ONLY a JSON object with these exact fields: meal_name, calories, protein, carbs, fats, meal_type (breakfast/lunch/dinner/snack). Be accurate with nutrition data. No extra text, just JSON.';

const AI_CACHE_PREFIX =
  'meal-parser-v1:';

const numberWords: NumberWordMap = {
  a: 1,
  an: 1,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  half: 0.5,
  quarter: 0.25,
  large: 1.5,
  small: 0.75,
  medium: 1,
};

const regionalNameMap: Record<
  string,
  string
> = {
  anda: 'egg',
  unda: 'egg',
  chawal: 'rice',
  roti: 'roti',
  chapati: 'roti',
  chapathi: 'roti',
  daal: 'dal',
  dhal: 'dal',
  sabzi: 'vegetable curry',
  subzi: 'vegetable curry',
  doodh: 'milk',
  dahi: 'curd',
  chai: 'tea',
  chay: 'tea',
  makkhan: 'butter',
  paneer: 'paneer',
  murgh: 'chicken',
  gosht: 'mutton',
  maas: 'mutton',
  machli: 'fish',
  aloo: 'potato',
  gobi: 'cauliflower',
  palak: 'spinach',
  pyaz: 'onion',
  tamatar: 'tomato',
};

function sanitizeMealType(
  rawType: string,
): MealType {
  const normalized =
    (rawType || '')
      .toLowerCase()
      .trim();

  if (
    normalized === 'breakfast' ||
    normalized === 'lunch' ||
    normalized === 'dinner' ||
    normalized === 'snack'
  ) {
    return normalized;
  }

  return 'snack';
}

function categoryToMealType(
  category: FoodCategory,
): MealType {
  if (
    category === 'breakfast' ||
    category === 'lunch' ||
    category === 'dinner' ||
    category === 'snack'
  ) {
    return category;
  }
  return 'snack';
}

function safeNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed)
    ? Math.max(0, parsed)
    : 0;
}

function normalizeQuery(query: string) {
  let normalized = query
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

  Object.entries(regionalNameMap).forEach(
    ([from, to]) => {
      normalized = normalized.replace(
        new RegExp(
          `\\b${from}\\b`,
          'g',
        ),
        to,
      );
    },
  );

  return normalized;
}

function extractQuantity(query: string) {
  const numericMatch =
    query.match(
      /\b(\d+(\.\d+)?)\b/,
    );
  if (numericMatch) {
    return Number(numericMatch[1]);
  }

  const words =
    query.split(/\s+/g);
  for (const word of words) {
    if (word in numberWords) {
      return numberWords[word];
    }
  }

  return 1;
}

function scoreMatch(
  query: string,
  candidate: {
    name: string;
    aliases: string[];
    tags: string[];
  },
) {
  const normalizedName =
    candidate.name.toLowerCase();
  const aliases =
    candidate.aliases.map(alias =>
      alias.toLowerCase(),
    );
  const tags =
    candidate.tags.map(tag =>
      tag.toLowerCase(),
    );

  if (query === normalizedName) {
    return 1;
  }
  if (aliases.includes(query)) {
    return 0.96;
  }
  if (
    normalizedName.includes(query) ||
    query.includes(normalizedName)
  ) {
    return 0.82;
  }
  if (
    aliases.some(
      alias =>
        alias.includes(query) ||
        query.includes(alias),
    )
  ) {
    return 0.78;
  }
  if (
    tags.some(
      tag =>
        query.includes(tag) ||
        tag.includes(query),
    )
  ) {
    return 0.65;
  }
  return 0;
}

export function searchLocalDatabase(
  query: string,
) {
  const normalized =
    normalizeQuery(query);
  const quantity =
    extractQuantity(normalized);

  let bestMatch: any = null;
  let bestScore = 0;

  searchableFoods.forEach(food => {
    const score = scoreMatch(
      normalized,
      food,
    );
    if (score > bestScore) {
      bestScore = score;
      bestMatch = food;
    }
  });

  if (!bestMatch || bestScore < 0.6) {
    return null;
  }

  return {
    id: bestMatch.id,
    name: bestMatch.name,
    serving_size:
      bestMatch.serving_size,
    quantity,
    confidence: Number(
      bestScore.toFixed(2),
    ),
    calories: safeNumber(
      bestMatch.calories * quantity,
    ),
    protein: safeNumber(
      bestMatch.protein * quantity,
    ),
    carbs: safeNumber(
      bestMatch.carbs * quantity,
    ),
    fats: safeNumber(
      bestMatch.fats * quantity,
    ),
    fiber: safeNumber(
      bestMatch.fiber * quantity,
    ),
    meal_type: categoryToMealType(
      bestMatch.category,
    ),
  };
}

function splitInput(
  input: string,
) {
  return input
    .split(
      /\s(?:and|with)\s|,|\+|&/gi,
    )
    .map(part => part.trim())
    .filter(Boolean);
}

export function parseMultipleFoods(
  input: string,
) {
  const parts = splitInput(input);
  const items = parts
    .map(part =>
      searchLocalDatabase(part),
    )
    .filter(Boolean) as ParsedMealItem[];

  const totals = items.reduce(
    (acc, item) => ({
      calories:
        acc.calories + item.calories,
      protein:
        acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fats: acc.fats + item.fats,
      fiber:
        acc.fiber + item.fiber,
    }),
    {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      fiber: 0,
    },
  );

  return {
    items,
    totals,
    parsedCount: items.length,
    totalCount: parts.length,
  };
}

async function parseMealWithAI(
  description: string,
): Promise<ClaudeMeal | null> {
  const apiKey =
    process.env
      .EXPO_PUBLIC_ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.error('Missing EXPO_PUBLIC_ANTHROPIC_API_KEY');
    return null;
  }

  try {
    const response = await fetch(
      'https://api.anthropic.com/v1/messages',
      {
        method: 'POST',
      headers: {
        'content-type':
            'application/json',
          'x-api-key': apiKey,
          'anthropic-version':
            '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model:
            'claude-sonnet-4-20250514',
          max_tokens: 300,
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: 'user',
              content: description,
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const errorText =
        await response.text();
      console.error('MEAL PARSE ERROR:', JSON.stringify(errorText));
      console.error('API STATUS:', response.status);
      throw new Error(
        `Claude API error (${response.status}): ${errorText}`,
      );
    }

    const result =
      await response.json();

    const textContent =
      result?.content?.[0]?.text;

    if (!textContent) {
      throw new Error(
        'Claude returned empty response',
      );
    }

    let parsed: any;

    try {
      parsed = JSON.parse(textContent);
    } catch {
      throw new Error(
        'Claude response was not valid JSON',
      );
    }

    return {
      meal_name:
        parsed?.meal_name ||
        description.trim(),
      calories: safeNumber(
        parsed?.calories,
      ),
      protein: safeNumber(
        parsed?.protein,
      ),
      carbs: safeNumber(parsed?.carbs),
      fats: safeNumber(parsed?.fats),
      fiber:
        safeNumber(parsed?.fiber) || 0,
      meal_type: sanitizeMealType(
        parsed?.meal_type,
      ),
    };
  } catch (error) {
    console.error('MEAL PARSE FETCH FAILED:', JSON.stringify(error));
    return null;
  }
}

export async function parseMeal(
  description: string,
): Promise<ParsedMealResult> {
  const normalized =
    normalizeQuery(description);

  const localParsed =
    parseMultipleFoods(normalized);

  const allItemsFound =
    localParsed.totalCount > 0 &&
    localParsed.parsedCount ===
      localParsed.totalCount;

  if (allItemsFound) {
    return {
      items: localParsed.items,
      totals: localParsed.totals,
      source: 'database',
    };
  }

  const cacheKey =
    `${AI_CACHE_PREFIX}${normalized}`;
  const cached =
    await AsyncStorage.getItem(
      cacheKey,
    );

  if (cached) {
    const parsedCached =
      JSON.parse(cached);
    return {
      ...parsedCached,
      source: 'ai',
    };
  }

  const ai = await parseMealWithAI(
    description,
  );

  if (!ai) {
    // Fallback to showing manual entry or an error
    // For now, we'll return an empty result which the UI can handle
    return {
      items: [],
      totals: { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 },
      source: 'database', // or a new 'error' source
    };
  }

  if (!ai) {
    // Fallback to showing manual entry or an error
    // For now, we'll return an empty result which the UI can handle
    return {
      items: [],
      totals: { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 },
      source: 'database', // or a new 'error' source
    };
  }

  const aiItem: ParsedMealItem = {
    id: `ai-${normalized}`,
    name: ai.meal_name,
    serving_size: '1 serving',
    quantity: 1,
    confidence: 0.5,
    calories: ai.calories,
    protein: ai.protein,
    carbs: ai.carbs,
    fats: ai.fats,
    fiber: ai.fiber,
  };

  const result: ParsedMealResult = {
    items: [aiItem],
    totals: {
      calories: ai.calories,
      protein: ai.protein,
      carbs: ai.carbs,
      fats: ai.fats,
      fiber: ai.fiber,
    },
    source: 'ai',
  };

  await AsyncStorage.setItem(
    cacheKey,
    JSON.stringify(result),
  );

  return result;
}