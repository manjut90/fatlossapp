import React, {
  useEffect,
  useRef,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  Pressable,
} from 'react-native';

import {
  Flame,
  Camera,
  Dumbbell,
  Utensils,
  Clapperboard,
  X,
} from 'lucide-react-native';

const { height } =
  Dimensions.get('window');

export default function CreateActionModal({
  visible,
  onClose,
  navigation,
}: any) {
  const translateY =
    useRef(
      new Animated.Value(height),
    ).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(
        translateY,
        {
          toValue: 0,

          friction: 8,

          tension: 80,

          useNativeDriver: true,
        },
      ).start();
    } else {
      Animated.timing(
        translateY,
        {
          toValue: height,

          duration: 260,

          useNativeDriver: true,
        },
      ).start();
    }
  }, [visible]);

  const actions = [
    {
      title: 'Daily Check-In',

      subtitle:
        'Track consistency & habits',

      icon: (
        <Flame
          size={22}
          color="#ff7a00"
        />
      ),

      screen: 'Create',
    },

    {
      title: 'Upload Progress',

      subtitle:
        'Transformations & physique',

      icon: (
        <Camera
          size={22}
          color="#fff"
        />
      ),

      screen: 'Create',
    },

    {
      title: 'Log Workout',

      subtitle:
        'Sets, reps & PR tracking',

      icon: (
        <Dumbbell
          size={22}
          color="#ff3040"
        />
      ),

      screen: 'Create',
    },

    {
      title: 'Post Meal',

      subtitle:
        'AI nutrition analysis later',

      icon: (
        <Utensils
          size={22}
          color="#8B7CFF"
        />
      ),

      screen: 'Create',
    },

    {
      title: 'Create Reel',

      subtitle:
        'Share your grind socially',

      icon: (
        <Clapperboard
          size={22}
          color="#3aa6ff"
        />
      ),

      screen: 'Reels',
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
    >
      {/* BACKDROP */}

      <Pressable
        style={styles.backdrop}
        onPress={onClose}
      />

      {/* SHEET */}

      <Animated.View
        style={[
          styles.sheet,

          {
            transform: [
              {
                translateY,
              },
            ],
          },
        ]}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <Text style={styles.title}>
            Create
          </Text>

          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
          >
            <X
              size={22}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        {/* ACTIONS */}

        {actions.map(
          (action, index) => (
            <TouchableOpacity
              key={index}
              style={
                styles.actionCard
              }
              activeOpacity={0.88}
              onPress={() => {
                onClose();

                setTimeout(() => {
                  navigation.navigate(
                    action.screen,
                  );
                }, 250);
              }}
            >
              <View
                style={
                  styles.iconWrap
                }
              >
                {action.icon}
              </View>

              <View
                style={{
                  flex: 1,
                }}
              >
                <Text
                  style={
                    styles.actionTitle
                  }
                >
                  {action.title}
                </Text>

                <Text
                  style={
                    styles.actionSubtitle
                  }
                >
                  {
                    action.subtitle
                  }
                </Text>
              </View>
            </TouchableOpacity>
          ),
        )}

        <View style={{ height: 40 }} />
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,

    backgroundColor:
      'rgba(0,0,0,0.55)',
  },

  sheet: {
    position: 'absolute',

    bottom: 0,

    width: '100%',

    backgroundColor: '#121212',

    borderTopLeftRadius: 34,

    borderTopRightRadius: 34,

    paddingHorizontal: 22,

    paddingTop: 22,
  },

  header: {
    flexDirection: 'row',

    justifyContent:
      'space-between',

    alignItems: 'center',

    marginBottom: 26,
  },

  title: {
    color: '#fff',

    fontSize: 28,

    fontWeight: '900',
  },

  closeButton: {
    width: 42,

    height: 42,

    borderRadius: 21,

    backgroundColor:
      'rgba(255,255,255,0.08)',

    justifyContent: 'center',

    alignItems: 'center',
  },

  actionCard: {
    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor:
      'rgba(255,255,255,0.05)',

    borderRadius: 24,

    padding: 18,

    marginBottom: 16,
  },

  iconWrap: {
    width: 56,

    height: 56,

    borderRadius: 28,

    backgroundColor:
      'rgba(255,255,255,0.06)',

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

    lineHeight: 20,
  },
});