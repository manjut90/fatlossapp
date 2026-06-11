// HomeScreen.tsx

import { MissionCard } from '../components/MissionCard';
import { useHealth } from '../context/HealthContext';
import { getWeatherTemp } from '../services/weather';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Share,
} from 'react-native';

import {
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle as SvgCircle } from 'react-native-svg';

import {
  Flame,
  Droplets,
  Footprints,
  MoonStar,
  Bed,
  Leaf,
  Sparkles,
  CloudRain,
  Share2,
  Dumbbell,
  Utensils,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react-native';

import { useAuth } from '../context/AuthContext';

// ── PROGRESS RING component ──
function ProgressRing({
  progress,
  color,
  size = 68,
  strokeWidth = 4,
  children,
  completed,
}: any) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        {/* Background track */}
        <SvgCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#ECECEC"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress arc */}
        <SvgCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={completed ? color : color + '99'}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children}
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
    const [firstName, setFirstName] = useState('');
  const [greeting, setGreeting] = useState('Hey');

  const { profile } = useAuth();
  const { healthData, refreshHealthData } = useHealth();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning,');
    } else if (hour < 18) {
      setGreeting('Good afternoon,');
    } else {
      setGreeting('Good evening,');
    }
  }, []);

  useEffect(() => {
    const rawName = profile?.full_name || profile?.username || '';
    if (rawName) {
      const name = rawName.split(' ')[0];
      setFirstName(name.charAt(0).toUpperCase() + name.slice(1));
    }
  }, [profile?.full_name, profile?.username]);
  const [temperature, setTemperature] = useState<number | null>(null);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    const fetchAiSummary = async () => {
      setSummaryLoading(true);
      try {
        const claudeKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
        if (!claudeKey) {
          setAiSummary(getPrimeStateSummary()); // Fallback to local summary
          return;
        }

        const prompt = `You are a world-class fitness coach and nutritionist. The user's stats today: calories=${healthData.todayCalories}, protein=${healthData.todayProtein}g, water=${healthData.todayWater}ml, sleep=${healthData.todaySleep}h, workout=${healthData.todayWorkout}, goal=${userGoal}, current weight=${currentWeight}kg, target weight=${targetWeight}kg. Give ONE powerful, specific, data-driven coaching insight in max 20 words. Sound like the top 1% fitness coach. Be direct, specific to their numbers, no fluff.`;

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
            max_tokens: 1000,
            messages: [{ role: 'user', content: prompt }],
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(`Claude API failed: ${res.status}`);
        }
        const data = await res.json();
        const summary = data?.content?.[0]?.text?.trim() || getPrimeStateSummary();
        setAiSummary(summary);

      } catch (error) {
        setAiSummary(getPrimeStateSummary()); // Fallback on error
      } finally {
        setSummaryLoading(false);
      }
    };

    if (healthData.todayCalories > 0 || healthData.todayWorkout) {
      fetchAiSummary();
    } else {
      setAiSummary(getPrimeStateSummary());
    }
  }, [healthData]);


  useFocusEffect(
    useCallback(() => {
      refreshHealthData();
    }, [refreshHealthData])
  );

  const handleViewAllPress = () => navigation.navigate('CheckIn');
  const handleSharePress = async () => {
    try {
      await Share.share({
        message: `I'm at ${dailyScore}% daily score on my transformation journey 🔥`,
      });
    } catch {}
  };
  const handleImprovePress = () => navigation.navigate('CheckIn');

  const dailyScore = healthData?.dailyScore || 0;
  const caloriesGoal = profile?.target_calories || 2000;
  const proteinGoal = profile?.target_protein || 150;
  const waterGoal = 2500;
  const sleepGoal = 8;
  const currentWeight = profile?.current_weight || 0;
  const targetWeight = profile?.target_weight || 0;
  const userGoal = profile?.goals?.[0] || 'fat_loss';

  const gender = (profile?.gender || '').toLowerCase().trim();
  const fiberGoal = gender === 'male' || gender === 'man' ? 38 : 25;
  const carbsGoal = 250;
  const fatsGoal = 80;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const livePulse = useRef(new Animated.Value(0)).current;
  const checkInGlow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(livePulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(livePulse, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(checkInGlow, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(checkInGlow, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ])
    ).start();

    getWeatherTemp().then(setTemperature);
  }, []);

  const liveOpacity = livePulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });



  // ── CHECK-IN items with ring progress ──
  const checkInItems = [
    {
      type: 'food',
      label: 'Food',
      icon: <Utensils size={18} color="#FF8C42" />,
      ringColor: '#FF8C42',
      dotColor: '#FF8C42',
      bubbleColor: '#FFF0DD',
      completed: healthData.todayCalories > 0,
      progress: Math.min(100, (healthData.todayCalories / caloriesGoal) * 100),
    },
    {
      type: 'water',
      label: 'Water',
      icon: <Droplets size={18} color="#4AA9FF" />,
      ringColor: '#4AA9FF',
      dotColor: '#4AA9FF',
      bubbleColor: '#E8F5FF',
      completed: healthData.todayWater >= waterGoal * 0.8,
      progress: Math.min(100, (healthData.todayWater / waterGoal) * 100),
    },
    {
      type: 'workout',
      label: 'Workout',
      icon: <Dumbbell size={18} color="#8B7CFF" />,
      ringColor: '#8B7CFF',
      dotColor: '#8B7CFF',
      bubbleColor: '#EAE6FF',
      completed: !!healthData.todayWorkout,
      progress: healthData.todayWorkout ? 100 : 0,
    },
    {
      type: 'sleep',
      label: 'Sleep',
      icon: <MoonStar size={18} color="#FFAD42" />,
      ringColor: '#FFAD42',
      dotColor: '#FFAD42',
      bubbleColor: '#FFF8EC',
      completed: healthData.todaySleep >= 7,
      progress: Math.min(100, (healthData.todaySleep / sleepGoal) * 100),
    },
  ];

  // ── PRIME STATE — personal health summary ──
  const getPrimeStateTitle = () => {
    const wins = [];
    if (healthData.todayWorkout) wins.push(1);
    if (healthData.todayWater / waterGoal >= 0.8) wins.push(1);
    if (healthData.todaySleep >= 7) wins.push(1);
    if (healthData.todayCalories > 0) wins.push(1);

    if (wins.length >= 4) return 'Peak Momentum';
    if (wins.length >= 2) return 'Building Rhythm';
    if (wins.length > 0) return 'On Track';
    return 'Starting Strong';
  };

  const getPrimeStateSummary = () => {
    const { todayProtein, todayWater, todayWorkout } = healthData;
    const proteinGoal = profile?.target_protein || 150;

    if (todayProtein > 0 && todayProtein < proteinGoal * 0.5) {
      return "Protein critically low. Add 2 eggs or 100g chicken to your next meal.";
    }
    if (todayWater < 1000) {
      return "Under 1L water logged. Dehydration kills fat loss by 23%. Drink now.";
    }
    if (!todayWorkout) {
      return "No workout logged yet. Even 20 mins raises metabolism for 14 hours.";
    }
    return "Log your meals and workout to unlock your personalised coaching insight.";
  };

  // XP progress toward next level (1000 XP per level)
  const xpInCurrentLevel =
  (healthData.totalXp || 0) % 500;

const xpProgress =
  (xpInCurrentLevel / 500) * 100;

  // ── OPTIMIZE TODAY — only shows when off track ──
  const getOptimizeItems = () => {
    const items = [];
    const caloriesRemaining = caloriesGoal - healthData.todayCalories;
    const proteinRemaining = proteinGoal - healthData.todayProtein;
    const waterRemaining = waterGoal - healthData.todayWater;

    if (caloriesRemaining > caloriesGoal * 0.4) {
      items.push('Log your next meal to fuel your progress');
    }
    if (proteinRemaining > 30) {
      items.push('Add a protein source like eggs or chicken to your next meal');
    }
    if (waterRemaining > waterGoal * 0.5) {
      items.push('A glass of water right now is a great idea');
    }
    if (!healthData.todayWorkout) {
      items.push('Even a 20-min walk is a win for today');
    }
    return items;
  };

  const optimizeItems = getOptimizeItems();
  const isOffTrack = optimizeItems.length > 0;

  // ── MACROS STATUS labels ──
  const getMacroStatus = (value: number, target: number) => {
    const pct = value / target;
    if (pct < 0.3) return 'Low';
    if (pct > 1.1) return 'Over';
    if (pct >= 1) return 'Hit ✓';
    return 'On track';
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0B1020', '#0B1020', '#0B1020']}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 90 }}
      >
        <Animated.View style={{ opacity: fadeAnim }}>

          {/* ══════════════════════════════
              HEADER
          ══════════════════════════════ */}
          <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
            <View style={styles.headerContent}>
              {/* Left side: Avatar + Greeting */}
              <View style={styles.headerLeft}>
                <View style={styles.avatar}>
                  <Image
                    source={require('../assets/neo_logo.png')}
                    style={{ width: 52, height: 52, resizeMode: 'contain' }}
                  />
                </View>
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                    <Text style={styles.greeting}>{greeting} </Text>
                    <Text style={styles.friendText}>{firstName || 'there'}</Text>
                  </View>
                  <Text style={styles.subtitle}>
                    <Text style={{ color: '#F7C873', fontWeight: '900', fontSize: 13, letterSpacing: 2 }}>EARN. </Text>
                    <Text style={{ color: '#8B7CFF', fontWeight: '900', fontSize: 13, letterSpacing: 2 }}>RISE. </Text>
                    <Text style={{ color: '#FF8FA3', fontWeight: '900', fontSize: 13, letterSpacing: 2 }}>ASCEND.</Text>
                  </Text>
                </View>
              </View>

              {/* Right side: Bell */}
              <View style={{ width: 28 }} />
            </View>
          </View>

{/* DAILY MISSION */}
<MissionCard />

          {/* ══════════════════════════════
              TODAY'S CHECK-INS
              Original timeline layout with progress rings
          ══════════════════════════════ */}
          <View style={styles.checkinCard}>
            <View style={styles.checkinHeader}>
              <View style={styles.checkinTitleWrap}>
                <View style={{ width: 18, height: 18, alignItems: 'center', justifyContent: 'center', marginRight: 6 }}>
                  <Animated.View style={{
                    position: 'absolute',
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    backgroundColor: '#8B7CFF',
                    opacity: checkInGlow.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.4] }),
                    transform: [{ scale: checkInGlow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] }) }],
                  }} />
                  <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#8B7CFF' }} />
                </View>
                <Text style={styles.checkinTitle}>TODAY'S CHECK-INS</Text>
              </View>
            </View>

            {/* Timeline with rings */}
            <View style={styles.timelineWrap}>
              {checkInItems.map((item, index) => (
                <React.Fragment key={item.type}>
                  <View
                    style={styles.timelineItem}
                  >
                    {/* Progress ring around icon */}
                    <ProgressRing
                      progress={item.progress}
                      color={item.ringColor}
                      size={50}
                      strokeWidth={4}
                      completed={item.completed}
                    >
                      <View style={[styles.timelineBubble, { backgroundColor: item.bubbleColor }]}>
                        {item.icon}
                      </View>
                    </ProgressRing>

                    <Text style={styles.timelineLabel}>{item.label}</Text>

                    {/* Glowing dot when complete, plain dot when pending */}
                    {item.completed ? (
                      <View style={[styles.completedDot, {
                        backgroundColor: item.dotColor,
                        shadowColor: item.dotColor,
                      }]} />
                    ) : (
                      <View style={styles.pendingDot} />
                    )}
                  </View>
                  {index < checkInItems.length - 1 && (
                    <View style={styles.timelineConnector} />
                  )}
                </React.Fragment>
              ))}
            </View>
          </View>

          {/* ══════════════════════════════
              PRIME STATE — Personal Summary
          ══════════════════════════════ */}
          <View style={styles.primeCard}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSharePress}
              style={styles.shareFloating}
            >
              <Share2 size={14} color="#7C7C7C" strokeWidth={2.2} />
            </TouchableOpacity>

            <View style={styles.primeLeft}>
              <View style={styles.primeTopRow}>
                <View style={styles.primeTag}>
                  <Sparkles size={12} color="#8B7CFF" />
                  <Text style={styles.primeTagText}>YOUR SUMMARY</Text>
                </View>
                <View style={styles.weatherPill}>
                  <CloudRain size={11} color="#88A1A8" />
                  <Text style={styles.weatherText}>{temperature ?? '--'}°</Text>
                </View>
              </View>

              <Text style={styles.primeTitle}>{getPrimeStateTitle()}</Text>
              <Text style={styles.primeSub}>
                {summaryLoading ? 'Neo is reviewing your data...' : aiSummary || getPrimeStateSummary()}
              </Text>

              {/* Level + XP */}
              <View style={styles.levelSection}>
                <Text style={styles.levelText}>LEVEL {healthData.level || 1}</Text>
                <View style={styles.levelTrack}>
                  <LinearGradient
                    colors={['#8B7CFF', '#FF8FA3']}
                    style={[styles.levelFill, { width: `${xpProgress}%` }]}
                  />
                </View>
                <Text style={styles.xpText}>
  +{healthData.xp || 0} XP today • {healthData.totalXp || 0} Total XP
</Text>
              </View>
            </View>

            <View style={styles.verticalDivider} />

            {/* Right: Calories In vs Burned */}
            <View style={styles.primeRight}>
              <TouchableOpacity onPress={() => navigation.navigate('CheckIn', { screen: 'Food' })}>
                <Metric
                  icon={<Flame size={14} color="#F3A24B" />}
                  title="CALORIES IN"
                  value={`${healthData.todayCalories}`}
                  sub={`${healthData.todayCalories} / ${caloriesGoal}`}
                  color="#F3A24B"
                  progress={Math.min(100, (healthData.todayCalories / caloriesGoal) * 100)}
                  textColor='#F7F8FC'
                  subColor='#6B7280'
                />
              </TouchableOpacity>
              <View style={styles.metricDivider} />
              <TouchableOpacity onPress={() => navigation.navigate('CheckIn', { screen: 'Activity' })}>
                <Metric
                  icon={<TrendingUp size={14} color="#FF5F85" />}
                  title="CAL BURNED"
                  value={`${healthData.todayCaloriesBurned || 0}`}
                  sub={healthData.todayWorkout ? 'From workout' : 'No workout yet'}
                  color="#FF5F85"
                  progress={Math.min(100, ((healthData.todayCaloriesBurned || 0) / 500) * 100)}
                  textColor='#F7F8FC'
                  subColor='#6B7280'
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* ══════════════════════════════
              HEALTH OVERVIEW
          ══════════════════════════════ */}
          <View style={styles.healthOverview}>
            <HealthMini
              icon={<Droplets size={17} color="#4B9EFF" />}
              title="HYDRATE"
              value={`${((healthData.todayWater || 0) / 1000).toFixed(1)}L`}
              sub={`${Math.min(100, Math.round(((healthData.todayWater || 0) / waterGoal) * 100))}%`}
              color="#4B9EFF"
            />
            <HealthMini
              icon={<MoonStar size={17} color="#8B6BFF" />}
              title="RECOVER"
              value={`${dailyScore}%`}
              sub="Score"
              color="#8B6BFF"
            />
            <HealthMini
              icon={<Footprints size={17} color="#59A95D" />}
              title="MOVE"
              value={healthData.todayWorkout ? 'Done' : '--'}
              sub={healthData.todayWorkout ? 'Tracked' : 'Pending'}
              color="#59A95D"
            />
            <HealthMini
              icon={<Bed size={17} color="#5A9CFF" />}
              title="SLEEP"
              value={`${healthData.todaySleep || 0}h`}
              sub={healthData.todaySleep >= 7 ? 'Good' : healthData.todaySleep > 0 ? 'Low' : '--'}
              color="#5A9CFF"
            />
            <HealthMini
              icon={<Flame size={17} color="#FF922E" />}
              title="STREAK"
              value={`${healthData.streak || 0}`}
              sub="days"
              color="#FF922E"
            />
          </View>

          {/* ══════════════════════════════
              OPTIMIZE TODAY
              Only shows when off track
          ══════════════════════════════ */}
          {isOffTrack && (
            <View style={styles.optimizeCard}>
              <View style={styles.optimizeLeft}>
                <View style={styles.optimizeTop}>
                  <AlertTriangle size={13} color="#F59E0B" />
                  <Text style={styles.optimizeLabel}>OPTIMIZE TODAY</Text>
                </View>
                {optimizeItems.slice(0, 2).map((item, i) => (
                  <View key={i} style={styles.optimizeItem}>
                    <View style={styles.optimizeDot} />
                    <Text style={styles.optimizeText}>{item}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleImprovePress}
                style={styles.optimizeButton}
              >
                <Text style={styles.optimizeButtonText}>Fix it</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ══════════════════════════════
              MACROS BREAKDOWN
              Protein + Carbs + Fats + Fiber
              with progress bars
          ══════════════════════════════ */}
          <View style={styles.fuelCard}>
            <View style={styles.fuelHeader}>
              <View style={styles.fuelTitleWrap}>
                <Leaf size={14} color="#5EA765" strokeWidth={2.2} />
                <Text style={styles.fuelTitle}>MACROS BREAKDOWN</Text>
              </View>
            </View>

            {[
              { label: 'PROTEIN', value: healthData.todayProtein || 0, target: proteinGoal, unit: 'g', color: '#8B7CFF' },
              { label: 'CARBS', value: healthData.todayCarbs || 0, target: carbsGoal, unit: 'g', color: '#4A90FF' },
              { label: 'FATS', value: healthData.todayFats || 0, target: fatsGoal, unit: 'g', color: '#FF8C42' },
              { label: 'FIBER', value: healthData.todayFiber || 0, target: fiberGoal, unit: 'g', color: '#5EA765' },
            ].map((macro) => (
              <View key={macro.label} style={styles.macroRow}>
                <Text style={[styles.macroLabel, { color: macro.color }]}>{macro.label}</Text>
                <View style={styles.macroBarWrap}>
                  <View style={styles.macroBar}>
                    <View style={[
                      styles.macroFill,
                      {
                        width: `${Math.min(100, (macro.value / macro.target) * 100)}%`,
                        backgroundColor: macro.color,
                      },
                    ]} />
                  </View>
                </View>
                <Text style={styles.macroValue}>
                  {Math.round(macro.value)}{macro.unit}
                  <Text style={styles.macroTarget}>/{macro.target}{macro.unit}</Text>
                </Text>
                <Text style={[styles.macroStatus, { color: macro.color }]}>
                  {getMacroStatus(macro.value, macro.target)}
                </Text>
              </View>
            ))}
          </View>

        </Animated.View>
      </ScrollView>
    </View>
  );
}

function Metric({ icon, title, value, sub, progress, color, textColor, subColor }: any) {
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {icon}
        <Text style={{ marginLeft: 7, color: '#666', fontSize: 9, fontWeight: '700' }}>
          {title}
        </Text>
      </View>
      <Text style={{ fontSize: 22, fontWeight: '800', color: textColor || '#1E1E1E', marginTop: 8 }}>
        {value}
      </Text>
      <Text style={{ color: subColor || '#777', marginTop: 2, fontSize: 10 }}>{sub}</Text>
      <View style={{ height: 5, backgroundColor: '#1A2235', borderRadius: 999, overflow: 'hidden', marginTop: 10 }}>
        <View style={{ width: `${progress}%`, height: 5, backgroundColor: color }} />
      </View>
    </View>
  );
}

function HealthMini({ icon, title, value, sub, color }: any) {
  return (
    <View style={styles.healthMiniCard}>
      <View style={[styles.iconGlowWrap, { shadowColor: color, shadowOpacity: 0.3, shadowRadius: 10 }]}>
        {icon}
      </View>
      <Text style={[styles.healthMiniLabel, { color }]}>{title}</Text>
      <Text style={styles.healthMiniValue}>{value}</Text>
      <Text style={styles.healthMiniSub}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1020' },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: '#0B1020',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'transparent',
    marginRight: 12,
    position: 'relative',
  },
  brainIconWrapper: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#1A2235',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0B1020',
  },
  greeting: {
    fontFamily: 'Epilogue-Bold',
    fontSize: 20,
    color: '#F7F8FC',
    fontWeight: '700',
  },
  friendText: {
    fontFamily: 'Epilogue-Bold',
    fontSize: 22,
    color: '#8B7CFF',
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 6,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: '900',
  },
  betterYou: {
    color: '#8B7CFF',
    fontWeight: 'bold',
  },

  // CHECK-IN CARD
  checkinCard: {
    marginHorizontal: 18, marginTop: 18, backgroundColor: '#131929',
    borderRadius: 24, paddingTop: 16, paddingBottom: 18, paddingHorizontal: 16,
    borderWidth: 1, borderColor: 'rgba(139,124,255,0.2)',
  },
  checkinHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18,
  },
  checkinTitleWrap: { flexDirection: 'row', alignItems: 'center' },
  checkinIconMini: {
    width: 18, height: 18, borderRadius: 9, backgroundColor: 'rgba(139,124,255,0.1)',
    justifyContent: 'center', alignItems: 'center', marginRight: 8,
  },
  liveDot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: '#63BA63',
    position: 'absolute', bottom: 0, right: 0,
  },
  checkinClock: { fontSize: 10, color: '#8B7CFF', fontWeight: '700' },
  checkinTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, color: '#8B7CFF' },

  // TIMELINE with rings
  timelineWrap: {
    flexDirection: 'row', alignItems: 'flex-start',
  },
  timelineConnector: {
    flex: 1, height: 2, backgroundColor: 'rgba(139,124,255,0.3)', marginTop: 30,
  },
  timelineItem: { alignItems: 'center', width: 72 },
  timelineBubble: {
    width: 37, height: 37, 
    borderRadius: 19, justifyContent: 'center', alignItems: 'center',
  },
  timelineLabel: { marginTop: 10, fontSize: 10, color: '#F7F8FC', fontWeight: '700' },
  completedDot: {
    width: 10, height: 10, borderRadius: 5, marginTop: 8,
    shadowOpacity: 0.7, shadowRadius: 6, shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  pendingDot: {
    width: 10, height: 10, borderRadius: 5, marginTop: 8,
    borderWidth: 2, borderColor: '#6B7280', backgroundColor: '#1A2235',
  },

  // PRIME CARD
  primeCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#131929',
    borderRadius: 28,
    padding: 20,
    flexDirection: 'row',
    position: 'relative',
    shadowColor: '#8B7CFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  shareFloating: { position: 'absolute', right: 14, bottom: 14 },
  primeLeft: { width: '55%' },
  primeRight: { width: '31%' },
  primeTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  primeTag: { flexDirection: 'row', alignItems: 'center' },
  primeTagText: { marginLeft: 6, fontSize: 10, color: '#8B7CFF', fontWeight: '700' },
  weatherPill: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A2235',
    borderRadius: 30, paddingHorizontal: 8, paddingVertical: 5,
  },
  weatherText: { marginLeft: 4, color: '#6B7280', fontSize: 9 },
  primeTitle: { fontSize: 20, fontWeight: '800', color: '#F7F8FC', marginTop: 22 },
  primeSub: { marginTop: 4, color: '#6B7280', fontSize: 15, lineHeight: 24 },
  levelSection: { marginTop: 30 },
  levelText: { color: '#8B7CFF', fontWeight: '800', fontSize: 10 },
  levelTrack: {
    width: 130, height: 4, borderRadius: 999, backgroundColor: '#1A2235',
    overflow: 'hidden', marginTop: 8,
  },
  levelFill: { height: 4, borderRadius: 999 },
  xpText: { color: '#8B7CFF', fontWeight: '600', fontSize: 9, marginTop: 8 },
  verticalDivider: { width: 1, backgroundColor: 'rgba(139,124,255,0.15)', marginHorizontal: 16 },
  metricDivider: { height: 1, backgroundColor: 'rgba(139,124,255,0.15)', marginVertical: 16 },

  // HEALTH OVERVIEW
  healthOverview: {
    marginHorizontal: 18, marginTop: 16, backgroundColor: '#131929',
    borderRadius: 28, paddingVertical: 16, paddingHorizontal: 6,
    borderWidth: 1, borderColor: 'rgba(139,124,255,0.2)', flexDirection: 'row', justifyContent: 'space-between',
  },
  healthMiniCard: { width: '19%', alignItems: 'center' },
  iconGlowWrap: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: '#1A2235',
    justifyContent: 'center', alignItems: 'center',
  },
  healthMiniLabel: { marginTop: 8, fontSize: 8, fontWeight: '700' },
  healthMiniValue: { marginTop: 8, fontSize: 17, fontWeight: '800', color: '#F7F8FC' },
  healthMiniSub: { marginTop: 2, fontSize: 10, color: '#6B7280' },

  // OPTIMIZE TODAY
  optimizeCard: {
    marginHorizontal: 18, marginTop: 14, backgroundColor: '#131929',
    borderRadius: 22, paddingVertical: 14, paddingHorizontal: 16,
    borderWidth: 1, borderColor: 'rgba(247,200,115,0.3)', flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
  },
  optimizeLeft: { flex: 1, paddingRight: 10 },
  optimizeTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  optimizeLabel: { marginLeft: 6, fontSize: 10, fontWeight: '800', color: '#F7C873' },
  optimizeItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  optimizeDot: {
    width: 5, height: 5, borderRadius: 3, backgroundColor: '#F7C873',
    marginTop: 5, marginRight: 7,
  },
  optimizeText: { flex: 1, fontSize: 12, lineHeight: 18, color: '#6B7280' },
  optimizeButton: {
    height: 36, paddingHorizontal: 14, borderRadius: 14,
    backgroundColor: 'rgba(247,200,115,0.2)', justifyContent: 'center', alignItems: 'center',
  },
  optimizeButtonText: { color: '#F7C873', fontWeight: '700', fontSize: 12 },

  // MACROS BREAKDOWN
  fuelCard: {
    marginHorizontal: 18, marginTop: 12, backgroundColor: '#131929',
    borderRadius: 22, paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 1, borderColor: 'rgba(139,124,255,0.2)',
  },
  fuelHeader: { marginBottom: 14 },
  fuelTitleWrap: { flexDirection: 'row', alignItems: 'center' },
  fuelTitle: { marginLeft: 7, fontSize: 10, fontWeight: '800', color: '#F7F8FC' },
  macroRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 6,
  },
  macroLabel: { fontSize: 9, fontWeight: '800', width: 52, letterSpacing: 0.5 },
  macroBarWrap: { flex: 1 },
  macroBar: { height: 7, backgroundColor: '#1A2235', borderRadius: 4, overflow: 'hidden' },
  macroFill: { height: '100%', borderRadius: 4 },
  macroValue: { fontSize: 11, fontWeight: '700', color: '#F7F8FC', width: 58, textAlign: 'right' },
  macroTarget: { fontSize: 10, color: '#6B7280', fontWeight: '500' },
  macroStatus: { fontSize: 9, fontWeight: '800', width: 44, textAlign: 'right' },
});