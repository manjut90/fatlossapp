type ParsedResult = {
  type:
    | 'water'
    | 'sleep'
    | 'food'
    | 'activity'
    | null;

  value: any;
};

export function parseChatInput(
  input: string,
): ParsedResult {
  const text =
    input.toLowerCase();

  // ======================================================
  // WATER
  // ======================================================

  if (
    text.includes('water') ||
    text.includes('ml') ||
    text.includes('litre') ||
    text.includes('liter')
  ) {
    const numberMatch =
      text.match(/\d+/);

    const amount = numberMatch
      ? parseInt(
          numberMatch[0],
        )
      : 250;

    return {
      type: 'water',
      value: amount,
    };
  }

  // ======================================================
  // SLEEP
  // ======================================================

  if (
    text.includes('sleep') ||
    text.includes('slept')
  ) {
    const numberMatch =
      text.match(/\d+/);

    const hours = numberMatch
      ? parseInt(
          numberMatch[0],
        )
      : 7;

    return {
      type: 'sleep',
      value: hours,
    };
  }

  // ======================================================
  // ACTIVITY
  // ======================================================

  if (
    text.includes('workout') ||
    text.includes('gym') ||
    text.includes('cycling') ||
    text.includes('run') ||
    text.includes('steps')
  ) {
    return {
      type: 'activity',
      value: input,
    };
  }

  // ======================================================
  // FOOD
  // ======================================================

  if (
    text.includes('ate') ||
    text.includes('food') ||
    text.includes('meal') ||
    text.includes('protein') ||
    text.includes('chicken') ||
    text.includes('rice') ||
    text.includes('eggs')
  ) {
    return {
      type: 'food',
      value: input,
    };
  }

  // ======================================================
  // UNKNOWN
  // ======================================================

  return {
    type: null,
    value: null,
  };
}