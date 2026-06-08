export function calculateBMR({
  weight,
  height,
  gender,
}: any) {
  if (
    gender === 'Female'
  ) {
    return (
      10 * weight +
      6.25 * height -
      161
    );
  }

  return (
    10 * weight +
    6.25 * height +
    5
  );
}

export function getActivityMultiplier(
  activity: string
) {
  switch (activity) {
    case 'Sedentary':
      return 1.2;

    case 'Lightly Active':
      return 1.375;

    case 'Moderately Active':
      return 1.55;

    case 'Very Active':
      return 1.725;

    default:
      return 1.4;
  }
}

export function calculateTDEE({
  bmr,
  activityLevel,
}: any) {
  return Math.round(
    bmr *
      getActivityMultiplier(
        activityLevel
      )
  );
}

export function calculateGoalCalories({
  tdee,
  goal,
}: any) {
  if (
    goal === 'fat_loss'
  ) {
    return tdee - 450;
  }

  if (
    goal ===
    'muscle_gain'
  ) {
    return tdee + 250;
  }

  return tdee;
}

export function calculateMacros({
  calories,
  weight,
  goal,
}: any) {
  let protein =
    weight * 2.2;

  let fats =
    weight * 0.8;

  if (
    goal ===
    'muscle_gain'
  ) {
    protein =
      weight * 2.4;

    fats =
      weight * 1;
  }

  const proteinCalories =
    protein * 4;

  const fatCalories =
    fats * 9;

  const carbs =
    (calories -
      proteinCalories -
      fatCalories) /
    4;

  return {
    protein:
      Math.round(protein),

    fats:
      Math.round(fats),

    carbs:
      Math.round(carbs),
  };
}

export function calculateBMI({
  weight,
  height,
}: any) {
  const heightMeters =
    height / 100;

  return (
    weight /
    (
      heightMeters *
      heightMeters
    )
  ).toFixed(1);
}

export function calculateFitnessScore(
  {
    bmi,
    activityLevel,
    trainingExperience,
  }: any
) {
  let score = 65;

  /* BMI */

  if (
    bmi >= 20 &&
    bmi <= 25
  ) {
    score += 10;
  }

  /* ACTIVITY */

  if (
    activityLevel ===
    'Very Active'
  ) {
    score += 12;
  }

  if (
    activityLevel ===
    'Moderately Active'
  ) {
    score += 8;
  }

  /* TRAINING */

  if (
    trainingExperience ===
    'Advanced'
  ) {
    score += 10;
  }

  if (
    trainingExperience ===
    'Intermediate'
  ) {
    score += 6;
  }

  return Math.min(
    100,
    Math.round(score)
  );
}

export function generateAISummary(
  {
    goal,
    bmi,
    activityLevel,
    score,
  }: any
) {
  if (score >= 85) {
    return 'Your metabolic profile and training consistency indicate strong long-term physique optimization potential.';
  }

  if (
    goal === 'fat_loss'
  ) {
    return 'Current body composition trends indicate high potential for sustainable fat reduction and improved metabolic efficiency.';
  }

  if (
    goal ===
    'muscle_gain'
  ) {
    return 'Your recovery capacity and activity profile support strong lean muscle development potential.';
  }

  return 'Your current physiological profile supports steady improvements in strength, energy, and body composition.';
}