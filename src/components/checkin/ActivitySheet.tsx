import React, {
  forwardRef,
  useState,
} from 'react';

import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';

import BottomSheet, {
  BottomSheetView,
} from '@gorhom/bottom-sheet';

import {
  Dumbbell,
  Zap,
  Edit2,
} from 'lucide-react-native';

import { parseActivity } from '../../services/activityParser';

const quickChips = [
  '30 min run',
  '1 hour gym',
  '45 min yoga',
  '20 min HIIT',
  '1 hour cricket',
  '30 min cycling',
];

const ActivitySheet = forwardRef(
  ({ onSelect, userWeight = 70 }: any, ref: any) => {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [confirmData, setConfirmData] = useState<any>(null);
    const [error, setError] = useState('');

    const handleParse = async (text: string) => {
      const query = text || input;
      if (!query.trim()) return;

      setError('');
      setLoading(true);

      try {
        const result = await parseActivity(query, userWeight);
        if (result) {
          setConfirmData(result);
        } else {
          setError('Could not recognize activity. Try "30 min run" or "1 hour gym"');
        }
      } catch {
        setError('Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    const handleConfirm = () => {
      if (!confirmData) return;

      onSelect({
        activity_type: confirmData.activity_type,
        activity_name: confirmData.activity_name,
        duration: confirmData.duration_minutes,
        calories_burned: confirmData.calories_burned,
        met_value: confirmData.met_value,
      });

      // Reset
      setInput('');
      setConfirmData(null);
      setError('');
    };

    const handleEdit = () => {
      setConfirmData(null);
      setError('');
    };

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={['75%']}
        enablePanDownToClose
      >
        <BottomSheetView style={styles.container}>
          <Text style={styles.title}>Activity Check-In</Text>
          <Text style={styles.subtitle}>Tell us what you did</Text>

          {/* CONFIRMATION CARD */}
          {confirmData ? (
            <View style={styles.confirmCard}>
              {/* Source badge */}
              <View style={styles.sourceBadge}>
                {confirmData.source === 'database' ? (
                  <>
                    <Zap size={12} color="#F7C873" />
                    <Text style={styles.sourceText}>Found in database ⚡</Text>
                  </>
                ) : (
                  <>
                    <Image source={require('../../assets/neo_logo.png')} style={{ width: 12, height: 12, borderRadius: 6 }} />
                    <Text style={[styles.sourceText, { color: '#8B7CFF' }]}>Calculated by AI 🤖</Text>
                  </>
                )}
              </View>

              {/* Activity name */}
              <Text style={styles.confirmActivityName}>{confirmData.activity_name}</Text>

              {/* Stats row */}
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{confirmData.duration_minutes}</Text>
                  <Text style={styles.statLabel}>mins</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={[styles.statValue, { color: '#FF7B7B' }]}>{confirmData.calories_burned}</Text>
                  <Text style={styles.statLabel}>cal burned</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={[styles.statValue, { color: '#8B7CFF' }]}>{confirmData.activity_type}</Text>
                  <Text style={styles.statLabel}>type</Text>
                </View>
              </View>

              {/* Action buttons */}
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                  <Edit2 size={14} color="#8B7CFF" />
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                  <Text style={styles.confirmText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              {/* INPUT */}
              <View style={styles.inputContainer}>
                <Dumbbell size={18} color="#8B7CFF" style={styles.inputIcon} />
                <TextInput
                  value={input}
                  onChangeText={setInput}
                  placeholder="e.g. 30 min run, 1 hour gym..."
                  placeholderTextColor="#9E9E9E"
                  style={styles.input}
                  returnKeyType="done"
                  onSubmitEditing={() => handleParse(input)}
                />
              </View>

              {/* ERROR */}
              {!!error && (
                <Text style={styles.errorText}>{error}</Text>
              )}

              {/* QUICK CHIPS */}
              <Text style={styles.chipsLabel}>QUICK ADD</Text>
              <View style={styles.chipsRow}>
                {quickChips.map((chip, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.chip}
                    onPress={() => {
                      setInput(chip);
                      handleParse(chip);
                    }}
                  >
                    <Text style={styles.chipText}>{chip}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* CALCULATE BUTTON */}
              <TouchableOpacity
                style={[styles.calculateButton, !input.trim() && styles.calculateButtonDisabled]}
                onPress={() => handleParse(input)}
                disabled={loading || !input.trim()}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.calculateText}>Calculate Calories</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

export default ActivitySheet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 22,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0B1020',
  },
  subtitle: {
    marginTop: 6,
    color: '#9E9E9E',
    fontSize: 13,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 8,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#0B1020',
  },
  errorText: {
    color: '#FF7B7B',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  chipsLabel: {
    marginTop: 16,
    marginBottom: 10,
    fontSize: 11,
    letterSpacing: 1.5,
    color: '#9E9E9E',
    fontWeight: '800',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    height: 36,
    borderRadius: 999,
    paddingHorizontal: 14,
    backgroundColor: '#E8E5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    color: '#8B7CFF',
    fontSize: 12,
    fontWeight: '700',
  },
  calculateButton: {
    marginTop: 16,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#8B7CFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calculateButtonDisabled: {
    opacity: 0.5,
  },
  calculateText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  confirmCard: {
    backgroundColor: '#F7F8FC',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E8E5FF',
  },
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sourceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F7C873',
    marginLeft: 4,
  },
  confirmActivityName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0B1020',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#F7F8FC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#EAEAEA',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0B1020',
  },
  statLabel: {
    fontSize: 11,
    color: '#9E9E9E',
    marginTop: 2,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#8B7CFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  editText: {
    color: '#8B7CFF',
    fontSize: 14,
    fontWeight: '700',
  },
  confirmButton: {
    flex: 2,
    height: 48,
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