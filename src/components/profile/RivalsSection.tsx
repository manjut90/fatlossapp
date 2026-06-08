import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import {
  Plus,
} from 'lucide-react-native';

const rivals = [
  {
    id: 1,
    name: 'Alex',
    streak: 142,

    image:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600',
  },

  {
    id: 2,
    name: 'Ryan',
    streak: 118,

    image:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600',
  },

  {
    id: 3,
    name: 'Chris',
    streak: 97,

    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600',
  },

  {
    id: 4,
    name: 'Noah',
    streak: 84,

    image:
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=600',
  },
];

export default function RivalsSection() {
  return (
    <View style={styles.container}>
      {/* TITLE */}

      <Text style={styles.title}>
        Consistency Circle
      </Text>

      {/* STORIES */}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={
          false
        }
      >
        {/* USER */}

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.storyWrap}
          onPress={() => {}}
        >
          <View
            style={styles.addStoryRing}
          >
            <View
              style={
                styles.addStoryInner
              }
            >
              <Plus
                size={30}
                color="#8B7CFF"
                strokeWidth={2.2}
              />
            </View>
          </View>

          <Text style={styles.name}>
            You
          </Text>
        </TouchableOpacity>

        {/* RIVALS */}

        {rivals.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.9}
            style={styles.storyWrap}
            onPress={() => {}}
          >
            {/* OUTER RING */}

            <View
              style={styles.ring}
            >
              {/* INNER */}

              <View
                style={
                  styles.imageWrap
                }
              >
                <Image
                  source={{
                    uri: item.image,
                  }}
                  style={
                    styles.avatar
                  }
                />
              </View>

              {/* STREAK */}

              <View
                style={
                  styles.streakBadge
                }
              >
                <Text
                  style={
                    styles.streakText
                  }
                >
                  🔥 {item.streak}
                </Text>
              </View>
            </View>

            <Text style={styles.name}>
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
  },

  title: {
    fontSize: 34,

    fontWeight: '900',

    color: '#171717',

    marginBottom: 24,
  },

  storyWrap: {
    alignItems: 'center',

    marginRight: 22,
  },

  addStoryRing: {
    width: 92,

    height: 92,

    borderRadius: 46,

    backgroundColor:
      'rgba(123,97,255,0.08)',

    justifyContent:
      'center',

    alignItems: 'center',

    marginBottom: 12,

    borderWidth: 2,

    borderColor:
      'rgba(123,97,255,0.16)',
  },

  addStoryInner: {
    width: 78,

    height: 78,

    borderRadius: 39,

    backgroundColor:
      '#F7F3EC',

    justifyContent:
      'center',

    alignItems: 'center',
  },

  ring: {
    width: 92,

    height: 92,

    borderRadius: 46,

    backgroundColor:
      '#8B7CFF',

    justifyContent:
      'center',

    alignItems: 'center',

    marginBottom: 12,

    shadowColor: '#8B7CFF',

    shadowOpacity: 0.22,

    shadowRadius: 14,

    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 5,
  },

  imageWrap: {
    width: 82,

    height: 82,

    borderRadius: 41,

    backgroundColor:
      '#F7F3EC',

    justifyContent:
      'center',

    alignItems: 'center',
  },

  avatar: {
    width: 74,

    height: 74,

    borderRadius: 37,
  },

  streakBadge: {
    position: 'absolute',

    bottom: -6,

    backgroundColor:
      '#EFE7DD',

    paddingHorizontal: 10,

    height: 24,

    borderRadius: 12,

    justifyContent:
      'center',

    borderWidth: 1,

    borderColor: '#E7DACC',
  },

  streakText: {
    fontSize: 11,

    fontWeight: '700',

    color: '#5F5A55',
  },

  name: {
    fontSize: 14,

    fontWeight: '700',

    color: '#232323',
  },
});