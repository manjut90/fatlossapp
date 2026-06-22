import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, StatusBar, ScrollView, Share, Modal, TextInput,
  KeyboardAvoidingView, Platform, Dimensions, Animated, Alert, RefreshControl
} from 'react-native';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, X, Plus, Bell, MessageSquare, Grid, Play, Flame, Target, TrendingUp, Zap, Award, Users } from 'lucide-react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import PostViewerModal from '../components/profile/PostViewerModal';
import ReelViewerModal from '../components/profile/ReelViewerModal';
import { ENABLE_REELS } from '../constants/featureFlags';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import RefreshableScrollView from '../components/RefreshableScrollView';
import { decode } from 'base64-arraybuffer';
import { getLevelFromXP } from '../constants/levels';
import { achievementOrchestrator } from './gamification/services/AchievementOrchestrator';
import { useGamificationStore } from './gamification/store/useGamificationStore';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// =================================================================
// Story Types & Constants
// =================================================================
const STORY_TYPES = {
  USER: 'user',
} as const;

const STORY_RING_COLORS: Record<string, [string, string, string]> = {
  [STORY_TYPES.USER]: ['#8B7CFF', '#FF6B6B', '#FF8C42'],
};

// =================================================================
// Enhanced Story Viewer Modal
// =================================================================
const StoryViewerModal = ({ stories, visible, onClose }: { stories: any[], visible: boolean, onClose: () => void }) => {
  const { user } = useAuth();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [replyText, setReplyText] = useState('');
  const progressAnim = useRef(new Animated.Value(0)).current;

  const activeStory = stories[currentIdx];

  useEffect(() => {
    if (visible) {
      setCurrentIdx(0);
    }
  }, [visible]);

  useEffect(() => {
    if (visible && stories.length > 0) {
      progressAnim.setValue(0);
      const animation = Animated.timing(progressAnim, {
        toValue: 1,
        duration: 5000,
        useNativeDriver: false,
      });
      animation.start(({ finished }) => {
        if (finished) {
          handleNext();
        }
      });

      return () => {
        animation.stop();
      };
    }
  }, [visible, currentIdx, stories.length]);

  if (!activeStory) return null;

  const handleNext = () => {
    if (currentIdx < stories.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !user?.id) return;
    await supabase.from('story_replies').insert({
      story_id: activeStory.id,
      user_id: user.id,
      message: replyText,
    }).then(() => setReplyText(''));
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView style={styles.storyModalContainer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Progress Bar Container */}
        <View style={styles.storyProgressBarContainer}>
          {stories.map((s, idx) => (
            <View key={s.id} style={styles.storyProgressBarBg}>
              <Animated.View 
                style={[
                  styles.storyProgressBarFill, 
                  { 
                    width: idx === currentIdx 
                      ? progressWidth 
                      : idx < currentIdx 
                        ? '100%' 
                        : '0%' 
                  }
                ]} 
              />
            </View>
          ))}
        </View>

        <View style={styles.storyModalHeader}>
          <Image 
            source={{ 
              uri: activeStory.profiles?.avatar_url 
                ? `${activeStory.profiles.avatar_url}?t=${activeStory.profiles.updated_at ? new Date(activeStory.profiles.updated_at).getTime() : Date.now()}` 
                : 'https://i.pravatar.cc/150' 
            }} 
            style={styles.storyModalAvatar} 
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.storyModalUsername}>{activeStory.profiles?.full_name || activeStory.profiles?.username || 'Member'}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.storyModalClose}>
            <X size={32} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1, position: 'relative', width: '100%' }}>
          <Image source={{ uri: activeStory.media_url || activeStory.image_url }} style={styles.storyModalImage} resizeMode="contain" />

          {/* Left Tap Control */}
          <TouchableOpacity 
            style={styles.tapLeft} 
            activeOpacity={1} 
            onPress={handlePrev} 
          />

          {/* Right Tap Control */}
          <TouchableOpacity 
            style={styles.tapRight} 
            activeOpacity={1} 
            onPress={handleNext} 
          />
        </View>

        <View style={styles.storyModalInputContainer}>
          <TextInput
            style={styles.storyModalInput}
            placeholder="Send message..."
            placeholderTextColor="#999"
            value={replyText}
            onChangeText={setReplyText}
          />
          <TouchableOpacity onPress={handleReply}>
            <Feather name="send" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};


// =================================================================
// Post Card (For Posts Tab) — Preserved
// =================================================================
const getRankBadge = (xp: number = 0) => { 
  if (xp >= 10000) return {label:'Ascendant',color:'#8B7CFF',bg:'rgba(139,124,255,0.2)'}; 
  if (xp >= 5000) return {label:'Diamond',color:'#60C8FF',bg:'rgba(96,200,255,0.2)'}; 
  if (xp >= 2000) return {label:'Gold',color:'#F7C873',bg:'rgba(247,200,115,0.2)'}; 
  if (xp >= 500) return {label:'Silver',color:'#C9D0DA',bg:'rgba(201,208,218,0.2)'}; 
  return {label:'Bronze',color:'#C27A5B',bg:'rgba(194,122,91,0.2)'}; 
}; 

const PostCard = ({ post, onPress }: any) => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(()=>{ 
    if(!user?.id || !post?.id) return; 
    supabase 
      .from('reactions') 
      .select('id') 
      .eq('post_id', post.id) 
      .eq('user_id', user.id) 
      .single() 
      .then(({data})=>{ if(data) setIsLiked(true); }); 
  },[post?.id, user?.id]); 

  useEffect(()=>{ 
    if(!user?.id || !post?.id) return; 
    supabase 
      .from('bookmarks') 
      .select('id') 
      .eq('post_id', post.id) 
      .eq('user_id', user.id) 
      .single() 
      .then(({data})=>{ if(data) setIsBookmarked(true); }); 
  },[post?.id, user?.id]);

  // REQUIRED: Create 'bookmarks' table in Supabase with columns: id, post_id, user_id, created_at
// RLS: Users can insert/delete own bookmarks
const handleBookmark = async () => { 
    if(!user?.id) return; 
    const newState = !isBookmarked; 
    setIsBookmarked(newState); 
    if(newState){ 
      await supabase.from('bookmarks').insert({post_id:post.id, user_id:user.id}); 
    } else { 
      await supabase.from('bookmarks').delete().eq('post_id',post.id).eq('user_id',user.id); 
    } 
  }; 

  const handleLike = async () => {
    if (!user) return;
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount(newLikedState ? likesCount + 1 : likesCount - 1);
    if (newLikedState) {
      await supabase.from('reactions').insert({ post_id: post.id, user_id: user.id, type: 'like' });
      await supabase.from('posts').update({likes_count: likesCount+1}).eq('id',post.id);
    } else {
      await supabase.from('reactions').delete().eq('post_id', post.id).eq('user_id', user.id);
      await supabase.from('posts').update({likes_count: Math.max(0,likesCount-1)}).eq('id',post.id);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({message: post.image_url ? `Check this out on LFGO! ${post.image_url}` : post.content || 'Check this out on LFGO!'});
    } catch(e){}
  };

  const timeAgo = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return `${Math.floor(interval)}y`;
    interval = seconds / 2592000;
    if (interval > 1) return `${Math.floor(interval)}mo`;
    interval = seconds / 86400;
    if (interval > 1) return `${Math.floor(interval)}d`;
    interval = seconds / 3600;
    if (interval > 1) return `${Math.floor(interval)}h`;
    interval = seconds / 60;
    if (interval > 1) return `${Math.floor(interval)}m`;
    return `${Math.floor(seconds)}s`;
  };

  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image source={{ uri: post.profiles?.avatar_url || 'https://i.pravatar.cc/150' }} style={styles.postAvatar} />
        <Text style={styles.postUsername}>{post.profiles?.full_name || post.profiles?.username || 'Member'}</Text>
        {(() => { 
          const rank = getRankBadge(post.profiles?.xp || 0); 
          return ( 
            <View style={{paddingHorizontal:6,paddingVertical:2,borderRadius:6,backgroundColor:rank.bg,marginLeft:6,flexDirection:'row',gap:3}}> 
              <Text style={{fontSize:9,fontWeight:'800',color:rank.color}}>{rank.label}</Text> 
              <Text style={{fontSize:9,fontWeight:'600',color:rank.color}}>Lv.{getLevelFromXP(post.profiles?.xp||0).level}</Text> 
            </View> 
          ); 
        })()} 
        <TouchableOpacity style={{ marginLeft: 'auto' }} onPress={()=>Alert.alert( 
          'Post Options', 
          '', 
          [ 
            {text:'Report', onPress:()=>Alert.alert('Reported','Thank you for your feedback.')}, 
            {text:'Copy Link', onPress:()=>{}}, 
            {text: post.user_id===user?.id ? 'Delete Post' : 'Hide Post', 
             style:'destructive', 
             onPress: async ()=>{ 
               if(post.user_id===user?.id){ 
                 await supabase.from('posts').delete().eq('id',post.id); 
                 Alert.alert('Deleted','Your post has been removed.'); 
               } 
             } 
            }, 
            {text:'Cancel',style:'cancel'}, 
          ] 
        )} >
          <MoreHorizontal size={24} color="#F7F8FC" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
        <Image source={{ uri: post.image_url }} style={styles.postImage} />
      </TouchableOpacity>
      <View style={styles.postActions}>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <TouchableOpacity onPress={handleLike}>
            <Heart size={26} color={isLiked ? "#E0245E" : "#F7F8FC"} fill={isLiked ? "#E0245E" : "none"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Comments', { postId: post.id })}>
            <MessageCircle size={26} color="#F7F8FC" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare}>
            <Feather name="send" size={26} color="#F7F8FC" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={{ marginLeft: 'auto' }} onPress={handleBookmark}>
          <Bookmark size={26} color="#F7F8FC" fill={isBookmarked ? "#F7F8FC" : "none"} />
        </TouchableOpacity>
      </View>
      <Text style={styles.likes}>{likesCount} likes</Text>
      <Text style={{color:'#F7C873',fontSize:11,fontWeight:'700',paddingHorizontal:12,marginBottom:4}}> 
        +{Math.floor(Math.random()*50)+10} XP 
      </Text> 
      <Text style={styles.caption} numberOfLines={2}>
        <Text style={styles.captionUsername}>{post.profiles?.full_name || post.profiles?.username || 'Member'} </Text>
        {post.content}
      </Text>
      <TouchableOpacity onPress={() => navigation.navigate('Comments', { postId: post.id })}>
        <Text style={styles.viewComments}>View all {post.comments_count || 0} comments</Text>
      </TouchableOpacity>
      <Text style={styles.timestamp}>{timeAgo(post.created_at)}</Text>
    </View>
  );
};

// =================================================================
// Reel Item (For Reels Tab) — Preserved
// =================================================================
const ReelItem = ({ post, onPress }: { post: any, onPress?: () => void }) => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [isReelLiked, setIsReelLiked] = useState(false);
  const [reelLikes, setReelLikes] = useState(post.likes_count || 0);

  const handleReelLike = async () => {
    if (!user) return;
    const newState = !isReelLiked;
    setIsReelLiked(newState);
    const newLikesCount = newState ? reelLikes + 1 : Math.max(0, reelLikes - 1);
    setReelLikes(newLikesCount);
    if (newState) {
      await supabase.from('reactions').insert({ post_id: post.id, user_id: user.id, type: 'like' });
      await supabase.from('posts').update({ likes_count: newLikesCount }).eq('id', post.id);
    } else {
      await supabase.from('reactions').delete().eq('post_id', post.id).eq('user_id', user.id);
      await supabase.from('posts').update({ likes_count: newLikesCount }).eq('id', post.id);
    }
  };

  return (
    <View style={styles.reelItemContainer}>
      <TouchableOpacity activeOpacity={0.9} style={StyleSheet.absoluteFill} onPress={onPress}>
        <Image source={{ uri: post.image_url }} style={styles.reelImage} />
      </TouchableOpacity>
      <View style={styles.reelOverlay}>
        {/* Bottom left — user info */}
        <View style={styles.reelDetails}>
          <View style={{flexDirection:'row',alignItems:'center',gap:8,marginBottom:6}}>
            <Image
              source={{uri: post.profiles?.avatar_url || 'https://i.pravatar.cc/150'}}
              style={{width:36,height:36,borderRadius:18,borderWidth:1.5,borderColor:'#8B7CFF'}}
            />
            <View>
              <Text style={styles.reelUsername}>
                @{post.profiles?.full_name || post.profiles?.username || 'Member'}
              </Text>
              {(()=>{
                const rank = getRankBadge(post.profiles?.xp || 0);
                const level = getLevelFromXP(post.profiles?.xp || 0).level;
                return(
                  <View style={{flexDirection:'row',alignItems:'center',gap:4}}>
                    <View style={{paddingHorizontal:6,paddingVertical:1,borderRadius:6,backgroundColor:rank.bg}}>
                      <Text style={{fontSize:9,fontWeight:'800',color:rank.color}}>{rank.label}</Text>
                    </View>
                    <Text style={{fontSize:9,color:'#F7C873',fontWeight:'700'}}>Lv.{level}</Text>
                  </View>
                );
              })()}
            </View>
          </View>
          <Text style={styles.reelCaption} numberOfLines={2}>{post.content}</Text>
        </View>

        {/* Right side actions */}
        <View style={styles.reelActions}>
          <TouchableOpacity style={styles.reelActionBtn} onPress={handleReelLike}>
            <Heart size={28} color={isReelLiked ? '#E0245E' : '#FFF'} fill={isReelLiked ? '#E0245E' : 'none'}/>
            <Text style={styles.reelActionText}>{reelLikes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.reelActionBtn} onPress={() => navigation.navigate('Comments', { postId: post.id })}>
            <MessageCircle size={28} color="#FFF" />
            <Text style={styles.reelActionText}>{post.comments_count || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.reelActionBtn} onPress={() => Share.share({ message: post.image_url })}>
            <Share2 size={28} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.reelActionBtn}>
            <Bookmark size={28} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// =================================================================
// Empty State Components
// =================================================================
const EmptyStateHero = ({ onCreatePost, userXp, userStreak }: { onCreatePost: () => void, userXp: number, userStreak: number }) => {
  const level = getLevelFromXP(userXp);
  const rank = getRankBadge(userXp);

  return (
    <View style={styles.emptyHeroWrap}>
      <LinearGradient
        colors={['#1A1040', '#131929', '#0B1020']}
        style={styles.emptyHeroCard}
      >
        <View style={styles.emptyHeroIconRow}>
          <View style={styles.emptyHeroIconCircle}>
            <Zap size={32} color="#8B7CFF" />
          </View>
        </View>
        <Text style={styles.emptyHeroTitle}>Your Feed Awaits</Text>
        <Text style={styles.emptyHeroSubtitle}>
          Share your journey, inspire others, and earn XP for every post.
        </Text>

        <View style={styles.emptyHeroStatsRow}>
          <View style={styles.emptyHeroStat}>
            <Text style={styles.emptyHeroStatValue}>Lv.{level.level}</Text>
            <Text style={styles.emptyHeroStatLabel}>{rank.label}</Text>
          </View>
          <View style={[styles.emptyHeroStatDivider]} />
          <View style={styles.emptyHeroStat}>
            <Text style={styles.emptyHeroStatValue}>{userStreak}</Text>
            <Text style={styles.emptyHeroStatLabel}>Day Streak</Text>
          </View>
          <View style={[styles.emptyHeroStatDivider]} />
          <View style={styles.emptyHeroStat}>
            <Text style={styles.emptyHeroStatValue}>{userXp}</Text>
            <Text style={styles.emptyHeroStatLabel}>Total XP</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.emptyHeroCTA} onPress={onCreatePost}>
          <LinearGradient colors={['#8B7CFF', '#6B5CE7']} style={styles.emptyHeroCTAGradient}>
            <Plus size={18} color="#FFF" />
            <Text style={styles.emptyHeroCTAText}>Share Your Journey</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const MOTIVATION_CARDS = [
  { icon: '🎯', title: 'Complete Today\'s Mission', subtitle: 'Crush your daily mission to earn bonus XP and climb the ranks.', gradient: ['#064E3B', '#131929'] as [string, string] },
  { icon: '📸', title: 'Post Your Progress', subtitle: 'Every check-in photo earns you XP. Your transformation inspires others.', gradient: ['#1E1A3A', '#131929'] as [string, string] },
  { icon: '⚔️', title: 'Challenge a Rival', subtitle: 'Head-to-head accountability. Push each other to stay consistent.', gradient: ['#451A03', '#131929'] as [string, string] },
];

const MotivationCards = () => (
  <View style={styles.motivationSection}>
    <Text style={styles.motivationSectionTitle}>GET STARTED</Text>
    {MOTIVATION_CARDS.map((card, index) => (
      <LinearGradient key={index} colors={card.gradient} style={styles.motivationCard}>
        <Text style={styles.motivationIcon}>{card.icon}</Text>
        <View style={styles.motivationContent}>
          <Text style={styles.motivationTitle}>{card.title}</Text>
          <Text style={styles.motivationSubtitle}>{card.subtitle}</Text>
        </View>
      </LinearGradient>
    ))}
  </View>
);

const CommunityHighlights = () => {
  const highlights = [
    { emoji: '🏋️', stat: `${Math.floor(Math.random() * 200) + 50}`, label: 'missions completed today' },
    { emoji: '🔥', stat: `${(Math.floor(Math.random() * 80) + 20).toLocaleString()}K`, label: 'calories burned this week' },
    { emoji: '💪', stat: `${Math.floor(Math.random() * 50) + 10}`, label: 'transformations shared' },
  ];

  return (
    <View style={styles.communitySection}>
      <Text style={styles.communitySectionTitle}>LFGO COMMUNITY</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {highlights.map((item, index) => (
          <LinearGradient key={index} colors={['#1A2235', '#131929']} style={styles.communityCard}>
            <Text style={styles.communityEmoji}>{item.emoji}</Text>
            <Text style={styles.communityStat}>{item.stat}</Text>
            <Text style={styles.communityLabel}>{item.label}</Text>
          </LinearGradient>
        ))}
      </ScrollView>
    </View>
  );
};

const TRANSFORMATION_KEYWORDS = [
  'before and after', 'transformation', 'progress pic', 'week 1 vs',
  'week 2 vs', 'month 1', 'journey', 'glow up', 'body recomp',
];

const MISSION_KEYWORDS = [
  'mission complete', 'daily mission', 'all missions', 'mission done',
  'completed my mission', 'missions crushed',
];

const PROGRESS_KEYWORDS = [
  'check-in', 'weighed in', 'new pr', 'personal best', 'pb',
  'logged', 'tracked', 'progress update',
];

// =================================================================
// Feed Prioritization
// =================================================================
const detectContentType = (content: string | null): string[] => {
  if (!content) return [];
  const lower = content.toLowerCase();
  const types: string[] = [];
  if (TRANSFORMATION_KEYWORDS.some(k => lower.includes(k))) types.push('transformation');
  if (MISSION_KEYWORDS.some(k => lower.includes(k))) types.push('mission');
  if (PROGRESS_KEYWORDS.some(k => lower.includes(k))) types.push('progress');
  return types;
};

const calculatePostScore = (post: any): number => {
  // Recency score: 100 points decaying over 50 hours
  const hoursOld = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
  const recencyScore = Math.max(0, 100 - hoursOld * 2);

  // Priority bonuses
  let priorityBonus = 0;
  const contentTypes = detectContentType(post.content);

  if (contentTypes.includes('transformation')) priorityBonus += 40;
  if (contentTypes.includes('mission')) priorityBonus += 30;
  if (contentTypes.includes('progress')) priorityBonus += 20;

  // Streak bonus for author
  const authorStreak = post.profiles?.streak || 0;
  if (authorStreak >= 7) priorityBonus += 10;

  // Engagement bonus
  const engagementScore = Math.min(20, (post.likes_count || 0) * 2 + (post.comments_count || 0) * 3);
  
  return recencyScore + priorityBonus + engagementScore;
};

const prioritizePosts = (posts: any[]): any[] => {
  return [...posts]
    .map(post => ({ ...post, _score: calculatePostScore(post) }))
    .sort((a, b) => b._score - a._score);
};

// =================================================================
// Main Feed Screen
// =================================================================
// REQUIRED in Supabase:
// 1. Create storage bucket 'stories' (public)
// 2. Create table 'stories': id, user_id, image_url, expires_at, created_at
// 3. Add RLS: authenticated users can insert own stories
// 4. Add RLS: public can view stories
export default function FeedScreen() {

  const [posts, setPosts] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [allStories, setAllStories] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('Posts');
  const [storyModalVisible, setStoryModalVisible] = useState(false);
  const [selectedStoryGroup, setSelectedStoryGroup] = useState<any[]>([]);
  const [postViewerVisible, setPostViewerVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [reelViewerVisible, setReelViewerVisible] = useState(false);
  const [selectedReel, setSelectedReel] = useState<any>(null);
  const { user, profile } = useAuth();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = async () => {
    console.log("Refresh triggered");
    setRefreshing(true);
    try {
      await fetchFeedData();
    } catch (e) {
      console.error('[FeedScreen] Refresh failed:', e);
    } finally {
      setRefreshing(false);
    }
  };

  // Sync stories state with profile avatar updates
  useEffect(() => {
    if (profile && stories.length > 0) {
      setStories(prevStories => 
        prevStories.map(s => {
          if (s.user_id === user?.id) {
            return {
              ...s,
              profiles: {
                ...s.profiles,
                avatar_url: profile.avatar_url,
                updated_at: profile.updated_at,
              }
            };
          }
          return s;
        })
      );
    }
  }, [profile?.avatar_url, profile?.updated_at]);

  // Animated tab indicator
  const tabIndicatorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(tabIndicatorAnim, {
      toValue: activeTab === 'Posts' ? 0 : 1,
      useNativeDriver: true,
      tension: 68,
      friction: 12,
    }).start();
  }, [activeTab]);

  const fetchFeedData = async () => {
    // Step 1: fetch posts only
    const { data: postsData, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return;
    }

    // Step 2: fetch profiles separately
    const userIds = [...new Set((postsData || []).map((p: any) => p.user_id))];
    const { data: profilesData } = userIds.length > 0
      ? await supabase.from('profiles').select('id,username,avatar_url,full_name,xp,streak').in('id', userIds)
      : { data: [] };

    // Step 3: merge
    const merged = (postsData || []).map((post: any) => ({
      ...post,
      profiles: profilesData?.find((p: any) => p.id === post.user_id) || null,
    }));

    // Step 4: Apply prioritization
    const prioritized = prioritizePosts(merged);
    setPosts(prioritized);

    // Step 5: Fetch user-uploaded stories (expires_at > now and age <= 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const now = new Date().toISOString();
    const { data: storiesData } = await supabase
      .from('stories')
      .select('*')
      .gt('expires_at', now)
      .gt('created_at', oneDayAgo)
      .order('created_at', { ascending: false });

    const storyUserIds = [...new Set((storiesData || []).map((s: any) => s.user_id))];
    const { data: storyProfiles } = storyUserIds.length > 0
      ? await supabase.from('profiles').select('id,username,avatar_url,full_name').in('id', storyUserIds)
      : { data: [] };

    const mergedStories = (storiesData || []).map((s: any) => ({
      ...s,
      storyType: STORY_TYPES.USER,
      profiles: storyProfiles?.find((p: any) => p.id === s.user_id) || null,
    }));

    // Deduplicate stories so there is only one avatar per user
    const seenUsers = new Set<string>();
    const dedupedStories = mergedStories.filter(s => {
      if (seenUsers.has(s.user_id)) return false;
      seenUsers.add(s.user_id);
      return true;
    });

    setStories(dedupedStories);
    setAllStories(mergedStories);
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchFeedData();
    }, [])
  );

  const handleAddStory = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'We need camera roll permission to post a story.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      const ext = asset.uri.split('.').pop() || 'jpg';
      const fileName = `story_${Date.now()}.${ext}`;
      const filePath = `${user?.id}/${fileName}`;
      const base64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: 'base64' });
      const { error: uploadError } = await supabase.storage
        .from('stories')
        .upload(filePath, decode(base64), { contentType: `image/${ext}`, upsert: true });
      if (uploadError) { Alert.alert('Upload failed', uploadError.message); return; }
      const { data: urlData } = supabase.storage.from('stories').getPublicUrl(filePath);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      
      const payload = {
        user_id: user?.id,
        media_url: urlData.publicUrl,
        image_url: urlData.publicUrl,
        expires_at: expiresAt,
        created_at: new Date().toISOString(),
      };
      


      const { error: dbError } = await supabase.from('stories').insert(payload);
      
      if (dbError) {

        Alert.alert('Error', dbError.message);
        return;
      }
      Alert.alert('Story posted!', 'Your story will disappear in 24 hours.');
      fetchFeedData();

      const newAchievement = await achievementOrchestrator.checkForNewAchievements(user.id);
      if (newAchievement) {
        // TODO: Handle achievement display if needed in the future
      }
    } catch (e: any) {
      console.error('Failed to post story:', e);
      Alert.alert('Error', e.message || 'Something went wrong.');
    }
  };

  // Listen for triggerStory param from FAB
  useEffect(() => {
    if (route.params?.triggerStory) {
      handleAddStory();
      navigation.setParams({ triggerStory: undefined });
    }
  }, [route.params?.triggerStory]);

  const openStory = (story: any) => {
    const userStories = allStories
      .filter(s => s.user_id === story.user_id)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    setSelectedStoryGroup(userStories);
    setStoryModalVisible(true);
  };

  const closeStory = () => {
    setStoryModalVisible(false);
    setSelectedStoryGroup([]);
  };

  const openPost = (post: any) => {
    setSelectedPost(post);
    setPostViewerVisible(true);
  };

  const closePost = () => {
    setPostViewerVisible(false);
    setSelectedPost(null);
  };

  const openReel = (reel: any) => {
    setSelectedReel(reel);
    setReelViewerVisible(true);
  };

  const closeReel = () => {
    setReelViewerVisible(false);
    setSelectedReel(null);
  };

  // Get user profile data for empty state
  const userProfile = posts.find(p => p.user_id === user?.id)?.profiles;
  const userXp = userProfile?.xp || 0;
  const userStreak = userProfile?.streak || 0;

  const renderPostsContent = () => {
    // Filter posts for only images / text (non-video)
    const filteredPosts = posts.filter(p => p.type !== 'video');

    if (filteredPosts.length === 0) {
      return (
        <RefreshableScrollView onRefresh={handleRefresh} contentContainerStyle={{ paddingBottom: 40 }}>
          <EmptyStateHero
            onCreatePost={() => navigation.navigate('CreatePost')}
            userXp={userXp}
            userStreak={userStreak}
          />
          <CommunityHighlights />
          <MotivationCards />
        </RefreshableScrollView>
      );
    }

    const showCommunityHighlights = filteredPosts.length < 5;

    return (
      <FlatList
        data={filteredPosts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <PostCard post={item} onPress={() => openPost(item)} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ backgroundColor: '#0B1020', paddingTop: 8, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#8B7CFF"
            colors={['#8B7CFF']}
            progressBackgroundColor="#1E1D33"
          />
        }
        ListFooterComponent={
          <View>
            {showCommunityHighlights && <CommunityHighlights />}
            <MotivationCards />
          </View>
        }
      />
    );
  };

  const ReelGridItem = ({ post, onPress }: { post: any, onPress: () => void }) => {
    return (
      <TouchableOpacity 
        activeOpacity={0.8} 
        onPress={onPress} 
        style={styles.reelGridItem}
      >
        <Image source={{ uri: post.image_url }} style={styles.reelGridImage} />
        
        {/* Overlay details: Play icon + Likes count */}
        <View style={styles.reelGridOverlay}>
          <Play size={12} color="#FFF" fill="#FFF" />
          <Text style={styles.reelGridLikesText}>{post.likes_count || 0}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderReelsContent = () => {
    const filteredReels = posts.filter(p => p.type === 'video');

    if (filteredReels.length === 0) {
      return (
        <RefreshableScrollView onRefresh={handleRefresh} contentContainerStyle={{ paddingBottom: 40 }}>
          <EmptyStateHero
            onCreatePost={() => navigation.navigate('CreatePost')}
            userXp={userXp}
            userStreak={userStreak}
          />
          <CommunityHighlights />
          <MotivationCards />
        </RefreshableScrollView>
      );
    }

    return (
      <FlatList
        data={filteredReels}
        numColumns={3}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <ReelGridItem post={item} onPress={() => openReel(item)} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ backgroundColor: '#0B1020', padding: 2, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#8B7CFF"
            colors={['#8B7CFF']}
            progressBackgroundColor="#1E1D33"
          />
        }
      />
    );
  };

  const renderContent = () => {
    if (!ENABLE_REELS) {
      return renderPostsContent();
    }
    switch (activeTab) {
      case 'Posts':
        return renderPostsContent();
      case 'Reels':
        return renderReelsContent();
      default:
        return null;
    }
  };

  // Tab indicator animation
  const tabContainerWidth = screenWidth - 32; // 16px padding on each side
  const tabWidth = (tabContainerWidth - 8) / 2; // subtract internal padding
  const indicatorTranslateX = tabIndicatorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, tabWidth],
  });

  return (
    <View style={[styles.container]}>
      <StatusBar barStyle="light-content" />
      {/* Header */}
      <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingTop: insets.top + 8, paddingBottom: 8, paddingHorizontal: 16, borderBottomWidth:0}}>
        <Text style={{fontSize:28,fontWeight:'900',color:'#F7F8FC',letterSpacing:-0.5}}>
          LF<Text style={{color:'#8B7CFF'}}>GO</Text>
        </Text>
        <View style={{flexDirection:'row',gap:12}}>
          <TouchableOpacity onPress={()=>navigation.navigate('Notifications')} style={{width:38,height:38,borderRadius:12,backgroundColor:'#131929',alignItems:'center',justifyContent:'center'}}>
            <Bell size={20} color="#F7F8FC"/>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            try {
              navigation.navigate('Messages');
            } catch (e) {
              console.error('[NAV ERROR]', e);
            }
          }} style={{width:38,height:38,borderRadius:12,backgroundColor:'#131929',alignItems:'center',justifyContent:'center'}}>
            <MessageSquare size={20} color="#F7F8FC"/>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stories Row — Compact Instagram-style */}
      <View style={styles.storiesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 16 }}>
          {/* Your Story */}
          <TouchableOpacity style={styles.storyContainer} onPress={handleAddStory}>
            <View style={styles.yourStoryAvatarWrap}>
              <Image 
                source={{ 
                  uri: profile?.avatar_url 
                    ? `${profile.avatar_url}?t=${profile.updated_at ? new Date(profile.updated_at).getTime() : Date.now()}` 
                    : 'https://i.pravatar.cc/150' 
                }} 
                style={styles.storyAvatar} 
              />
              <View style={styles.yourStoryPlus}>
                <Plus size={12} color="#FFF" />
              </View>
            </View>
            <Text style={styles.storyUsername}>Your story</Text>
          </TouchableOpacity>

          {/* User stories */}
          {stories.slice(0, 15).map(story => {
            const ringColors = STORY_RING_COLORS[STORY_TYPES.USER];

            return (
              <TouchableOpacity key={story.id} style={styles.storyContainer} onPress={() => openStory(story)}>
                <View style={styles.storyAvatarOuter}>
                  <LinearGradient colors={ringColors} style={styles.storyRingGradient}>
                    <View style={styles.storyRingInner}>
                      <Image 
                        source={{ 
                          uri: story.profiles?.avatar_url 
                            ? `${story.profiles.avatar_url}?t=${story.profiles.updated_at ? new Date(story.profiles.updated_at).getTime() : Date.now()}` 
                            : 'https://i.pravatar.cc/150' 
                        }} 
                        style={styles.storyAvatar} 
                      />
                    </View>
                  </LinearGradient>
                </View>
                <Text style={styles.storyUsername} numberOfLines={1}>
                  {(story.profiles?.full_name || story.profiles?.username || 'Member').slice(0, 10)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Pill Segmented Switcher */}
      {ENABLE_REELS && (
        <View style={styles.segmentedContainer}>
          <View style={styles.segmentedPill}>
            {/* Animated active indicator */}
            <Animated.View
              style={[
                styles.segmentedActiveIndicator,
                {
                  width: tabWidth,
                  transform: [{ translateX: indicatorTranslateX }],
                },
              ]}
            >
              <LinearGradient
                colors={['#8B7CFF', '#7B6CE7']}
                style={styles.segmentedActiveGradient}
              />
            </Animated.View>

            {/* Posts Tab */}
            <TouchableOpacity
              onPress={() => setActiveTab('Posts')}
              style={styles.segmentedTab}
              activeOpacity={0.7}
            >
              <Grid size={16} color={activeTab === 'Posts' ? '#FFF' : '#6B7280'} />
              <Text style={[
                styles.segmentedTabText,
                activeTab === 'Posts' && styles.segmentedTabTextActive
              ]}>Posts</Text>
            </TouchableOpacity>

            {/* Reels Tab */}
            <TouchableOpacity
              onPress={() => setActiveTab('Reels')}
              style={styles.segmentedTab}
              activeOpacity={0.7}
            >
              <Play size={16} color={activeTab === 'Reels' ? '#FFF' : '#6B7280'} />
              <Text style={[
                styles.segmentedTabText,
                activeTab === 'Reels' && styles.segmentedTabTextActive
              ]}>Reels</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Content */}
      <View style={styles.contentContainer}>
        {renderContent()}
      </View>

      {/* Modals */}
      {selectedStoryGroup.length > 0 && <StoryViewerModal stories={selectedStoryGroup} visible={storyModalVisible} onClose={closeStory} />}
      {selectedPost && <PostViewerModal post={selectedPost} visible={postViewerVisible} onClose={closePost} />}
      {ENABLE_REELS && selectedReel && <ReelViewerModal reel={selectedReel} visible={reelViewerVisible} onClose={closeReel} />}
    </View>
  );
}

// =================================================================
// Styles
// =================================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1020' },
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 10 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#F7F8FC' },
  headerIcons: { flexDirection: 'row' },

  // Stories — Compact
  storiesContainer: { paddingVertical: 10, paddingLeft: 12, borderBottomWidth: 0, marginBottom: 0 },
  storyContainer: { alignItems: 'center', marginRight: 12, width: 72 },
  storyAvatarOuter: { position: 'relative' },
  storyRingGradient: { width: 68, height: 68, borderRadius: 34, padding: 2, justifyContent: 'center', alignItems: 'center' },
  storyRingInner: { width: 62, height: 62, borderRadius: 31, borderWidth: 2, borderColor: '#0B1020', overflow: 'hidden' },
  storyAvatar: { width: 58, height: 58, borderRadius: 29 },
  storyUsername: { fontSize: 10, marginTop: 4, maxWidth: 68, color: '#6B7280', textAlign: 'center' },
  yourStoryAvatarWrap: { position: 'relative' },
  yourStoryPlus: { position: 'absolute', bottom: 0, right: -2, backgroundColor: '#8B7CFF', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#0B1020' },
  storyBadge: { position: 'absolute', bottom: -2, right: -2, backgroundColor: '#0B1020', borderRadius: 10, width: 22, height: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#131929' },
  storyBadgeText: { fontSize: 11 },

  // Segmented Switcher
  segmentedContainer: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 10 },
  segmentedPill: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 4, position: 'relative' },
  segmentedActiveIndicator: { position: 'absolute', top: 4, left: 4, height: '100%', borderRadius: 10, overflow: 'hidden' },
  segmentedActiveGradient: { flex: 1, borderRadius: 10 },
  segmentedTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, gap: 6, zIndex: 1 },
  segmentedTabText: { fontSize: 14, fontWeight: '700', color: '#6B7280' },
  segmentedTabTextActive: { color: '#FFF' },

  // Content
  contentContainer: { flex: 1 },

  // Post Card
  postCard: { backgroundColor: '#0F1624', borderWidth:0, borderBottomColor: 'rgba(139,124,255,0.1)', borderBottomWidth: 1, marginBottom: 8 },
  postHeader: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  postAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  postUsername: { fontWeight: 'bold', fontSize: 14, color: '#F7F8FC' },
  postImage: { width: '100%', aspectRatio: 1 },
  postActions: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 12 },
  likes: { fontWeight: 'bold', paddingHorizontal: 12, fontSize: 14, marginTop: 8, color: '#F7F8FC' },
  caption: { paddingHorizontal: 12, marginTop: 4, fontSize: 14, color: '#F7F8FC' },
  captionUsername: { fontWeight: 'bold', color: '#F7F8FC' },
  viewComments: { color: '#6B7280', paddingHorizontal: 12, marginTop: 4, fontSize: 14 },
  timestamp: { color: '#6B7280', paddingHorizontal: 12, marginTop: 4, fontSize: 11, paddingBottom: 12 },

  // Reel Item
  reelItemContainer: { width: screenWidth, height: screenHeight - 250, backgroundColor: '#000' },
  reelImage: { ...StyleSheet.absoluteFillObject },
  reelOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', padding: 16, flexDirection: 'row' },
  reelDetails: { flex: 1, justifyContent: 'flex-end' },
  reelUsername: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  reelCaption: { color: '#FFF', marginTop: 4, fontSize: 13 },
  reelActions: { justifyContent: 'flex-end', gap: 16 },
  reelActionBtn: { alignItems: 'center', gap: 6 },
  reelActionText: { color: '#FFF', fontSize: 12, fontWeight: '600' },

  // Story Modal — Enhanced
  storyModalContainer: { flex: 1, backgroundColor: '#000', paddingTop: 50 },
  storyProgressBarContainer: { 
    position: 'absolute', 
    top: 44, 
    left: 16, 
    right: 16, 
    zIndex: 10,
    flexDirection: 'row',
    gap: 4
  },
  storyProgressBarBg: { 
    flex: 1, 
    height: 3, 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    borderRadius: 2, 
    overflow: 'hidden' 
  },
  storyProgressBarFill: { height: '100%', backgroundColor: '#FFF', borderRadius: 2 },
  storyModalHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, position: 'absolute', top: 52, left: 0, right: 0, zIndex: 1 },
  storyModalAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  storyModalUsername: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  storyModalType: { color: '#8B7CFF', fontSize: 11, fontWeight: '600', marginTop: 1 },
  storyModalClose: { marginLeft: 'auto' },
  storyModalImage: { flex: 1, width: '100%', height: '100%' },
  storyModalInputContainer: { flexDirection: 'row', alignItems: 'center', padding: 16, borderTopWidth: 1, borderTopColor: '#333' },
  storyModalInput: { flex: 1, color: '#FFF', height: 40, borderColor: '#555', borderWidth: 1, borderRadius: 20, paddingHorizontal: 16, marginRight: 10 },
  tapLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '30%',
    zIndex: 5,
  },
  tapRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '70%',
    zIndex: 5,
  },

  // Auto Story Content
  autoStoryContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, paddingTop: 80 },
  autoStoryIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  autoStoryTitle: { fontSize: 28, fontWeight: '900', color: '#FFF', textAlign: 'center', marginBottom: 8 },
  autoStorySubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: 32 },
  autoStoryStat: { alignItems: 'center', marginTop: 8 },
  autoStoryStatValue: { fontSize: 56, fontWeight: '900', color: '#FFF' },
  autoStoryStatLabel: { fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 4, textAlign: 'center' },

  // Empty State — Hero
  emptyHeroWrap: { paddingHorizontal: 16, paddingTop: 16 },
  emptyHeroCard: { borderRadius: 20, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(139,124,255,0.2)' },
  emptyHeroIconRow: { marginBottom: 16 },
  emptyHeroIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(139,124,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  emptyHeroTitle: { fontSize: 24, fontWeight: '900', color: '#F7F8FC', marginBottom: 8 },
  emptyHeroSubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  emptyHeroStatsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 16 },
  emptyHeroStat: { alignItems: 'center' },
  emptyHeroStatValue: { fontSize: 20, fontWeight: '800', color: '#F7F8FC' },
  emptyHeroStatLabel: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  emptyHeroStatDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.1)' },
  emptyHeroCTA: { width: '100%' },
  emptyHeroCTAGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14 },
  emptyHeroCTAText: { fontSize: 16, fontWeight: '800', color: '#FFF' },

  // Motivation Cards
  motivationSection: { paddingHorizontal: 16, marginTop: 24 },
  motivationSectionTitle: { fontSize: 11, fontWeight: '800', color: '#6B7280', letterSpacing: 1.2, marginBottom: 12 },
  motivationCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(139,124,255,0.1)' },
  motivationIcon: { fontSize: 28, marginRight: 14 },
  motivationContent: { flex: 1 },
  motivationTitle: { fontSize: 15, fontWeight: '800', color: '#F7F8FC', marginBottom: 3 },
  motivationSubtitle: { fontSize: 12, color: '#6B7280', lineHeight: 17 },

  // Community Highlights
  communitySection: { paddingLeft: 16, marginTop: 24 },
  communitySectionTitle: { fontSize: 11, fontWeight: '800', color: '#6B7280', letterSpacing: 1.2, marginBottom: 12 },
  communityCard: { width: 140, padding: 16, borderRadius: 14, marginRight: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(139,124,255,0.1)' },
  communityEmoji: { fontSize: 28, marginBottom: 8 },
  communityStat: { fontSize: 22, fontWeight: '900', color: '#F7F8FC', marginBottom: 4 },
  communityLabel: { fontSize: 11, color: '#6B7280', textAlign: 'center', lineHeight: 15 },
  reelGridItem: {
    width: (screenWidth - 8) / 3,
    height: ((screenWidth - 8) / 3) * 1.35,
    margin: 1.3,
    backgroundColor: '#131929',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 4,
  },
  reelGridImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  reelGridOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  reelGridLikesText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
});