// ======================================================
// PROFILE SCREEN — LFGO PROGRESSION & IDENTITY OPERATING SYSTEM
// BETA-READY LAUNCH-STAGE EXPERIENCE POLISHED SPRINT
// ======================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Share,
  Modal,
  Alert,
  AlertButton,
  ActivityIndicator,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  Plus,
  Settings,
  Share2,
  Flame,
  Zap,
  Dumbbell,
  Target,
  Trophy,
  Droplet,
  ChevronDown,
  ChevronUp,
  Lock,
  Award,
  ChevronRight,
  TrendingUp,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

import { useAuth } from '../context/AuthContext';
import { useHealth } from '../context/HealthContext';
import { getLevelFromXP } from '../constants/levels';
import { getUserTargets } from '../utils/healthCalculations';
import { calculateDailyScore } from '../utils/calculateDailyScore';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../services/supabase';
import PostViewerModal from '../components/profile/PostViewerModal';
import RefreshableScrollView from '../components/RefreshableScrollView';
import { ENABLE_REELS } from '../constants/featureFlags';

const { width } = Dimensions.get('window');

interface Post {
  id: string;
  image_url: string;
  content: string;
  type?: string;
}

interface Badge {
  id: string;
  title: string;
  icon: string;
  color: string;
  desc: string;
  unlocked: boolean;
}

interface PerformanceDay {
  dayLabel: string;
  dateKey: string;
  hasWorkout: boolean;
  hasMissions: boolean;
  hasHydration: boolean;
  xpGained: number;
}

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  // Context & Auth
  const { profile, user, refreshProfile } = useAuth();
  const { healthData, refreshHealthData } = useHealth();

  // Component State
  const [posts, setPosts] = useState<Post[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [postViewerVisible, setPostViewerVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Dynamic Progression Stats
  const [workoutsCompleted, setWorkoutsCompleted] = useState<number>(0);
  const [missionsCompleted, setMissionsCompleted] = useState<number>(0);
  const [hydrationCount, setHydrationCount] = useState<number>(0);
  const [postsExpanded, setPostsExpanded] = useState(false);

  // Recent Performance (Last 7 Days)
  const [recentPerformance, setRecentPerformance] = useState<PerformanceDay[]>([]);
  const [weeklyScore, setWeeklyScore] = useState<number>(0);
  const [hasSufficientScoreData, setHasSufficientScoreData] = useState<boolean>(false);

  // AI Insight State
  const [aiSummary, setAiSummary] = useState<string>('');
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Achievements Modal State
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  // Animation values
  const xpWidth = useRef(new Animated.Value(0)).current;
  const streakScale = useRef(new Animated.Value(1)).current;
  const insightOpacity = useRef(new Animated.Value(0)).current;

  // Level Info Calculation
  const totalXp = healthData?.totalXp || profile?.xp || 0;
  const levelInfo = getLevelFromXP(totalXp);
  const currentXpInLevel = totalXp - levelInfo.currentLevelXp;
  const xpNeededForNextLevel = levelInfo.nextLevelXp ? (levelInfo.nextLevelXp - levelInfo.currentLevelXp) : 1000;
  const xpUntilNextLevel = levelInfo.nextLevelXp ? (levelInfo.nextLevelXp - totalXp) : 0;
  const currentStreak = healthData?.streak || profile?.streak || 0;

  // Health Targets Calculation
  const targets = getUserTargets(profile);
  const currentWeight = profile?.current_weight || profile?.weight || 75;
  const targetWeight = profile?.target_weight || 70;
  const weightDifference = Math.max(0, currentWeight - targetWeight);
  const weightProgressPercent = currentWeight > targetWeight 
    ? Math.min(100, Math.max(0, ((80 - currentWeight) / (80 - targetWeight)) * 100)) 
    : 100;

  // Database stats lookup
  const fetchLifetimeStats = async () => {
    if (!user) return;
    try {
      // 1. Workouts count
      const { count: workouts } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      if (workouts !== null) setWorkoutsCompleted(workouts);

      // 2. Hydration logs count
      const { count: hydration } = await supabase
        .from('hydration_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      if (hydration !== null) setHydrationCount(hydration);

      // 3. Missions completed count
      const { data: missions } = await supabase
        .from('daily_missions')
        .select('completed_missions')
        .eq('user_id', user.id);
      if (missions) {
        const total = missions.reduce((sum, row) => sum + (row.completed_missions?.length || 0), 0);
        setMissionsCompleted(total);
      }
    } catch (e) {
      console.error('Error fetching lifetime stats:', e);
    }
  };

  // Fetch recent performance logs (Last 7 Days)
  const fetchRecentPerformance = async () => {
    if (!user) return;
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);
      const startISO = sevenDaysAgo.toISOString();

      const [xpRes, activityRes, hydrationRes, missionsRes, foodRes, sleepRes] = await Promise.all([
        supabase.from('xp_logs').select('*').eq('user_id', user.id).gte('created_at', startISO),
        supabase.from('activity_logs').select('*').eq('user_id', user.id).gte('created_at', startISO),
        supabase.from('hydration_logs').select('*').eq('user_id', user.id).gte('created_at', startISO),
        supabase.from('daily_missions').select('*').eq('user_id', user.id).gte('date', sevenDaysAgo.toISOString().split('T')[0]),
        supabase.from('food_logs').select('*').eq('user_id', user.id).gte('created_at', startISO),
        supabase.from('sleep_logs').select('*').eq('user_id', user.id).gte('created_at', startISO),
      ]);

      const xpLogs = xpRes.data || [];
      const activityLogs = activityRes.data || [];
      const hydrationLogs = hydrationRes.data || [];
      const missionsLogs = missionsRes.data || [];
      const foodLogs = foodRes.data || [];
      const sleepLogs = sleepRes.data || [];

      // Helper to get local date string YYYY-MM-DD
      const toLocalDateStr = (d: Date) => {
        const yr = d.getFullYear();
        const mo = String(d.getMonth() + 1).padStart(2, '0');
        const dy = String(d.getDate()).padStart(2, '0');
        return `${yr}-${mo}-${dy}`;
      };

      const days: PerformanceDay[] = [];
      let totalScoreSum = 0;
      let activeDaysCount = 0;

      for (let i = 0; i < 7; i++) {
        const dayDate = new Date();
        dayDate.setDate(dayDate.getDate() - (6 - i));
        const key = toLocalDateStr(dayDate);
        const label = dayDate.toLocaleDateString('en-US', { weekday: 'short' });

        // Check workout
        const dayWorkouts = activityLogs.filter(log => toLocalDateStr(new Date(log.created_at)) === key);
        const hasWorkout = dayWorkouts.length > 0;

        // Check hydration
        const dayHydrations = hydrationLogs.filter(log => toLocalDateStr(new Date(log.created_at)) === key);
        const hasHydration = dayHydrations.length > 0;

        // Check missions
        const dayMissions = missionsLogs.filter(log => log.date === key);
        const hasMissions = dayMissions.some(log => Array.isArray(log.completed_missions) && log.completed_missions.length > 0);

        // Check XP
        const dayXps = xpLogs.filter(log => toLocalDateStr(new Date(log.created_at)) === key);
        const xpGained = dayXps.reduce((sum, log) => sum + (Number(log.xp) || 0), 0);

        // Check Food
        const dayFoods = foodLogs.filter(log => toLocalDateStr(new Date(log.created_at)) === key);
        const calories = dayFoods.reduce((sum, log) => sum + (Number(log.calories) || 0), 0);

        // Check Sleep
        const daySleeps = sleepLogs.filter(log => toLocalDateStr(new Date(log.created_at)) === key);
        const sleep = daySleeps.reduce((max, log) => Math.max(max, Number(log.hours) || 0), 0);

        // Calculate daily score for this day
        const dayScore = calculateDailyScore({
          calories,
          water: dayHydrations.reduce((sum, log) => sum + (Number(log.amount) || 0), 0),
          workout: hasWorkout,
          sleep,
        }, targets);

        totalScoreSum += dayScore;

        const hasAnyLog = hasWorkout || hasMissions || hasHydration || xpGained > 0 || calories > 0 || sleep > 0;
        if (hasAnyLog) {
          activeDaysCount++;
        }

        days.push({
          dayLabel: label,
          dateKey: key,
          hasWorkout,
          hasMissions,
          hasHydration,
          xpGained,
        });
      }

      setRecentPerformance(days);

      // We consider there is sufficient data if at least one day in the last 7 days has any log/activity.
      const sufficient = activeDaysCount > 0;
      setHasSufficientScoreData(sufficient);
      if (sufficient) {
        setWeeklyScore(Math.round(totalScoreSum / 7));
      } else {
        setWeeklyScore(0);
      }
    } catch (error) {
      console.error('Error fetching recent performance:', error);
    }
  };

  // Fetch AI Progression Summary
  const fetchAiSummary = async () => {
    if (!user) return;
    setSummaryLoading(true);
    try {
      const prompt = `You are Neo, a world-class fitness and nutrition expert. The user's stats: lifetime workouts completed=${workoutsCompleted}, lifetime missions completed=${missionsCompleted}, current streak=${currentStreak} days, total XP=${totalXp}, current weight=${currentWeight}kg, target weight=${targetWeight}kg. Give ONE powerful, specific, motivational progression-focused insight in max 20 words. Focus on how far they've come and what they are becoming. No fluff, no markdown. Plain text only.`;

      const { data, error } = await supabase.functions.invoke('coach-chat', {
        body: {
          messages: [{ role: 'user', content: prompt }],
          system: "You are Neo, a world-class fitness and nutrition expert.",
          max_tokens: 100,
        }
      });
      if (error || !data) throw error || new Error('Failed to get summary');
      const summary = data?.content?.[0]?.text?.trim() || '';
      setAiSummary(summary);
    } catch (err) {
      console.error('Failed to fetch AI summary:', err);
      setAiSummary(getProfileStateSummary());
    } finally {
      setSummaryLoading(false);
    }
  };

  const getProfileStateSummary = () => {
    if (currentStreak >= 7) {
      return `Incredible consistency! Your ${currentStreak}-day streak is in the top 5% of LFGO explorers. Keep the flame burning.`;
    }
    if (workoutsCompleted > 10) {
      return `With ${workoutsCompleted} workouts logged, your metabolism is firing high. Focus on hydration tomorrow.`;
    }
    return "You are building the habit loops of a champion. Complete your daily missions to unlock custom progression coach coaching.";
  };

  // Trigger data updates on focus
  useFocusEffect(
    useCallback(() => {
      refreshHealthData?.();
      fetchLifetimeStats();
      fetchRecentPerformance();
    }, [user])
  );

  // Fetch posts and trigger coach insights
  useEffect(() => {
    const fetchPosts = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
      }
      if (data) {
        const rawPosts = data as Post[];
        const filtered = ENABLE_REELS ? rawPosts : rawPosts.filter(p => p.type !== 'video');
        setPosts(filtered);
      }
    };

    fetchPosts();
    fetchAiSummary();
  }, [user, workoutsCompleted, missionsCompleted, currentStreak]);

  // Setup animations
  useEffect(() => {
    // XP bar animation
    Animated.timing(xpWidth, {
      toValue: levelInfo.progressPercent / 100,
      duration: 1200,
      useNativeDriver: false,
    }).start();

    // Streak heartbeat pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(streakScale, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
        Animated.timing(streakScale, { toValue: 1.0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, [levelInfo.progressPercent]);

  // Animate insight card when loaded
  useEffect(() => {
    if (aiSummary) {
      insightOpacity.setValue(0);
      Animated.timing(insightOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  }, [aiSummary]);

  useEffect(() => {
    setImageLoadError(false);
    console.log("avatar_url", profile?.avatar_url);
  }, [profile?.avatar_url, profile?.updated_at]);

  // Avatar Upload Handlers
  const handleAvatarPreview = () => {
    if (profile?.avatar_url) {
      setPreviewVisible(true);
    }
  };

  const handleAvatarEdit = () => {
    console.log("Avatar edit button pressed");
    const options: AlertButton[] = [
      { text: 'Choose Photo', onPress: handleLaunchLibrary },
      { text: 'Take Photo', onPress: handleLaunchCamera },
    ];
    if (profile?.avatar_url) {
      options.push({ text: 'Remove Photo', onPress: handleRemovePhoto, style: 'destructive' });
    }
    options.push({ text: 'Cancel', style: 'cancel' });

    Alert.alert(
      'Profile Photo',
      'Manage your avatar:',
      options,
      { cancelable: true }
    );
  };

  const handleRemovePhoto = async () => {
    if (!user) return;
    setUploading(true);
    console.log('[AvatarRemove] Removing avatar photo...');
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('[AvatarRemove] Profiles table update error:', updateError);
        throw updateError;
      }
      
      console.log('[AvatarRemove] Profile updated successfully. Refreshing auth context...');
      await refreshProfile();
      console.log('[AvatarRemove] Profile refreshed!');
    } catch (e: any) {
      console.error('[AvatarRemove] Error removing photo:', e);
      Alert.alert('Error', e.message || 'Could not remove profile photo.');
    } finally {
      setUploading(false);
    }
  };

  const handleLaunchLibrary = async () => {
    if (uploading) return;
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please grant photo permissions to change your avatar.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
      });
      if (!result.canceled && result.assets?.[0]) {
        await uploadAvatar(result.assets[0]);
      }
    } catch (e: any) {
      console.error('Image library error:', e);
      Alert.alert('Error', e.message || 'An error occurred during selection.');
    }
  };

  const handleLaunchCamera = async () => {
    if (uploading) return;
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please grant camera permissions to take a photo.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
      });
      if (!result.canceled && result.assets?.[0]) {
        await uploadAvatar(result.assets[0]);
      }
    } catch (e: any) {
      console.error('Camera error:', e);
      Alert.alert('Error', e.message || 'An error occurred during capture.');
    }
  };

  const uploadAvatar = async (asset: ImagePicker.ImagePickerAsset) => {
    if (!user) return;
    setUploading(true);

    const uri = asset.uri;
    const inferredMime = uri.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
    const mimeType = asset.mimeType || inferredMime;
    const extension = mimeType.includes('png') ? 'png' : 'jpg';
    const fileSize = asset.fileSize;
    const type = asset.type;

    console.log('[AvatarUpload] Starting avatar upload for user:', user.id);
    console.log('asset.type:', type);
    console.log('asset.mimeType:', mimeType);
    console.log('asset.fileSize:', fileSize);
    console.log('contentType sent to Supabase:', mimeType);

    try {
      console.log('[AvatarUpload] Reading file as base64...');
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
      const decoded = decode(base64);
      console.log('[AvatarUpload] Decoded base64 arraybuffer successfully. Size:', decoded.byteLength);

      const filePath = `${user.id}/avatar.${extension}`;

      console.log('[AvatarUpload] Uploading to Supabase Storage path:', filePath);
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, decoded, { contentType: mimeType, upsert: true });

      if (uploadError) {
        console.error('[AvatarUpload] Supabase Storage upload error:', uploadError);
        throw uploadError;
      }

      console.log('[AvatarUpload] Storage upload success. Retrieving public URL...');
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = urlData?.publicUrl;
      if (!publicUrl) {
        throw new Error('Could not retrieve public URL');
      }
      console.log('[AvatarUpload] Public URL retrieved:', publicUrl);

      console.log('[AvatarUpload] Updating profiles table with new avatar_url and updated_at...');
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('[AvatarUpload] Profiles table update error:', updateError);
        throw updateError;
      }
      console.log('[AvatarUpload] Profiles table updated. Refreshing auth profile context...');

      await refreshProfile();
      console.log('[AvatarUpload] Profile refreshed successfully!');
    } catch (error: any) {
      console.error('[AvatarUpload] Fatal error in avatar upload flow:', error);
      Alert.alert('Upload Failed', error.message || 'An error occurred during upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleShareProfile = async () => {
    try {
      await Share.share({
        message: `Check out my LFGO fitness progression identity. I'm currently level ${levelInfo.level} ${levelInfo.title} on a ${currentStreak}-day streak! ⚡🔥`,
      });
    } catch (error: any) {
      console.error('Error sharing profile:', error);
    }
  };

  const getDisplayUsername = () => {
    if (profile?.username) {
      return `@${profile.username.toLowerCase()}`;
    }
    if (profile?.full_name) {
      const cleaned = profile.full_name.toLowerCase().replace(/[^a-z0-9_]/g, '');
      if (cleaned.length >= 3) {
        return `@${cleaned.slice(0, 20)}`;
      }
    }
    if (user?.email) {
      const prefix = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
      if (prefix.length >= 3) {
        return `@${prefix.slice(0, 20)}`;
      }
    }
    return `@user_${user?.id ? user.id.slice(0, 5) : 'explorer'}`;
  };

  // Pull-to-refresh action
  const handleRefresh = async () => {
    await Promise.all([
      refreshProfile?.(),
      fetchLifetimeStats(),
      fetchRecentPerformance(),
      fetchAiSummary(),
    ]);
  };

  // Badge configs
  const badgesList: Badge[] = [
    {
      id: 'streak_7',
      title: '7-Day Streak',
      icon: 'Flame',
      color: '#FF8FA3',
      desc: 'Achieved by logging your workouts and food metrics for 7 consecutive days.',
      unlocked: currentStreak >= 7,
    },
    {
      id: 'first_workout',
      title: 'First Workout',
      icon: 'Dumbbell',
      color: '#8B7CFF',
      desc: 'Unlocked when you log your first completed activity in the LFGO planner.',
      unlocked: workoutsCompleted >= 1,
    },
    {
      id: 'hydration_hero',
      title: 'Hydration Hero',
      icon: 'Droplet',
      color: '#38BDF8',
      desc: 'Log your hydration targets 5 times to maximize cells metabolic recovery.',
      unlocked: hydrationCount >= 5,
    },
    {
      id: 'mission_master',
      title: 'Mission Master',
      icon: 'Target',
      color: '#F7C873',
      desc: 'Successfully completed 5 AI daily missions sent by Coach Neo.',
      unlocked: missionsCompleted >= 5,
    },
    {
      id: 'level_10',
      title: 'Level 10 Legend',
      icon: 'Trophy',
      color: '#10B981',
      desc: 'Level up your real-life health identity to Level 10 or higher.',
      unlocked: levelInfo.level >= 10,
    },
  ];

  const renderBadgeIcon = (iconName: string, color: string, size = 26) => {
    switch (iconName) {
      case 'Flame':
        return <Flame size={size} color={color} fill={color} />;
      case 'Dumbbell':
        return <Dumbbell size={size} color={color} />;
      case 'Droplet':
        return <Droplet size={size} color={color} fill={color} />;
      case 'Target':
        return <Target size={size} color={color} />;
      case 'Trophy':
        return <Trophy size={size} color={color} fill={color} />;
      default:
        return <Trophy size={size} color={color} fill={color} />;
    }
  };

  return (
    <View style={[ps.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* TOP HEADER SECTION */}
      <View style={ps.headerRow}>
        <Text style={ps.username}>{getDisplayUsername()}</Text>
        <View style={ps.headerActions}>
          <TouchableOpacity style={ps.iconBtn} onPress={handleShareProfile}>
            <Share2 size={18} color="#F7F8FC" />
          </TouchableOpacity>
          <TouchableOpacity style={ps.iconBtn} onPress={() => navigation.navigate('Settings')}>
            <Settings size={18} color="#F7F8FC" />
          </TouchableOpacity>
        </View>
      </View>

      <RefreshableScrollView onRefresh={handleRefresh} contentContainerStyle={ps.scrollContent}>
        
        {/* 1. HERO IDENTITY CARD */}
        <View style={ps.heroCardWrapper}>
          <LinearGradient
            colors={['rgba(139, 124, 255, 0.18)', 'rgba(255, 143, 163, 0.05)']}
            style={ps.heroGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={ps.heroMainRow}>
              {/* Avatar Wrapper */}
              <View style={ps.avatarContainer}>
                <View style={ps.avatarPulseRing} pointerEvents="none" />
                <TouchableOpacity onPress={handleAvatarPreview} activeOpacity={0.8}>
                  {profile?.avatar_url && !imageLoadError ? (
                    <Image 
                      source={{ uri: `${profile.avatar_url}?t=${profile.updated_at ? new Date(profile.updated_at).getTime() : Date.now()}` }} 
                      style={ps.avatarImage} 
                      onError={(e) => {
                        console.log("image load error", e.nativeEvent.error);
                        setImageLoadError(true);
                      }}
                    />
                  ) : (
                    <View style={ps.avatarFallback}>
                      <Text style={ps.avatarInitial}>
                        {(profile?.full_name || profile?.username || user?.email || 'U')[0].toUpperCase()}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={ps.avatarEditButton} onPress={handleAvatarEdit} disabled={uploading}>
                  {uploading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Plus size={10} color="#FFF" />
                  )}
                </TouchableOpacity>
              </View>

              {/* Identity Info */}
              <View style={ps.identityInfo}>
                <Text style={ps.nameText}>{profile?.full_name || 'LFGO Explorer'}</Text>
                <View style={ps.levelBadgeRow}>
                  <Zap size={12} color="#F7C873" fill="#F7C873" />
                  <Text style={ps.levelTitleText}>Level {levelInfo.level} {levelInfo.title}</Text>
                </View>
              </View>
            </View>

            {/* Progression XP Metrics */}
            <View style={ps.xpContainer}>
              <View style={ps.xpLabelRow}>
                <Text style={ps.xpProgressLabel}>Progression</Text>
                <Text style={ps.xpValueText}>
                  {currentXpInLevel} <Text style={{ color: 'rgba(247, 248, 252, 0.4)' }}>/ {xpNeededForNextLevel} XP</Text>
                </Text>
              </View>
              
              {/* Custom XP Bar */}
              <View style={ps.xpTrack}>
                <Animated.View 
                  style={[
                    ps.xpFill, 
                    { 
                      width: xpWidth.interpolate({ 
                        inputRange: [0, 1], 
                        outputRange: ['0%', '100%'] 
                      }) 
                    }
                  ]}
                >
                  <LinearGradient
                    colors={['#8B7CFF', '#FF8FA3']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ flex: 1 }}
                  />
                </Animated.View>
              </View>

              {/* Bottom XP Metrics & Streak Row */}
              <View style={ps.xpBottomRow}>
                <Text style={ps.xpNextLevelText}>
                  {xpUntilNextLevel > 0 
                    ? `${xpUntilNextLevel} XP to Level ${levelInfo.level + 1}` 
                    : 'Max Rank'}
                </Text>
                
                {/* Prominent Embedded Streak Indicator */}
                <Animated.View style={[ps.heroStreakPill, { transform: [{ scale: streakScale }] }]}>
                  <Flame size={12} color="#FF8FA3" fill="#FF8FA3" />
                  <Text style={ps.heroStreakText}>
                    {currentStreak} Day{currentStreak === 1 ? '' : 's'} Streak
                  </Text>
                </Animated.View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* 2. CURRENT GOAL CARD */}
        <TouchableOpacity 
          style={ps.goalCard} 
          onPress={() => navigation.navigate('FitnessGoals')}
          activeOpacity={0.8}
        >
          <View style={ps.goalCardHeader}>
            <View style={ps.goalTitleContainer}>
              <Target size={16} color="#8B7CFF" />
              <Text style={ps.goalCardTitle}>Fitness Goals</Text>
            </View>
            <ChevronRight size={16} color="#6B7280" />
          </View>

          <View style={ps.goalProgressRows}>
            {/* Weight Goal Column */}
            <View style={ps.goalColumn}>
              <View style={ps.goalMetricHeader}>
                <Text style={ps.goalLabel}>Weight Goal</Text>
                <Text style={ps.goalValue}>{currentWeight}kg → {targetWeight}kg</Text>
              </View>
              <View style={ps.goalProgressBarTrack}>
                <View style={[ps.goalProgressBarFill, { width: `${weightProgressPercent}%`, backgroundColor: '#8B7CFF' }]} />
              </View>
              <Text style={ps.goalSubtext}>
                {weightDifference > 0 ? `${weightDifference.toFixed(1)}kg to target` : 'Target weight achieved!'}
              </Text>
            </View>

            <View style={ps.goalDivider} />

            {/* Body Fat Goal Column */}
            <View style={ps.goalColumn}>
              <View style={ps.goalMetricHeader}>
                <Text style={ps.goalLabel}>Body Fat Goal</Text>
                <Text style={ps.goalValue}>20% → 15%</Text>
              </View>
              <View style={ps.goalProgressBarTrack}>
                <View style={[ps.goalProgressBarFill, { width: '60%', backgroundColor: '#FF8FA3' }]} />
              </View>
              <Text style={ps.goalSubtext}>5.0% to target</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* 3. NEO AI INSIGHT CARD */}
        <Animated.View style={[ps.insightCard, { opacity: insightOpacity }]}>
          <LinearGradient
            colors={['rgba(255, 143, 163, 0.12)', 'rgba(139, 124, 255, 0.04)']}
            style={ps.insightGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={ps.insightHeader}>
              <View style={ps.insightTitleGroup}>
                <Zap size={14} color="#F7C873" fill="#F7C873" />
                <Text style={ps.insightTitle}>NEO PROGRESSION INSIGHT</Text>
              </View>
              <View style={ps.liveDot} />
            </View>

            {summaryLoading ? (
              <View style={ps.insightLoading}>
                <ActivityIndicator size="small" color="#F7C873" />
                <Text style={ps.insightLoadingText}>Neo is evaluating metrics...</Text>
              </View>
            ) : (
              <Text style={ps.insightText}>"{aiSummary || getProfileStateSummary()}"</Text>
            )}
          </LinearGradient>
        </Animated.View>

        {/* 4. CORE STATS DASHBOARD (RESTRICTURED & FIXED EMPTY STATES) */}
        <Text style={ps.sectionLabel}>CORE DASHBOARD</Text>
        <View style={ps.statsGrid}>
          {/* Row 1: Weekly Score Avg (Full Width) - Hide entirely if no data! */}
          {hasSufficientScoreData && (
            <View style={ps.fullStatCard}>
              <View style={ps.fullStatHeader}>
                <TrendingUp size={18} color="#10B981" />
                <Text style={ps.fullStatCardLabel}>Weekly Score Avg</Text>
              </View>
              <Text style={ps.fullStatCardNumber}>{weeklyScore}%</Text>
            </View>
          )}

          {/* Row 2: 2x2 Columns */}
          <View style={ps.statCardRow}>
            {/* Total XP */}
            <View style={ps.statCard}>
              <Zap size={16} color="#8B7CFF" fill="#8B7CFF" />
              <Text style={[ps.statCardNumber, !totalXp && ps.emptyStatNumberText]}>
                {totalXp > 0 ? totalXp : '--'}
              </Text>
              <Text style={ps.statCardLabel}>Total XP</Text>
            </View>

            {/* Workouts Logged */}
            <View style={ps.statCard}>
              <Dumbbell size={16} color="#38BDF8" />
              <Text style={[ps.statCardNumber, !workoutsCompleted && ps.emptyStatNumberText]}>
                {workoutsCompleted > 0 ? `${workoutsCompleted} Workouts` : 'Start logging activity'}
              </Text>
              <Text style={ps.statCardLabel}>Workouts Logged</Text>
            </View>
          </View>

          {/* Row 3: 2x2 Columns */}
          <View style={ps.statCardRow}>
            {/* Missions Completed */}
            <View style={ps.statCard}>
              <Target size={16} color="#F7C873" />
              <Text style={[ps.statCardNumber, !missionsCompleted && ps.emptyStatNumberText]}>
                {missionsCompleted > 0 ? `${missionsCompleted} Completed` : 'None completed'}
              </Text>
              <Text style={ps.statCardLabel}>Missions Completed</Text>
            </View>

            {/* Water Logged Today */}
            <View style={ps.statCard}>
              <Droplet size={16} color="#60A5FA" fill="#60A5FA" />
              <Text style={[ps.statCardNumber, !(healthData?.todayWater > 0) && ps.emptyStatNumberText]}>
                {healthData?.todayWater > 0 ? `${healthData.todayWater}ml` : 'No logs today'}
              </Text>
              <Text style={ps.statCardLabel}>Water Logged Today</Text>
            </View>
          </View>
        </View>

        {/* 5. ACHIEVEMENTS SECTION (COLLECTIBLES) */}
        <View style={ps.achievementsCard}>
          <Text style={ps.sectionLabelNoMargin}>COLLECTIBLE BADGES</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={ps.badgeRibbon}>
            {badgesList.map((badge) => (
              <TouchableOpacity
                key={badge.id}
                style={[ps.badgeContainer, !badge.unlocked && ps.badgeLocked]}
                onPress={() => setSelectedBadge(badge)}
                activeOpacity={0.8}
              >
                <View style={[ps.badgeCircle, { borderColor: badge.color }]}>
                  {renderBadgeIcon(badge.icon, badge.color)}
                  {!badge.unlocked && (
                    <View style={ps.badgeLockOverlay}>
                      <Lock size={5} color="rgba(247,248,252,0.8)" />
                    </View>
                  )}
                </View>
                <Text style={ps.badgeNameText} numberOfLines={1}>
                  {badge.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 6. LAST 7 DAYS PERFORMANCE DASHBOARD */}
        <View style={ps.performanceCard}>
          <View style={ps.performanceHeader}>
            <View style={ps.performanceTitleContainer}>
              <TrendingUp size={16} color="#8B7CFF" />
              <Text style={ps.performanceCardTitle}>Last 7 Days</Text>
            </View>
            <Text style={ps.performanceSubtitle}>Weekly consistency</Text>
          </View>

          {recentPerformance.length > 0 ? (
            <View style={ps.performanceGrid}>
              {recentPerformance.map((day, idx) => (
                <View key={idx} style={ps.performanceColumn}>
                  {/* Day Label */}
                  <Text style={ps.performanceDayLabel}>{day.dayLabel}</Text>
                  
                  {/* Indicators Container */}
                  <View style={ps.performanceIndicatorContainer}>
                    {/* Workout Indicator */}
                    <View style={[
                      ps.performanceDot,
                      day.hasWorkout ? { backgroundColor: 'rgba(56, 189, 248, 0.15)', borderColor: '#38BDF8' } : ps.performanceDotInactive
                    ]}>
                      <Dumbbell size={10} color={day.hasWorkout ? '#38BDF8' : 'rgba(257,248,252,0.15)'} />
                    </View>

                    {/* Mission Indicator */}
                    <View style={[
                      ps.performanceDot,
                      day.hasMissions ? { backgroundColor: 'rgba(247, 200, 115, 0.15)', borderColor: '#F7C873' } : ps.performanceDotInactive
                    ]}>
                      <Target size={10} color={day.hasMissions ? '#F7C873' : 'rgba(257,248,252,0.15)'} />
                    </View>

                    {/* Hydration Indicator */}
                    <View style={[
                      ps.performanceDot,
                      day.hasHydration ? { backgroundColor: 'rgba(96, 165, 250, 0.15)', borderColor: '#60A5FA' } : ps.performanceDotInactive
                    ]}>
                      <Droplet size={10} color={day.hasHydration ? '#60A5FA' : 'rgba(257,248,252,0.15)'} fill={day.hasHydration ? '#60A5FA' : 'transparent'} />
                    </View>
                  </View>

                  {/* XP Gained Label */}
                  <Text style={[
                    ps.performanceXpText,
                    day.xpGained > 0 ? { color: '#10B981' } : { color: 'rgba(257,248,252,0.2)' }
                  ]}>
                    {day.xpGained > 0 ? `+${day.xpGained}` : '--'}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <ActivityIndicator size="small" color="#8B7CFF" style={{ marginVertical: 20 }} />
          )}

          {/* Legend */}
          <View style={ps.performanceLegend}>
            <View style={ps.legendItem}>
              <View style={[ps.legendDotIndicator, { backgroundColor: '#38BDF8' }]} />
              <Text style={ps.legendText}>Workout</Text>
            </View>
            <View style={ps.legendItem}>
              <View style={[ps.legendDotIndicator, { backgroundColor: '#F7C873' }]} />
              <Text style={ps.legendText}>Mission</Text>
            </View>
            <View style={ps.legendItem}>
              <View style={[ps.legendDotIndicator, { backgroundColor: '#60A5FA' }]} />
              <Text style={ps.legendText}>Water</Text>
            </View>
          </View>
        </View>

        {/* 7. COLLAPSIBLE POSTS SECTION (DE-EMPHASIZED) */}
        <View style={ps.postsAccordion}>
          <TouchableOpacity 
            style={ps.accordionHeader} 
            onPress={() => setPostsExpanded(!postsExpanded)}
            activeOpacity={0.8}
          >
            <View style={ps.accordionTitleContainer}>
              <Award size={16} color="rgba(247, 248, 252, 0.4)" />
              <Text style={ps.accordionTitle}>Past Win Posts ({posts?.length || 0})</Text>
            </View>
            {postsExpanded ? (
              <ChevronUp size={16} color="rgba(247, 248, 252, 0.4)" />
            ) : (
              <ChevronDown size={16} color="rgba(247, 248, 252, 0.4)" />
            )}
          </TouchableOpacity>

          {postsExpanded && (
            <View style={ps.accordionContent}>
              {posts?.length > 0 ? (
                <View style={ps.grid}>
                  {posts.map((p: Post, i) => (
                    <TouchableOpacity
                      key={p.id || i}
                      style={ps.gridItem}
                      onPress={() => {
                        setSelectedPost(p);
                        setPostViewerVisible(true);
                      }}
                      activeOpacity={0.9}
                    >
                      {p.image_url ? (
                        <Image source={{ uri: p.image_url }} style={ps.gridImg} />
                      ) : (
                        <View style={[ps.gridImg, ps.gridImgFallback]}>
                          <Text style={ps.gridFallbackText}>{p.content?.slice(0, 40)}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={ps.emptyPostsContainer}>
                  <Text style={ps.emptyPostsText}>No posts shared yet. Keep your focus on progression.</Text>
                </View>
              )}
            </View>
          )}
        </View>

      </RefreshableScrollView>

      {/* PREVIEW AVATAR MODAL */}
      <Modal visible={previewVisible} transparent animationType="fade">
        <TouchableOpacity
          style={ps.modalOverlay}
          onPress={() => setPreviewVisible(false)}
          activeOpacity={1}
        >
          {profile?.avatar_url ? (
            <Image source={{ uri: `${profile.avatar_url}?t=${profile.updated_at ? new Date(profile.updated_at).getTime() : Date.now()}` }} style={ps.modalAvatarLarge} />
          ) : (
            <View style={ps.modalAvatarLargeFallback}>
              <Text style={{ fontSize: 80, fontWeight: '900', color: '#8B7CFF' }}>
                {(profile?.full_name || 'U')[0].toUpperCase()}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Modal>

      {/* INDIVIDUAL BADGE DETAILS MODAL */}
      <Modal visible={selectedBadge !== null} transparent animationType="slide" onRequestClose={() => setSelectedBadge(null)}>
        <View style={ps.badgeDetailsOverlay}>
          <View style={ps.badgeDetailsCard}>
            <View style={[ps.badgeDetailsIconCircle, { borderColor: selectedBadge?.color || '#8B7CFF' }]}>
              {selectedBadge && renderBadgeIcon(selectedBadge.icon, selectedBadge.color || '#8B7CFF', 48)}
            </View>
            <Text style={ps.badgeDetailsTitle}>{selectedBadge?.title}</Text>
            
            <View style={[ps.badgeStatusTag, selectedBadge?.unlocked ? ps.badgeStatusUnlocked : ps.badgeStatusLocked]}>
              <Text style={[ps.badgeStatusText, selectedBadge?.unlocked ? ps.badgeStatusTextUnlocked : ps.badgeStatusTextLocked]}>
                {selectedBadge?.unlocked ? 'UNLOCKED' : 'LOCKED'}
              </Text>
            </View>

            <Text style={ps.badgeDetailsDesc}>{selectedBadge?.desc}</Text>
            
            <TouchableOpacity style={ps.badgeDetailsCloseBtn} onPress={() => setSelectedBadge(null)}>
              <Text style={ps.badgeDetailsCloseBtnText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* POST VIEWER MODAL */}
      <PostViewerModal
        visible={postViewerVisible}
        onClose={() => setPostViewerVisible(false)}
        post={selectedPost}
      />
    </View>
  );
}

const ps = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1021', // Deep Midnight
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  username: {
    fontSize: 15,
    fontWeight: '700',
    color: 'rgba(247, 248, 252, 0.6)',
    letterSpacing: 0.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 60, // reduced to account for hidden FAB
  },

  // Hero Identity Card Styles
  heroCardWrapper: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(139, 124, 255, 0.2)', // Sleek Lavender border
    shadowColor: '#8B7CFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 5,
  },
  heroGradient: {
    padding: 24,
  },
  heroMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: '#8B7CFF',
  },
  avatarFallback: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#1E1D33',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#8B7CFF',
  },
  avatarInitial: {
    fontSize: 28,
    fontWeight: '900',
    color: '#8B7CFF',
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#8B7CFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0F1021',
  },
  avatarPulseRing: {
    position: 'absolute',
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 1,
    borderColor: 'rgba(139, 124, 255, 0.3)',
    top: -3,
    left: -3,
  },
  identityInfo: {
    flex: 1,
  },
  nameText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F7F8FC',
    letterSpacing: -0.3,
  },
  levelBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(247, 200, 115, 0.1)',
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(247, 200, 115, 0.25)',
  },
  levelTitleText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F7C873',
    letterSpacing: 0.5,
  },
  xpContainer: {
    marginTop: 20,
  },
  xpLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  xpProgressLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(247, 248, 252, 0.4)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  xpValueText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F7F8FC',
  },
  xpTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    borderRadius: 4,
  },
  xpBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  xpNextLevelText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(247, 248, 252, 0.4)',
  },
  heroStreakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 143, 163, 0.12)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 143, 163, 0.2)',
  },
  heroStreakText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FF8FA3',
  },

  // Goals Card Styles
  goalCard: {
    backgroundColor: 'rgba(25, 28, 55, 0.35)',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  goalCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goalCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F7F8FC',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  goalProgressRows: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  goalColumn: {
    flex: 1,
  },
  goalMetricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  goalLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(247, 248, 252, 0.4)',
  },
  goalValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F7F8FC',
  },
  goalProgressBarTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  goalProgressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  goalSubtext: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(247, 248, 252, 0.3)',
    marginTop: 6,
  },
  goalDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },

  // AI Insight Card Styles
  insightCard: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 143, 163, 0.15)',
  },
  insightGradient: {
    padding: 20,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  insightTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  insightTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F7C873',
    letterSpacing: 1,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  insightLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  insightLoadingText: {
    fontSize: 12,
    color: 'rgba(247, 248, 252, 0.4)',
    fontWeight: '600',
  },
  insightText: {
    fontSize: 13,
    color: '#F7F8FC',
    lineHeight: 18,
    fontWeight: '700',
    fontStyle: 'italic',
  },

  // Stats Grid Section
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(247, 248, 252, 0.4)',
    letterSpacing: 1,
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 10,
  },
  sectionLabelNoMargin: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(247, 248, 252, 0.4)',
    letterSpacing: 1,
    marginBottom: 12,
  },
  statsGrid: {
    paddingHorizontal: 16,
    gap: 8,
  },
  statCardRow: {
    flexDirection: 'row',
    gap: 8,
  },
  fullStatCard: {
    backgroundColor: 'rgba(25, 28, 55, 0.25)',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    gap: 8,
  },
  fullStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fullStatCardLabel: {
    fontSize: 11,
    color: 'rgba(247, 248, 252, 0.4)',
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  fullStatCardNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#10B981',
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(25, 28, 55, 0.25)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    gap: 8,
  },
  statCardNumber: {
    fontSize: 16,
    fontWeight: '900',
    color: '#F7F8FC',
  },
  emptyStatNumberText: {
    color: 'rgba(247, 248, 252, 0.3)',
    fontSize: 13,
    fontWeight: '600',
  },
  statCardLabel: {
    fontSize: 11,
    color: 'rgba(247, 248, 252, 0.4)',
    fontWeight: '700',
  },

  // Achievements section
  achievementsCard: {
    backgroundColor: 'rgba(25, 28, 55, 0.25)',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  badgeRibbon: {
    flexDirection: 'row',
    marginTop: 4,
  },
  badgeContainer: {
    alignItems: 'center',
    marginRight: 18,
    width: 60,
  },
  badgeLocked: {
    opacity: 0.75, // Badge color and icon remain the visual focus
  },
  badgeCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#FFF',
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  badgeLockOverlay: {
    position: 'absolute',
    bottom: -1, // Push further into the corner
    right: -1,
    backgroundColor: 'rgba(15, 16, 33, 0.85)',
    width: 10, // ~30% smaller than 14
    height: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    opacity: 0.3, // ~50% reduced opacity from 0.5
  },
  badgeNameText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F7F8FC',
    marginTop: 6,
    textAlign: 'center',
    width: '100%',
  },

  // Last 7 Days Performance
  performanceCard: {
    backgroundColor: 'rgba(25, 28, 55, 0.25)',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  performanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  performanceTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  performanceCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F7F8FC',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  performanceSubtitle: {
    fontSize: 11,
    color: 'rgba(247,248,252,0.4)',
    fontWeight: '600',
  },
  performanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  performanceColumn: {
    alignItems: 'center',
    flex: 1,
  },
  performanceDayLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(247, 248, 252, 0.4)',
    marginBottom: 10,
  },
  performanceIndicatorContainer: {
    gap: 6,
    marginBottom: 10,
    alignItems: 'center',
  },
  performanceDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  performanceDotInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  performanceXpText: {
    fontSize: 10,
    fontWeight: '800',
  },
  performanceLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 8,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    paddingTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDotIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 10,
    color: 'rgba(247, 248, 252, 0.4)',
    fontWeight: '600',
  },

  // Collapsible Posts Section
  postsAccordion: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: 'rgba(25, 28, 55, 0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  accordionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accordionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(247, 248, 252, 0.4)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  accordionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  gridItem: {
    width: '32%',
  },
  gridImg: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  gridImgFallback: {
    backgroundColor: '#1E1D33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridFallbackText: {
    fontSize: 10,
    color: '#8B7CFF',
    fontWeight: '700',
    padding: 6,
    textAlign: 'center',
  },
  emptyPostsContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyPostsText: {
    color: 'rgba(247, 248, 252, 0.3)',
    fontSize: 11,
    textAlign: 'center',
  },

  // Modals & Overlays
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 16, 33, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalAvatarLarge: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 4,
    borderColor: '#8B7CFF',
  },
  modalAvatarLargeFallback: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#1E1D33',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#8B7CFF',
  },

  badgeDetailsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 16, 33, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDetailsCard: {
    width: width - 64,
    backgroundColor: '#15172C',
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 124, 255, 0.15)',
    shadowColor: '#8B7CFF',
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  badgeDetailsIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#FFF',
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },
  badgeDetailsTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#F7F8FC',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  badgeStatusTag: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 18,
    borderWidth: 1,
  },
  badgeStatusUnlocked: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  badgeStatusLocked: {
    backgroundColor: 'rgba(244, 63, 94, 0.08)',
    borderColor: 'rgba(244, 63, 94, 0.18)',
  },
  badgeStatusText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  badgeStatusTextUnlocked: {
    color: '#10B981',
  },
  badgeStatusTextLocked: {
    color: '#F43F5E',
  },
  badgeDetailsDesc: {
    fontSize: 13,
    color: 'rgba(247, 248, 252, 0.6)',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
  },
  badgeDetailsCloseBtn: {
    backgroundColor: '#8B7CFF',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  badgeDetailsCloseBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
});