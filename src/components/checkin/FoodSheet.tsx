import { supabase } from '../../services/supabase';
import React, {
  forwardRef,
  useMemo,
  useRef,
  useState,
  useEffect,
} from 'react';

import {
  ActivityIndicator,
  Animated,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Keyboard,
} from 'react-native';

import BottomSheet, {
  BottomSheetView,
} from '@gorhom/bottom-sheet';

import {
  Camera,
  Sparkles,
  Flame,
  Drumstick,
  Wheat,
  Droplets,
  Leaf,
} from 'lucide-react-native';

import {
  parseMeal,
  parseMultipleFoods,
  ParsedMealResult,
} from '../../services/mealParser';

const mealTypes = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Snack',
];

const quickAdds = [
  '2 eggs and toast',
  'Chicken salad',
  'Oats with fruit',
  'Protein shake',
];

const FoodSheet = forwardRef(
  ({ onSave }: any, ref: any) => {
    const snapPoints = useMemo(() => ['80%'], []);

    const [meal, setMeal] = useState('');
    const [recentMeals, setRecentMeals] = useState<string[]>([]);
 
 useEffect(() => { 
   const fetchRecentMeals = async () => { 
     try { 
       const { data: { user } } = await supabase.auth.getUser(); 
       if (!user?.id) return; 
       const { data } = await supabase 
         .from('food_logs') 
         .select('meal_name') 
         .eq('user_id', user.id) 
         .order('created_at', { ascending: false }) 
         .limit(20); 
       if (data) { 
         // Deduplicate and take top 6 
         const unique = [...new Set(data.map(d => d.meal_name).filter(Boolean))].slice(0, 6); 
         setRecentMeals(unique); 
       } 
     } catch {} 
   }; 
   fetchRecentMeals(); 
 }, []);
    const [selectedMealType, setSelectedMealType] = useState<
      'breakfast' | 'lunch' | 'dinner' | 'snack'
    >('snack');
    const [parsedMeal, setParsedMeal] = useState<ParsedMealResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const cardOpacity = useRef(new Animated.Value(0)).current;
    const cardTranslateY = useRef(new Animated.Value(18)).current;

    const showConfirmationCard = () => {
      Animated.parallel([
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.spring(cardTranslateY, {
          toValue: 0,
          damping: 16,
          stiffness: 180,
          useNativeDriver: true,
        }),
      ]).start();
    };

    const resetCardAnimation = () => {
      cardOpacity.setValue(0);
      cardTranslateY.setValue(18);
    };

    const handleCalculate = async () => {
      if (!meal.trim()) return;

      Keyboard.dismiss();
      setLoading(true);
      setError('');
      setParsedMeal(null);
      resetCardAnimation();

      try {
        const localCheck = parseMultipleFoods(meal.trim());
        const needsAiFallback = !(
          localCheck.totalCount > 0 &&
          localCheck.parsedCount === localCheck.totalCount
        );

        if (!needsAiFallback) setLoading(false);

        const parsed = await parseMeal(meal.trim());
        setParsedMeal(parsed);
        showConfirmationCard();
      } catch (err: any) {
        setError('Hmm, I didn\'t catch that. Try something like "2 rotis and dal"');
      } finally {
        setLoading(false);
      }
    };

    const handleConfirmSave = () => {
      if (!parsedMeal || parsedMeal.items.length === 0) return;

      onSave({
        meal_name: parsedMeal.items.map(item => item.name).join(' + '),
        meal_type: selectedMealType,
        calories: parsedMeal.totals.calories,
        protein: parsedMeal.totals.protein,
        carbs: parsedMeal.totals.carbs,
        fats: parsedMeal.totals.fats,
        fiber: parsedMeal.totals.fiber,
      });

      setMeal('');
      setParsedMeal(null);
      setError('');
      resetCardAnimation();
    };

    const handleEdit = () => {
      setParsedMeal(null);
      setError('');
      resetCardAnimation();
    };

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backgroundStyle={{
          backgroundColor: '#F7F8FC',
          borderRadius: 36,
        }}
      >
        <BottomSheetView style={styles.container}>

          {/* HEADER */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Fuel report, chef. 🍳</Text>
              <Text style={styles.subtitle}>Every bite moves the needle — make it count.</Text>
            </View>
            <View style={styles.xpPill}>
              <Sparkles size={12} color="#FFFFFF" />
              <Text style={styles.xpText}>+12 XP</Text>
            </View>
          </View>

          {/* MEAL TYPE SELECTOR */}
          <View style={styles.chips}>
            {mealTypes.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.quickChip,
                  selectedMealType === item.toLowerCase() && styles.quickChipActive,
                ]}
                onPress={() =>
                  setSelectedMealType(
                    item.toLowerCase() as 'breakfast' | 'lunch' | 'dinner' | 'snack',
                  )
                }
              >
                <Text
                  style={[
                    styles.quickChipText,
                    selectedMealType === item.toLowerCase() && styles.quickChipTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* QUICK ADD */}
          <View>
            <Text style={styles.sectionTitle}>{recentMeals.length > 0 ? 'YOUR USUALS' : 'QUICK ADD'}</Text>
            <View style={styles.chips}>
              {(recentMeals.length > 0 ? recentMeals : ['2 eggs and toast', 'Chicken salad', 'Oats with fruit', 'Protein shake', 'Dal chawal', 'Roti sabzi']).map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickChip}
                  onPress={() => setMeal(item)}
                >
                  <Text style={styles.quickChipText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* INPUT */}
          {!parsedMeal && (
            <>
              <View style={styles.inputRow}>
                <View style={styles.inputShell}>
                  <TextInput
                    value={meal}
                    onChangeText={setMeal}
                    placeholder="e.g. 3 idlis and chai, bowl of oats..."
                    placeholderTextColor="#9E9E9E"
                    style={styles.input}
                    multiline
                    editable={!loading}
                  />
                </View>
                <TouchableOpacity style={styles.captureButton} onPress={async () => { 
   try { 
     const { launchCameraAsync, requestCameraPermissionsAsync, MediaTypeOptions } = await import('expo-image-picker'); 
     const { status } = await requestCameraPermissionsAsync(); 
     if (status !== 'granted') return; 
     const result = await launchCameraAsync({ 
       mediaTypes: MediaTypeOptions.Images, 
       base64: true, 
       quality: 0.5, 
     }); 
     if (result.canceled || !result.assets?.[0]?.base64) return; 
     setLoading(true); 
     setError(''); 
     const claudeKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY; 
     const res = await fetch(' https://api.anthropic.com/v1/messages ', { 
       method: 'POST', 
       headers: { 'Content-Type': 'application/json', 'x-api-key': claudeKey || '', 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' }, 
       body: JSON.stringify({ 
         model: 'claude-haiku-4-5-20251001', 
         max_tokens: 300, 
         messages: [{ role: 'user', content: [ 
           { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: result.assets[0].base64 } }, 
           { type: 'text', text: 'Identify the food in this image and estimate: meal name, calories, protein(g), carbs(g), fats(g). Respond only as JSON: {"meal_name":string,"calories":number,"protein":number,"carbs":number,"fats":number}' } 
         ]}] 
       }), 
     }); 
     const data = await res.json(); 
     const text = data?.content?.[0]?.text?.replace(/```json/gi,'').replace(/```/g,'').trim() || ''; 
     const parsed = JSON.parse(text); 
     setMeal(parsed.meal_name); 
     setParsedMeal({ items: [{ ...parsed, id: 'camera', name: parsed.meal_name, serving_size: '1 serving', quantity: 1, confidence: 0.8, fiber: 0 }], totals: { calories: parsed.calories, protein: parsed.protein, carbs: parsed.carbs, fats: parsed.fats, fiber: 0 }, source: 'ai' }); 
     showConfirmationCard(); 
   } catch (e) { 
     setError('Could not read image. Try typing instead.'); 
   } finally { 
     setLoading(false); 
   } 
 }}>
                  <Camera size={22} color="#9E9E9E" />
                </TouchableOpacity>
              </View>

              {!!error && (
                <Text style={styles.errorText}>{error}</Text>
              )}

              <TouchableOpacity
                style={[styles.calculateButton, !meal.trim() && styles.calculateButtonDisabled]}
                onPress={handleCalculate}
                disabled={loading || !meal.trim()}
              >
                {loading ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.calculateText}>Working it out...</Text>
                  </View>
                ) : (
                  <Text style={styles.calculateText}>Log this meal</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* CONFIRMATION CARD */}
          {!!parsedMeal && (
            <Animated.View
              style={[
                styles.confirmationCard,
                {
                  opacity: cardOpacity,
                  transform: [{ translateY: cardTranslateY }],
                },
              ]}
            >
              <Text style={styles.confirmationTitle}>Looks good? 👀</Text>

              {/* Food items */}
              {parsedMeal.items.map(item => (
                <View key={item.id} style={styles.itemRow}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemMacros}>
                    {Math.round(item.calories)} kcal • {Math.round(item.protein)}g protein •{' '}
                    {Math.round(item.carbs)}g carbs • {Math.round(item.fats)}g fat
                  </Text>
                </View>
              ))}

              {/* Totals */}
              <View style={styles.totalsRow}>
                <View style={styles.totalPill}>
                  <Flame size={12} color="#FF7B7B" />
                  <Text style={styles.totalPillText}>{Math.round(parsedMeal.totals.calories)} kcal</Text>
                </View>
                <View style={styles.totalPill}>
                  <Drumstick size={12} color="#8B7CFF" />
                  <Text style={styles.totalPillText}>{Math.round(parsedMeal.totals.protein)}g protein</Text>
                </View>
              </View>

              <View style={styles.totalsRow}>
                <View style={styles.totalPill}>
                  <Wheat size={12} color="#73F7C8" />
                  <Text style={styles.totalPillText}>{Math.round(parsedMeal.totals.carbs)}g carbs</Text>
                </View>
                <View style={styles.totalPill}>
                  <Droplets size={12} color="#F7C873" />
                  <Text style={styles.totalPillText}>{Math.round(parsedMeal.totals.fats)}g fat</Text>
                </View>
              </View>

              <View style={styles.totalsRow}>
                <View style={styles.totalPill}>
                  <Leaf size={12} color="#8B7CFF" />
                  <Text style={styles.totalPillText}>{Math.round(parsedMeal.totals.fiber)}g fiber</Text>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.confirmActionRow}>
                <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmSave}>
                  <Text style={styles.confirmText}>Save meal ✓</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

        </BottomSheetView>
      </BottomSheet>
    );
  },
);

export default FoodSheet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0B1020',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#9E9E9E',
  },
  xpPill: {
    height: 34,
    borderRadius: 999,
    paddingHorizontal: 14,
    backgroundColor: '#8B7CFF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  xpText: {
    marginLeft: 5,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9E9E9E',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  quickChip: {
    height: 36,
    borderRadius: 999,
    paddingHorizontal: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  quickChipActive: {
    backgroundColor: '#8B7CFF',
  },
  quickChipText: {
    color: '#9E9E9E',
    fontSize: 13,
    fontWeight: '700',
  },
  quickChipTextActive: {
    color: '#FFFFFF',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  inputShell: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  captureButton: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    minHeight: 54,
    fontSize: 15,
    color: '#0B1020',
    textAlignVertical: 'top',
  },
  calculateButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: '#8B7CFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calculateButtonDisabled: {
    opacity: 0.4,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calculateText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  errorText: {
    marginBottom: 10,
    color: '#D9534F',
    fontSize: 13,
    fontWeight: '600',
  },
  confirmationCard: {
    marginTop: 8,
    backgroundColor: '#E8E5FF',
    borderRadius: 24,
    padding: 18,
  },
  confirmationTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0B1020',
    marginBottom: 12,
  },
  itemRow: {
    backgroundColor: '#F7F8FC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0B1020',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  itemMacros: {
    fontSize: 12,
    color: '#9E9E9E',
    fontWeight: '500',
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  totalPill: {
    width: '48%',
    height: 38,
    borderRadius: 999,
    backgroundColor: '#F7F8FC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  totalPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0B1020',
  },
  confirmActionRow: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#DCD6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editText: {
    color: '#5A5198',
    fontSize: 14,
    fontWeight: '800',
  },
  confirmButton: {
    flex: 2,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#8B7CFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});