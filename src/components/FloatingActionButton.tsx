import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Pressable, Dimensions, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Plus, X, Camera, Image as ImageIcon, Bot, Zap } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { ENABLE_REELS } from '../constants/featureFlags';

const { width: screenWidth } = Dimensions.get('window');

type Props = {
  onNeoPress: () => void;
  onMediaPress: () => void;
};

const ACTIONS = [
  {
    key: 'neo',
    label: 'Ask Neo',
    subtitle: 'AI fitness coach',
    icon: Bot,
    color: '#8B7CFF',
    gradientColors: ['#8B7CFF', '#00D1FF'] as [string, string],
    route: 'Neo', // Navigates to Neo tab
  },
  {
    key: 'checkin',
    label: 'Check-In',
    subtitle: 'Log your day',
    icon: Zap,
    color: '#22C55E',
    gradientColors: ['#22C55E', '#16A34A'] as [string, string],
    route: 'CheckIn',
  },
  {
    key: 'post',
    label: 'Post',
    subtitle: ENABLE_REELS ? 'Photo or video' : 'Share a photo',
    icon: ImageIcon,
    color: '#F7C873',
    gradientColors: ['#F7C873', '#F59E0B'] as [string, string],
    route: 'CreatePost',
  },
];

export default function FloatingActionButton({ onNeoPress, onMediaPress }: Props) {
  const [open, setOpen] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const toggle = () => {
    Animated.spring(anim, {
      toValue: open ? 0 : 1,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
    setOpen(o => !o);
  };

  const close = () => {
    Animated.timing(anim, { toValue: 0, duration: 180, useNativeDriver: true }).start();
    setOpen(false);
  };

  const handleAction = async (action: typeof ACTIONS[number]) => {
    close();
    if (action.key === 'post') {

      try {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'We need camera roll permission to select media.');
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ENABLE_REELS ? ['images', 'videos'] : ['images'],
          allowsEditing: true,
          aspect: [4, 5],
          quality: 0.8,
        });



        if (result.canceled || !result.assets?.[0]) {
          return;
        }

        const asset = result.assets[0];
        const isVideo = ENABLE_REELS && (
          asset.mimeType?.startsWith('video/') || 
          asset.type === 'video' || 
          asset.uri.toLowerCase().endsWith('.mp4') || 
          asset.uri.toLowerCase().endsWith('.mov')
        );

        navigation.navigate('CreatePost', {
          mediaUri: asset.uri,
          mediaType: isVideo ? 'video' : 'image'
        });
      } catch (e: any) {
        Alert.alert('Error picking media', e.message || 'Something went wrong.');
      }
    } else if (action.key === 'story') {
      // Navigate to Feed tab and trigger story creation
      navigation.navigate('Feed');
      // Small delay to ensure feed is mounted, then trigger story
      setTimeout(() => {
        navigation.navigate('Feed', { screen: 'FeedHome', params: { triggerStory: Date.now() } });
      }, 100);
    } else if (action.key === 'neo') {
      onNeoPress();
    } else {
      navigation.navigate(action.route);
    }
  };

  const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] });
  const backdropOpacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  const getOptionStyle = (idx: number) => ({
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -(idx * 68 + 16)],
        }),
      },
      {
        scale: anim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.3, 0.8, 1],
        }),
      },
    ],
  });

  return (
    <>
      {/* Backdrop */}
      {open && (
        <Animated.View style={[s.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={close} />
        </Animated.View>
      )}

      {/* FAB Container */}
      <View style={[s.wrap, { bottom: insets.bottom + 70 }]} pointerEvents="box-none">
        {/* Action Items */}
        {ACTIONS.map((action, i) => {
          const Icon = action.icon;
          return (
            <Animated.View
              key={action.key}
              style={[s.optionRow, getOptionStyle(i + 1)]}
              pointerEvents={open ? 'auto' : 'none'}
            >
              <TouchableOpacity
                style={s.optionTouchable}
                onPress={() => handleAction(action)}
                activeOpacity={0.8}
              >
                {/* Label pill */}
                <View style={s.labelPill}>
                  <Text style={s.labelText}>{action.label}</Text>
                  <Text style={s.labelSubtext}>{action.subtitle}</Text>
                </View>

                {/* Icon circle */}
                <LinearGradient
                  colors={action.gradientColors}
                  style={s.optionCircle}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Icon size={22} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        {/* Main FAB */}
        <TouchableOpacity style={s.fabOuter} onPress={toggle} activeOpacity={0.85}>
          <LinearGradient
            colors={['#8B7CFF', '#FF8FA3']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.fabGradient}
          >
            <Animated.View style={{ transform: [{ rotate }] }}>
              {open ? <X size={26} color="#FFF" /> : <Plus size={26} color="#FFF" />}
            </Animated.View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </>
  );
}

const s = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 98,
  },
  wrap: {
    position: 'absolute',
    right: 20,
    alignItems: 'flex-end',
    zIndex: 99,
  },
  fabOuter: {
    width: 58,
    height: 58,
    borderRadius: 29,
    shadowColor: '#8B7CFF',
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  fabGradient: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionRow: {
    position: 'absolute',
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  labelPill: {
    backgroundColor: '#131929',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(139,124,255,0.2)',
    minWidth: 130,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  labelText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F7F8FC',
    letterSpacing: -0.2,
  },
  labelSubtext: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 1,
  },
  optionCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
});