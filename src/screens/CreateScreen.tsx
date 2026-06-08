import { useNavigation } from '@react-navigation/native';
import React, {
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
} from 'react-native';

import {
  Flame,
  Dumbbell,
  Camera,
  Utensils,
  Moon,
  Droplets,
  Activity,
  ChevronRight,
  CircleCheck,
} from 'lucide-react-native';

export default function CreateScreen() {
  const navigation = useNavigation();
  const [protein, setProtein] =
    useState('');

  const [water, setWater] =
    useState('');

  const [steps, setSteps] =
    useState('');

  const [weight, setWeight] =
    useState('');

  const [sleep, setSleep] =
    useState('');

  return (
    <SafeAreaView
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* HEADER */}

        <View style={styles.header}>
          <Text style={styles.title}>
            Daily Check-In
          </Text>

          <Text
            style={styles.subtitle}
          >
            Track progress. Build
            consistency. Beat your
            rivals.
          </Text>
        </View>

        {/* DAILY STATUS */}

        <View style={styles.statusCard}>
          <View
            style={styles.statusTop}
          >
            <View
              style={styles.flameWrap}
            >
              <Flame
                size={22}
                color="#ff7a00"
              />
            </View>

            <View>
              <Text
                style={
                  styles.statusTitle
                }
              >
                23 Day Streak
              </Text>

              <Text
                style={
                  styles.statusSubtitle
                }
              >
                Keep showing up.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={
              styles.checkInButton
            }
            onPress={() => navigation.navigate('CheckIn')}
          >
            <CircleCheck
              size={18}
              color="#000"
            />

            <Text
              style={
                styles.checkInText
              }
            >
              Complete Check-In
            </Text>
          </TouchableOpacity>
        </View>

        {/* TRACKERS */}

        <Text style={styles.section}>
          Today's Metrics
        </Text>

        {/* PROTEIN */}

        <View style={styles.inputCard}>
          <View
            style={styles.inputHeader}
          >
            <View
              style={styles.iconWrap}
            >
              <Utensils
                size={18}
                color="#8B7CFF"
              />
            </View>

            <Text
              style={styles.inputTitle}
            >
              Protein Intake
            </Text>
          </View>

          <TextInput
            value={protein}
            onChangeText={setProtein}
            placeholder="e.g. 180g"
            placeholderTextColor="#666"
            style={styles.input}
          />
        </View>

        {/* WATER */}

        <View style={styles.inputCard}>
          <View
            style={styles.inputHeader}
          >
            <View
              style={styles.iconWrap}
            >
              <Droplets
                size={18}
                color="#3aa6ff"
              />
            </View>

            <Text
              style={styles.inputTitle}
            >
              Hydration
            </Text>
          </View>

          <TextInput
            value={water}
            onChangeText={setWater}
            placeholder="e.g. 4L"
            placeholderTextColor="#666"
            style={styles.input}
          />
        </View>

        {/* STEPS */}

        <View style={styles.inputCard}>
          <View
            style={styles.inputHeader}
          >
            <View
              style={styles.iconWrap}
            >
              <Activity
                size={18}
                color="#00d26a"
              />
            </View>

            <Text
              style={styles.inputTitle}
            >
              Steps
            </Text>
          </View>

          <TextInput
            value={steps}
            onChangeText={setSteps}
            placeholder="e.g. 12000"
            placeholderTextColor="#666"
            style={styles.input}
          />
        </View>

        {/* WEIGHT */}

        <View style={styles.inputCard}>
          <View
            style={styles.inputHeader}
          >
            <View
              style={styles.iconWrap}
            >
              <Dumbbell
                size={18}
                color="#ff3040"
              />
            </View>

            <Text
              style={styles.inputTitle}
            >
              Body Weight
            </Text>
          </View>

          <TextInput
            value={weight}
            onChangeText={setWeight}
            placeholder="e.g. 78kg"
            placeholderTextColor="#666"
            style={styles.input}
          />
        </View>

        {/* SLEEP */}

        <View style={styles.inputCard}>
          <View
            style={styles.inputHeader}
          >
            <View
              style={styles.iconWrap}
            >
              <Moon
                size={18}
                color="#9f7aea"
              />
            </View>

            <Text
              style={styles.inputTitle}
            >
              Sleep
            </Text>
          </View>

          <TextInput
            value={sleep}
            onChangeText={setSleep}
            placeholder="e.g. 7h 30m"
            placeholderTextColor="#666"
            style={styles.input}
          />
        </View>

        {/* QUICK ACTIONS */}

        <Text style={styles.section}>
          Create
        </Text>

        {/* PROGRESS */}

        <TouchableOpacity
          style={styles.actionCard}
        >
          <View
            style={styles.actionLeft}
          >
            <View
              style={styles.actionIcon}
            >
              <Camera
                size={22}
                color="#fff"
              />
            </View>

            <View>
              <Text
                style={
                  styles.actionTitle
                }
              >
                Upload Progress
              </Text>

              <Text
                style={
                  styles.actionSubtitle
                }
              >
                Physique updates &
                transformations
              </Text>
            </View>
          </View>

          <ChevronRight
            size={20}
            color="#777"
          />
        </TouchableOpacity>

        {/* WORKOUT */}

        <TouchableOpacity
          style={styles.actionCard}
        >
          <View
            style={styles.actionLeft}
          >
            <View
              style={styles.actionIcon}
            >
              <Dumbbell
                size={22}
                color="#fff"
              />
            </View>

            <View>
              <Text
                style={
                  styles.actionTitle
                }
              >
                Log Workout
              </Text>

              <Text
                style={
                  styles.actionSubtitle
                }
              >
                Sets, reps & PRs
              </Text>
            </View>
          </View>

          <ChevronRight
            size={20}
            color="#777"
          />
        </TouchableOpacity>

        {/* REEL */}

        <TouchableOpacity
          style={styles.actionCard}
        >
          <View
            style={styles.actionLeft}
          >
            <View
              style={styles.actionIcon}
            >
              <Camera
                size={22}
                color="#fff"
              />
            </View>

            <View>
              <Text
                style={
                  styles.actionTitle
                }
              >
                Create Reel
              </Text>

              <Text
                style={
                  styles.actionSubtitle
                }
              >
                Share your grind
              </Text>
            </View>
          </View>

          <ChevronRight
            size={20}
            color="#777"
          />
        </TouchableOpacity>

        <View
          style={{ height: 120 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: '#0B1020',
  },

  header: {
    paddingHorizontal: 22,

    marginTop: 20,
  },

  title: {
    color: '#fff',

    fontSize: 34,

    fontWeight: '900',
  },

  subtitle: {
    color: '#8a8a8a',

    marginTop: 10,

    fontSize: 15,

    lineHeight: 24,
  },

  statusCard: {
    marginHorizontal: 22,

    marginTop: 28,

    backgroundColor:
      'rgba(255,255,255,0.05)',

    borderRadius: 30,

    padding: 22,
  },

  statusTop: {
    flexDirection: 'row',

    alignItems: 'center',
  },

  flameWrap: {
    width: 58,

    height: 58,

    borderRadius: 29,

    backgroundColor:
      'rgba(255,122,0,0.15)',

    justifyContent: 'center',

    alignItems: 'center',

    marginRight: 16,
  },

  statusTitle: {
    color: '#fff',

    fontSize: 22,

    fontWeight: '900',
  },

  statusSubtitle: {
    color: '#8a8a8a',

    marginTop: 4,
  },

  checkInButton: {
    height: 58,

    borderRadius: 22,

    backgroundColor: '#8B7CFF',

    marginTop: 22,

    justifyContent: 'center',

    alignItems: 'center',

    flexDirection: 'row',
  },

  checkInText: {
    color: '#000',

    fontWeight: '900',

    marginLeft: 10,

    fontSize: 16,
  },

  section: {
    color: '#fff',

    fontSize: 22,

    fontWeight: '900',

    marginTop: 36,

    marginBottom: 18,

    paddingHorizontal: 22,
  },

  inputCard: {
    marginHorizontal: 22,

    marginBottom: 16,

    backgroundColor:
      'rgba(255,255,255,0.04)',

    borderRadius: 24,

    padding: 18,
  },

  inputHeader: {
    flexDirection: 'row',

    alignItems: 'center',

    marginBottom: 16,
  },

  iconWrap: {
    width: 42,

    height: 42,

    borderRadius: 21,

    backgroundColor:
      'rgba(255,255,255,0.06)',

    justifyContent: 'center',

    alignItems: 'center',

    marginRight: 14,
  },

  inputTitle: {
    color: '#fff',

    fontSize: 16,

    fontWeight: '700',
  },

  input: {
    height: 54,

    borderRadius: 18,

    backgroundColor:
      'rgba(255,255,255,0.05)',

    paddingHorizontal: 18,

    color: '#fff',

    fontSize: 16,
  },

  actionCard: {
    marginHorizontal: 22,

    marginBottom: 16,

    backgroundColor:
      'rgba(255,255,255,0.05)',

    borderRadius: 24,

    padding: 20,

    flexDirection: 'row',

    justifyContent:
      'space-between',

    alignItems: 'center',
  },

  actionLeft: {
    flexDirection: 'row',

    alignItems: 'center',
  },

  actionIcon: {
    width: 52,

    height: 52,

    borderRadius: 26,

    backgroundColor:
      'rgba(255,255,255,0.08)',

    justifyContent: 'center',

    alignItems: 'center',

    marginRight: 16,
  },

  actionTitle: {
    color: '#fff',

    fontSize: 17,

    fontWeight: '800',
  },

  actionSubtitle: {
    color: '#8a8a8a',

    marginTop: 6,
  },
});