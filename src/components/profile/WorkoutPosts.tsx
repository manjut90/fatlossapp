import React, {
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';

import {
  Grid3X3,
  Clapperboard,
} from 'lucide-react-native';

import PostViewerModal from './PostViewerModal';

const { width } = Dimensions.get('window');

const ITEM_SIZE =
  (width - 52) / 3;

const posts = [
  {
    id: '1',

    image: {
      uri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438',
    },
  },

  {
    id: '2',

    image: {
      uri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48',
    },
  },

  {
    id: '3',

    image: {
      uri: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b',
    },
  },

  {
    id: '4',

    image: {
      uri: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61',
    },
  },

  {
    id: '5',

    image: {
      uri: 'https://images.unsplash.com/photo-1518611012118-696072aa579a',
    },
  },

  {
    id: '6',

    image: {
      uri: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd',
    },
  },
];

export default function WorkoutPosts() {
  const [
    activeTab,
    setActiveTab,
  ] = useState('posts');

  const [
    viewerVisible,
    setViewerVisible,
  ] = useState(false);

  const [
    selectedIndex,
    setSelectedIndex,
  ] = useState(0);

  return (
    <View style={styles.container}>
      {/* TABS */}

      <View style={styles.tabsRow}>
        {/* POSTS */}

        <TouchableOpacity
          style={[
            styles.tabButton,

            activeTab ===
              'posts' &&
              styles.activeTab,
          ]}
          onPress={() =>
            setActiveTab('posts')
          }
        >
          <Grid3X3
            size={18}
            color={
              activeTab ===
              'posts'
                ? '#8B7CFF'
                : '#8E8A86'
            }
          />

          <Text
            style={[
              styles.tabText,

              activeTab ===
                'posts' &&
                styles.activeTabText,
            ]}
          >
            Posts
          </Text>
        </TouchableOpacity>

        {/* VIDEOS */}

        <TouchableOpacity
          style={[
            styles.tabButton,

            activeTab ===
              'videos' &&
              styles.activeTab,
          ]}
          onPress={() =>
            setActiveTab('videos')
          }
        >
          <Clapperboard
            size={18}
            color={
              activeTab ===
              'videos'
                ? '#8B7CFF'
                : '#8E8A86'
            }
          />

          <Text
            style={[
              styles.tabText,

              activeTab ===
                'videos' &&
                styles.activeTabText,
            ]}
          >
            Videos
          </Text>
        </TouchableOpacity>
      </View>

      {/* POSTS GRID */}

      <FlatList
        data={posts}
        numColumns={3}
        scrollEnabled={false}
        keyExtractor={(item) =>
          item.id
        }
        columnWrapperStyle={{
          justifyContent:
            'space-between',
        }}
        renderItem={({
          item,
          index,
        }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.postCard}
            onPress={() => {
              setSelectedIndex(
                index
              );

              setViewerVisible(
                true
              );
            }}
          >
            <Image
              source={item.image}
              style={
                styles.postImage
              }
            />
          </TouchableOpacity>
        )}
      />

      {/* MODAL */}

      <PostViewerModal
        visible={viewerVisible}
        posts={posts}
        selectedIndex={selectedIndex}
        onClose={() =>
          setViewerVisible(false)
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },

  tabsRow: {
    flexDirection: 'row',

    marginBottom: 20,
  },

  tabButton: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent:
      'center',

    paddingHorizontal: 22,

    height: 48,

    borderRadius: 24,

    backgroundColor:
      '#F7F3EC',

    borderWidth: 1,

    borderColor: '#E8DED2',

    marginRight: 12,
  },

  activeTab: {
    backgroundColor:
      'rgba(123,97,255,0.12)',

    borderColor:
      'rgba(123,97,255,0.18)',
  },

  tabText: {
    color: '#8E8A86',

    fontWeight: '700',

    marginLeft: 8,

    fontSize: 15,
  },

  activeTabText: {
    color: '#8B7CFF',
  },

  postCard: {
    width: ITEM_SIZE,

    height: ITEM_SIZE,

    borderRadius: 22,

    overflow: 'hidden',

    marginBottom: 12,

    backgroundColor:
      '#EAE2D7',
  },

  postImage: {
    width: '100%',

    height: '100%',
  },
});