import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform, ScrollView, Share, ActivityIndicator } from 'react-native';
import { X, Heart, MessageCircle, Share2, Send } from 'lucide-react-native';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';

export default function PostViewerModal({ visible, post, onClose }: any) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [commentsCount, setCommentsCount] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible && post) {
      fetchPostData();
    }
  }, [visible, post]);

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

    // Fetch comments (two separate queries — no foreign key join)
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
      profiles: { username: user.username, avatar_url: user.avatar_url },
    };
    setComments([...comments, tempComment]);
    setCommentText('');

    const { error } = await supabase.from('comments').insert({
      post_id: post.id,
      user_id: user.id,
      text: commentText.trim(),
    });

    if (error) {
      // Optionally remove the temp comment and show an error
    } else {
      fetchPostData(); // Re-fetch to get the latest comments
    }
  };

  if (!post) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}><X color="#333" size={24} /></TouchableOpacity>
        </View>
        <ScrollView>
          {loading ? (
            <ActivityIndicator size="large" color="#8B7CFF" style={{ marginTop: 100 }}/>
          ) : (
            <>
              <Image source={{ uri: post.image_url }} style={styles.image} />
              <View style={styles.contentContainer}>
                <View style={styles.actions}>
                  <TouchableOpacity onPress={handleLike} style={styles.actionBtn}>
                    <Heart size={24} color="#FF4B4B" fill={isLiked ? '#FF4B4B' : 'none'} />
                    <Text style={styles.actionText}>{likesCount}</Text>
                  </TouchableOpacity>
                  <View style={styles.actionBtn}>
                    <MessageCircle size={24} color="#333" />
                    <Text style={styles.actionText}>{commentsCount}</Text>
                  </View>
                  <TouchableOpacity onPress={handleShare} style={[styles.actionBtn, { marginLeft: 'auto' }]}>
                    <Share2 size={24} color="#333" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.caption}>{post.content}</Text>

                <View style={styles.commentsSection}>
                  <Text style={styles.commentsTitle}>Comments</Text>
                  {comments.map(comment => (
                    <View key={comment.id} style={styles.comment}>
                      <Image source={{ uri: comment.profiles?.avatar_url || 'https://i.pravatar.cc/150' }} style={styles.commentAvatar} />
                      <View style={styles.commentBody}>
                        <Text style={styles.commentUser}>{comment.profiles?.username || 'User'}</Text>
                        <Text style={styles.commentText}>{comment.text}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}
        </ScrollView>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Add a comment..."
            value={commentText}
            onChangeText={setCommentText}
          />
          <TouchableOpacity onPress={handleSendComment}><Send color="#8B7CFF" size={24} /></TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', justifyContent: 'flex-end', padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  image: { width: '100%', aspectRatio: 1 },
  contentContainer: { padding: 16 },
  actions: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginRight: 16 },
  actionText: { fontWeight: '600', fontSize: 16 },
  caption: { fontSize: 15, lineHeight: 22, marginBottom: 20 },
  commentsSection: { marginTop: 20 },
  commentsTitle: { fontWeight: '800', fontSize: 16, marginBottom: 10 },
  comment: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  commentAvatar: { width: 36, height: 36, borderRadius: 18 },
  commentBody: { flex: 1 },
  commentUser: { fontWeight: '700' },
  commentText: { marginTop: 2 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 16, borderTopWidth: 1, borderTopColor: '#EEE', gap: 10 },
  input: { flex: 1, backgroundColor: '#F7F8FC', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20 },
});