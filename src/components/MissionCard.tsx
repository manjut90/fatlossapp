import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Zap, Droplets, Utensils, Footprints, CheckCircle } from 'lucide-react-native';
import { useDailyMission, Mission } from '../hooks/useDailyMission';

const CATEGORY_CONFIG = {
  movement:  { icon: Footprints, color: '#73F7C8', label: 'MOVEMENT'  },
  hydration: { icon: Droplets,   color: '#4AA9FF', label: 'HYDRATION' },
  nutrition: { icon: Utensils,   color: '#FF8FA3', label: 'NUTRITION' },
};

function CategoryPill({ category }: { category: string }) {
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
  index,
  completed,
  onComplete,
}: {
  mission: Mission;
  index: number;
  completed: boolean;
  onComplete: () => void;
}) {
  return (
    <View style={[styles.missionRow, completed && styles.missionRowDone]}>
      <View style={styles.missionLeft}>
        <View style={styles.missionMeta}>
          <CategoryPill category={mission.category} />
          <View style={styles.xpPill}>
            <Zap size={9} color="#F7C873" />
            <Text style={styles.xpText}>+{mission.xp} XP</Text>
          </View>
        </View>
        <Text style={[styles.missionTitle, completed && styles.missionTitleDone]}>
          {mission.title}
        </Text>
        <Text style={styles.missionDesc}>{mission.description}</Text>
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
    </View>
  );
}

export function MissionCard() {
  const { mission, loading, completeMission } = useDailyMission();

  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator color="#8B7CFF" />
        <Text style={styles.loadingText}>Coach is preparing your mission...</Text>
      </View>
    );
  }

  if (!mission) return null;

  const allDone = mission.missions.length > 0 &&
    mission.missions.every((_, i) => mission.completed_missions.includes(i));

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Zap size={12} color="#8B7CFF" />
        <Text style={styles.headerText}>TODAY'S MISSION</Text>
        {allDone && <Text style={styles.allDoneText}>✓ COMPLETE</Text>}
      </View>

      {/* Coach message */}
      <Text style={styles.coachMsg}>"{mission.coach_message}"</Text>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Mission rows */}
      {mission.missions.map((m: Mission, i: number) => (
        <MissionRow
          key={i}
          mission={m}
          index={i}
          completed={mission.completed_missions.includes(i)}
          onComplete={() => completeMission(i)}
        />
      ))}
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
});