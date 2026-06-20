import React, { useEffect, useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, Modal, TouchableOpacity, Image, 
  TextInput, KeyboardAvoidingView, Platform, ScrollView, 
  Share, ActivityIndicator, Animated, Dimensions 
} from 'react-native';
import { X, Heart, MessageCircle, Share2, Send } from 'lucide-react-native';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ReelViewerModal({ visible, reel, onClose }: any) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [commentsCount, setCommentsCount] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);

  // Comments slide-up sheet visibility
  const [commentsVisible, setCommentsVisible] = useState(false);

  // Animation values
  const commentsSheetY = useRef(new Animated.Value(screenHeight)).current;
  const doubleTapHeartScale = useRef(new Animated.Value(0)).current;
  const [showHeart, setShowHeart] = useState(false);
  const lastTapRef = useRef<number>(0);



  useEffect(() => {
    if (visible && reel) {
      fetchReelData();
      setCommentsVisible(false);
      commentsSheetY.setValue(screenHeight);
    }
  }, [visible, reel]);

  const fetchReelData = async () => {
    if (!reel || !user?.id) return;
    setLoading(true);
    
    // Fetch likes
    const { data: likesData, count: likes } = await supabase
      .from('reactions')
      .select('*', { count: 'exact' })
      .eq('post_id', reel.id);
    setLikesCount(likes || 0);
    setIsLiked(likesData?.some(l => l.user_id === user.id) || false);

    // Fetch comments
    const { data: rawComments, count: commentsTotal } = await supabase
      .from('comments')
      .select('*', { count: 'exact' })
      .eq('post_id', reel.id)
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
    if (!reel || !user?.id) return;
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount(newLikedState ? likesCount + 1 : likesCount - 1);

    if (newLikedState) {
      await supabase.from('reactions').insert({ post_id: reel.id, user_id: user.id });
    } else {
      await supabase.from('reactions').delete().match({ post_id: reel.id, user_id: user.id });
    }
  };

  const handleDoubleTap = () => {
    if (!isLiked) {
      handleLike();
    }
    setShowHeart(true);
    doubleTapHeartScale.setValue(0);
    Animated.sequence([
      Animated.spring(doubleTapHeartScale, {
        toValue: 1.3,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(doubleTapHeartScale, {
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
      handleDoubleTap();
    }
    lastTapRef.current = now;
  };

  const handleShare = async () => {
    if (!reel) return;
    try {
      await Share.share({ message: `Check out this reel!`, url: reel.image_url });
    } catch {}
  };

  const handleSendComment = async () => {
    if (!reel || !user?.id || !commentText.trim()) return;
    const tempComment = {
      id: Date.now(),
      text: commentText.trim(),
      created_at: new Date().toISOString(),
      profiles: { username: user.username || 'user', avatar_url: user.avatar_url || 'https://i.pravatar.cc/150' },
    };
    setComments([...comments, tempComment]);
    setCommentText('');

    const { error } = await supabase.from('comments').insert({
      post_id: reel.id,
      user_id: user.id,
      text: commentText.trim(),
    });

    if (!error) {
      fetchReelData();
    }
  };

  const openCommentsSheet = () => {
    setCommentsVisible(true);
    Animated.spring(commentsSheetY, {
      toValue: screenHeight * 0.4, // Open to cover bottom 60% of the screen
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const closeCommentsSheet = () => {
    Animated.timing(commentsSheetY, {
      toValue: screenHeight,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setCommentsVisible(false);
    });
  };

  if (!reel) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
      <View style={styles.container}>
        {/* Full-Screen Video Background */}
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={handleImagePress} 
          style={StyleSheet.absoluteFill}
        >
          <Image
            source={{ uri: reel.image_url || reel.media_url }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        </TouchableOpacity>

        {/* Heart Animation Overlay */}
        {showHeart && (
          <Animated.View style={[styles.heartOverlay, { transform: [{ scale: doubleTapHeartScale }] }]}>
            <Heart size={90} color="#FF4B4B" fill="#FF4B4B" />
          </Animated.View>
        )}

        {/* Back / Close button (Top Left) */}
        <TouchableOpacity 
          onPress={onClose} 
          style={styles.backBtn}
        >
          <X color="#FFF" size={28} />
        </TouchableOpacity>

        {/* Right Side Actions Overlay */}
        <View style={styles.rightOverlay}>
          <TouchableOpacity onPress={handleLike} style={styles.actionBtn}>
            <View style={styles.actionIconCircle}>
              <Heart size={26} color={isLiked ? '#FF4B4B' : '#FFF'} fill={isLiked ? '#FF4B4B' : 'none'} />
            </View>
            <Text style={styles.actionText}>{likesCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={openCommentsSheet} style={styles.actionBtn}>
            <View style={styles.actionIconCircle}>
              <MessageCircle size={26} color="#FFF" />
            </View>
            <Text style={styles.actionText}>{commentsCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleShare} style={styles.actionBtn}>
            <View style={styles.actionIconCircle}>
              <Share2 size={26} color="#FFF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Bottom Details Overlay */}
        <View style={styles.bottomOverlay} pointerEvents="box-none">
          <View style={styles.userDetails}>
            <Image 
              source={{ uri: reel.profiles?.avatar_url || 'https://i.pravatar.cc/150' }} 
              style={styles.userAvatar} 
            />
            <Text style={styles.username}>@{reel.profiles?.username || 'Member'}</Text>
          </View>
          {reel.content ? (
            <Text style={styles.caption} numberOfLines={3}>{reel.content}</Text>
          ) : null}
        </View>

        {/* Slide-Up Comments Bottom Sheet */}
        {commentsVisible && (
          <Animated.View style={[styles.commentsSheet, { transform: [{ translateY: commentsSheetY }] }]}>
            <View style={styles.commentsHeader}>
              <Text style={styles.commentsTitle}>Comments ({commentsCount})</Text>
              <TouchableOpacity onPress={closeCommentsSheet} style={styles.closeCommentsBtn}>
                <X color="#FFF" size={22} />
              </TouchableOpacity>
            </View>

            {loading ? (
              <ActivityIndicator size="small" color="#8B7CFF" style={{ marginVertical: 30 }} />
            ) : (
              <ScrollView style={styles.commentsScroll} showsVerticalScrollIndicator={false}>
                {comments.length === 0 ? (
                  <Text style={styles.noCommentsText}>No comments yet. Start the conversation!</Text>
                ) : (
                  comments.map(c => (
                    <View key={c.id} style={styles.commentRow}>
                      <Image 
                        source={{ uri: c.profiles?.avatar_url || 'https://i.pravatar.cc/150' }} 
                        style={styles.commentAvatar} 
                      />
                      <View style={styles.commentBody}>
                        <Text style={styles.commentUser}>{c.profiles?.username || 'User'}</Text>
                        <Text style={styles.commentText}>{c.text}</Text>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
            )}

            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
              keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
            >
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
            </KeyboardAvoidingView>
          </Animated.View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    zIndex: 10,
    padding: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  heartOverlay: {
    position: 'absolute',
    alignSelf: 'center',
    top: '40%',
    zIndex: 10,
  },
  rightOverlay: {
    position: 'absolute',
    right: 16,
    bottom: Platform.OS === 'ios' ? 120 : 90,
    zIndex: 8,
    gap: 20,
    alignItems: 'center',
  },
  actionBtn: {
    alignItems: 'center',
    gap: 6,
  },
  actionIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  bottomOverlay: {
    position: 'absolute',
    left: 16,
    right: 80,
    bottom: Platform.OS === 'ios' ? 80 : 50,
    zIndex: 8,
  },
  userDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#8B7CFF',
  },
  username: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 15,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  caption: {
    color: '#EEE',
    fontSize: 14,
    lineHeight: 18,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  commentsSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: screenHeight * 0.6,
    backgroundColor: '#0F1624',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 15,
    paddingTop: 16,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  commentsTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  closeCommentsBtn: {
    padding: 4,
  },
  commentsScroll: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  noCommentsText: {
    color: '#6B7280',
    fontSize: 13,
    textAlign: 'center',
    marginVertical: 20,
  },
  commentRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  commentAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  commentBody: {
    flex: 1,
  },
  commentUser: {
    color: '#8B7CFF',
    fontWeight: '800',
    fontSize: 12,
    marginBottom: 2,
  },
  commentText: {
    color: '#E5E7EB',
    fontSize: 13,
    lineHeight: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    backgroundColor: '#0B1020',
    gap: 12,
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
    fontSize: 14,
  },
  sendBtn: {
    padding: 6,
  },
});
