import React, {
  forwardRef,
  useMemo,
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Keyboard,
} from 'react-native';

import BottomSheet, {
  BottomSheetView,
} from '@gorhom/bottom-sheet';

import {
  Droplets,
  Sparkles,
  Plus,
} from 'lucide-react-native';

const quickWater = [
  250,
  500,
  750,
  1000,
];

const WaterSheet = forwardRef(
  (
    {
      onSave,
    }: any,
    ref: any,
  ) => {
    const snapPoints = useMemo(
      () => ['70%'],
      [],
    );

    const [customWater, setCustomWater] =
      useState('');

    const handleCustomSave =
      () => {
        const amount =
          parseInt(customWater);

        if (!amount) return;

        onSave(amount);

        Keyboard.dismiss();

        setCustomWater('');
      };

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backgroundStyle={{
          backgroundColor:
            '#F7F8FC',
          borderRadius: 36,
        }}
      >
        <BottomSheetView
          style={styles.container}
        >
          {/* HEADER */}

          <View style={styles.header}>
            <View>
              <Text
                style={styles.title}
              >
                Hydration
              </Text>

              <Text
                style={styles.subtitle}
              >
                Water impacts energy,
                recovery & fat loss.
              </Text>
            </View>

            <View style={styles.xpPill}>
              <Sparkles
                size={12}
                color="#FFFFFF"
              />

              <Text
                style={styles.xpText}
              >
                +5 XP
              </Text>
            </View>
          </View>

          {/* QUICK ADD */}

          <Text
            style={styles.sectionTitle}
          >
            QUICK ADD
          </Text>

          <View style={styles.quickRow}>
            {quickWater.map(
              (
                item,
                index,
              ) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickCard}
                  onPress={() =>
                    onSave(item)
                  }
                >
                  <Droplets
                    size={18}
                    color="#73F7C8"
                  />

                  <Text
                    style={
                      styles.quickText
                    }
                  >
                    {item}ml
                  </Text>
                </TouchableOpacity>
              ),
            )}
          </View>

          {/* CUSTOM */}

          <Text
            style={styles.sectionTitle}
          >
            CUSTOM AMOUNT
          </Text>

          <View style={styles.inputWrap}>
            <TextInput
              value={customWater}
              onChangeText={
                setCustomWater
              }
              placeholder="Enter water in ml"
              placeholderTextColor="#9E9E9E"
              keyboardType="numeric"
              style={styles.input}
            />

            <TouchableOpacity
              style={styles.addButton}
              onPress={
                handleCustomSave
              }
            >
              <Plus
                size={16}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>

          {/* TIPS */}

          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>
              Recovery Tip
            </Text>

            <Text style={styles.tipText}>
              Hydration directly
              impacts metabolism,
              energy and workout
              performance.
            </Text>
          </View>
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

export default WaterSheet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 10,
  },

  header: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0B1020',
  },

  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: '#9E9E9E',
    width: 220,
    lineHeight: 20,
  },

  xpPill: {
    height: 34,
    borderRadius: 999,
    paddingHorizontal: 14,
    backgroundColor: '#73F7C8',
    flexDirection: 'row',
    alignItems: 'center',
  },

  xpText: {
    marginLeft: 5,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  sectionTitle: {
    marginTop: 26,
    marginBottom: 14,
    fontSize: 11,
    letterSpacing: 1.5,
    color: '#9E9E9E',
    fontWeight: '800',
  },

  quickRow: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
  },

  quickCard: {
    width: '23%',
    height: 88,
    borderRadius: 24,
    backgroundColor: '#E8FFFA',

    justifyContent: 'center',
    alignItems: 'center',
  },

  quickText: {
    marginTop: 10,
    color: '#73F7C8',
    fontSize: 12,
    fontWeight: '700',
  },

  inputWrap: {
    flexDirection: 'row',
  },

  input: {
    flex: 1,
    height: 58,
    borderRadius: 22,
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 18,
    fontSize: 14,
    color: '#0B1020',
  },

  addButton: {
    width: 58,
    height: 58,
    borderRadius: 22,
    marginLeft: 10,
    backgroundColor: '#73F7C8',
    justifyContent: 'center',
    alignItems: 'center',
  },

  tipCard: {
    marginTop: 30,
    backgroundColor: '#F0F0F0',
    borderRadius: 28,
    padding: 22,
  },

  tipTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0B1020',
  },

  tipText: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 22,
    color: '#9E9E9E',
  },
});