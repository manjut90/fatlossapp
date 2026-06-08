import React, {
  useRef,
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
  Animated,
} from 'react-native';

import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Flame,
  Trophy,
} from 'lucide-react-native';

const { width, height } =
  Dimensions.get('window');

const reels = [
  {
    id: '1',

    user: 'MJ',

    caption:
      'Push day domination 🔥',

    workout:
      'Chest + Triceps',

    xp: '+120 XP',

    streak: '23 Day Streak',

    image:
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438',
  },

  {
    id: '2',

    user: 'Alex',

    caption:
      'Leg day pain is temporary.',

    workout: 'Leg Day',

    xp: '+90 XP',

    streak: '18 Day Streak',

    image:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48',
  },

  {
    id: '3',

    user: 'Sarah',

    caption:
      'No excuses. Locked in.',

    workout:
      'Back + Biceps',

    xp: '+140 XP',

    streak: '31 Day Streak',

    image:
      'https://images.unsplash.com/photo-1518611012118-696072aa579a',
  },
];

export default function ReelsScreen() {
  const [liked, setLiked] =
    useState<string[]>([]);

  const scrollY =
    useRef(
      new Animated.Value(0)
    ).current;

  const toggleLike = (
    id: string,
  ) => {
    setLiked((prev) => {
      if (prev.includes(id)) {
        return prev.filter(
          (item) => item !== id,
        );
      }

      return [...prev, id];
    });
  };

  const renderItem = ({
    item,
    index,
  }: any) => {
    return (
      <View style={styles.card}>
        {/* BG */}

        <ImageBackground
          source={{
            uri: item.image,
          }}
          style={styles.image}
        >
          {/* OVERLAY */}

          <View style={styles.overlay} />

          {/* TOP */}

          <View style={styles.topBar}>
            <View style={styles.liveBadge}>
              <Flame
                size={14}
                color="#fff"
              />

              <Text
                style={
                  styles.liveText
                }
              >
                ACTIVE
              </Text>
            </View>

            <TouchableOpacity
              style={
                styles.rankBadge
              }
            >
              <Trophy
                size={14}
                color="#F7C873"
              />

              <Text
                style={
                  styles.rankText
                }
              >
                #12
              </Text>
            </TouchableOpacity>
          </View>

          {/* RIGHT ACTIONS */}

          <View
            style={
              styles.actionsColumn
            }
          >
            {/* PROFILE */}

            <View
              style={
                styles.avatarWrap
              }
            >
              <View
                style={
                  styles.avatar
                }
              />
            </View>

            {/* LIKE */}

            <TouchableOpacity
              style={
                styles.actionButton
              }
              onPress={() =>
                toggleLike(
                  item.id,
                )
              }
            >
              <Heart
                size={30}
                color={
                  liked.includes(
                    item.id,
                  )
                    ? '#ff3040'
                    : '#fff'
                }
                fill={
                  liked.includes(
                    item.id,
                  )
                    ? '#ff3040'
                    : 'transparent'
                }
              />

              <Text
                style={
                  styles.actionText
                }
              >
                4.2K
              </Text>
            </TouchableOpacity>

            {/* COMMENT */}

            <TouchableOpacity
              style={
                styles.actionButton
              }
            >
              <MessageCircle
                size={28}
                color="#fff"
              />

              <Text
                style={
                  styles.actionText
                }
              >
                312
              </Text>
            </TouchableOpacity>

            {/* SHARE */}

            <TouchableOpacity
              style={
                styles.actionButton
              }
            >
              <Share2
                size={28}
                color="#fff"
              />

              <Text
                style={
                  styles.actionText
                }
              >
                Share
              </Text>
            </TouchableOpacity>

            {/* SAVE */}

            <TouchableOpacity
              style={
                styles.actionButton
              }
            >
              <Bookmark
                size={28}
                color="#fff"
              />

              <Text
                style={
                  styles.actionText
                }
              >
                Save
              </Text>
            </TouchableOpacity>
          </View>

          {/* BOTTOM */}

          <View style={styles.bottom}>
            {/* USER */}

            <View style={styles.userRow}>
              <Text
                style={styles.username}
              >
                @{item.user}
              </Text>

              <View
                style={
                  styles.followButton
                }
              >
                <Text
                  style={
                    styles.followText
                  }
                >
                  Follow
                </Text>
              </View>
            </View>

            {/* CAPTION */}

            <Text style={styles.caption}>
              {item.caption}
            </Text>

            {/* WORKOUT */}

            <View
              style={
                styles.workoutBadge
              }
            >
              <Text
                style={
                  styles.workoutText
                }
              >
                {item.workout}
              </Text>
            </View>

            {/* XP */}

            <View style={styles.xpRow}>
              <View
                style={
                  styles.xpBadge
                }
              >
                <Text
                  style={
                    styles.xpText
                  }
                >
                  {item.xp}
                </Text>
              </View>

              <View
                style={
                  styles.streakBadge
                }
              >
                <Flame
                  size={14}
                  color="#ff7a00"
                />

                <Text
                  style={
                    styles.streakText
                  }
                >
                  {item.streak}
                </Text>
              </View>
            </View>
          </View>
        </ImageBackground>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.FlatList
        data={reels}
        pagingEnabled
        showsVerticalScrollIndicator={
          false
        }
        snapToInterval={height}
        decelerationRate="fast"
        keyExtractor={(item) =>
          item.id
        }
        renderItem={renderItem}
        onScroll={Animated.event(
          [
            {
              nativeEvent: {
                contentOffset: {
                  y: scrollY,
                },
              },
            },
          ],
          {
            useNativeDriver: true,
          },
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: '#000',
  },

  card: {
    width,

    height,
  },

  image: {
    flex: 1,

    justifyContent:
      'space-between',
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,

    backgroundColor:
      'rgba(0,0,0,0.25)',
  },

  topBar: {
    marginTop: 70,

    flexDirection: 'row',

    justifyContent:
      'space-between',

    paddingHorizontal: 20,
  },

  liveBadge: {
    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor:
      'rgba(255,255,255,0.12)',

    paddingHorizontal: 14,

    paddingVertical: 10,

    borderRadius: 20,
  },

  liveText: {
    color: '#fff',

    marginLeft: 6,

    fontWeight: '700',
  },

  rankBadge: {
    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor:
      'rgba(0,0,0,0.25)',

    paddingHorizontal: 14,

    paddingVertical: 10,

    borderRadius: 20,
  },

  rankText: {
    color: '#fff',

    marginLeft: 6,

    fontWeight: '700',
  },

  actionsColumn: {
    position: 'absolute',

    right: 16,

    bottom: 160,

    alignItems: 'center',
  },

  avatarWrap: {
    marginBottom: 24,
  },

  avatar: {
    width: 62,

    height: 62,

    borderRadius: 31,

    backgroundColor:
      'rgba(255,255,255,0.25)',

    borderWidth: 2,

    borderColor: '#fff',
  },

  actionButton: {
    alignItems: 'center',

    marginBottom: 24,
  },

  actionText: {
    color: '#fff',

    marginTop: 6,

    fontWeight: '700',
  },

  bottom: {
    paddingHorizontal: 20,

    paddingBottom: 120,
  },

  userRow: {
    flexDirection: 'row',

    alignItems: 'center',

    marginBottom: 16,
  },

  username: {
    color: '#fff',

    fontSize: 20,

    fontWeight: '900',
  },

  followButton: {
    marginLeft: 14,

    backgroundColor:
      '#F7C873',

    paddingHorizontal: 16,

    paddingVertical: 8,

    borderRadius: 18,
  },

  followText: {
    color: '#000',

    fontWeight: '800',
  },

  caption: {
    color: '#fff',

    fontSize: 18,

    lineHeight: 28,

    width: '82%',
  },

  workoutBadge: {
    alignSelf: 'flex-start',

    backgroundColor:
      'rgba(255,255,255,0.12)',

    paddingHorizontal: 16,

    paddingVertical: 10,

    borderRadius: 20,

    marginTop: 18,
  },

  workoutText: {
    color: '#fff',

    fontWeight: '700',
  },

  xpRow: {
    flexDirection: 'row',

    marginTop: 20,
  },

  xpBadge: {
    backgroundColor:
      '#F7C873',

    paddingHorizontal: 16,

    paddingVertical: 10,

    borderRadius: 18,

    marginRight: 12,
  },

  xpText: {
    color: '#000',

    fontWeight: '900',
  },

  streakBadge: {
    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor:
      'rgba(255,255,255,0.12)',

    paddingHorizontal: 16,

    paddingVertical: 10,

    borderRadius: 18,
  },

  streakText: {
    color: '#fff',

    marginLeft: 6,

    fontWeight: '700',
  },
});