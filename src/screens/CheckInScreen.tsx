

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
} from 'react-native';

import BottomSheet from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';

import {
  Utensils,
  Activity,
  Droplets,
  MoonStar as Moon,
  ChevronRight,
  CheckCircle,
  Check,
} from 'lucide-react-native';


import WaterSheet from '../components/checkin/WaterSheet';
import ActivitySheet from '../components/checkin/ActivitySheet';
import FoodSheet from '../components/checkin/FoodSheet';
import SleepSheet from '../components/checkin/SleepSheet';
import SuccessToast from '../components/checkin/SuccessToast';
import { getRandomMessage } from '../services/toast';
import { useHealth } from '../context/HealthContext';

export default function CheckInScreen() {
  const { healthData, addParsedCheckIn } = useHealth();
  const { profile } = useAuth();
  const firstName = profile?.full_name?.split(' ')[0] || 'Champ';
  const insets = useSafeAreaInsets();

  const waterSheetRef = useRef<BottomSheet>(null);
  const foodSheetRef = useRef<BottomSheet>(null);
  const activitySheetRef = useRef<BottomSheet>(null);
  const sleepSheetRef = useRef<BottomSheet>(null);

  const [activeSheet, setActiveSheet] = useState<string | null>(null);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');



  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2200);
  };

  const checkIns = [
    {
      id: 'food',
      icon: <Utensils size={22} color="#8B7CFF" />,
      title: 'Food',
      desc: 'Log your meals',
      color: '#8B7CFF',
      bg: '#EAE6FF',
      done: healthData.todayCalories > 0,
      doneText: `${healthData.todayCalories} kcal logged`,
      onPress: () => {
        // close all
        foodSheetRef.current?.close();
        activitySheetRef.current?.close();
        waterSheetRef.current?.close();
        sleepSheetRef.current?.close();
        // open this one after brief delay
        setTimeout(() => foodSheetRef.current?.snapToIndex(0), 100);
        setActiveSheet('food');
      },
    },
    {
      id: 'activity',
      icon: <Activity size={22} color="#4AA9FF" />,
      title: 'Activity',
      desc: 'Log your workout',
      color: '#4AA9FF',
      bg: '#EBF5FF',
      done: healthData.todayWorkout,
      doneText: 'Workout logged ✅',
      onPress: () => {
        // close all
        foodSheetRef.current?.close();
        activitySheetRef.current?.close();
        waterSheetRef.current?.close();
        sleepSheetRef.current?.close();
        // open this one after brief delay
        setTimeout(() => activitySheetRef.current?.snapToIndex(0), 100);
        setActiveSheet('activity');
      },
    },
    {
      id: 'water',
      icon: <Droplets size={22} color="#22C55E" />,
      title: 'Water',
      desc: 'Log your hydration',
      color: '#22C55E',
      bg: '#EDFBF1',
      done: healthData.todayWater > 0,
      doneText: `${healthData.todayWater}ml logged`,
      onPress: () => {
        // close all
        foodSheetRef.current?.close();
        activitySheetRef.current?.close();
        waterSheetRef.current?.close();
        sleepSheetRef.current?.close();
        // open this one after brief delay
        setTimeout(() => waterSheetRef.current?.snapToIndex(0), 100);
        setActiveSheet('water');
      },
    },
    {
      id: 'sleep',
      icon: <Moon size={22} color="#FFAD42" />,
      title: 'Sleep',
      desc: "Log last night's sleep",
      color: '#FFAD42',
      bg: '#FFF8EC',
      done: healthData.todaySleep > 0,
      doneText: `${healthData.todaySleep}h logged`,
      onPress: () => {
        // close all
        foodSheetRef.current?.close();
        activitySheetRef.current?.close();
        waterSheetRef.current?.close();
        sleepSheetRef.current?.close();
        // open this one after brief delay
        setTimeout(() => sleepSheetRef.current?.snapToIndex(0), 100);
        setActiveSheet('sleep');
      },
    },
  ];

  const completedCount = checkIns.filter(c => c.done).length;

  return (
    <>
      <StatusBar barStyle="dark-content" />

      <View style={styles.container}>
        <SuccessToast visible={toastVisible} message={toastMessage} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 160 }}
        >
          {/* ── HEADER ── */}
          <View style={{ paddingHorizontal: 20, paddingTop: insets.top + 4, paddingBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <View style={{
                width: 40, height: 40, borderRadius: 20,
                background: 'linear-gradient(135deg, #C68BFF, #8B7CFF)',
                backgroundColor: '#8B7CFF',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ fontSize: 12, fontWeight: '900', color: '#FFFFFF', letterSpacing: 1 }}>NEO</Text>
              </View>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#8B7CFF', letterSpacing: 1 }}>Your Fitness Coach</Text>
            </View>
            <Text style={{ fontSize: 26, fontWeight: '900', color: '#1B1B1B', lineHeight: 36 }}>
              {`Hey ${firstName}, what are we `}
              <Text style={{
                backgroundColor: '#FFE5EC',
                color: '#E8476A',
                fontWeight: '900',
                paddingHorizontal: 4,
                borderRadius: 6,
              }}>Crushing</Text>
              {` today?`}
            </Text>
            <Text style={{ fontSize: 14, color: '#888', marginTop: 6, fontWeight: '500' }}>
              {completedCount === 4 ? 'You nailed it today. Seriously. 🔥' : `${completedCount}/4 logged — keep building that streak.`}
            </Text>
          </View>

          {/* ── CHECK-IN CARDS ── */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12 }}>
            {checkIns.map(item => (
              <TouchableOpacity
                key={item.id}
                onPress={item.onPress}
                activeOpacity={0.85}
                style={{
                  width: '47%',
                  backgroundColor: item.bg,
                  borderRadius: 24,
                  padding: 20,
                  borderWidth: 1.5,
                  borderColor: item.done ? item.color + '55' : '#F0F0F0',
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
                    {item.icon}
                  </View>
                  {item.done && (
                    <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: item.color, alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={12} color="#FFFFFF" strokeWidth={3} />
                    </View>
                  )}
                </View>
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#1B1B1B', marginBottom: 4 }}>{item.title}</Text>
                <Text style={{ fontSize: 12, color: item.done ? item.color : '#888', fontWeight: '600' }}>
                  {item.done ? item.doneText : item.desc}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── COMPLETION MESSAGE ── */}
          {completedCount === 4 && (
            <View style={styles.completedBanner}>
              <Text style={styles.completedEmoji}>🎉</Text>
              <Text style={styles.completedText}>
                All done for today! You're building great habits.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* ── SHEETS ── */}
        <WaterSheet
          ref={waterSheetRef}
          onSave={async (amount: number) => {
            await addParsedCheckIn({ water: amount / 1000 });
            waterSheetRef.current?.close();
            showToast(getRandomMessage('water'));
          }}
        />

        <FoodSheet
          ref={foodSheetRef}
          onSave={async (payload: any) => {
            await addParsedCheckIn({ ...payload });
            foodSheetRef.current?.close();
            showToast(getRandomMessage('food'));
          }}
        />

        <ActivitySheet
          ref={activitySheetRef}
          onSelect={async (payload: any) => {
            await addParsedCheckIn({ workout: true, ...payload });
            activitySheetRef.current?.close();
            showToast(getRandomMessage('activity'));
          }}
        />

        <SleepSheet
          ref={sleepSheetRef}
          onSelect={async (hours: number) => {
            await addParsedCheckIn({ sleep: hours });
            sleepSheetRef.current?.close();
            showToast(getRandomMessage('sleep'));
          }}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },
  header: {
    paddingTop: 68,
    paddingHorizontal: 22,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0B1020',
  },
  progressPill: {
    backgroundColor: '#8B7CFF',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  chatLauncher: {
    marginTop: 16,
    marginHorizontal: 18,
    backgroundColor: '#F7F8FC',
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: '#EEE6DA',
  },
  neoOrb: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  neoText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  chatTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0B1020',
  },
  chatSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: '#8A8A8A',
  },
  cardsSection: {
    marginTop: 24,
    paddingHorizontal: 18,
  },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: '800',
    color: '#8A8A8A',
    marginBottom: 14,
  },
  checkInCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0ECFF',
  },
  checkInCardDone: {
    borderColor: '#E8FFE8',
    backgroundColor: '#FAFFFE',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0B1020',
  },
  cardDesc: {
    marginTop: 3,
    fontSize: 13,
    color: '#888888',
    fontWeight: '500',
  },
  completedBanner: {
    marginHorizontal: 18,
    marginTop: 8,
    backgroundColor: '#F0FFF4',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  completedEmoji: {
    fontSize: 24,
  },
  completedText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
    lineHeight: 20,
  },
});