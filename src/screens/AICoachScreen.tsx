import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Modal,
  Animated,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Dumbbell,
  Utensils,
  ChevronRight,
  Zap,
  Leaf,
  Drumstick,
  Check,
  BookOpen,
  RefreshCw,
  RotateCcw,
  Trophy,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useHealth } from '../context/HealthContext';
import { addActivity } from '../services/activity';
import { addFood } from '../services/food';
import { supabase } from '../services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  calculateBMR,
  calculateTDEE,
  calculateGoalCalories,
  calculateMacros,
} from '../utils/healthCalculations';

// =====================================================
// REQUIRED: Add this to your .env file in project root
// EXPO_PUBLIC_OPENROUTER_API_KEY=xxxxxxxxxxxxxxx
// Make sure .env is in .gitignore
// =====================================================

// =================================================================================
// MEAL PLAN GENERATION
// =================================================================================

const vegMealPlan = [ 
   { id:1, time:'Breakfast', title:'Moong Dal Chilla with Mint Chutney', description:'High protein savoury crepes. 22g protein, gut-friendly, zero refined carbs.', type:'veg', calories:320, protein:22, carbs:35, fats:8, fiber:6, recipe:{prepTime:'10 min',cookTime:'15 min',ingredients:['1 cup moong dal (soaked 4hrs)','1 green chilli','1/2 tsp cumin','Salt to taste','1 tsp ghee','Fresh coriander'],steps:['Blend soaked dal with chilli and cumin','Make thin crepes on hot tawa with minimal ghee','Serve with mint-coriander chutney']} }, 
   { id:2, time:'Morning Snack', title:'Handful of Soaked Almonds & 1 Banana', description:'Brain fuel + potassium. Perfect pre-workout or mid-morning energy.', type:'veg', calories:180, protein:5, carbs:28, fats:9, fiber:3, recipe:{prepTime:'5 min',cookTime:'0 min',ingredients:['8-10 soaked almonds (overnight)','1 ripe banana'],steps:['Peel soaked almonds','Eat with banana for sustained energy']} }, 
   { id:3, time:'Lunch', title:'Dal Tadka + Brown Rice + Cucumber Raita', description:'Complete amino acid profile. The gold standard Indian fitness meal.', type:'veg', calories:520, protein:28, carbs:72, fats:10, fiber:12, recipe:{prepTime:'15 min',cookTime:'25 min',ingredients:['1 cup toor dal','1 cup brown rice','1 tomato','1 tsp turmeric','1 tsp ghee','Mustard seeds','Curry leaves','1 cup curd for raita','1 cucumber'],steps:['Pressure cook dal with turmeric and salt','Prepare tadka with ghee mustard seeds curry leaves tomato','Mix tadka into cooked dal','Serve with brown rice and cucumber raita']} }, 
   { id:4, time:'Evening Snack', title:'Sprouts Chaat with Lemon & Chilli', description:'Living food. Enzymes, protein and fibre that boost metabolism.', type:'veg', calories:160, protein:10, carbs:24, fats:2, fiber:8, recipe:{prepTime:'5 min',cookTime:'0 min',ingredients:['1 cup mixed sprouts','1/2 onion chopped','1 tomato chopped','Lemon juice','Chaat masala','Green chilli optional'],steps:['Mix all ingredients','Squeeze lemon generously','Add chaat masala and serve immediately']} }, 
   { id:5, time:'Dinner', title:'Palak Paneer + 2 Multigrain Rotis', description:'Iron, calcium and protein. Light yet deeply nourishing end-of-day meal.', type:'veg', calories:440, protein:24, carbs:48, fats:14, fiber:9, recipe:{prepTime:'10 min',cookTime:'20 min',ingredients:['200g paneer','2 bunches palak (spinach)','2 tomatoes','1 onion','Ginger garlic paste','1 tsp ghee','Garam masala','2 multigrain rotis'],steps:['Blanch and blend palak','Sauté onion ginger garlic tomato in ghee','Add blended palak and cook 5 mins','Add cubed paneer and simmer 5 mins','Serve with multigrain rotis']} }, 
 ];

const nonVegMealPlan = [ 
   { id:1, time:'Breakfast', title:'Egg White Omelette with Vegetables & Toast', description:'30g protein at breakfast sets your metabolism for the entire day.', type:'non-veg', calories:380, protein:30, carbs:32, fats:10, fiber:4, recipe:{prepTime:'5 min',cookTime:'10 min',ingredients:['4 egg whites + 1 whole egg','1/2 onion chopped','1/2 capsicum','Handful spinach','Salt pepper turmeric','1 slice multigrain bread','1 tsp oil'],steps:['Beat eggs with salt pepper turmeric','Sauté vegetables in pan','Pour eggs over vegetables','Cook on medium heat fold and serve with toast']} }, 
   { id:2, time:'Morning Snack', title:'Greek Yogurt with Flaxseeds & Honey', description:'Probiotic power. Gut health drives fat loss more than most people realise.', type:'non-veg', calories:190, protein:14, carbs:22, fats:5, fiber:3, recipe:{prepTime:'2 min',cookTime:'0 min',ingredients:['150g Greek yogurt','1 tbsp flaxseeds','1 tsp honey','Pinch of cinnamon'],steps:['Add flaxseeds to yogurt','Drizzle honey on top','Sprinkle cinnamon and eat immediately']} }, 
   { id:3, time:'Lunch', title:'Grilled Chicken Breast + Dal + Brown Rice', description:'The holy trinity of Indian fitness nutrition. 45g protein per serving.', type:'non-veg', calories:580, protein:46, carbs:65, fats:10, fiber:8, recipe:{prepTime:'15 min',cookTime:'25 min',ingredients:['150g chicken breast','1 tsp olive oil','Lemon juice','Jeera coriander pepper','1 cup masoor dal','1 cup brown rice','Turmeric salt'],steps:['Marinate chicken in lemon oil spices 30 mins','Grill on tawa or oven 180C for 20 mins','Cook dal with turmeric salt','Serve grilled chicken over dal and rice']} }, 
   { id:4, time:'Evening Snack', title:'Boiled Eggs & Cucumber Slices', description:'Portable. Perfect. Zero processed ingredients. Pure muscle food.', type:'non-veg', calories:160, protein:14, carbs:6, fats:9, fiber:2, recipe:{prepTime:'2 min',cookTime:'10 min',ingredients:['2 boiled eggs','1 cucumber','Salt pepper chilli flakes'],steps:['Boil eggs 8-10 mins for hard boiled','Slice cucumber','Season eggs with salt pepper','Eat together as a balanced snack']} }, 
   { id:5, time:'Dinner', title:'Fish Curry + 2 Rotis + Salad', description:'Omega-3 rich dinner. Reduces inflammation and optimises overnight recovery.', type:'non-veg', calories:480, protein:38, carbs:44, fats:12, fiber:6, recipe:{prepTime:'10 min',cookTime:'20 min',ingredients:['200g rohu or surmai fish','2 tomatoes','1 onion','Ginger garlic paste','Turmeric coriander cumin','Mustard oil','2 wheat rotis','Mixed salad'],steps:['Marinate fish in turmeric salt 10 mins','Sauté onion ginger garlic in mustard oil','Add tomatoes and spices cook 5 mins','Add fish and cook covered 10 mins','Serve with rotis and fresh salad']} }, 
 ];

function parseHealthConditions(raw: any): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(s => String(s).toLowerCase());
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(s => String(s).toLowerCase());
    } catch {}
    return raw.split(',').map(s => s.trim().toLowerCase());
  }
  return [];
}

function generateMealPlan(profile) {
  if (!profile) {
    return nonVegMealPlan.map(meal => ({
      ...meal,
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      fiber: 0,
    }));
  }

  const weight = parseFloat(profile?.weight) || 70;
  const height = parseFloat(profile?.height) || 170;
  const gender = profile?.sex || 'Male';
  const activityLevel = profile?.activity_level || 'Moderately Active';
  const goal = profile?.goal || 'fitness';

  const conditions = parseHealthConditions(profile?.health_conditions);
  const isVegetarian = conditions.includes('vegetarian');

  // Always include BOTH veg and non-veg in fallback so filters work
  const basePlan = [...vegMealPlan, ...nonVegMealPlan];

  const bmr = calculateBMR({
    weight,
    height,
    gender,
  });

  const tdee = calculateTDEE({
    bmr,
    activityLevel,
  });

  const targetCalories = calculateGoalCalories({
    tdee,
    goal,
  });

  const macros = calculateMacros({
    calories: targetCalories,
    weight,
    goal,
  });

  const calorieDistribution = {
    Breakfast: 0.25,
    'Morning Snack': 0.1,
    Lunch: 0.3,
    'Evening Snack': 0.1,
    Dinner: 0.25,
  };

  const macroDistribution = {
    Breakfast: { p: 0.25, c: 0.3, f: 0.2 },
    'Morning Snack': { p: 0.1, c: 0.1, f: 0.1 },
    Lunch: { p: 0.35, c: 0.3, f: 0.3 },
    'Evening Snack': { p: 0.1, c: 0.1, f: 0.1 },
    Dinner: { p: 0.2, c: 0.2, f: 0.3 },
  };

  return basePlan.map((meal) => {
    const mealCalories = Math.round(
      targetCalories * calorieDistribution[meal.time]
    );
    const mealMacros = {
      protein: Math.round(macros.protein * macroDistribution[meal.time].p),
      carbs: Math.round(macros.carbs * macroDistribution[meal.time].c),
      fats: Math.round(macros.fats * macroDistribution[meal.time].f),
    };

    return {
      ...meal,
      calories: mealCalories,
      protein: mealMacros.protein,
      carbs: mealMacros.carbs,
      fats: mealMacros.fats,
      fiber: Math.round(mealCalories / 30), // Estimate fiber
      type: meal.type, // keep original type from the meal object
      recipe: meal.recipe || {
        prepTime: '5 mins',
        cookTime: '10 mins',
        ingredients: ['See full recipe online'],
        steps: ['Prepare ingredients', 'Cook as directed', 'Serve and enjoy'],
      },
    };
  });
}

// =================================================================================
// WORKOUT PLAN GENERATION
// =================================================================================

const workoutDatabase = {
  fat_loss: {
    Beginner: {
      title: 'Full Body Fat Burn',
      description:
        'Focus on large muscle groups with compound movements to maximize calorie burn and build a solid foundation.',
      duration: '35-45 min',
      intensity: 'Moderate',
      exercises: {
        gym: [
          { name: 'Goblet Squat', sets: '3', reps: '12-15' },
          { name: 'Push-up', sets: '3', reps: '10-12' },
          { name: 'DB Romanian Deadlift', sets: '3', reps: '12' },
          { name: 'Mountain Climbers', sets: '3', reps: '40sec' },
        ],
        home: [
          { name: 'Bodyweight Squat', sets: '3', reps: '15-20' },
          { name: 'Incline Push-up', sets: '3', reps: '10-15' },
          { name: 'Glute Bridge', sets: '3', reps: '15' },
          { name: 'Jumping Jacks', sets: '3', reps: '45sec' },
        ],
      },
    },
    Intermediate: {
      title: 'HIIT Metabolic Circuit',
      description:
        'This high-intensity circuit is designed to elevate your heart rate and boost your metabolism for hours post-workout.',
      duration: '40-50 min',
      intensity: 'High',
      exercises: {
        gym: [
          { name: 'Barbell Back Squat', sets: '4', reps: '10' },
          { name: 'KB Swings', sets: '4', reps: '15' },
          { name: 'DB Push Press', sets: '3', reps: '10' },
          { name: 'Burpee to Pull-up', sets: '3', reps: '8' },
        ],
        home: [
          { name: 'DB Goblet Squat', sets: '4', reps: '12' },
          { name: 'DB Swings', sets: '4', reps: '15' },
          { name: 'DB Push Press', sets: '3', reps: '10' },
          { name: 'Burpees', sets: '3', reps: '10' },
        ],
      },
    },
    Advanced: {
      title: 'Conjugate Fat Loss Protocol',
      description:
        'Combine max effort lifts with explosive movements to build strength and power while stripping body fat.',
      duration: '55-65 min',
      intensity: 'Very High',
      exercises: {
        gym: [
          { name: 'Trap Bar Deadlift', sets: '5', reps: '5 @80% 1RM' },
          { name: 'Weighted Box Jump', sets: '5', reps: '5' },
          { name: 'Incline DB Press', sets: '4', reps: '8-10' },
          { name: 'Sled Push', sets: '4', reps: '20m' },
        ],
        home: [
          { name: 'DB Deadlift', sets: '5', reps: '6-8' },
          { name: 'Tuck Jumps', sets: '5', reps: '8' },
          { name: 'Decline Push-up', sets: '4', reps: '10-12' },
          { name: 'Broad Jump Burpees', sets: '4', reps: '8' },
        ],
      },
    },
  },
  muscle_gain: {
    Beginner: {
      title: 'Full Body Hypertrophy A',
      description:
        'Master the fundamental movement patterns with enough volume to stimulate muscle growth across your entire body.',
      duration: '45-55 min',
      intensity: 'Moderate',
      exercises: {
        gym: [
          { name: 'Barbell Squat', sets: '3', reps: '8-10' },
          { name: 'DB Bench Press', sets: '3', reps: '10-12' },
          { name: 'Seated Cable Row', sets: '3', reps: '10-12' },
          { name: 'Overhead Press', sets: '3', reps: '10' },
        ],
        home: [
          { name: 'DB Goblet Squat', sets: '3', reps: '10-12' },
          { name: 'DB Bench Press', sets: '3', reps: '10-12' },
          { name: 'DB Bent-over Row', sets: '3', reps: '10-12' },
          { name: 'DB Overhead Press', sets: '3', reps: '10' },
        ],
      },
    },
    Intermediate: {
      title: 'Push Day — Hypertrophy Focus',
      description:
        'Isolate and overload your chest, shoulders, and triceps with a variety of rep ranges to maximize muscle fiber recruitment.',
      duration: '55-65 min',
      intensity: 'High',
      exercises: {
        gym: [
          { name: 'Incline Barbell Press', sets: '4', reps: '8-10' },
          { name: 'Cable Lateral Raise', sets: '4', reps: '15-20' },
          { name: 'Pec Dec Fly', sets: '3', reps: '12-15' },
          { name: 'Tricep Rope Pushdown', sets: '4', reps: '12-15' },
        ],
        home: [
          { name: 'Incline DB Press', sets: '4', reps: '10-12' },
          { name: 'DB Lateral Raise', sets: '4', reps: '15-20' },
          { name: 'DB Fly', sets: '3', reps: '12-15' },
          { name: 'Overhead DB Tricep Extension', sets: '4', reps: '12-15' },
        ],
      },
    },
    Advanced: {
      title: 'RPE-Based Upper Power',
      description:
        'Drive strength progression with heavy compounds regulated by RPE, followed by targeted accessory work for a powerful upper body.',
      duration: '65-75 min',
      intensity: 'Very High',
      exercises: {
        gym: [
          { name: 'Flat Barbell Press', sets: '5', reps: '5 @ RPE 8' },
          { name: 'Weighted Pull-up', sets: '4', reps: '6-8' },
          { name: 'DB Incline Fly', sets: '4', reps: '10-12' },
          { name: 'Face Pull', sets: '4', reps: '20' },
        ],
        home: [
          { name: 'Weighted Push-up', sets: '5', reps: '8-10' },
          { name: 'Weighted Pull-up', sets: '4', reps: '6-8' },
          { name: 'Incline DB Fly', sets: '4', reps: '10-12' },
          { name: 'Band Pull-apart', sets: '4', reps: '25' },
        ],
      },
    },
  },
  fitness: {
    Beginner: {
      title: 'Functional Movement Circuit',
      description:
        'Build a strong, resilient body by mastering fundamental movements that translate directly to everyday life.',
      duration: '30-40 min',
      intensity: 'Low-Moderate',
      exercises: {
        gym: [
          { name: 'Bodyweight Squat', sets: '3', reps: '15' },
          { name: 'Hip Hinge (RDL pattern)', sets: '3', reps: '12' },
          { name: 'Incline Push-up', sets: '3', reps: '12' },
          { name: 'Dead Bug', sets: '3', reps: '10 each side' },
        ],
        home: [
          { name: 'Bodyweight Squat', sets: '3', reps: '15' },
          { name: 'Good Morning (no weight)', sets: '3', reps: '12' },
          { name: 'Knee Push-up', sets: '3', reps: '12' },
          { name: 'Dead Bug', sets: '3', reps: '10 each side' },
        ],
      },
    },
    Intermediate: {
      title: 'Athletic Conditioning Block',
      description:
        'Develop power, stability, and work capacity with a blend of explosive lifts and functional strength exercises.',
      duration: '45-55 min',
      intensity: 'Moderate-High',
      exercises: {
        gym: [
          { name: 'Power Clean (light)', sets: '4', reps: '5' },
          { name: 'Single Leg RDL', sets: '3', reps: '10 each' },
          { name: 'Ring Row', sets: '3', reps: '12' },
          { name: 'Farmer Carry', sets: '3', reps: '30m' },
        ],
        home: [
          { name: 'DB Hang Clean', sets: '4', reps: '6' },
          { name: 'Single Leg DB RDL', sets: '3', reps: '10 each' },
          { name: 'Inverted Row (under a table)', sets: '3', reps: '10' },
          { name: 'Suitcase Carry', sets: '3', reps: '30m each' },
        ],
      },
    },
    Advanced: {
      title: 'Elite GPP Session',
      description:
        'Push your limits with a high-intensity General Physical Preparedness session designed to forge elite-level fitness.',
      duration: '60-70 min',
      intensity: 'High',
      exercises: {
        gym: [
          { name: 'Clean & Press', sets: '5', reps: '4' },
          { name: 'Weighted Step-up', sets: '4', reps: '10 each' },
          { name: 'TRX Plank Row', sets: '4', reps: '12' },
          { name: 'Assault Bike', sets: '5', reps: '30sec all-out' },
        ],
        home: [
          { name: 'DB Clean & Press', sets: '5', reps: '5 each' },
          { name: 'Weighted Step-up (on chair)', sets: '4', reps: '10 each' },
          { name: 'Renegade Row', sets: '4', reps: '10 each' },
          { name: 'Burpee Broad Jumps', sets: '5', reps: '30sec' },
        ],
      },
    },
  },
  healthy_lifestyle: {
    Beginner: {
      title: 'Functional Movement Circuit',
      description:
        'Build a strong, resilient body by mastering fundamental movements that translate directly to everyday life.',
      duration: '30-40 min',
      intensity: 'Low-Moderate',
      exercises: {
        gym: [
          { name: 'Bodyweight Squat', sets: '3', reps: '15' },
          { name: 'Hip Hinge (RDL pattern)', sets: '3', reps: '12' },
          { name: 'Incline Push-up', sets: '3', reps: '12' },
          { name: 'Dead Bug', sets: '3', reps: '10 each side' },
        ],
        home: [
          { name: 'Bodyweight Squat', sets: '3', reps: '15' },
          { name: 'Good Morning (no weight)', sets: '3', reps: '12' },
          { name: 'Knee Push-up', sets: '3', reps: '12' },
          { name: 'Dead Bug', sets: '3', reps: '10 each side' },
        ],
      },
    },
    Intermediate: {
      title: 'Athletic Conditioning Block',
      description:
        'Develop power, stability, and work capacity with a blend of explosive lifts and functional strength exercises.',
      duration: '45-55 min',
      intensity: 'Moderate-High',
      exercises: {
        gym: [
          { name: 'Power Clean (light)', sets: '4', reps: '5' },
          { name: 'Single Leg RDL', sets: '3', reps: '10 each' },
          { name: 'Ring Row', sets: '3', reps: '12' },
          { name: 'Farmer Carry', sets: '3', reps: '30m' },
        ],
        home: [
          { name: 'DB Hang Clean', sets: '4', reps: '6' },
          { name: 'Single Leg DB RDL', sets: '3', reps: '10 each' },
          { name: 'Inverted Row (under a table)', sets: '3', reps: '10' },
          { name: 'Suitcase Carry', sets: '3', reps: '30m each' },
        ],
      },
    },
    Advanced: {
      title: 'Elite GPP Session',
      description:
        'Push your limits with a high-intensity General Physical Preparedness session designed to forge elite-level fitness.',
      duration: '60-70 min',
      intensity: 'High',
      exercises: {
        gym: [
          { name: 'Clean & Press', sets: '5', reps: '4' },
          { name: 'Weighted Step-up', sets: '4', reps: '10 each' },
          { name: 'TRX Plank Row', sets: '4', reps: '12' },
          { name: 'Assault Bike', sets: '5', reps: '30sec all-out' },
        ],
        home: [
          { name: 'DB Clean & Press', sets: '5', reps: '5 each' },
          { name: 'Weighted Step-up (on chair)', sets: '4', reps: '10 each' },
          { name: 'Renegade Row', sets: '4', reps: '10 each' },
          { name: 'Burpee Broad Jumps', sets: '5', reps: '30sec' },
        ],
      },
    },
  },
};

const experienceLevels = ['Beginner', 'Intermediate', 'Advanced'];

function generateWorkoutPlan(profile) {
  const defaultWorkout = {
    title: 'Full Body Strength',
    description:
      'A balanced workout hitting all major muscle groups to boost metabolism.',
    duration: '45-60 min',
    intensity: 'Moderate',
    exercises: [
      { name: 'Squats', sets: '3', reps: '8-12' },
      { name: 'Push-ups', sets: '3', reps: 'As many as possible' },
      { name: 'Bent-over Rows', sets: '3', reps: '10-15' },
      { name: 'Plank', sets: '3', reps: '30-60 sec' },
    ],
  };

  if (!profile) {
    return {
      todaysWorkout: defaultWorkout,
      yesterdaysWorkout: defaultWorkout,
    };
  }

  const goal = profile.goal || 'fitness';
  const experience = profile.training_experience || 'Beginner';
  const gymAccess = profile.gym_access || 'gym';

  const goalWorkouts =
    workoutDatabase[goal] || workoutDatabase.healthy_lifestyle;
  const todaysWorkoutData = goalWorkouts[experience] || goalWorkouts.Beginner;

  const currentExperienceIndex = experienceLevels.indexOf(experience);
  const yesterdayExperienceIndex = Math.max(0, currentExperienceIndex - 1);
  const yesterdayExperience = experienceLevels[yesterdayExperienceIndex];
  const yesterdaysWorkoutData =
    goalWorkouts[yesterdayExperience] || goalWorkouts.Beginner;

  const getWorkout = (data) => {
    const exercises = data.exercises[gymAccess] || data.exercises.home;
    return {
      title: data.title,
      description: data.description,
      duration: data.duration,
      intensity: data.intensity,
      exercises: exercises.map((ex) => ({
        ...ex,
        reps: String(ex.reps),
        sets: String(ex.sets),
      })),
    };
  };

  return {
    todaysWorkout: getWorkout(todaysWorkoutData),
    yesterdaysWorkout: getWorkout(yesterdaysWorkoutData),
  };
}

export default function AICoachScreen() {
  const navigation = useNavigation();
  const { profile } = useAuth();
  const { healthData, refreshHealthData } = useHealth();

  const firstName = profile?.full_name?.split(' ')[0] || 'Champ';
  const goal = profile?.goal || 'fitness';
  const weight = parseFloat(profile?.weight) || 70;
  const height = parseFloat(profile?.height) || 170;

  const heroMessage = goal === 'fat_loss'
    ? `Burning fat is science, not suffering. Your plan is calibrated for maximum results.`
    : goal === 'muscle_gain'
    ? `Muscle is built in the kitchen as much as the gym. Your plan maximises both.`
    : `Peak fitness is a daily practice. Your personalised plan adapts to your lifestyle.`

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const yesterdayWorkoutCompleted = (healthData?.timeline || []).some(
    (entry: any) => entry?.date?.startsWith(yesterdayStr) && entry?.workout
  );

  const gender = profile?.sex || 'Male';
  const activityLevel = profile?.activity_level || 'Moderately Active';
  const bmr = calculateBMR({ weight, height, gender });
  const tdee = calculateTDEE({ bmr, activityLevel });
  const computedCalories = calculateGoalCalories({ tdee, goal });
  const computedMacros = calculateMacros({ calories: computedCalories, weight, goal });
  const targetCalories = parseFloat(profile?.target_calories) || computedCalories;
  const targetProtein = parseFloat(profile?.target_protein) || computedMacros.protein;
  const targetCarbs = parseFloat(profile?.target_carbs) || computedMacros.carbs;
  const targetFats = parseFloat(profile?.target_fats) || computedMacros.fats;

  // State for meal filtering
  const conditions = parseHealthConditions(profile?.health_conditions);
  const isVegetarian = conditions.includes('vegetarian');
  const [mealFilter, setMealFilter] = useState(isVegetarian ? 'veg' : 'non-veg'); // 'veg' or 'non-veg'
  const [mealTimeFilter, setMealTimeFilter] = useState('Breakfast');

  // State for direct check-ins
  const [isWorkoutCheckedIn, setIsWorkoutCheckedIn] = useState(false);
  const [checkedInMeals, setCheckedInMeals] = useState<number[]>([]);
  const [mealsLoading, setMealsLoading] = useState(true);
  const [workoutLoading, setWorkoutLoading] = useState(true);
  const [aiGeneratedMeals, setAiGeneratedMeals] = useState<any[]>([]);
  const [aiWorkoutPlan, setAiWorkoutPlan] = useState<{
    todaysWorkout: any;
    yesterdaysWorkout: any;
  } | null>(null);

  // State for Recipe Modal
    const [recipeModal, setRecipeModal] = useState<{
      visible: boolean;
      meal: any | null;
    }>({ visible: false, meal: null });
    const [recipeLoading, setRecipeLoading] = useState(false);

  const shimmerAnim = useRef(new Animated.Value(0)).current;

  const aiWorkouts = aiWorkoutPlan || generateWorkoutPlan(profile);

  const fetchAIMeals = async (forceRefresh = false) => {
    console.log('fetchAIMeals called. Claude key present:', !!process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY);
    if (!profile) return;
    setMealsLoading(true);

    const macros = { protein: targetProtein, carbs: targetCarbs, fats: targetFats };

    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `ai_meals_${profile?.id}_${today}`;

    if (!forceRefresh) {
      try {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
          setAiGeneratedMeals(JSON.parse(cached));
          setMealsLoading(false);
          return;
        }
      } catch {}
    }

    const claudeKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
    if (!claudeKey) {
      console.error('Anthropic API key missing. Loading static fallback.');
      setAiGeneratedMeals([...vegMealPlan, ...nonVegMealPlan].map((m, i) => ({ ...m, id: i + 1 })));
      setMealsLoading(false);
      return;
    }

    const bfCals = Math.round(targetCalories * 0.25);
    const snackCals = Math.round(targetCalories * 0.10);
    const lunchCals = Math.round(targetCalories * 0.30);
    const dinnerCals = Math.round(targetCalories * 0.25);

    const makePrompt = (dietType: 'veg' | 'non-veg') => 
 `You are a world-class Indian sports nutritionist. 
 Generate EXACTLY 15 ${dietType} meals: 3 options for each of 5 slots. 
 
 User: Goal: ${goal} | Calories: ${targetCalories}kcal | P:${targetProtein}g C:${targetCarbs}g F:${targetFats}g 
 
 Calories per slot: Breakfast ${bfCals}kcal, Snacks ${snackCals}kcal, Lunch ${lunchCals}kcal, Dinner ${dinnerCals}kcal. 
 80%+ authentic Indian dishes. All meals type must be "${dietType}". 
 
 Respond ONLY with a JSON array of 15 objects. No markdown. No backticks. No extra text. 
 Each object: { "id": number, "time": "Breakfast"|"Morning Snack"|"Lunch"|"Evening Snack"|"Dinner", "title": string, "description": string (max 10 words), "calories": number, "protein": number, "carbs": number, "fats": number, "fiber": number, "type": "${dietType}" } 
 
 Do NOT include recipe. Just the 15 meal objects.`; 
 
    try {
 const callClaude = async (prompt: string) => { 
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
       max_tokens: 4000, 
       messages: [{ role: 'user', content: prompt }], 
     }), 
   }); 
   if (!res.ok) { 
     const err = await res.json(); 
     console.error('Claude error:', res.status, JSON.stringify(err)); 
     throw new Error(`Claude API failed: ${res.status}`); 
   } 
   const data = await res.json(); 
   const raw = data?.content?.[0]?.text || ''; 
   return raw.replace(/```json/gi,'').replace(/```/g,'').trim(); 
 }; 
 
 console.log('Fetching veg & non-veg meals in parallel...'); 
 const [vegText, nonVegText] = await Promise.all([ 
   callClaude(makePrompt('veg')), 
   callClaude(makePrompt('non-veg')), 
 ]); 
 
 const vegMeals = JSON.parse(vegText); 
 const nonVegMeals = JSON.parse(nonVegText); 
 
 if (!Array.isArray(vegMeals) || !Array.isArray(nonVegMeals) || vegMeals.length === 0 || nonVegMeals.length === 0) { 
   throw new Error('Invalid meal response format from Claude'); 
 } 
 
 // Reassign IDs to avoid duplicates 
 const allMeals = [ 
   ...vegMeals.map((m, i) => ({ ...m, id: i + 1, type: 'veg' })), 
   ...nonVegMeals.map((m, i) => ({ ...m, id: i + 1 + vegMeals.length, type: 'non-veg' })), 
 ]; 
 
 console.log('AI meals received:', allMeals.length, 'veg:', vegMeals.length, 'non-veg:', nonVegMeals.length); 
 
 const slotTargets = { 
   'Breakfast': { cal: bfCals, p: Math.round(targetProtein*0.25), c: Math.round(targetCarbs*0.25), f: Math.round(targetFats*0.20) }, 
   'Morning Snack': { cal: snackCals, p: Math.round(targetProtein*0.10), c: Math.round(targetCarbs*0.10), f: Math.round(targetFats*0.10) }, 
   'Lunch': { cal: lunchCals, p: Math.round(targetProtein*0.30), c: Math.round(targetCarbs*0.30), f: Math.round(targetFats*0.30) }, 
   'Evening Snack': { cal: snackCals, p: Math.round(targetProtein*0.10), c: Math.round(targetCarbs*0.10), f: Math.round(targetFats*0.10) }, 
   'Dinner': { cal: dinnerCals, p: Math.round(targetProtein*0.25), c: Math.round(targetCarbs*0.25), f: Math.round(targetFats*0.30) }, 
 }; 
 const normalizedMeals = allMeals.map(meal => { 
   const t = slotTargets[meal.time]; 
   if (!t) return meal; 
   const ratio = meal.calories > 0 ? t.cal / meal.calories : 1; 
   const needsFix = Math.abs(ratio - 1) > 0.25; // Allow slightly more variance 
   return needsFix ? { ...meal, calories: t.cal, protein: t.p, carbs: t.c, fats: t.f, fiber: Math.round(t.cal / 35) } : meal; 
 }); 
 
 setAiGeneratedMeals(normalizedMeals); 
 await AsyncStorage.setItem(cacheKey, JSON.stringify(normalizedMeals));
    } catch (error) {
      console.error('Failed to fetch or parse AI meals, using static fallback:', error);
      setAiGeneratedMeals(generateMealPlan(profile));
    } finally {
      setMealsLoading(false);
    }
  };

  const aiMeals = aiGeneratedMeals.length > 0 ? aiGeneratedMeals : generateMealPlan(profile);

  const getSuggestedMealTime = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 10) return 'Breakfast';
    if (hour >= 10 && hour < 12) return 'Morning Snack';
    if (hour >= 12 && hour < 15) return 'Lunch';
    if (hour >= 15 && hour < 18) return 'Evening Snack';
    if (hour >= 18 && hour < 22) return 'Dinner';
    return 'all';
  };

  useEffect(() => {
    if (mealsLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 900,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      shimmerAnim.stopAnimation();
    }
  }, [mealsLoading]);

  const fetchAIWorkout = async () => {
    if (!profile?.id) return;
    setWorkoutLoading(true);

    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `ai_workout_${profile.id}_${today}`;

    try {
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        setAiWorkoutPlan(JSON.parse(cached));
        setWorkoutLoading(false);
        return;
      }
    } catch {}

    const goal = profile?.goal || 'fitness';
    const experience = profile?.training_experience || 'Beginner';
    const gymAccess = profile?.gym_access || profile?.gymAccess || 'gym';
    const weight = parseFloat(profile?.weight) || 70;

    const prompt = `You are India's top fitness coach — combine the science of Jeff Nippard with the practicality of an Indian gym culture. Design two complete workouts.

User:
- Goal: ${goal.replace(/_/g, ' ')}
- Experience: ${experience}
- Equipment: ${gymAccess === 'gym' ? 'Full commercial gym (barbells, cables, machines, dumbbells)' : 'Home only — dumbbells and bodyweight, no machines'}
- Weight: ${weight}kg

RULES:
1. todaysWorkout and yesterdaysWorkout must target DIFFERENT muscle groups or energy systems.
2. Each workout must have EXACTLY 6-8 exercises.
3. Include a warm-up note in the description.
4. Use exercise names that Indian gym-goers understand. Prefer common names (e.g. 'Chest Press' not 'Bench Press', 'Lat Pulldown', 'Leg Press', 'Dumbbell Curl', 'Overhead Press').
5. For home workouts: use only push-ups, squats, lunges, planks, dumbbell exercises.
6. Sets: 3-4. Reps: specific ranges like '10-12' or '8-10'. No vague instructions.
7. Workouts must be appropriate for ${experience} level — not too advanced, not too easy.

Respond ONLY with valid JSON. No markdown, no backticks, no explanation.
{
  "todaysWorkout": {
    "title": string,
    "description": string (include warm-up tip),
    "duration": string,
    "intensity": string,
    "exercises": [ { "name": string, "sets": string, "reps": string } ]
  },
  "yesterdaysWorkout": {
    "title": string,
    "description": string,
    "duration": string,
    "intensity": string,
    "exercises": [ { "name": string, "sets": string, "reps": string } ]
  }
}`;

    try {
      const claudeKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
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
        max_tokens: 2000,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        console.error('Claude error:', res.status, JSON.stringify(err));
        throw new Error(`Claude API failed: ${res.status}`);
      }
      const data = await res.json();
      const raw = data?.content?.[0]?.text || '';
      const clean = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
      const plan = JSON.parse(clean);
      if (plan?.todaysWorkout && plan?.yesterdaysWorkout) {
        setAiWorkoutPlan(plan);
        await AsyncStorage.setItem(cacheKey, JSON.stringify(plan));
      } else {
        setAiWorkoutPlan(generateWorkoutPlan(profile));
      }
    } catch (err) {
      console.log('AI workout failed, using static:', err);
      setAiWorkoutPlan(generateWorkoutPlan(profile));
    } finally {
      setWorkoutLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.id) {
      fetchAIMeals();
      fetchAIWorkout();
    }
  }, [profile?.id]);



  const handleWorkoutCheckIn = async () => {
    // In a real app, you'd call an API here to save the data.
    setIsWorkoutCheckedIn(true);
    await addActivity({
      activity_type: workoutToShow.title,
      duration: parseInt(workoutToShow.duration),
      calories_burned: 350, // This is a placeholder, you might want to calculate this
    });
    await refreshHealthData();
  };

  const handleMealCheckIn = async (meal: (typeof aiMeals)[0]) => {
    // In a real app, you'd call an API here to save the data.
    if (!checkedInMeals.includes(meal.id)) {
      setCheckedInMeals([...checkedInMeals, meal.id]);
      await addFood({
        meal_name: meal.title,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fats: meal.fats,
        fiber: meal.fiber,
        meal_type: meal.time,
      });
      await refreshHealthData();
    }
  };

  const fetchRecipeForMeal = async (meal: any) => {
    if (meal.recipe?.steps?.length > 0) {
      setRecipeModal({ visible: true, meal });
      return;
    }
    setRecipeLoading(true);
    setRecipeModal({ visible: true, meal: { ...meal, recipe: { prepTime: 'Loading...', cookTime: '', ingredients: [], steps: [] } } });
    try {
      const claudeKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
      const prompt = `Give a quick recipe for "${meal.title}" (${meal.type}, Indian cuisine). 
 Respond ONLY with JSON: { "prepTime": string, "cookTime": string, "ingredients": string[], "steps": string[] } 
 Max 6 ingredients, max 5 steps. No markdown.`;
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': claudeKey || '', 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
        body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 600, messages: [{ role: 'user', content: prompt }] }),
      });
      const data = await res.json();
      const raw = data?.content?.[0]?.text?.replace(/```json/gi,'').replace(/```/g,'').trim() || '';
      const recipe = JSON.parse(raw);
      setRecipeModal({ visible: true, meal: { ...meal, recipe } });
    } catch (e) {
      console.log('Recipe fetch failed:', e);
      setRecipeModal({ visible: true, meal: { ...meal, recipe: { prepTime: '10 min', cookTime: '15 min', ingredients: ['See full recipe online'], steps: ['Prepare all ingredients', 'Cook as per taste', 'Serve hot'] } } });
    } finally {
      setRecipeLoading(false);
    }
  };


  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const workoutToShow = yesterdayWorkoutCompleted
    ? aiWorkouts.todaysWorkout
    : aiWorkouts.yesterdaysWorkout;

  const filteredMeals = aiMeals.filter(meal => {
    const typeMatch = mealFilter === 'all' || meal.type?.toLowerCase().trim() === mealFilter.toLowerCase().trim();
    const timeMatch = mealTimeFilter === 'all' || meal.time === mealTimeFilter;
    return typeMatch && timeMatch;
  });

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ================================================= */}
        {/* HERO CARD */}
        {/* ================================================= */}
        <LinearGradient
          colors={['#0B1020', '#131929']}
          style={styles.heroCard}
        >
          <View style={styles.heroHeader}>
            <Image 
              source={require('../assets/neo_logo.png')} 
              style={{ width: 48, height: 48, borderRadius: 24 }}
            />
            <View>
              <Text style={styles.heroTitle}>Neo</Text>
              <Text style={styles.heroSubtitle}>
                <Text style={{ fontWeight: '900', color: '#8B7CFF' }}>
                  {firstName}
                </Text>
                {', let\'s go. 💪'}
              </Text>
            </View>
          </View>
          <Text style={styles.heroText} numberOfLines={2}>
            {heroMessage}
          </Text>
        </LinearGradient>

        {/* ================================================= */}
        {/* TODAY'S WORKOUT */}
        {/* ================================================= */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Trophy size={18} color="#F7C873" />
            <Text style={styles.sectionTitle}>Today's Workout</Text>
          </View>

          {workoutLoading ? (
            <Animated.View
              style={[
                styles.card,
                {
                  opacity: shimmerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.4, 1],
                  }),
                },
              ]}
            >
              <View
                style={{
                  height: 16,
                  width: '60%',
                  backgroundColor: '#EAE3D9',
                  borderRadius: 8,
                  marginBottom: 12,
                }}
              />
              <View
                style={{
                  height: 12,
                  width: '90%',
                  backgroundColor: '#EAE3D9',
                  borderRadius: 8,
                  marginBottom: 20,
                }}
              />
              <View
                style={{
                  height: 14,
                  width: '100%',
                  backgroundColor: '#EAE3D9',
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              />
              <View
                style={{
                  height: 14,
                  width: '100%',
                  backgroundColor: '#EAE3D9',
                  borderRadius: 8,
                  marginBottom: 20,
                }}
              />
              <View
                style={{
                  height: 44,
                  backgroundColor: '#EAE3D9',
                  borderRadius: 16,
                }}
              />
            </Animated.View>
          ) : (
            <>
              {!yesterdayWorkoutCompleted && healthData.streak > 0 && (
                <View style={styles.noticeCard}>
                  <Text style={styles.noticeText}>
                    Missed yesterday's session? Log it now to protect your streak.
                  </Text>
                  <TouchableOpacity
                    style={styles.forgotButton}
                    onPress={() => navigation.navigate('LogActivity')}
                  >
                    <Text style={styles.forgotButtonText}>
                      Yes, I trained yesterday
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{workoutToShow.title}</Text>
                  <View style={styles.tagContainer}>
                    <Text style={styles.tag}>{workoutToShow.duration}</Text>
                    <Text style={styles.tag}>{workoutToShow.intensity}</Text>
                  </View>
                </View>
                <Text style={styles.cardDescription}>{workoutToShow.description}</Text>
                <View style={styles.exerciseList}>
                  {workoutToShow.exercises.map((ex, index) => (
                    <View key={index} style={styles.exerciseRow}>
                      <Text style={styles.exerciseName}>{ex.name}</Text>
                      <Text style={styles.exerciseDetails}>{`${ex.sets}x${ex.reps}`}</Text>
                    </View>
                  ))}
                </View>
                <TouchableOpacity
                  style={[
                    styles.checkInButton,
                    isWorkoutCheckedIn && styles.checkedInButton,
                  ]}
                  onPress={handleWorkoutCheckIn}
                  disabled={isWorkoutCheckedIn}
                >
                  {isWorkoutCheckedIn ? (
                    <Check size={18} color="#FFFFFF" />
                  ) : (
                    <Zap size={18} color="#FFFFFF" />
                  )}
                  <Text style={styles.checkInButtonText}>
                    {isWorkoutCheckedIn ? 'Grind logged ✔' : 'Log the grind ⚡'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              marginTop: 8,
              paddingHorizontal: 4,
            }}
          >
            <Text style={{ fontSize: 18 }}>👣</Text>
            <Text
              style={{
                fontSize: 13,
                color: '#667085',
                fontWeight: '600',
                flex: 1,
              }}
            >
              {`Daily step goal: ${
                workoutToShow.intensity === 'Very High'
                  ? '12,000'
                  : workoutToShow.intensity === 'High'
                  ? '10,000'
                  : workoutToShow.intensity === 'Moderate'
                  ? '8,000'
                  : '6,000'
              } steps — movement outside the gym counts too.`}
            </Text>
          </View>
        </View>

        {/* ================================================= */}
        {/* TODAY'S MEALS */}
        {/* ================================================= */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, { justifyContent: 'space-between' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Utensils size={18} color="#5c677d" />
              <Text style={styles.sectionTitle}>Today's Nutrition Plan</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={styles.filterContainer}>

                <TouchableOpacity onPress={() => setMealFilter('veg')} style={[styles.filterButton, mealFilter === 'veg' && styles.filterActive]}>
                  <Leaf size={14} color={mealFilter === 'veg' ? '#FFFFFF' : '#2e7d32'} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setMealFilter('non-veg')} style={[styles.filterButton, mealFilter === 'non-veg' && styles.filterActive]}>
                  <Drumstick size={14} color={mealFilter === 'non-veg' ? '#FFFFFF' : '#c62828'} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => fetchAIMeals(true)}
                disabled={mealsLoading}
                style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#F0EBFF', alignItems: 'center', justifyContent: 'center' }}
              >
                <RotateCcw size={16} color={mealsLoading ? '#C68BFF' : '#8B7CFF'} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </View>



          {mealTimeFilter !== 'all' && (
            <Text style={{ fontSize: 12, color: '#8B5E34', fontWeight: '600', marginTop: 8, marginBottom: 4, paddingHorizontal: 4 }}>
              ⏰ Showing meals for: {mealTimeFilter}
            </Text>
          )}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 4, marginBottom: 8 }}
            contentContainerStyle={{ paddingBottom: 4 }}
          >
            {['Breakfast', 'Morning Snack', 'Lunch', 'Evening Snack', 'Dinner'].map(slot => (
              <TouchableOpacity
                key={slot}
                onPress={() => setMealTimeFilter(slot)}
                style={[styles.mealTimePill, mealTimeFilter === slot && styles.mealTimePillActive]}
              >
                <Text style={[styles.mealTimePillText, mealTimeFilter === slot && styles.mealTimePillTextActive]}>
                  {slot === 'all' ? 'All Meals' : slot}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {mealsLoading ? (
            [1, 2, 3].map(i => (
              <Animated.View
                key={i}
                style={[
                  styles.card,
                  {
                    opacity: shimmerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.4, 1],
                    }),
                  },
                ]}
              >
                <View
                  style={{
                    height: 16,
                    width: '60%',
                    backgroundColor: '#EAE3D9',
                    borderRadius: 8,
                    marginBottom: 12,
                  }}
                />
                <View
                  style={{
                    height: 12,
                    width: '90%',
                    backgroundColor: '#EAE3D9',
                    borderRadius: 8,
                    marginBottom: 8,
                  }}
                />
                <View
                  style={{
                    height: 12,
                    width: '70%',
                    backgroundColor: '#EAE3D9',
                    borderRadius: 8,
                    marginBottom: 20,
                  }}
                />
                <View
                  style={{
                    height: 44,
                    backgroundColor: '#EAE3D9',
                    borderRadius: 16,
                  }}
                />
              </Animated.View>
            ))
          ) : filteredMeals.length === 0 ? (
            <View style={{ padding: 24, alignItems: 'center' }}>
              <Text style={{ color: '#8B5E34', fontWeight: '600', fontSize: 14 }}>No meals found for this filter.</Text>
            </View>
          ) : filteredMeals.map(meal => {
            const isMealCheckedIn = checkedInMeals.includes(meal.id);
            return (
              <View style={styles.card} key={meal.id}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{meal.title}</Text>
                  <Text style={styles.tag}>{`~${meal.calories} kcal`}</Text>
                </View>
                <Text style={styles.cardDescription}>{meal.description}</Text>

                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    style={[
                      styles.checkInButton,
                      styles.mealCheckin,
                      isMealCheckedIn && styles.checkedInButton,
                      { flex: 1 },
                    ]}
                    onPress={() => handleMealCheckIn(meal)}
                    disabled={isMealCheckedIn}
                  >
                    {isMealCheckedIn ? (
                      <Check size={18} color="#FFFFFF" />
                    ) : (
                      <ChevronRight size={18} color="#FFFFFF" />
                    )}
                    <Text style={styles.checkInButtonText}>
                      {isMealCheckedIn ? 'Fuelled ✅' : 'Log This Meal'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#EEF2F5',
                      borderRadius: 16,
                      paddingVertical: 12,
                      gap: 8,
                    }}
                    onPress={() => fetchRecipeForMeal(meal)}
                  >
                    <BookOpen size={18} color="#0B1020" />
                    <Text
                      style={{
                        color: '#344054',
                        fontWeight: 'bold',
                        fontSize: 15,
                      }}
                    >
                      How to Prep
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {/* RECIPE MODAL GOES HERE — SEE PART 2 */}
        {recipeModal.meal && (
          <Modal
            animationType="slide"
            transparent={true}
            visible={recipeModal.visible}
            onRequestClose={() => {
              setRecipeModal({ visible: false, meal: null });
            }}
          >
            <TouchableOpacity
              style={styles.recipeModalOverlay}
              activeOpacity={1}
              onPressOut={() => setRecipeModal({ visible: false, meal: null })}
            >
              <View style={styles.recipeModalSheet}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={styles.recipeTitle}>
                    {recipeModal.meal.title}
                  </Text>
                  {recipeLoading && (
                    <Text style={{ color: '#8B5E34', fontSize: 13, fontWeight: '600', marginBottom: 12 }}>
                      Loading recipe...
                    </Text>
                  )}
                  <View style={styles.recipeTagRow}>
                    <Text style={styles.recipeTag}>
                      ⏱ Prep: {recipeModal.meal.recipe.prepTime}
                    </Text>
                    <Text style={styles.recipeTag}>
                      🔥 Cook: {recipeModal.meal.recipe.cookTime}
                    </Text>
                  </View>

                  <Text style={styles.recipeSectionHeading}>INGREDIENTS</Text>
                  {recipeModal.meal.recipe.ingredients.map(
                    (ingredient, index) => (
                      <Text key={index} style={styles.recipeIngredient}>
                        • {ingredient}
                      </Text>
                    )
                  )}

                  <View style={styles.recipeDivider} />

                  <Text style={styles.recipeSectionHeading}>METHOD</Text>
                  {recipeModal.meal.recipe.steps.map((step, index) => (
                    <Text key={index} style={styles.recipeStep}>
                      {index + 1}. {step}
                    </Text>
                  ))}

                  <TouchableOpacity
                    style={styles.recipeCloseButton}
                    onPress={() =>
                      setRecipeModal({ visible: false, meal: null })
                    }
                  >
                    <Text style={styles.recipeCloseButtonText}>Got It</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1020',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  heroCard: {
    padding: 24,
    paddingTop: 70,
    paddingBottom: 30,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 24,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  heroAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1A2235',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(139,124,255,0.3)',
  },
  heroAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B7CFF',
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B7CFF',
    opacity: 0.8,
  },
  heroSubtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F7F8FC',
    lineHeight: 26,
    flexWrap: 'wrap',
    flex: 1,
  },
  heroText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 18,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F7F8FC',
  },
  noticeCard: {
    backgroundColor: '#1A1235',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(139,124,255,0.4)',
  },
  noticeText: {
    fontSize: 14,
    color: '#C4B5FD',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 12,
  },
  forgotButton: {
    backgroundColor: '#8B7CFF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'center',
  },
  forgotButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#131929',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(139,124,255,0.2)',
    marginBottom: 12,
    shadowColor: '#8B7CFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F7F8FC',
    flex: 1,
    marginRight: 8,
  },
  tagContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  tag: {
    backgroundColor: '#1A2235',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#8B7CFF',
    overflow: 'hidden',
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  exerciseList: {
    marginBottom: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139,124,255,0.15)',
    paddingTop: 12,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#F7F8FC',
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  checkInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B7CFF',
    borderRadius: 16,
    paddingVertical: 14,
    gap: 8,
    transition: 'background-color 0.3s ease',
  },
  checkedInButton: {
    backgroundColor: 'rgba(139,124,255,0.5)',
    opacity: 1,
  },
  mealCheckin: {
    backgroundColor: '#FF7A7A',
    paddingVertical: 12,
  },
  checkInButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#131929',
    borderRadius: 12,
    padding: 4,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginHorizontal: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  filterActive: {
    backgroundColor: '#8B7CFF',
  },
  filterText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 14,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  mealTimePill: {
    backgroundColor: '#131929',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 8,
  },
  mealTimePillActive: {
    backgroundColor: '#8B7CFF',
  },
  mealTimePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  mealTimePillTextActive: {
    color: '#FFFFFF',
  },
  recipeModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  recipeModalSheet: {
    backgroundColor: '#131929',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '82%',
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F7F8FC',
    marginBottom: 8,
  },
  recipeTagRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  recipeTag: {
    backgroundColor: '#1A2235',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#8B7CFF',
    overflow: 'hidden',
  },
  recipeSectionHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8B7CFF',
    letterSpacing: 1,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  recipeIngredient: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 24,
  },
  recipeDivider: {
    height: 1,
    backgroundColor: 'rgba(139,124,255,0.15)',
    marginVertical: 16,
  },
  recipeStep: {
    fontSize: 14,
    color: '#F7F8FC',
    lineHeight: 22,
    marginBottom: 10,
  },
  recipeCloseButton: {
    marginTop: 20,
    backgroundColor: '#8B7CFF',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  recipeCloseButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

// WORKOUT PLAN UPGRADE — SEE PART 3