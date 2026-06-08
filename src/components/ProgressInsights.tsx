import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, RefreshCw } from 'lucide-react-native';
import { useProgressInsights } from '../hooks/useProgressInsights';

export function ProgressInsights() {
  const { positives, negatives, recommendations, loading, cached, refresh } =
    useProgressInsights();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>INSIGHTS FROM YOUR WEEK</Text>
        {cached && (
          <TouchableOpacity onPress={refresh} disabled={loading}>
            <RefreshCw
              size={16}
              color={loading ? '#CCC' : '#8B7CFF'}
              strokeWidth={2}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.insightCard}>
        <LinearGradient
          colors={[
            'rgba(123,97,255,0.06)',
            'transparent',
          ]}
          style={styles.insightGlow}
        />

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B7CFF" />
            <Text style={styles.loadingText}>Generating insights...</Text>
          </View>
        ) : (
          <>
            <View style={styles.grid}>
              {/* Positives Column (Good) */}
              <View style={styles.gridColumn}>
                <View style={styles.columnHeader}>
                  <Text style={[styles.columnTitle, { color: '#52C77C' }]}>
                    WHAT WENT WELL
                  </Text>
                </View>
                <View style={styles.bulletList}>
                  {positives.split('. ').slice(0, 5).map((item, i) => (
                    item.trim() && (
                      <View key={i} style={styles.bulletItem}>
                        <Text style={styles.bulletDot}>•</Text>
                        <Text style={styles.bulletText}>{item.trim()}</Text>
                      </View>
                    )
                  ))}
                </View>
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Negatives Column (Bad) */}
              <View style={styles.gridColumn}>
                <View style={styles.columnHeader}>
                  <Text style={[styles.columnTitle, { color: '#FF9A4D' }]}>
                    AREAS TO IMPROVE
                  </Text>
                </View>
                <View style={styles.bulletList}>
                  {negatives.split('. ').slice(0, 5).map((item, i) => (
                    item.trim() && (
                      <View key={i} style={styles.bulletItem}>
                        <Text style={styles.bulletDot}>•</Text>
                        <Text style={styles.bulletText}>{item.trim()}</Text>
                      </View>
                    )
                  ))}
                </View>
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
    marginHorizontal: 18,
  },

  sectionHeader: {
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionTitle: {
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: '800',
    color: '#7B7B7B',
  },

  insightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EEE6DA',
    overflow: 'hidden',
  },

  insightGlow: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 999,
  },

  loadingContainer: {
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  gridColumn: {
    flex: 1,
  },

  columnHeader: {
    marginBottom: 12,
  },

  columnTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },

  bulletList: {
    marginTop: 10,
  },

  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  bulletDot: {
    fontSize: 12,
    color: '#7B7B7B',
    marginRight: 8,
    fontWeight: '600',
  },

  bulletText: {
    flex: 1,
    fontSize: 12,
    color: '#5D5D5D',
    lineHeight: 18,
  },

  divider: {
    width: 1,
    backgroundColor: '#F1ECE5',
    marginHorizontal: 18,
  },
});