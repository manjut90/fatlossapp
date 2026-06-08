import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, Image, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Heart, ArrowLeft, Send } from 'lucide-react-native';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

const CommentItem = ({ comment, onLike, onReply, depth = 0 }: any) => (
  <View style={{ marginLeft: depth * 20 }}>
    <View style={s.row}>
      <Image
        source={{ uri: comment.profiles?.avatar_url || 'https://i.pravatar.cc/150' }}
        style={s.avatar}
      />
      <View style={{ flex: 1 }}>
        <Text style={s.user}>{comment.profiles?.username || 'user'}</Text>
        <Text style={s.text}>{comment.content}</Text>
        <View style={s.actions}>
          <TouchableOpacity onPress={() => onLike(comment.id)} style={s.action}>
            <Heart size={12} color={comment.liked ? '#FF4B4B' : '#888'} fill={comment.liked ? '#FF4B4B' : 'none'} />
            <Text style={s.actionText}>{comment.likes || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onReply(comment.id, comment.profiles?.username || 'user')} style={s.action}>
            <Text style={s.reply}>Reply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </View>
);

export default function CommentsScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { postId } = route.params || {};
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: string; user: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (postId) fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    setLoading(true);

    const { data: commentsData, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error || !commentsData) {
      setLoading(false);
      return;
    }

    const userIds = [...new Set(commentsData.map((c: any) => c.user_id))];
    const { data: profilesData } = userIds.length > 0
      ? await supabase.from('profiles').select('id, username, avatar_url').in('id', userIds)
      : { data: [] };

    const merged = commentsData.map((c: any) => ({
      ...c,
      liked: false,
      likes: 0,
      profiles: (profilesData || []).find((p: any) => p.id === c.user_id) || null,
    }));

    setComments(merged);
    setLoading(false);
  };

  const likeComment = async (id: string) => {
    if (!user) return;
    setComments(prev =>
      prev.map(c =>
        c.id === id
          ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 }
          : c
      )
    );
    await supabase.from('comment_reactions').insert({ comment_id: id, user_id: user.id });
  };

  const handleSend = async () => {
    if (!text.trim() || !user || !postId) return;
    setSubmitting(true);
    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      user_id: user.id,
      content: text.trim(),
    });
    if (!error) {
      setText('');
      setReplyingTo(null);
      fetchComments();
    }
    setSubmitting(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#F7F8FC' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
          <ArrowLeft size={22} color="#0B1020" />
        </TouchableOpacity>
        <Text style={s.title}>Comments</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#8B7CFF" style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={comments}
          keyExtractor={i => i.id}
          renderItem={({ item }) => (
            <CommentItem
              comment={item}
              onLike={likeComment}
              onReply={(id: string, username: string) => setReplyingTo({ id, user: username })}
            />
          )}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        />
      )}
      {replyingTo && (
        <View style={s.banner}>
          <Text style={s.bannerText}>Replying to {replyingTo.user}</Text>
          <TouchableOpacity onPress={() => setReplyingTo(null)}>
            <Text style={{ color: '#8B7CFF', fontWeight: '700' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={[s.inputRow, { paddingBottom: insets.bottom + 8 }]}>
        <TextInput
          style={s.input}
          placeholder="Add a comment..."
          placeholderTextColor="#AAA"
          value={text}
          onChangeText={setText}
          multiline
        />
        <TouchableOpacity onPress={handleSend} style={s.send} disabled={submitting}>
          <Send size={18} color="#FFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F2F3F7' },
  back: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#F2F3F7', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  title: { fontSize: 18, fontWeight: '800', color: '#0B1020' },
  row: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  avatar: { width: 34, height: 34, borderRadius: 17 },
  user: { fontSize: 13, fontWeight: '700', color: '#0B1020', marginBottom: 3 },
  text: { fontSize: 14, color: '#0B1020', lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 16, marginTop: 6 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { fontSize: 12, color: '#888', fontWeight: '600' },
  reply: { fontSize: 12, color: '#8B7CFF', fontWeight: '700' },
  banner: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#EAE6FF' },
  bannerText: { fontSize: 13, color: '#6B5FD4', fontWeight: '600' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F2F3F7', gap: 10 },
  input: { flex: 1, backgroundColor: '#F2F3F7', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: '#0B1020', maxHeight: 100 },
  send: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#8B7CFF', alignItems: 'center', justifyContent: 'center' },
});
