import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  ChevronLeft, Bell, Activity,
  Utensils, Droplets, Dumbbell, MoonStar,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useHealth } from '../context/HealthContext';
import { supabase } from '../services/supabase';

const SYSTEM_NOTIFICATIONS = [
  { id: '1', icon: '🏆', title: 'Streak Milestone!', body: 'You hit a 7-day check-in streak. Keep it going!', time: '2h ago', unread: true },
  { id: '2', icon: '💪', title: 'New Workout Ready', body: 'Neo has prepared your personalised workout for today.', time: '5h ago', unread: true },
  { id: '3', icon: '🍽️', title: 'Meal Plan Updated', body: 'Your daily fuel plan has been refreshed with new Indian recipes.', time: '8h ago', unread: false },
  { id: '4', icon: '✅', title: 'Goal Progress', body: 'You are 68% toward your monthly fat loss target. Great work.', time: '1d ago', unread: false },
  { id: '5', icon: '💧', title: 'Hydration Reminder', body: 'You are behind on water today. Aim for 2.5L by end of day.', time: '1d ago', unread: false },
];

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { profile } = useAuth();
  const { healthData } = useHealth();
  const [activeTab, setActiveTab] = useState<'system' | 'activity'>('system');
  const [activityFeed, setActivityFeed] = useState<any[]>([]);

  useEffect(() => { loadActivityFeed(); }, []);

  const loadActivityFeed = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const since = sevenDaysAgo.toISOString();
      const [foodRes, actRes, waterRes, sleepRes] = await Promise.all([
        supabase.from('food_logs').select('meal_name,calories,created_at').eq('user_id', user.id).gte('created_at', since).order('created_at', { ascending: false }).limit(10),
        supabase.from('activity_logs').select('activity_name,duration,created_at').eq('user_id', user.id).gte('created_at', since).order('created_at', { ascending: false }).limit(10),
        supabase.from('hydration_logs').select('amount_ml,created_at').eq('user_id', user.id).gte('created_at', since).order('created_at', { ascending: false }).limit(10),
        supabase.from('sleep_logs').select('hours,created_at').eq('user_id', user.id).gte('created_at', since).order('created_at', { ascending: false }).limit(5),
      ]);
      const feed: any[] = [];
      (foodRes.data || []).forEach(r => feed.push({ icon: 'food', label: `Logged ${r.meal_name}`, sub: `${r.calories} kcal`, time: r.created_at }));
      (actRes.data || []).forEach(r => feed.push({ icon: 'activity', label: `Completed ${r.activity_name}`, sub: `${r.duration} mins`, time: r.created_at }));
      (waterRes.data || []).forEach(r => feed.push({ icon: 'water', label: 'Logged hydration', sub: `${(r.amount_ml / 1000).toFixed(1)}L`, time: r.created_at }));
      (sleepRes.data || []).forEach(r => feed.push({ icon: 'sleep', label: 'Logged sleep', sub: `${r.hours}h`, time: r.created_at }));
      feed.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setActivityFeed(feed);
    } catch (e) { }
  };

  const formatTime = (iso: string) => {
    const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const getIcon = (type: string) => {
    if (type === 'food') return <Utensils size={18} color="#FF8C42" />;
    if (type === 'activity') return <Dumbbell size={18} color="#8B7CFF" />;
    if (type === 'water') return <Droplets size={18} color="#4AA9FF" />;
    if (type === 'sleep') return <MoonStar size={18} color="#FFAD42" />;
    return <Activity size={18} color="#888" />;
  };

  const getBg = (type: string) => {
    if (type === 'food') return '#FFF0DD';
    if (type === 'activity') return '#EFE7FF';
    if (type === 'water') return '#E8F5FF';
    if (type === 'sleep') return '#FFF8EC';
    return '#F0F0F0';
  };

  return (
    <>
      <StatusBar barStyle="light-content" />
      <View style={[styles.container, { paddingTop: insets.top }]}>

        <View style={[styles.header, { backgroundColor: '#0B1020'}]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft size={24} color="#F7F8FC" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'system' && styles.tabActive]}
            onPress={() => setActiveTab('system')}
          >
            <Bell size={15} color={activeTab === 'system' ? '#8B7CFF' : '#6B7280'} />
            <Text style={[styles.tabText, activeTab === 'system' && styles.tabTextActive]}>Updates</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'activity' && styles.tabActive]}
            onPress={() => setActiveTab('activity')}
          >
            <Activity size={15} color={activeTab === 'activity' ? '#8B7CFF' : '#6B7280'} />
            <Text style={[styles.tabText, activeTab === 'activity' && styles.tabTextActive]}>My Activity</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {activeTab === 'system' ? (
            SYSTEM_NOTIFICATIONS.map(n => (
              <View key={n.id} style={[styles.card, n.unread && styles.cardUnread]}>
                <View style={styles.iconWrap}>
                  <Text style={{ fontSize: 22 }}>{n.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.cardTitle}>{n.title}</Text>
                    <Text style={styles.cardTime}>{n.time}</Text>
                  </View>
                  <Text style={styles.cardBody}>{n.body}</Text>
                </View>
                {n.unread && <View style={styles.unreadDot} />}
              </View>
            ))
          ) : activityFeed.length === 0 ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Text style={{ color: '#6B7280', fontSize: 14 }}>No activity logged yet.</Text>
            </View>
          ) : (
            activityFeed.map((item, i) => (
              <View key={i} style={styles.card}>
                <View style={[styles.iconWrap, { backgroundColor: getBg(item.icon) }]}>
                  {getIcon(item.icon)}
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.cardTitle}>{item.label}</Text>
                    <Text style={styles.cardTime}>{formatTime(item.time)}</Text>
                  </View>
                  <Text style={styles.cardBody}>{item.sub}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1020' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#F7F8FC' },
  tabs: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 8, backgroundColor: '#131929', borderRadius: 12, padding: 4 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10 },
  tabActive: { backgroundColor: '#1A2235', shadowColor: '#8B7CFF', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  tabTextActive: { color: '#8B7CFF' },
  card: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginHorizontal: 16, marginBottom: 8, backgroundColor: '#131929', borderRadius: 16, padding: 14, shadowColor: '#8B7CFF', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  cardUnread: { borderLeftWidth: 3, borderLeftColor: '#8B7CFF' },
  iconWrap: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#1A2235', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#F7F8FC', flex: 1, marginRight: 8 },
  cardBody: { fontSize: 13, color: '#6B7280', marginTop: 2, lineHeight: 18 },
  cardTime: { fontSize: 11, color: '#6B7280', fontWeight: '500' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#8B7CFF', marginTop: 4 },
});