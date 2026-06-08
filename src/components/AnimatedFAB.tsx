import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Text,
  Image,
} from 'react-native';
import { Plus, X, Sparkles, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const FAB_SIZE = 56;
const FAB_RADIUS = FAB_SIZE / 2;
const FAB_MARGIN = 16;
const OPTION_SIZE = 50;
const OPTION_RADIUS = OPTION_SIZE / 2;

type Action = {
  label: string;
  icon: React.ReactNode;
  color: string;
  onPress: () => void;
};

type Props = {
  onNeoPress: () => void;
  onMediaPress: () => void;
};

export default function AnimatedFAB({ onNeoPress, onMediaPress }: Props) {
  const navigation = useNavigation();
  const [open, setOpen] = React.useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    const toValue = open ? 0 : 1;
    Animated.spring(animation, {
      toValue,
      friction: 6,
      useNativeDriver: true,
    }).start();
    setOpen(!open);
  };

  const close = () => {
    Animated.spring(animation, {
      toValue: 0,
      friction: 6,
      useNativeDriver: true,
    }).start();
    setOpen(false);
  };

  const ACTIONS: Action[] = [
    {
      label: 'Post',
      icon: <Sparkles size={20} color="#FFF" />,
      color: '#F7C873',
      onPress: () => {
        close();
        onMediaPress();
      },
    },
    {
      label: 'Neo',
      icon: (
        <Image
          source={require('../assets/neo_logo.png')}
          style={{ width: 22, height: 22, resizeMode: 'contain' }}
        />
      ),
      color: '#8B7CFF',
      onPress: () => {
        close();
        onNeoPress();
      },
    },
    {
      label: 'Check In',
      icon: <Zap size={20} color="#FFF" />,
      color: '#FF8FA3',
      onPress: () => {
        close();
        navigation.navigate('CheckIn' as never);
      },
    },
  ];

  const rotate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const renderOption = (action: Action, index: number) => {
    const translateY = animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -(index + 1) * (OPTION_SIZE + 16)],
    });

    const opacity = animation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0, 1],
    });

    return (
      <Animated.View
        key={action.label}
        style={[s.option, { transform: [{ translateY }], opacity }]}
      >
        <View style={s.labelWrap}>
          <Text style={s.labelText}>{action.label}</Text>
        </View>
        <TouchableOpacity
          style={[s.optionBtn, { backgroundColor: action.color }]}
          onPress={action.onPress}
        >
          {action.icon}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={s.container}>
      {ACTIONS.map(renderOption)}
      <TouchableOpacity style={s.fab} onPress={toggleMenu}>
        <LinearGradient
          colors={['#8B7CFF', '#FF8FA3']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.gradient}
        >
          <Animated.View style={{ transform: [{ rotate }] }}>
            {open ? (
              <X size={24} color="#FFF" />
            ) : (
              <Plus size={24} color="#FFF" />
            )}
          </Animated.View>
        </LinearGradient>
      </TouchableOpacity>
      {open && <TouchableOpacity style={s.backdrop} onPress={toggleMenu} />}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: FAB_MARGIN,
    right: FAB_MARGIN,
    alignItems: 'center',
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_RADIUS,
    elevation: 8,
    shadowColor: '#8B7CFF',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  gradient: {
    width: '100%',
    height: '100%',
    borderRadius: FAB_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
  },
  option: {
    position: 'absolute',
    right: (FAB_SIZE - OPTION_SIZE) / 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionBtn: {
    width: OPTION_SIZE,
    height: OPTION_SIZE,
    borderRadius: OPTION_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  labelWrap: {
    position: 'absolute',
    right: FAB_SIZE - 2,
    backgroundColor: '#131929',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(139,124,255,0.3)',
  },
  labelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F7F8FC',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: -1,
  },
});