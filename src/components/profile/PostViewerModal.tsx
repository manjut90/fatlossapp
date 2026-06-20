import React, { useEffect, useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, Modal, TouchableOpacity, Image, 
  TextInput, KeyboardAvoidingView, Platform, ScrollView, 
  Share, ActivityIndicator, Animated, PanResponder, Dimensions 
} from 'react-native';
import { X, Heart, MessageCircle, Share2, Send } from 'lucide-react-native';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';

const { height: screenHeight } = Dimensions.get('window');

export default function PostViewerModal({ visible, post, onClose }: any) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [commentsCount, setCommentsCount] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);

  // UX Interactivity States
  const [showOverlay, setShowOverlay] = useState(true);
  const [showHeart, setShowHeart] = useState(false);
  
  // Animation Refs
  const heartScale = useRef(new Animated.Value(0)).current;
  const pan = useRef(new Animated.ValueXY()).current;
  const lastTapRef = useRef<number>(0);
  const tapTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (visible && post) {
      fetchPostData();
      setShowOverlay(true);
      setShowHeart(false);
      pan.setValue({ x: 0, y: 0 });
    }
  }, [visible, post]);

  // Swipe to Close PanResponder Configuration
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only trigger pan responder if user drags downwards on the background/elements
        return gestureState.dy > 15 && Math.abs(gestureState.dx) < gestureState.dy;
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          pan.setValue({ x: 0, y: gestureState.dy });
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 140) {
          Animated.timing(pan, {
            toValue: { x: 0, y: screenHeight },
            duration: 220,
            useNativeDriver: true,
          }).start(() => {
            onClose();
            pan.setValue({ x: 0, y: 0 });
          });
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
            friction: 5,
          }).start();
        }
      },
    })
  ).current;

  const fetchPostData = async () => {
    if (!post || !user?.id) return;
    setLoading(true);
    
    // Fetch likes
    const { data: likesData, count: likes } = await supabase
      .from('reactions')
      .select('*', { count: 'exact' })
      .eq('post_id', post.id);
    setLikesCount(likes || 0);
    setIsLiked(likesData?.some(l => l.user_id === user.id) || false);

    // Fetch comments
    const { data: rawComments, count: commentsTotal } = await supabase
      .from('comments')
      .select('*', { count: 'exact' })
      .eq('post_id', post.id)
      .order('created_at', { ascending: true });

    const commentUserIds = [...new Set((rawComments || []).map((c: any) => c.user_id))];
    const { data: commentProfiles } = commentUserIds.length > 0
      ? await supabase.from('profiles').select('id, username, avatar_url').in('id', commentUserIds)
      : { data: [] };

    const mergedComments = (rawComments || []).map((c: any) => ({
      ...c,
      profiles: (commentProfiles || []).find((p: any) => p.id === c.user_id) || null,
    }));

    setComments(mergedComments);
    setCommentsCount(commentsTotal || 0);
    setLoading(false);
  };

  const handleLike = async () => {
    if (!post || !user?.id) return;
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount(newLikedState ? likesCount + 1 : likesCount - 1);

    if (newLikedState) {
      await supabase.from('reactions').insert({ post_id: post.id, user_id: user.id });
    } else {
      await supabase.from('reactions').delete().match({ post_id: post.id, user_id: user.id });
    }
  };

  const handleDoubleTap = () => {
    if (!isLiked) {
      handleLike();
    }
    setShowHeart(true);
    heartScale.setValue(0);
    Animated.sequence([
      Animated.spring(heartScale, {
        toValue: 1.3,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(heartScale, {
        toValue: 0,
        duration: 150,
        delay: 450,
        useNativeDriver: true,
      })
    ]).start(() => {
      setShowHeart(false);
    });
  };

  const handleImagePress = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = null;
      }
      handleDoubleTap();
    } else {
      tapTimeoutRef.current = setTimeout(() => {
        setShowOverlay(prev => !prev);
        tapTimeoutRef.current = null;
      }, 300);
    }
    lastTapRef.current = now;
  };

  const handleShare = async () => {
    if (!post) return;
    try {
      await Share.share({ message: `Check out this post!`, url: post.image_url });
    } catch {}
  };

  const handleSendComment = async () => {
    if (!post || !user?.id || !commentText.trim()) return;
    const tempComment = {
      id: Date.now(),
      text: commentText.trim(),
      created_at: new Date().toISOString(),
      profiles: { username: user.username || 'user', avatar_url: user.avatar_url || 'https://i.pravatar.cc/150' },
    };
    setComments([...comments, tempComment]);
    setCommentText('');

    const { error } = await supabase.from('comments').insert({
      post_id: post.id,
      user_id: user.id,
      text: commentText.trim(),
    });

    if (!error) {
      fetchPostData();
    }
  };

  if (!post) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <Animated.View 
          style={[styles.modalContent, { transform: [{ translateY: pan.y }] }]}
          {...panResponder.panHandlers}
        >
          {/* Header */}
          {showOverlay && (
            <View style={styles.header}>
              <View style={styles.headerUserRow}>
                <Image source={{ uri: post.profiles?.avatar_url || 'https://i.pravatar.cc/150' }} style={styles.headerAvatar} />
                <Text style={styles.headerUsername}>{post.profiles?.full_name || post.profiles?.username || 'Member'}</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X color="#FFF" size={24} />
              </TouchableOpacity>
            </View>
          )}

          {/* Media / Image Body */}
          <View style={styles.mediaContainer}>
            <ScrollView
              style={styles.imageScrollView}
              contentContainerStyle={styles.imageScrollView}
              maximumZoomScale={3}
              minimumZoomScale={1}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
            >
              <TouchableOpacity activeOpacity={1} onPress={handleImagePress} style={styles.imageScrollView}>
                <Image source={{ uri: post.image_url }} style={styles.image} resizeMode="contain" />
              </TouchableOpacity>
            </ScrollView>

            {/* Heart Animation Overlay */}
            {showHeart && (
              <Animated.View style={[styles.heartOverlay, { transform: [{ scale: heartScale }] }]}>
                <Heart size={80} color="#FF4B4B" fill="#FF4B4B" />
              </Animated.View>
            )}
          </View>

          {/* Overlay Info Block */}
          {showOverlay && (
            <View style={styles.detailsContainer}>
              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity onPress={handleLike} style={styles.actionBtn}>
                  <Heart size={26} color={isLiked ? '#FF4B4B' : '#FFF'} fill={isLiked ? '#FF4B4B' : 'none'} />
                  <Text style={styles.actionText}>{likesCount}</Text>
                </TouchableOpacity>
                <View style={styles.actionBtn}>
                  <MessageCircle size={26} color="#FFF" />
                  <Text style={styles.actionText}>{commentsCount}</Text>
                </View>
                <TouchableOpacity onPress={handleShare} style={[styles.actionBtn, { marginLeft: 'auto' }]}>
                  <Share2 size={26} color="#FFF" />
                </TouchableOpacity>
              </View>

              {/* Caption */}
              {post.content ? (
                <Text style={styles.caption} numberOfLines={2}>
                  <Text style={styles.captionUser}>{post.profiles?.username || 'Member'} </Text>
                  {post.content}
                </Text>
              ) : null}

              {/* Comments List */}
              <View style={styles.commentsSection}>
                <Text style={styles.commentsTitle}>Comments</Text>
                {loading ? (
                  <ActivityIndicator size="small" color="#8B7CFF" style={{ marginVertical: 20 }} />
                ) : (
                  <ScrollView style={styles.commentsScroll} showsVerticalScrollIndicator={false}>
                    {comments.length === 0 ? (
                      <Text style={styles.noComments}>No comments yet. Start the conversation!</Text>
                    ) : (
                      comments.map(comment => (
                        <View key={comment.id} style={styles.commentRow}>
                          <Image 
                            source={{ uri: comment.profiles?.avatar_url || 'https://i.pravatar.cc/150' }} 
                            style={styles.commentAvatar} 
                          />
                          <View style={styles.commentBody}>
                            <Text style={styles.commentUser}>{comment.profiles?.username || 'User'}</Text>
                            <Text style={styles.commentText}>{comment.text}</Text>
                          </View>
                        </View>
                      ))
                    )}
                  </ScrollView>
                )}
              </View>
            </View>
          )}

          {/* Comment Input */}
          {showOverlay && (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Add a comment..."
                placeholderTextColor="#666"
                value={commentText}
                onChangeText={setCommentText}
              />
              <TouchableOpacity onPress={handleSendComment} style={styles.sendBtn}>
                <Send color="#8B7CFF" size={20} />
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: 'rgba(0, 0, 0, 0.92)' 
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#0B1020',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: Platform.OS === 'ios' ? 44 : 0,
    overflow: 'hidden',
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingVertical: 14, 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(255,255,255,0.06)' 
  },
  headerUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  headerUsername: {
    fontWeight: '800',
    color: '#FFF',
    fontSize: 14,
  },
  closeBtn: {
    padding: 4,
  },
  mediaContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  imageScrollView: {
    width: '100%',
    height: '100%',
  },
  image: { 
    width: '100%', 
    height: '100%',
  },
  heartOverlay: {
    position: 'absolute',
    zIndex: 10,
  },
  detailsContainer: { 
    flex: 1,
    padding: 16 
  },
  actions: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  actionBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6, 
    marginRight: 20 
  },
  actionText: { 
    fontWeight: '700', 
    fontSize: 14,
    color: '#FFF' 
  },
  caption: { 
    fontSize: 14, 
    lineHeight: 18, 
    color: '#FFF',
    marginBottom: 16 
  },
  captionUser: { 
    fontWeight: '800' 
  },
  commentsSection: { 
    flex: 1,
    borderTopWidth: 1, 
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 12 
  },
  commentsTitle: { 
    fontWeight: '800', 
    fontSize: 14, 
    color: '#8B7CFF',
    marginBottom: 10 
  },
  commentsScroll: {
    flex: 1,
  },
  noComments: {
    color: '#6B7280',
    fontSize: 13,
    textAlign: 'center',
    marginVertical: 20,
  },
  commentRow: { 
    flexDirection: 'row', 
    gap: 10, 
    marginBottom: 12 
  },
  commentAvatar: { 
    width: 28, 
    height: 28, 
    borderRadius: 14 
  },
  commentBody: { 
    flex: 1 
  },
  commentUser: { 
    fontWeight: '800',
    color: '#FFF',
    fontSize: 12 
  },
  commentText: { 
    marginTop: 2,
    color: '#D1D5DB',
    fontSize: 13,
    lineHeight: 16 
  },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 12, 
    borderTopWidth: 1, 
    borderTopColor: 'rgba(255,255,255,0.06)', 
    backgroundColor: '#0F1624',
    gap: 10 
  },
  input: { 
    flex: 1, 
    backgroundColor: 'rgba(255,255,255,0.04)', 
    color: '#FFF',
    paddingVertical: 10, 
    paddingHorizontal: 16, 
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    fontSize: 14 
  },
  sendBtn: {
    padding: 8,
    borderRadius: 20,
  }
});