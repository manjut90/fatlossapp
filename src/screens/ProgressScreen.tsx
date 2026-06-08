import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar,
  TouchableOpacity, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap, TrendingDown, TrendingUp, Flame, RefreshCw, CheckCircle2, Circle, Clock3 } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useHealth } from '../context/HealthContext';
import { useProgressMetrics } from '../hooks/useProgressMetrics';
import { useHistoricalData } from '../hooks/useHistoricalData';

const MOTIVATIONAL_LINES = [
  "The only bad workout is the one that didn't happen.",
  "Success isn't always about greatness. It's about consistency.",
  "The body achieves what the mind believes.",
  "Don't limit your challenges. Challenge your limits.",
  "The pain you feel today will be the strength you feel tomorrow.",
  "You are one workout away from a good mood.",
];

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const { healthData, refreshHealthData } = useHealth();
  const metrics = useProgressMetrics();
  const { dailyData, currentWeight, firstWeightEntry } = useHistoricalData();

  const [tagline] = useState(() => MOTIVATIONAL_LINES[new Date().getDay() % MOTIVATIONAL_LINES.length]);
  const [aiSummary, setAiSummary] = useState<{ good: string[]; bad: string[]; actions: string[] } | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'overall'>('weekly');

  const thunderAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(thunderAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(thunderAnim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useFocusEffect(useCallback(() => { refreshHealthData(); }, [refreshHealthData]));

  const firstName = profile?.full_name?.split(' ')[0] || 'Champ';
  const goal = profile?.goal || profile?.goals?.[0] || 'fat_loss';
  const startWeight = parseFloat(profile?.current_weight) || parseFloat(profile?.weight) || parseFloat(currentWeight) || 0;
  const currWeight = parseFloat(currentWeight) || parseFloat(profile?.current_weight) || 0;
  const goalWeight = parseFloat(profile?.target_weight) > 0
    ? parseFloat(profile?.target_weight)
    : parseFloat(profile?.current_weight) > 0
      ? Math.max(parseFloat(profile?.current_weight) - 5, 50)
      : '--';
  const targetWeight = parseFloat(profile?.target_weight) || 65;
  const weightDiff = parseFloat((startWeight - currWeight).toFixed(1));
  const isLoss = goal === 'fat_loss' ? weightDiff >= 0 : weightDiff <= 0;
  const weightDiffAbs = Math.abs(weightDiff);
  const diffColor = isLoss ? '#6EE7A0' : '#FFAD6B';
  const weeklyDiff = parseFloat((metrics?.overallMetrics?.weeklyLossRate || 0).toFixed(2));
  const pct = Math.min(100, Math.max(0, Math.round(metrics?.overallMetrics?.percentageComplete || 0)));
  const weeksLeft = Math.ceil(metrics?.overallMetrics?.weeksRemaining || 0);
  const kgLeft = Math.abs(parseFloat((currWeight - targetWeight).toFixed(1)));
  const journeyPct = startWeight !== targetWeight
    ? Math.min(100, Math.max(0, ((startWeight - currWeight) / (startWeight - targetWeight)) * 100))
    : 50;

  const periodDays = period === 'weekly' ? 7 : period === 'monthly' ? 30 : (dailyData?.length || 7);
  const periodData = (dailyData || []).slice(-periodDays);
  const periodLabel = period === 'weekly' ? 'This Week' : period === 'monthly' ? 'This Month' : 'All Time';

  const periodWeightDiff = (() => {
    if (!periodData.length) return weightDiff;
    const first = periodData.find(d => d.weight)?.weight || startWeight;
    const last = [...periodData].reverse().find(d => d.weight)?.weight || currWeight;
    return parseFloat((first - last).toFixed(1));
  })();
  const periodDiffAbs = Math.abs(periodWeightDiff);
  const periodColor = isLoss
    ? (periodWeightDiff >= 0 ? '#6EE7A0' : '#FFAD6B')
    : (periodWeightDiff <= 0 ? '#6EE7A0' : '#FFAD6B');

  const fetchAISummary = async (forceRefresh = false) => {
    if (!profile?.id) return;
    setSummaryLoading(true);
    const cacheKey = `progress_summary_${profile.id}_${period}_${new Date().toISOString().split('T')[0]}`;
    const cacheMs = period === 'weekly' ? 7 * 24 * 60 * 60 * 1000
   : period === 'monthly' ? 30 * 24 * 60 * 60 * 1000
   : 15 * 24 * 60 * 60 * 1000;
    try {
      if (!forceRefresh) {
        const AS = (await import('@react-native-async-storage/async-storage')).default;
        const cached = await AS.getItem(cacheKey);
        const expires = await AS.getItem(cacheKey + '_expires');
        const isValid = cached && expires && Date.now() < parseInt(expires);
        if (isValid) { setAiSummary(JSON.parse(cached)); setSummaryLoading(false); return; }
      }
    } catch {}

    const last7 = periodData;
    const avgProtein = last7.length ? (last7.reduce((s, d) => s + (d.protein || 0), 0) / last7.length).toFixed(1) : 0;
    const avgWater = last7.length ? ((last7.reduce((s, d) => s + (d.water || 0), 0) / last7.length) / 1000).toFixed(1) : 0;
    const avgSleep = last7.length ? (last7.reduce((s, d) => s + (d.sleep || 0), 0) / last7.length).toFixed(1) : 0;
    const workoutDays = last7.filter(d => d.workout).length;

    const prompt = `You are a world-class fitness coach reviewing ${firstName}'s ${periodLabel.toLowerCase()} data. Respond ONLY with valid JSON. No markdown, no backticks, no explanation.

Data:
- Goal: ${goal.replace(/_/g, ' ')}
- Weight: ${startWeight}kg → ${currWeight}kg (target: ${targetWeight}kg)
- Period change: ${periodDiffAbs}kg ${periodWeightDiff >= 0 ? 'lost' : 'gained'}
- Progress: ${pct}%
- Workout days: ${workoutDays}/${Math.min(periodDays, 7)}
- Avg protein: ${avgProtein}g (target: ${profile?.target_protein || 150}g)
- Avg water: ${avgWater}L
- Avg sleep: ${avgSleep}h
- Streak: ${healthData.streak} days

Respond with this exact JSON structure:
{
  "good": ["one positive point", "second positive point"],
  "bad": ["one area to improve", "second area to improve"],
  "actions": ["concrete action 1", "concrete action 2"]
}

Each array must have exactly 2 items. Each item max 12 words. Be specific with numbers. No fluff.`;

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
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(`Claude API failed: ${res.status}`);
      }
      const data = await res.json();
      const text = data?.content?.[0]?.text?.trim() || '';
      const clean = text.replace(/```json/gi,'').replace(/```/g,'').trim();
      const parsed = JSON.parse(clean);
      if (parsed?.good && parsed?.bad && parsed?.actions) {
        setAiSummary(parsed);
        const AS = (await import('@react-native-async-storage/async-storage')).default;
        await AS.setItem(cacheKey, JSON.stringify(parsed));
        await AS.setItem(cacheKey + '_expires', String(Date.now() + cacheMs));
      }
    } catch (e) {
      setAiSummary(null);
    } finally {
      setSummaryLoading(false);
    }
  };

const renderStreakDots = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

    return (
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>THIS WEEK’S STREAK</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 10, paddingTop: 10 }}>
          {days.map((day, i) => {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            const hasData = dailyData?.some(x => x.date?.startsWith(dateStr) && (x.calories > 0 || x.workout));
            const isFuture = d > today;
            const isToday = d.toDateString() === today.toDateString();

            let color = '#1A2235'; // Future
            if (!isFuture) {
              color = hasData ? '#22C55E' : '#FCA5A5'; // Past data or missed
            }

            return (
              <View key={day} style={{ alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: isToday ? '#F7F8FC' : '#6B7280' }}>{day}</Text>
                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: color, opacity: isFuture ? 0.5 : 1 }} />
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <>
      <StatusBar barStyle="light-content" />
      <ScrollView style={[styles.container, { paddingTop: insets.top }]} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <Animated.View style={{ opacity: fadeAnim }}>

          <LinearGradient colors={['#1A1235', '#2C142B', '#2E1A1D']} style={styles.welcomeCard}>
            <Text style={styles.welcomeEyebrow}>YOUR PROGRESS REPORT</Text>
            <Text style={styles.welcomeName}>{firstName}’s Journey</Text>
            <Text style={styles.welcomeTagline}>{tagline}</Text>
            <View style={styles.welcomeBadge}>
              <Flame size={12} color="#FF8FA3" />
              <Text style={styles.welcomeBadgeText}>{healthData.streak || 0} day streak</Text>
            </View>
          </LinearGradient>

          <View style={{ flexDirection: 'row', marginHorizontal: 16, marginBottom: 14, backgroundColor: '#1A2235', borderRadius: 16, padding: 4 }}>
            {(['weekly', 'monthly', 'overall'] as const).map(p => (
              <TouchableOpacity
                key={p}
                onPress={() => { setPeriod(p); setAiSummary(null); }}
                style={[{
                  flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center',
                }, period === p && { backgroundColor: '#8B7CFF' }]}
              >
                <Text style={[{ fontSize: 13, fontWeight: '700', color: '#6B7280' }, period === p && { color: '#F7F8FC' }]}>
                  {p === 'weekly' ? 'Weekly' : p === 'monthly' ? 'Monthly' : 'Overall'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <TrendingUp size={18} color="#F7C873" />
              <Text style={styles.sectionTitle}>OVERALL PROGRESS</Text>
            </View>
            <View style={styles.weightChangeRow}>
              <Text style={[styles.weightChangeBig, { color: periodColor }]}>{periodWeightDiff >= 0 ? '-' : '+'}{periodDiffAbs} kg</Text>
            </View>
            <View style={styles.weeklyRow}>
              {isLoss ? <TrendingDown size={14} color={periodColor} /> : <TrendingUp size={14} color={periodColor} />}
              <Text style={[styles.weeklyText, { color: periodColor }]}>{` ${periodDiffAbs} kg ${periodWeightDiff >= 0 ? 'lost' : 'gained'} — ${periodLabel}`}</Text>
            </View>
            <View style={styles.journeyWrap}>
              <View style={styles.journeyLabelRow}>
                <Text style={styles.journeyLabel}>{`Start\n`}<Text style={styles.journeyValue}>{startWeight} kg</Text></Text>
                <Text style={[styles.journeyLabel, { textAlign: 'center' }]}>{`Now\n`}<Text style={[styles.journeyValue, { color: '#8B7CFF' }]}>{currWeight} kg</Text></Text>
                <Text style={[styles.journeyLabel, { textAlign: 'right' }]}>{`Goal\n`}<Text style={styles.journeyValue}>{goalWeight} kg</Text></Text>
              </View>
              <View style={styles.journeyTrack}>
                <LinearGradient colors={['#8B7CFF', '#FF8FA3']} style={[styles.journeyFill, { width: `${journeyPct}%` }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
                <View style={[styles.journeyDot, { left: `${journeyPct}%` }]} />
              </View>
            </View>
          </View>

          {/* GOAL PROGRESS BAR */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>FITNESS GOAL PROGRESS</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#F7F8FC' }}>{pct}% complete</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#8B7CFF' }}>{kgLeft} kg to go</Text>
            </View>
            <View style={{ height: 14, backgroundColor: '#1A2235', borderRadius: 7, overflow: 'hidden', marginBottom: 10 }}>
              <LinearGradient colors={['#8B7CFF', '#FF8FA3']} style={{ width: `${pct}%`, height: '100%', borderRadius: 7 }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
            </View>
            <Text style={{ fontSize: 12, color: '#6B7280', lineHeight: 18 }}>
              {weeksLeft > 0
                ? `At your current pace, you'll hit your target in ~${weeksLeft} weeks. Stay consistent—you're on track.`
                : 'You have reached your target weight. Amazing work—now focus on maintaining it!'}
            </Text>
          </View>

          {/* WEIGHT TREND */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>{`WEIGHT TREND — ${periodLabel.toUpperCase()}`}</Text>
            </View>
            {dailyData && dailyData.length > 0 ? (
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 80 }}>
                {periodData.slice(-Math.min(periodDays, 12)).map((d, i) => {
                  const vals = periodData.slice(-Math.min(periodDays, 12)).map(x => x.weight || currWeight).filter(Boolean);
                  const minW = Math.min(...vals) - 1;
                  const maxW = Math.max(...vals) + 1;
                  const barH = maxW !== minW ? Math.round(((d.weight || currWeight) - minW) / (maxW - minW) * 60) + 10 : 40;
                  return (
                    <View key={i} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                      <Text style={{ fontSize: 9, color: '#6B7280' }}>{(d.weight || currWeight).toFixed(1)}</Text>
                      <View style={{ width: '80%', height: barH, backgroundColor: '#B8A8FF', borderRadius: 4, opacity: 0.65 + i * 0.05 }} />
                      <Text style={{ fontSize: 9, color: '#6B7280' }}>{new Date(d.date).getDate()}</Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text style={{ color: '#6B7280', fontSize: 13, textAlign: 'center', paddingVertical: 20 }}>
                Log your weight for at least two days to see your trend.
              </Text>
            )}
          </View>

          {/* WEEKLY STREAK */}
          {renderStreakDots()}

          {/* XP & LEVEL */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>XP & LEVEL</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#F7F8FC' }}>Level {healthData.level || 1}</Text>
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#8B7CFF' }}>{healthData.xp || 0} / {healthData.xpToNextLevel || 100} XP</Text>
            </View>
            <View style={{ height: 12, backgroundColor: '#1A2235', borderRadius: 6, overflow: 'hidden' }}>
              <LinearGradient
                colors={['#8B7CFF', '#FF8FA3']}
                style={{ width: `${Math.min(100, ((healthData.xp || 0) / (healthData.xpToNextLevel || 100)) * 100)}%`, height: '100%' }}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
          </View>

          {/* NUTRITION TRENDS */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>{`NUTRITION TRENDS — ${periodLabel.toUpperCase()}`}</Text>
            </View>
            {[
              { label: 'Protein', key: 'protein', color: '#8B7CFF', unit: 'g', target: parseFloat(profile?.target_protein) || 150 },
              { label: 'Water', key: 'water', color: '#4AA9FF', unit: 'L', target: 2.5, divisor: 1000 },
              { label: 'Sleep', key: 'sleep', color: '#FFAD42', unit: 'h', target: 8 },
            ].map(m => {
              const last7 = periodData;
              const avg = last7.length
                ? last7.reduce((s, d) => s + ((d[m.key] || 0) / (m.divisor || 1)), 0) / last7.length
                : 0;
              const pctT = Math.min(100, Math.round((avg / m.target) * 100));
              return (
                <View key={m.label} style={{ marginBottom: 14 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#F7F8FC' }}>{m.label}</Text>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: m.color }}>{avg.toFixed(1)}{m.unit} / {m.target}{m.unit}</Text>
                  </View>
                  <View style={{ height: 10, backgroundColor: '#1A2235', borderRadius: 5, overflow: 'hidden' }}>
                    <View style={{ width: `${pctT}%`, height: '100%', backgroundColor: m.color, borderRadius: 5 }} />
                  </View>
                </View>
              );
            })}
          </View>

          {/* ══ AI SUMMARY ══ */}
          <View style={[styles.sectionCard, { marginBottom: 24 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>{`NEO’S ${periodLabel.toUpperCase()} ANALYSIS`}</Text>
              </View>
              <TouchableOpacity
                onPress={() => fetchAISummary(true)}
                disabled={summaryLoading}
                style={{ padding: 4 }}
              >
                <RefreshCw size={16} color={summaryLoading ? '#4B5563' : '#8B7CFF'} />
              </TouchableOpacity>
            </View>

            {summaryLoading ? (
              <View style={{ padding: 16, alignItems: 'center' }}>
                <Text style={{ color: '#8B7CFF', fontWeight: '600', fontSize: 13 }}>
                  Neo is reviewing your {periodLabel.toLowerCase()} data...
                </Text>
              </View>
            ) : aiSummary ? (
              <View>
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
                  {/* GOOD */}
                  <View style={{ flex: 1, backgroundColor: '#0D2318', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)' }}>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: '#22C55E', letterSpacing: 1, marginBottom: 8 }}>WHAT WENT WELL</Text>
                    {aiSummary.good.map((item, i) => (
                      <View key={i} style={{ flexDirection: 'row', gap: 6, marginBottom: 6 }}>
                        <Text style={{ color: '#22C55E', fontSize: 12, marginTop: 1 }}>•</Text>
                        <Text style={{ fontSize: 12, color: '#6EE7A0', lineHeight: 18, flex: 1 }}>{item}</Text>
                      </View>
                    ))}
                  </View>
                  {/* BAD */}
                  <View style={{ flex: 1, backgroundColor: '#FFF7ED', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#FED7AA' }}>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: '#EA580C', letterSpacing: 1, marginBottom: 8 }}>NEEDS WORK</Text>
                    {aiSummary.bad.map((item, i) => (
                      <View key={i} style={{ flexDirection: 'row', gap: 6, marginBottom: 6 }}>
                        <Text style={{ color: '#F97316', fontSize: 12, marginTop: 1 }}>•</Text>
                        <Text style={{ fontSize: 12, color: '#9A3412', lineHeight: 18, flex: 1 }}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                {/* ACTIONS */}
                <View style={{ backgroundColor: '#EDE0FF', borderRadius: 12, padding: 12 }}>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: '#8B7CFF', letterSpacing: 1, marginBottom: 8 }}>{period === 'weekly' ? 'THIS WEEK’S ACTIONS' : period === 'monthly' ? 'THIS MONTH’S ACTIONS' : 'KEY ACTIONS'}</Text>
                  {aiSummary.actions.map((item, i) => (
                    <View key={i} style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}>
                      <Text style={{ color: '#8B7CFF', fontWeight: '800', fontSize: 12 }}>{i + 1}.</Text>
                      <Text style={{ fontSize: 12, color: '#4C1D95', lineHeight: 18, flex: 1 }}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => fetchAISummary(false)}
                style={{ backgroundColor: '#EDE0FF', borderRadius: 14, padding: 16, alignItems: 'center' }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#8B7CFF' }}>Get Neo’s {periodLabel} Analysis ✨</Text>
                <Text style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Tap to generate your personalised report</Text>
              </TouchableOpacity>
            )}
          </View>

        </Animated.View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1020',
  },
  welcomeCard: {
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  welcomeEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8B7CFF',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  welcomeName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F7F8FC',
    marginBottom: 4,
  },
  welcomeTagline: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 14,
  },
  welcomeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139,124,255,0.15)',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    gap: 4,
  },
  welcomeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF8FA3',
  },
  sectionCard: {
    backgroundColor: '#131929',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#8B7CFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  thunderWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1A2235',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F7F8FC',
    letterSpacing: 0.8,
  },
  weightChangeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
    gap: 6,
  },
  weightChangeBig: {
    fontSize: 32,
    fontWeight: '800',
  },
  weeklyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 4,
  },
  weeklyText: {
    fontSize: 13,
    fontWeight: '600',
  },
  journeyWrap: {
    marginTop: 8,
  },
  journeyLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  journeyLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  journeyValue: {
    fontSize: 13,
    color: '#F7F8FC',
    fontWeight: '800',
  },
  journeyTrack: {
    height: 8,
    backgroundColor: '#1A2235',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  journeyFill: {
    height: '100%',
    borderRadius: 4,
  },
  journeyDot: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#8B7CFF',
    borderWidth: 3,
    borderColor: '#0B1020',
    top: -4,
    transform: [{ translateX: -8 }],
  },
});