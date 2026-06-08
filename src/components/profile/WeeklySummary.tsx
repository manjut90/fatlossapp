import React from 'react';

import {
  View,
  Text,
 StyleSheet,
} from 'react-native';

import AnimatedScoreRing from './AnimatedScoreRing';

import {
  Droplets,
  Dumbbell,
  Flame,
} from 'lucide-react-native';

export default function WeeklySummary() {
  return (
    <View style={styles.container}>
      {/* SCORE */}

      <View style={styles.leftCard}>
        <AnimatedScoreRing
          score={84}
        />
      </View>

      {/* METRICS */}

      <View style={styles.rightColumn}>
        <MetricCard
          icon={
            <Flame
              size={16}
              color="#F7C873"
            />
          }
          title="Streak"
          value="142"
        />

        <MetricCard
          icon={
            <Droplets
              size={16}
              color="#4ea8ff"
            />
          }
          title="Hydration"
          value="91%"
        />

        <MetricCard
          icon={
            <Dumbbell
              size={16}
              color="#22c55e"
            />
          }
          title="Workout"
          value="6/7"
        />
      </View>
    </View>
  );
}

function MetricCard({
  icon,
  title,
  value,
}: any) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricTop}>
        {icon}

        <Text
          style={
            styles.metricTitle
          }
        >
          {title}
        </Text>
      </View>

      <Text style={styles.value}>
        {value}
      </Text>
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flexDirection: 'row',

      justifyContent:
        'space-between',

      marginBottom: 30,
    },

    leftCard: {
      width: '42%',

      backgroundColor: '#111',

      borderRadius: 28,

      justifyContent:
        'center',

      alignItems: 'center',

      paddingVertical: 20,
    },

    rightColumn: {
      width: '54%',

      justifyContent:
        'space-between',
    },

    metricCard: {
      height: 92,

      backgroundColor: '#111',

      borderRadius: 24,

      padding: 18,

      justifyContent:
        'space-between',
    },

    metricTop: {
      flexDirection: 'row',

      alignItems: 'center',
    },

    metricTitle: {
      color: '#999',

      marginLeft: 8,

      fontSize: 12,
    },

    value: {
      color: '#fff',

      fontSize: 28,

      fontWeight: '900',
    },
  });