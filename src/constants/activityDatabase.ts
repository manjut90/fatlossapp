export interface ActivityEntry {
  id: string;
  name: string;
  aliases: string[];
  met_value: number;
  category: 'cardio' | 'strength' | 'sports' | 'yoga' | 'daily';
  description: string;
}

export const activityDatabase: ActivityEntry[] = [
  // WALKING
  { id: 'walk_slow', name: 'Walking slow', aliases: ['slow walk', 'leisurely walk', 'stroll', 'walk'], met_value: 2.5, category: 'cardio', description: 'Slow pace walking' },
  { id: 'walk_moderate', name: 'Walking moderate', aliases: ['brisk walk', 'moderate walk', 'walking'], met_value: 3.5, category: 'cardio', description: 'Moderate pace walking' },
  { id: 'walk_fast', name: 'Walking fast', aliases: ['fast walk', 'power walk', 'speed walk'], met_value: 4.5, category: 'cardio', description: 'Fast pace walking' },

  // RUNNING
  { id: 'run_5kmh', name: 'Running 5km/h', aliases: ['light jog', 'easy run', 'slow run', 'jogging', 'jog'], met_value: 8, category: 'cardio', description: 'Light jogging pace' },
  { id: 'run_8kmh', name: 'Running 8km/h', aliases: ['moderate run', 'running', 'run'], met_value: 11, category: 'cardio', description: 'Moderate running pace' },
  { id: 'run_10kmh', name: 'Running 10km/h', aliases: ['fast run', 'speed run', 'hard run'], met_value: 13, category: 'cardio', description: 'Fast running pace' },
  { id: 'treadmill', name: 'Treadmill', aliases: ['treadmill run', 'treadmill walk', 'treadmill jog'], met_value: 9, category: 'cardio', description: 'Treadmill running' },
  { id: 'marathon', name: 'Marathon training', aliases: ['long run', 'marathon run'], met_value: 13.5, category: 'cardio', description: 'Marathon pace running' },

  // CYCLING
  { id: 'cycle_slow', name: 'Cycling slow', aliases: ['easy cycling', 'slow cycling', 'leisure cycling'], met_value: 4, category: 'cardio', description: 'Leisurely cycling' },
  { id: 'cycle_moderate', name: 'Cycling moderate', aliases: ['cycling', 'biking', 'bike ride', 'bicycle'], met_value: 6, category: 'cardio', description: 'Moderate cycling' },
  { id: 'cycle_fast', name: 'Cycling fast', aliases: ['fast cycling', 'hard cycling', 'intense cycling'], met_value: 10, category: 'cardio', description: 'Fast cycling' },
  { id: 'stationary_bike', name: 'Stationary bike', aliases: ['exercise bike', 'spin bike', 'indoor cycling', 'spinning'], met_value: 7, category: 'cardio', description: 'Stationary bike cycling' },

  // SWIMMING
  { id: 'swim_slow', name: 'Swimming slow', aliases: ['easy swimming', 'slow swim', 'leisure swim'], met_value: 6, category: 'cardio', description: 'Leisurely swimming' },
  { id: 'swim_laps', name: 'Swimming laps', aliases: ['swimming', 'swim', 'lap swimming', 'pool swim'], met_value: 8, category: 'cardio', description: 'Swimming laps' },
  { id: 'swim_fast', name: 'Swimming fast', aliases: ['hard swimming', 'fast swim', 'competitive swimming'], met_value: 10, category: 'cardio', description: 'Fast swimming' },

  // GYM & WEIGHTS
  { id: 'gym_general', name: 'Gym workout', aliases: ['gym', 'workout', 'gym session', 'weight room', 'lifting'], met_value: 5, category: 'strength', description: 'General gym workout' },
  { id: 'weight_training', name: 'Weight training', aliases: ['weights', 'weight lifting', 'resistance training', 'strength training', 'dumbbell', 'barbell'], met_value: 4, category: 'strength', description: 'Weight lifting' },
  { id: 'bodybuilding', name: 'Bodybuilding', aliases: ['bodybuilding', 'muscle building', 'hypertrophy'], met_value: 6, category: 'strength', description: 'Bodybuilding workout' },
  { id: 'push_ups', name: 'Push ups', aliases: ['pushups', 'push up', 'chest workout', 'press ups'], met_value: 4, category: 'strength', description: 'Push up exercises' },
  { id: 'pull_ups', name: 'Pull ups', aliases: ['pullups', 'pull up', 'chin ups', 'chinups'], met_value: 4, category: 'strength', description: 'Pull up exercises' },
  { id: 'squats', name: 'Squats', aliases: ['squat', 'squatting', 'leg workout', 'leg day'], met_value: 4, category: 'strength', description: 'Squat exercises' },
  { id: 'deadlift', name: 'Deadlift', aliases: ['deadlifts', 'dead lift'], met_value: 6, category: 'strength', description: 'Deadlift exercises' },
  { id: 'abs_workout', name: 'Abs workout', aliases: ['abs', 'core workout', 'core', 'crunches', 'sit ups', 'situps'], met_value: 4, category: 'strength', description: 'Core and abs workout' },
  { id: 'plank', name: 'Plank', aliases: ['planks', 'plank hold', 'plank exercise'], met_value: 3, category: 'strength', description: 'Plank exercises' },

  // HIIT & INTENSE
  { id: 'hiit', name: 'HIIT', aliases: ['hiit', 'high intensity', 'interval training', 'hiit workout'], met_value: 8, category: 'cardio', description: 'High intensity interval training' },
  { id: 'crossfit', name: 'CrossFit', aliases: ['crossfit', 'cross fit', 'wod'], met_value: 8, category: 'cardio', description: 'CrossFit workout' },
  { id: 'circuit_training', name: 'Circuit training', aliases: ['circuit', 'circuit workout', 'functional training'], met_value: 7, category: 'cardio', description: 'Circuit training workout' },
  { id: 'tabata', name: 'Tabata', aliases: ['tabata workout', 'tabata training'], met_value: 8, category: 'cardio', description: 'Tabata interval training' },
  { id: 'skipping', name: 'Skipping rope', aliases: ['jump rope', 'skipping', 'rope skipping', 'skip'], met_value: 10, category: 'cardio', description: 'Skipping rope' },
  { id: 'jumping_jacks', name: 'Jumping jacks', aliases: ['jumping jack', 'star jumps', 'jumping jacks'], met_value: 8, category: 'cardio', description: 'Jumping jack exercises' },
  { id: 'burpees', name: 'Burpees', aliases: ['burpee', 'burpees workout'], met_value: 8, category: 'cardio', description: 'Burpee exercises' },

  // YOGA & MINDFULNESS
  { id: 'yoga', name: 'Yoga', aliases: ['yoga', 'hatha yoga', 'yoga class'], met_value: 3, category: 'yoga', description: 'General yoga practice' },
  { id: 'power_yoga', name: 'Power yoga', aliases: ['power yoga', 'vinyasa yoga', 'ashtanga yoga', 'hot yoga'], met_value: 4, category: 'yoga', description: 'Power or vinyasa yoga' },
  { id: 'meditation', name: 'Meditation', aliases: ['meditation', 'meditate', 'mindfulness'], met_value: 1.5, category: 'yoga', description: 'Meditation practice' },
  { id: 'pilates', name: 'Pilates', aliases: ['pilates', 'pilates class'], met_value: 4, category: 'yoga', description: 'Pilates workout' },
  { id: 'stretching', name: 'Stretching', aliases: ['stretch', 'stretching', 'flexibility', 'cool down'], met_value: 2.5, category: 'yoga', description: 'Stretching exercises' },
  { id: 'pranayama', name: 'Pranayama', aliases: ['pranayama', 'breathing exercise', 'breathwork', 'anulom vilom'], met_value: 2, category: 'yoga', description: 'Breathing exercises' },

  // SPORTS
  { id: 'cricket', name: 'Cricket', aliases: ['cricket', 'cricket practice', 'cricket match', 'batting', 'bowling'], met_value: 5, category: 'sports', description: 'Cricket' },
  { id: 'football', name: 'Football', aliases: ['football', 'soccer', 'football match', 'futsal'], met_value: 7, category: 'sports', description: 'Football or soccer' },
  { id: 'basketball', name: 'Basketball', aliases: ['basketball', 'basketball match', 'hoops'], met_value: 7, category: 'sports', description: 'Basketball' },
  { id: 'badminton', name: 'Badminton', aliases: ['badminton', 'shuttlecock', 'badminton match'], met_value: 6, category: 'sports', description: 'Badminton' },
  { id: 'tennis', name: 'Tennis', aliases: ['tennis', 'lawn tennis', 'tennis match'], met_value: 7, category: 'sports', description: 'Tennis' },
  { id: 'table_tennis', name: 'Table tennis', aliases: ['table tennis', 'ping pong', 'tt'], met_value: 4, category: 'sports', description: 'Table tennis' },
  { id: 'volleyball', name: 'Volleyball', aliases: ['volleyball', 'beach volleyball', 'volleyball match'], met_value: 4, category: 'sports', description: 'Volleyball' },
  { id: 'kabaddi', name: 'Kabaddi', aliases: ['kabaddi', 'kabbadi'], met_value: 7, category: 'sports', description: 'Kabaddi' },
  { id: 'kho_kho', name: 'Kho Kho', aliases: ['kho kho', 'kho-kho'], met_value: 6, category: 'sports', description: 'Kho Kho' },
  { id: 'hockey', name: 'Hockey', aliases: ['hockey', 'field hockey', 'hockey match'], met_value: 8, category: 'sports', description: 'Field hockey' },
  { id: 'boxing', name: 'Boxing', aliases: ['boxing', 'boxing workout', 'punching bag', 'kickboxing'], met_value: 9, category: 'sports', description: 'Boxing workout' },
  { id: 'martial_arts', name: 'Martial arts', aliases: ['martial arts', 'karate', 'taekwondo', 'mma', 'judo', 'kung fu'], met_value: 7, category: 'sports', description: 'Martial arts training' },

  // DANCE & AEROBICS
  { id: 'dance', name: 'Dancing', aliases: ['dance', 'dancing', 'dance workout'], met_value: 5, category: 'cardio', description: 'Dancing' },
  { id: 'zumba', name: 'Zumba', aliases: ['zumba', 'zumba class', 'zumba workout'], met_value: 6, category: 'cardio', description: 'Zumba fitness class' },
  { id: 'aerobics', name: 'Aerobics', aliases: ['aerobics', 'aerobic exercise', 'step aerobics'], met_value: 6, category: 'cardio', description: 'Aerobic exercises' },
  { id: 'bollywood_dance', name: 'Bollywood dance', aliases: ['bollywood dance', 'bollywood', 'dance class'], met_value: 5.5, category: 'cardio', description: 'Bollywood dance workout' },

  // OUTDOOR & ADVENTURE
  { id: 'hiking', name: 'Hiking', aliases: ['hiking', 'trekking', 'trek', 'hill walk', 'nature walk'], met_value: 6, category: 'cardio', description: 'Hiking or trekking' },
  { id: 'stairs', name: 'Climbing stairs', aliases: ['stairs', 'stair climbing', 'steps', 'climbing steps'], met_value: 8, category: 'cardio', description: 'Stair climbing' },
  { id: 'rowing', name: 'Rowing', aliases: ['rowing', 'rowing machine', 'rower', 'kayaking'], met_value: 7, category: 'cardio', description: 'Rowing' },
  { id: 'elliptical', name: 'Elliptical', aliases: ['elliptical', 'cross trainer', 'elliptical machine'], met_value: 6, category: 'cardio', description: 'Elliptical machine' },

  // DAILY ACTIVITIES
  { id: 'housework', name: 'Housework', aliases: ['cleaning', 'housework', 'household chores', 'mopping', 'sweeping'], met_value: 3, category: 'daily', description: 'Household chores' },
  { id: 'gardening', name: 'Gardening', aliases: ['gardening', 'garden work', 'digging', 'farming'], met_value: 4, category: 'daily', description: 'Gardening activities' },
  { id: 'cooking', name: 'Cooking', aliases: ['cooking', 'kitchen work', 'making food'], met_value: 2, category: 'daily', description: 'Cooking activities' },
];

export const activityById: Record<string, ActivityEntry> = 
  activityDatabase.reduce((acc, activity) => {
    acc[activity.id] = activity;
    return acc;
  }, {} as Record<string, ActivityEntry>);
