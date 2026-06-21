import { supabase } from './supabase';
import { getUserTargets } from '../utils/healthCalculations';
import { awardCheckInXp } from './xp';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MissionDetail {
  title: string;
  completed: boolean;
}

export interface DailyFocus {
  workout_focus: string;
  nutrition_focus: string;
  recovery_focus: string;
}

export interface DailyMissionsJson {
  movement: MissionDetail;
  nutrition: MissionDetail;
  recovery: MissionDetail;
  daily_focus?: DailyFocus;
}

export interface DailyMissionRecord {
  id: string;
  user_id: string;
  date: string;
  coach_message: string;
  missions_json: DailyMissionsJson;
  xp_reward: number;
  completed_count: number;
  total_count: number;
  generated_at: string;
  created_at: string;
}

interface MissionTemplate {
  title: string;
  type: 'movement' | 'nutrition' | 'recovery';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  categories: string[];
}

const TEMPLATES: MissionTemplate[] = [
  // MOVEMENT
  { title: 'Walk 15 minutes after lunch', type: 'movement', difficulty: 'Easy', categories: ['walking', 'low_impact'] },
  { title: 'Take 5,000 steps today', type: 'movement', difficulty: 'Easy', categories: ['walking', 'steps', 'low_impact'] },
  { title: 'Gentle stretching for 10 minutes', type: 'movement', difficulty: 'Easy', categories: ['stretching', 'low_impact'] },
  { title: 'Do 10 gentle bodyweight squats', type: 'movement', difficulty: 'Easy', categories: ['squats', 'knees', 'low_impact'] },
  
  { title: 'Walk 25 minutes after lunch', type: 'movement', difficulty: 'Medium', categories: ['walking', 'low_impact'] },
  { title: 'Take 8,000 steps today', type: 'movement', difficulty: 'Medium', categories: ['walking', 'steps', 'low_impact'] },
  { title: 'Complete 30 minutes of stationary cycling', type: 'movement', difficulty: 'Medium', categories: ['cycling', 'low_impact'] },
  { title: 'Light yoga session for 20 minutes', type: 'movement', difficulty: 'Medium', categories: ['yoga', 'low_impact'] },
  { title: 'Complete a 30-minute upper body routine', type: 'movement', difficulty: 'Medium', categories: ['strength'] },
  
  { title: 'Take 10,000 steps today', type: 'movement', difficulty: 'Hard', categories: ['walking', 'steps'] },
  { title: 'Run for 20 minutes outside', type: 'movement', difficulty: 'Hard', categories: ['running', 'high_impact'] },
  { title: 'Complete 45 minutes strength workout', type: 'movement', difficulty: 'Hard', categories: ['strength', 'high_impact'] },
  { title: 'Jump rope for 15 minutes', type: 'movement', difficulty: 'Hard', categories: ['jumping', 'high_impact'] },
  { title: 'Complete 25 minutes of HIIT cardio', type: 'movement', difficulty: 'Hard', categories: ['hiit', 'high_impact'] },

  // NUTRITION
  { title: 'Drink 2.0 liters of water today', type: 'nutrition', difficulty: 'Easy', categories: ['water'] },
  { title: 'Log at least 1 meal in your journal', type: 'nutrition', difficulty: 'Easy', categories: ['logging'] },
  { title: 'Eat 1 serving of green vegetables', type: 'nutrition', difficulty: 'Easy', categories: ['greens'] },
  { title: 'Avoid sugary soda and drinks today', type: 'nutrition', difficulty: 'Easy', categories: ['sugar'] },
  
  { title: 'Hit your protein target of {protein}g', type: 'nutrition', difficulty: 'Medium', categories: ['protein'] },
  { title: 'Stay under your calorie target of {calories} kcal', type: 'nutrition', difficulty: 'Medium', categories: ['calories'] },
  { title: 'Drink {water}L of water today', type: 'nutrition', difficulty: 'Medium', categories: ['water'] },
  { title: 'Log all your meals in the app today', type: 'nutrition', difficulty: 'Medium', categories: ['logging'] },
  
  { title: 'Log all meals and stay within 100 kcal of target', type: 'nutrition', difficulty: 'Hard', categories: ['logging', 'calories'] },
  { title: 'Hit protein target ({protein}g) and stay under calories', type: 'nutrition', difficulty: 'Hard', categories: ['protein', 'calories'] },
  { title: 'Drink 3.0 liters of water today', type: 'nutrition', difficulty: 'Hard', categories: ['water'] },
  { title: 'Consume {fiber}g of dietary fiber today', type: 'nutrition', difficulty: 'Hard', categories: ['fiber'] },

  // RECOVERY
  { title: 'Avoid screens 15 minutes before bed', type: 'recovery', difficulty: 'Easy', categories: ['screens', 'sleep'] },
  { title: 'Gentle stretching for 10 minutes', type: 'recovery', difficulty: 'Easy', categories: ['stretching'] },
  { title: 'Spend 5 minutes doing deep breathing exercises', type: 'recovery', difficulty: 'Easy', categories: ['breathing'] },
  
  { title: 'Sleep before your target bedtime of {bedtime}', type: 'recovery', difficulty: 'Medium', categories: ['sleep'] },
  { title: 'Take a 15-minute recovery walk', type: 'recovery', difficulty: 'Medium', categories: ['walking', 'low_impact'] },
  { title: 'Avoid screens 30 minutes before bed', type: 'recovery', difficulty: 'Medium', categories: ['screens', 'sleep'] },
  
  { title: 'Sleep at least {sleep} hours tonight', type: 'recovery', difficulty: 'Hard', categories: ['sleep'] },
  { title: 'Avoid screens 45 minutes before bed', type: 'recovery', difficulty: 'Hard', categories: ['screens', 'sleep'] },
  { title: '30 minutes of deep full body stretching', type: 'recovery', difficulty: 'Hard', categories: ['stretching'] }
];

const FOCUS_CATEGORIES: Record<string, string[]> = {
  // Workout
  "Lower Body": ["squats", "knees", "low_impact", "steps"],
  "Upper Body": ["strength"],
  "Core": ["yoga", "stretching", "low_impact"],
  "Cardio": ["walking", "steps", "cycling", "running", "jumping", "hiit"],
  "Full Body": ["strength", "hiit", "yoga", "stretching", "steps"],
  
  // Nutrition
  "Protein": ["protein"],
  "Calorie Control": ["calories", "logging"],
  "Hydration": ["water"],
  "Fiber": ["fiber"],
  "Log Meals": ["logging"],
  
  // Recovery
  "Sleep": ["sleep", "screens"],
  "Screen Time": ["screens", "sleep"],
  "Stretching": ["stretching"],
  "Breathing": ["breathing"]
};

export function generateDailyFocus(userId: string, date: string): DailyFocus {
  const workoutFocuses = ["Lower Body", "Upper Body", "Core", "Cardio", "Full Body"];
  const nutritionFocuses = ["Protein", "Calorie Control", "Hydration", "Fiber", "Log Meals"];
  const recoveryFocuses = ["Sleep", "Screen Time", "Stretching", "Breathing", "Hydration"];

  const key = `${userId}_${date}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  return {
    workout_focus: workoutFocuses[hash % workoutFocuses.length],
    nutrition_focus: nutritionFocuses[hash % nutritionFocuses.length],
    recovery_focus: recoveryFocuses[hash % recoveryFocuses.length]
  };
}

export const MissionGenerationService = {
  /**
   * Helper to parse injuries/limitations text into category exclusions
   */
  getExcludedCategories(injuriesText: string | null): string[] {
    const list: string[] = [];
    if (!injuriesText) return list;
    const lower = injuriesText.toLowerCase();
    if (lower.includes('knee') || lower.includes('joint') || lower.includes('arthritis')) {
      list.push('jumping', 'knees', 'high_impact');
    }
    if (lower.includes('feet') || lower.includes('foot') || lower.includes('ankle') || lower.includes('flat feet')) {
      list.push('running', 'jumping', 'high_impact');
    }
    if (lower.includes('back') || lower.includes('spine') || lower.includes('lower back')) {
      list.push('high_impact', 'jumping', 'strength_heavy');
    }
    if (lower.includes('mobility') || lower.includes('restriction') || lower.includes('limit')) {
      list.push('high_impact');
    }
    return list;
  },

  /**
   * Fetch or initialize user constraints
   */
  async getOrSyncUserConstraints(userId: string, injuriesText: string | null): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('user_constraints')
        .select('excluded_categories')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        return data.excluded_categories || [];
      }

      // If no constraint record exists, insert one from the profile text
      const excluded = this.getExcludedCategories(injuriesText);
      await supabase.from('user_constraints').insert({
        user_id: userId,
        constraint_type: 'onboarding_injury',
        excluded_categories: excluded,
        notes: injuriesText,
      });

      return excluded;
    } catch (err) {
      console.error('Error in getOrSyncUserConstraints:', err);
      return this.getExcludedCategories(injuriesText);
    }
  },

  /**
   * Fetch or initialize behavioral generation context
   */
  async getMissionContext(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('mission_generation_context')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        return data;
      }

      const { data: newContext, error: insertError } = await supabase
        .from('mission_generation_context')
        .insert({
          user_id: userId,
          completion_rate: 0.0,
          consistency_score: 0,
          difficulty_tolerance: 'Easy',
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return newContext;
    } catch (err) {
      console.error('Error fetching mission context:', err);
      return { difficulty_tolerance: 'Easy', completion_rate: 0.0 };
    }
  },

  /**
   * Generate missions based on rules and constraints
   */
  async generateDailyMission(userId: string, date: string): Promise<DailyMissionRecord> {
    try {
      // 1. Fetch profile & targets
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      const targets = getUserTargets(profile);

      // 2. Fetch constraints & context
      const constraints = await this.getOrSyncUserConstraints(userId, profile.injuries_limitations);
      const context = await this.getMissionContext(userId);
      const difficulty = context.difficulty_tolerance || 'Easy';

      // Generate focus deterministically
      const focus = generateDailyFocus(userId, date);

      // 3. Filter templates by type, difficulty, constraints & focus
      const filterTemplates = (type: 'movement' | 'nutrition' | 'recovery') => {
        // filter by type
        let list = TEMPLATES.filter(t => t.type === type);

        // filter by constraints
        if (constraints.length > 0) {
          list = list.filter(t => !t.categories.some(cat => constraints.includes(cat)));
        }

        // filter by focus categories
        const focusName = type === 'movement' 
          ? focus.workout_focus 
          : type === 'nutrition' 
            ? focus.nutrition_focus 
            : focus.recovery_focus;
        const focusCats = FOCUS_CATEGORIES[focusName] || [];
        if (focusCats.length > 0) {
          const focusList = list.filter(t => t.categories.some(cat => focusCats.includes(cat)));
          if (focusList.length > 0) {
            list = focusList;
          }
        }

        // filter by difficulty
        let diffList = list.filter(t => t.difficulty === difficulty);
        
        // fallback if no templates left for difficulty
        if (diffList.length === 0) {
          diffList = list.filter(t => t.difficulty === 'Easy');
        }
        if (diffList.length === 0) {
          diffList = list; // absolute fallback
        }
        
        return diffList;
      };

      const movements = filterTemplates('movement');
      const nutritions = filterTemplates('nutrition');
      const recoveries = filterTemplates('recovery');

      // 4. Choose one random template per type
      const chooseRandom = (arr: MissionTemplate[]) => arr[Math.floor(Math.random() * arr.length)];

      const movTpl = chooseRandom(movements);
      const nutTpl = chooseRandom(nutritions);
      const recTpl = chooseRandom(recoveries);

      // Helper to format string variables
      const formatTitle = (tpl: MissionTemplate) => {
        let t = tpl.title;
        t = t.replace('{protein}', String(targets.protein));
        t = t.replace('{calories}', String(targets.calories));
        t = t.replace('{water}', String(targets.water));
        t = t.replace('{fiber}', String(targets.fiber));
        t = t.replace('{sleep}', String(targets.sleep));
        
        // Target bedtime calculation (e.g. 10:30 PM)
        let bedtime = '11:00 PM';
        if (profile.sleep_hours === '8h+') bedtime = '10:30 PM';
        else if (profile.sleep_hours === 'Under 5h') bedtime = '11:45 PM';
        t = t.replace('{bedtime}', bedtime);
        
        return t;
      };

      // Check if today's workout has already been generated and cached in AsyncStorage
      let workoutTitle: string | null = null;
      try {
        const cacheKey = `ai_workout_${userId}_${date}`;
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
          const plan = JSON.parse(cached);
          if (plan?.todaysWorkout?.title) {
            workoutTitle = plan.todaysWorkout.title;
          }
        }
      } catch (err) {
        console.error('Error reading cached workout in generateDailyMission:', err);
      }

      const movementTitle = workoutTitle 
        ? `Complete ${workoutTitle} workout`
        : formatTitle(movTpl);

      const missions_json: DailyMissionsJson = {
        movement: { title: movementTitle, completed: false },
        nutrition: { title: formatTitle(nutTpl), completed: false },
        recovery: { title: formatTitle(recTpl), completed: false },
        daily_focus: focus
      };

      // 5. Construct Coach Message
      const name = profile.full_name?.split(' ')[0] || 'Champ';
      const scheduleText = profile.schedule_pref === 'morning' 
        ? 'morning routines' 
        : profile.schedule_pref === 'evening' 
          ? 'evening workouts' 
          : 'flexible days';

      const coachMessages = [
        `Good morning, ${name}. Today we are focusing on recovery. Since you prefer ${scheduleText}, I've tailored your tasks accordingly.`,
        `Happy morning, ${name}! Your daily missions are ready. Focus on protein consistency and hydration today.`,
        `Let's make today count, ${name}! Focus on moving early and hitting recovery targets tonight.`
      ];
      const coach_message = coachMessages[Math.floor(Math.random() * coachMessages.length)];

      // 6. Save or update record in daily_missions
      const { data: saved, error: saveError } = await supabase
        .from('daily_missions')
        .insert({
          user_id: userId,
          date,
          coach_message,
          missions_json,
          xp_reward: 50,
          completed_count: 0,
          total_count: 3,
          generated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (saveError) {
        // If unique constraint fires, fetch the existing record instead of throwing
        if (saveError.code === '23505') {
          const { data: existing } = await supabase
            .from('daily_missions')
            .select('*')
            .eq('user_id', userId)
            .eq('date', date)
            .single();
          if (existing) return existing;
        }
        throw saveError;
      }

      return saved;
    } catch (err) {
      console.error('Error generating daily mission:', err);
      // Absolute fallback if everything fails
      const fallback: DailyMissionRecord = {
        id: 'fallback-id',
        user_id: userId,
        date,
        coach_message: `Let's keep building momentum today! Here are your beginner missions.`,
        missions_json: {
          movement: { title: 'Walk 15 minutes after lunch', completed: false },
          nutrition: { title: 'Drink 2.0L of water today', completed: false },
          recovery: { title: 'Avoid screens 15 minutes before bed', completed: false }
        },
        xp_reward: 50,
        completed_count: 0,
        total_count: 3,
        generated_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      return fallback;
    }
  },

  /**
   * Update the movement mission title with the generated workout title
   */
  async updateMovementMissionTitle(userId: string, workoutTitle: string): Promise<DailyMissionRecord | null> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: mission, error: fetchError } = await supabase
        .from('daily_missions')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .maybeSingle();

      if (fetchError || !mission) {
        console.error('[updateMovementMissionTitle] fetch error or no mission:', fetchError);
        return null;
      }

      const json = mission.missions_json as DailyMissionsJson;
      json.movement.title = `Complete ${workoutTitle} workout`;

      const { data: updated, error: updateError } = await supabase
        .from('daily_missions')
        .update({
          missions_json: json
        })
        .eq('id', mission.id)
        .select()
        .single();

      if (updateError) {
        console.error('[updateMovementMissionTitle] update error:', updateError);
        return null;
      }

      return updated;
    } catch (err) {
      console.error('[updateMovementMissionTitle] error:', err);
      return null;
    }
  },

  /**
   * Save mission record directly
   */
  async saveMission(mission: DailyMissionRecord): Promise<void> {
    const { error } = await supabase
      .from('daily_missions')
      .update({
        missions_json: mission.missions_json,
        completed_count: mission.completed_count,
      })
      .eq('id', mission.id);

    if (error) throw error;
  },

  /**
   * Get mission record for today, generating one if not exists
   */
  async getTodaysMission(userId: string): Promise<DailyMissionRecord> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('daily_missions')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();

    if (error) {
      console.error('Error fetching today\'s mission:', error);
    }

    if (data) {
      return data;
    }

    return this.generateDailyMission(userId, today);
  },

  /**
   * Update completion status of a specific daily mission
   */
  async updateMissionCompletion(
    userId: string,
    missionId: string,
    type: 'movement' | 'nutrition' | 'recovery',
    completed: boolean
  ): Promise<DailyMissionRecord> {
    // 1. Fetch the mission
    const { data: mission, error: fetchError } = await supabase
      .from('daily_missions')
      .select('*')
      .eq('id', missionId)
      .single();

    if (fetchError) throw fetchError;

    const json = mission.missions_json as DailyMissionsJson;
    const oldCompleted = json[type].completed;
    
    // If no change, return immediately
    if (oldCompleted === completed) {
      return mission;
    }

    // Update json
    json[type].completed = completed;

    // Calculate completed count
    const completed_count = (json.movement.completed ? 1 : 0) +
                            (json.nutrition.completed ? 1 : 0) +
                            (json.recovery.completed ? 1 : 0);

    // Save updated record
    const { data: updated, error: updateError } = await supabase
      .from('daily_missions')
      .update({
        missions_json: json,
        completed_count,
      })
      .eq('id', missionId)
      .select()
      .single();

    if (updateError) throw updateError;

    // 2. Award XP if transitioning to completed: true
    if (completed) {
      try {
        // Insert completion record to prevent duplicate awards
        const { error: completeInsertError } = await supabase
          .from('mission_completions')
          .insert({
            user_id: userId,
            mission_id: missionId,
            mission_type: type,
            xp_awarded: 15,
          });

        // If insert succeeds (not a duplicate), award XP
        if (!completeInsertError) {
          await awardCheckInXp(15, `${type.toUpperCase()} Mission Completed`, userId);

          // If all completed, award the 5 XP bonus
          if (completed_count === 3) {
            await supabase.from('mission_completions').insert({
              user_id: userId,
              mission_id: missionId,
              mission_type: 'all_bonus',
              xp_awarded: 5,
            });
            await awardCheckInXp(5, 'All Daily Missions Complete Bonus', userId);
          }
        }
      } catch (err) {
        console.error('Error awarding mission XP:', err);
      }
    }

    // 3. Trigger behavioral learning context update asynchronously
    this.updateBehavioralIntelligence(userId).catch(console.error);

    return updated;
  },

  /**
   * Infer and update behavioral stats automatically based on history
   */
  async updateBehavioralIntelligence(userId: string): Promise<void> {
    try {
      const { data: history, error: historyError } = await supabase
        .from('daily_missions')
        .select('completed_count, total_count')
        .eq('user_id', userId)
        .limit(30);

      if (historyError || !history.length) return;

      const totalMissions = history.reduce((sum, m) => sum + m.total_count, 0);
      const completedMissions = history.reduce((sum, m) => sum + m.completed_count, 0);
      const completion_rate = totalMissions > 0 ? (completedMissions / totalMissions) : 0.0;

      // Calculate consistency (number of days with at least 1 completion)
      const consistency_score = history.filter(m => m.completed_count > 0).length;

      // Find average completion hour
      const { data: completions } = await supabase
        .from('mission_completions')
        .select('completed_at')
        .eq('user_id', userId)
        .limit(30);

      let best_completion_time = 'flexible';
      if (completions && completions.length > 0) {
        const hours = completions.map(c => new Date(c.completed_at).getHours());
        const avgHour = hours.reduce((s, h) => s + h, 0) / hours.length;
        best_completion_time = avgHour < 12 ? 'morning' : avgHour < 18 ? 'evening' : 'flexible';
      }

      // Update difficulty tolerance slowly:
      // If completion rate > 80% on at least 3 logs, scale up. If < 50%, scale down.
      let difficulty_tolerance = 'Easy';
      const pastCount = history.length;
      if (pastCount >= 3) {
        if (completion_rate > 0.8) {
          difficulty_tolerance = 'Hard'; // scale up
        } else if (completion_rate >= 0.5) {
          difficulty_tolerance = 'Medium';
        } else {
          difficulty_tolerance = 'Easy'; // scale down
        }
      }

      await supabase
        .from('mission_generation_context')
        .update({
          completion_rate,
          consistency_score,
          best_completion_time,
          difficulty_tolerance,
          last_generated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

    } catch (err) {
      console.error('Error updating behavioral context:', err);
    }
  }
};
