import React, { forwardRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Moon } from 'lucide-react-native';
import Slider from '@react-native-community/slider';

const SleepSheet = forwardRef(({ onSelect }: any, ref: any) => {
  const [hours, setHours] = useState(8);

  return (
    <BottomSheet ref={ref} index={-1} snapPoints={['48%']} enablePanDownToClose>
      <BottomSheetView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Moon size={22} color="#B1A2FF" />
          </View>
          <Text style={styles.title}>How did you sleep?</Text>
        </View>

        <View style={styles.sliderContainer}>
          <Text style={styles.sleepAmount}>
            {hours}
            <Text style={styles.hText}>h</Text>
          </Text>
          <Text style={styles.sleepQuality}>Good sleep</Text>
        </View>

        <Slider
          style={{ width: '100%', height: 40, marginTop: 24 }}
          minimumValue={4}
          maximumValue={12}
          step={0.5}
          value={hours}
          onValueChange={setHours}
          minimumTrackTintColor="#B1A2FF"
          maximumTrackTintColor="#EAEAEA"
          thumbTintColor="#B1A2FF"
        />

        <View style={styles.labels}>
          <Text style={styles.labelText}>4h</Text>
          <Text style={styles.labelText}>8h</Text>
          <Text style={styles.labelText}>12h</Text>
        </View>

        <View style={{paddingTop: 24, marginTop: 32}}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => onSelect(hours)}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
});

export default SleepSheet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: '#F7F8FC',
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8E5FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0B1020',
  },
  sliderContainer: {
    marginTop: 32,
    alignItems: 'center',
  },
  sleepAmount: {
    fontSize: 64,
    fontWeight: '800',
    color: '#0B1020',
    lineHeight: 72,
  },
  hText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#9E9E9E',
  },
  sleepQuality: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9E9E9E',
    marginTop: 4,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: -8,
  },
  labelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9E9E9E',
  },
  saveButton: {
    marginTop: 'auto',
    marginBottom: 32,
    backgroundColor: '#B1A2FF',
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});