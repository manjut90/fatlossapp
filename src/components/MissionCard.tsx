import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Zap, Utensils, Footprints, CheckCircle, MoonStar } from 'lucide-react-native';
import { useDailyMission, Mission } from '../hooks/useDailyMission';

const CATEGORY_CONFIG = {
  movement:  { icon: Footprints, color: '#73F7C8', label: 'MOVEMENT'  },
  nutrition: { icon: Utensils,   color: '#FF8FA3', label: 'NUTRITION' },
  recovery:  { icon: MoonStar,   color: '#B1A2FF', label: 'RECOVERY'  },
};

function CategoryPill({ category }: { category: 'movement' | 'nutrition' | 'recovery' }) {
  const config = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.movement;
  const Icon = config.icon;
  return (
    <View style={[styles.pill, { backgroundColor: `${config.color}18` }]}>
      <Icon size={10} color={config.color} />
      <Text style={[styles.pillText, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

function MissionRow({
  mission,
  completed,
  onComplete,
}: {
  mission: Mission;
  completed: boolean;
  onComplete: () => void;
}) {
  // Animation values
  const xpAnimation = useRef(new Animated.Value(0)).current;
  const rowAnimation = useRef(new Animated.Value(0)).current;
  const prevCompletedRef = useRef<boolean>(completed);

  useEffect(() => {
    const prevCompleted = prevCompletedRef.current;
    if (prevCompleted === false && completed === true) {
      Animated.parallel([
        // Row fade and scale animation
        Animated.timing(rowAnimation, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        // Floating XP text animation
        Animated.timing(xpAnimation, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
    prevCompletedRef.current = completed;
  }, [completed, rowAnimation, xpAnimation]);

  // Interpolate styles from animation values
  const rowStyle = {
    opacity: rowAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.7],
    }),
    transform: [
      {
        scale: rowAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.98],
        }),
      },
    ],
  };

  const xpStyle = {
    opacity: xpAnimation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 1, 0],
    }),
    transform: [
      {
        translateY: xpAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -60],
        }),
      },
    ],
  };

  return (
    <Animated.View style={[styles.missionRow, completed && styles.missionRowDone, rowStyle]}>
      <Animated.Text style={[styles.xpFloating, xpStyle]}>
        +{mission.xp} XP
      </Animated.Text>
      <View style={styles.missionLeft}>
        <View style={styles.missionMeta}>
          <CategoryPill category={mission.type} />
          <View style={xpAnimation ? styles.xpPill : styles.xpPill}>
            <Zap size={9} color="#F7C873" />
            <Text style={styles.xpText}>+{mission.xp} XP</Text>
          </View>
        </View>
        <Text style={[styles.missionTitle, completed && styles.missionTitleDone]}>
          {mission.title}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.doneBtn, completed && styles.doneBtnDone]}
        onPress={onComplete}
        disabled={completed}
        activeOpacity={0.75}
      >
        {completed
          ? <CheckCircle size={18} color="#22C55E" />
          : <Text style={styles.doneBtnText}>Done</Text>
        }
      </TouchableOpacity>
    </Animated.View>
  );
}

export function MissionCard() {
  const { mission, loading, completeMission } = useDailyMission();

  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator color="#8B7CFF" />
        <Text style={styles.loadingText}>Neo is preparing your mission...</Text>
      </View>
    );
  }

  if (!mission) return null;

  const allDone = mission.completed_count === mission.total_count;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Zap size={12} color="#8B7CFF" />
        <Text style={styles.headerText}>NEO'S MISSION FOR TODAY</Text>
        {allDone && <Text style={styles.allDoneText}>✓ COMPLETE</Text>}
      </View>

      {/* Coach message */}
      <Text style={styles.coachSubtle}>Neo prepared this mission based on your profile.</Text>
      <Text style={styles.coachMsg}>"{mission.coach_message}"</Text>

      {/* Divider */}
      <View style={styles.divider} />

      {allDone ? (
        <View style={styles.completeContainer}>
          <Text style={styles.completeTitle}>🔥 Daily Missions Complete</Text>
          <View style={styles.completeXpBadge}>
            <Zap size={14} color="#F7C873" />
            <Text style={styles.completeXpText}>+50 XP earned</Text>
          </View>
          <Text style={styles.completeSubtitle}>Come back tomorrow for new missions</Text>
        </View>
      ) : (
        <>
          {/* Mission rows */}
          {mission.missions.map((m: Mission) => (
            <MissionRow
              key={m.type}
              mission={m}
              completed={m.completed}
              onComplete={() => completeMission(m.type)}
            />
          ))}
          
          {/* Bonus text */}
          <Text style={{ fontSize: 10, color: '#6B7280', textAlign: 'center', marginTop: 4 }}>
            Earn +15 XP per mission. Complete all to earn a +5 XP bonus!
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 18,
    marginTop: 16,
    backgroundColor: '#131929',
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(139,124,255,0.2)',
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8B7CFF',
    letterSpacing: 1,
    flex: 1,
  },
  allDoneText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#22C55E',
    letterSpacing: 1,
  },
  coachMsg: {
    fontSize: 13,
    color: '#6B7280',
    fontStyle: 'italic',
    lineHeight: 19,
  },
  coachSubtle: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(139,124,255,0.15)',
  },
  missionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B1020',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(139,124,255,0.1)',
    gap: 12,
  },
  missionRowDone: {
    opacity: 0.5,
    borderColor: 'rgba(34,197,94,0.2)',
  },
  missionLeft: {
    flex: 1,
    gap: 6,
  },
  missionMeta: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
  },
  pillText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  xpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(247,200,115,0.1)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
  },
  xpText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#F7C873',
  },
  xpFloating: {
    position: 'absolute',
    top: 10,
    right: 20,
    fontSize: 14,
    fontWeight: '900',
    color: '#F7C873',
    zIndex: 1,
  },
  missionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F7F8FC',
  },
  missionTitleDone: {
    textDecorationLine: 'line-through',
    color: '#6B7280',
  },
  missionDesc: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 17,
  },
  doneBtn: {
    backgroundColor: '#8B7CFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 52,
  },
  doneBtnDone: {
    backgroundColor: 'rgba(34,197,94,0.1)',
  },
  doneBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0B1020',
  },
  loadingText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
  },
  completeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  completeTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#73F7C8',
    textAlign: 'center',
  },
  completeXpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(247,200,115,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(247,200,115,0.2)',
  },
  completeXpText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F7C873',
  },
  completeSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});