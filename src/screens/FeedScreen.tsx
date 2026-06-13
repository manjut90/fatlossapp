import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, StatusBar, ScrollView, Share, Modal, TextInput,
  KeyboardAvoidingView, Platform, Dimensions, Animated, Alert
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, X, Plus, Bell, MessageSquare, Grid, Play } from 'lucide-react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import PostViewerModal from '../components/profile/PostViewerModal';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { getLevel } from '../services/level';
import { achievementOrchestrator } from './gamification/services/AchievementOrchestrator';
import { useGamificationStore } from './gamification/store/useGamificationStore';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// =================================================================
// Story Viewer Modal
// =================================================================
const StoryViewerModal = ({ story, visible, onClose }: { story: any, visible: boolean, onClose: () => void }) => {
  if (!story) return null;
  const { user } = useAuth();
  const [replyText, setReplyText] = useState('');

  const handleReply = async () => {
    if (!replyText.trim() || !user?.id) return;
    // REQUIRED: Create 'story_replies' table in Supabase with columns: id, story_id, user_id, message, created_at
    await supabase.from('story_replies').insert({
      story_id: story.id,
      user_id: user.id,
      message: replyText,
    }).then(() => setReplyText(''));
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView style={styles.storyModalContainer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.storyModalHeader}>
          <Image source={{ uri: story.profiles?.avatar_url || 'https://i.pravatar.cc/150' }} style={styles.storyModalAvatar} />
          <Text style={styles.storyModalUsername}>{story.profiles?.full_name || story.profiles?.username || 'Member'}</Text>
          <TouchableOpacity onPress={onClose} style={styles.storyModalClose}>
            <X size={32} color="#FFF" />
          </TouchableOpacity>
        </View>
        <Image source={{ uri: story.image_url }} style={styles.storyModalImage} resizeMode="contain" />
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
// Post Card (For Posts Tab)
// =================================================================
const getRankBadge = (xp: number = 0) => { 
  if (xp >= 10000) return {label:'Ascendant',color:'#8B7CFF',bg:'rgba(139,124,255,0.2)'}; 
  if (xp >= 5000) return {label:'Diamond',color:'#60C8FF',bg:'rgba(96,200,255,0.2)'}; 
  if (xp >= 2000) return {label:'Gold',color:'#F7C873',bg:'rgba(247,200,115,0.2)'}; 
  if (xp >= 500) return {label:'Silver',color:'#C9D0DA',bg:'rgba(201,208,218,0.2)'}; 
  return {label:'Bronze',color:'#C27A5B',bg:'rgba(194,122,91,0.2)'}; 
}; 

const PostCard = ({ post }: any) => {
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
              <Text style={{fontSize:9,fontWeight:'600',color:rank.color}}>Lv.{getLevel(post.profiles?.xp||0)}</Text> 
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
      <Image source={{ uri: post.image_url }} style={styles.postImage} />
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
// Reel Item (For Reels Tab)
// =================================================================
const ReelItem = ({ post }: any) => {
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
      <Image source={{ uri: post.image_url }} style={styles.reelImage} />
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
                const level = getLevel(post.profiles?.xp || 0);
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
// Main Feed Screen
// =================================================================
// REQUIRED in Supabase:
// 1. Create storage bucket 'stories' (public)
// 2. Create table 'stories': id, user_id, image_url, expires_at, created_at
// 3. Add RLS: authenticated users can insert own stories
// 4. Add RLS: public can view stories
export default function FeedScreen() {
  console.log(
    'FEED_SCREEN_ACTIVE'
  );
  const [posts, setPosts] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('Posts');
  const [storyModalVisible, setStoryModalVisible] = useState(false);
  const [selectedStory, setSelectedStory] = useState<any>(null);
  const [postViewerVisible, setPostViewerVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

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
      ? await supabase.from('profiles').select('id,username,avatar_url,full_name,xp').in('id', userIds)
      : { data: [] };

    // Step 3: merge
    const merged = (postsData || []).map((post: any) => ({
      ...post,
      profiles: profilesData?.find((p: any) => p.id === post.user_id) || null,
    }));

    setPosts(merged);

    // Step 2: Fetch stories
    const { data: storiesData } = await supabase
      .from('stories')
      .select('*')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    const storyUserIds = [...new Set((storiesData || []).map((s: any) => s.user_id))];
    const { data: storyProfiles } = storyUserIds.length > 0
      ? await supabase.from('profiles').select('id,username,avatar_url,full_name').in('id', storyUserIds)
      : { data: [] };

    const mergedStories = (storiesData || []).map((s: any) => ({
      ...s,
      profiles: storyProfiles?.find((p: any) => p.id === s.user_id) || null,
    }));

    setStories(mergedStories);
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchFeedData();
    }, [])
  );

  const handleAddStory = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
      const { error: dbError } = await supabase.from('stories').insert({
        user_id: user?.id,
        image_url: urlData.publicUrl,
        expires_at: expiresAt,
        created_at: new Date().toISOString(),
      });
      if (dbError) { Alert.alert('Error', dbError.message); return; }
      Alert.alert('Story posted!', 'Your story will disappear in 24 hours.');
      fetchFeedData();

      const newAchievement = await achievementOrchestrator.checkForNewAchievements(user.id);
      if (newAchievement) {
        // TODO: Handle achievement display if needed in the future
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Something went wrong.');
    }
  };

  const openStory = (story: any) => {
    setSelectedStory(story);
    setStoryModalVisible(true);
  };

  const openPost = (post: any) => {
    setSelectedPost(post);
    setPostViewerVisible(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Posts':
        return <FlatList data={posts} keyExtractor={item => item.id} renderItem={({ item }) => <PostCard post={item} />} showsVerticalScrollIndicator={false} contentContainerStyle={{backgroundColor:'#0B1020', paddingTop: 8}} />;
      case 'Reels':
        return <ScrollView pagingEnabled horizontal={false} showsVerticalScrollIndicator={false}>{posts.map(p => <ReelItem key={p.id} post={p} />)}</ScrollView>;
      default:
        return null;
    }
  };

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
            console.log('[MESSAGES BUTTON PRESSED]');
            try {
              navigation.navigate('Messages');
              console.log('[NAVIGATION CALLED]');
            } catch (e) {
              console.error('[NAV ERROR]', e);
            }
          }} style={{width:38,height:38,borderRadius:12,backgroundColor:'#131929',alignItems:'center',justifyContent:'center'}}>
            <MessageSquare size={20} color="#F7F8FC"/>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stories */}
      <View style={styles.storiesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity style={styles.storyContainer} onPress={handleAddStory}>
            <View>
              <Image source={{ uri: user?.user_metadata?.avatar_url || 'https://i.pravatar.cc/150' }} style={styles.storyAvatar} />
              <View style={styles.yourStoryPlus}>
                <Plus size={16} color="#FFF" />
              </View>
            </View>
            <Text style={styles.storyUsername}>Your story</Text>
          </TouchableOpacity>
          {stories.slice(0, 10).map(p => (
            <TouchableOpacity key={p.id} style={styles.storyContainer} onPress={() => openStory(p)}>
              <LinearGradient colors={['#8B7CFF', '#FF6B6B', '#FF8C42']} style={styles.storyRingGradient}>
                <View style={styles.storyRingInner}>
                  <Image source={{ uri: p.profiles?.avatar_url || 'https://i.pravatar.cc/150' }} style={styles.storyAvatar} />
                </View>
              </LinearGradient>
              <Text style={styles.storyUsername}>{(p.profiles?.full_name || p.profiles?.username || 'Member').slice(0, 8)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tab Switcher */}
      <View style={{ 
        flexDirection:'row', 
        marginHorizontal:0, 
        paddingHorizontal:40,
        marginTop: 4,
        marginBottom:0, 
        borderBottomWidth:1, 
        borderBottomColor:'rgba(255,255,255,0.1)', 
      }}> 
        {[ 
          {id:'Posts', icon:'grid'}, 
          {id:'Reels', icon:'play'}, 
        ].map(tab => ( 
          <TouchableOpacity 
            key={tab.id} 
            onPress={() => setActiveTab(tab.id)} 
            style={{ 
              flex:1, 
              alignItems:'center', 
              paddingVertical:10, 
              borderBottomWidth:2, 
              borderBottomColor: activeTab===tab.id ? '#F7F8FC' : 'transparent', 
            }} 
          > 
            {tab.id === 'Posts' 
              ? <Grid size={20} color={activeTab===tab.id ? '#F7F8FC' : '#6B7280'} /> 
              : <Play size={20} color={activeTab===tab.id ? '#F7F8FC' : '#6B7280'} /> 
            } 
          </TouchableOpacity> 
        ))} 
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        {renderContent()}
      </View>

      {/* Modals */}
      <StoryViewerModal story={selectedStory} visible={storyModalVisible} onClose={() => setStoryModalVisible(false)} />
      {selectedPost && <PostViewerModal post={selectedPost} visible={postViewerVisible} onClose={() => setPostViewerVisible(false)} />}
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
  // Stories
  storiesContainer: { paddingVertical: 10, paddingLeft: 12, borderBottomWidth: 0, marginBottom: 0 },
  storyContainer: { alignItems: 'center', marginRight: 14 },
  storyRingGradient: { width: 96, height: 96, borderRadius: 48, padding: 2, justifyContent: 'center', alignItems: 'center' },
  storyRingInner: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: '#FFF', overflow: 'hidden' },
  storyAvatar: { width: 90, height: 90, borderRadius: 45 },
  storyUsername: { fontSize: 10, marginTop: 4, maxWidth: 90, color: '#6B7280' },
  yourStoryPlus: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#8B7CFF', borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#0B1020' },
  // Tabs
  // Styles are now inline for the segmented control
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
  timestamp: { color: '#6B7280', paddingHorizontal: 12, marginTop: 4, fontSize: 11 },
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
  // For You Grid
  // Story Modal
  storyModalContainer: { flex: 1, backgroundColor: '#000', paddingTop: 50 },
  storyModalHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, position: 'absolute', top: 40, left: 0, right: 0, zIndex: 1 },
  storyModalAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  storyModalUsername: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  storyModalClose: { marginLeft: 'auto' },
  storyModalImage: { flex: 1, width: '100%', height: '100%' },
  storyModalInputContainer: { flexDirection: 'row', alignItems: 'center', padding: 16, borderTopWidth: 1, borderTopColor: '#333' },
  storyModalInput: { flex: 1, color: '#FFF', height: 40, borderColor: '#555', borderWidth: 1, borderRadius: 20, paddingHorizontal: 16, marginRight: 10 },
});