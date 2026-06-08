import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, MessageCircle } from 'lucide-react-native';

const FOLLOWERS = [
  { id: 'm1', name: 'Priya Nair', handle: '@priya_runs', avatar: 'https://i.pravatar.cc/150?u=priya', lastMsg: 'Great run today!', time: '2m', unread: 2 },
  { id: 'm2', name: 'Karan Mehta', handle: '@karan_eats', avatar: 'https://i.pravatar.cc/150?u=karan', lastMsg: 'What did you eat post workout?', time: '1h', unread: 0 },
  { id: 'm3', name: 'Arjun Sharma', handle: '@arjun_lifts', avatar: 'https://i.pravatar.cc/150?u=arjun', lastMsg: 'Bro leg day tomorrow?', time: '3h', unread: 1 },
];

const REQUESTS = [
  { id: 'r1', name: 'Rohit Verma', handle: '@rohit_gains', avatar: 'https://i.pravatar.cc/150?u=rohit', lastMsg: 'Hey, love your content!', time: '5h', unread: 1 },
  { id: 'r2', name: 'Sneha Reddy', handle: '@sneha_fit', avatar: 'https://i.pravatar.cc/150?u=sneha', lastMsg: 'Can you share your meal plan?', time: '1d', unread: 0 },
  { id: 'r3', name: 'Anjali Singh', handle: '@anjali_yoga', avatar: 'https://i.pravatar.cc/150?u=anjali', lastMsg: 'Amazing transformation!', time: '2d', unread: 0 },
];

const MsgRow = ({ item }: any) => (
  <TouchableOpacity style={s.card} activeOpacity={0.7}>
    <View style={{ position: 'relative' }}>
      <Image source={{ uri: item.avatar }} style={s.avatar} />
      {item.unread > 0 && (
        <View style={s.dot}><Text style={s.dotText}>{item.unread}</Text></View>
      )}
    </View>
    <View style={{ flex: 1, marginLeft: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={[s.name, item.unread > 0 && { color: '#1B1B1B' }]}>{item.name}</Text>
        <Text style={s.time}>{item.time}</Text>
      </View>
      <Text style={[s.msg, item.unread > 0 && { color: '#344054', fontWeight: '600' }]} numberOfLines={1}>
        {item.lastMsg}
      </Text>
    </View>
  </TouchableOpacity>
);

export default function MessagesScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<'followers' | 'requests'>('followers');

  const data = tab === 'followers' ? FOLLOWERS : REQUESTS;

  return (
    <View style={{ flex: 1, backgroundColor: '#0B1020' }}>
      <View style={[s.header, { paddingTop: insets.top + 8, backgroundColor: '#0B1020' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
          <ArrowLeft size={22} color="#F7F8FC" />
        </TouchableOpacity>
        <Text style={s.title}>Messages</Text>
      </View>

      <View style={s.tabs}>
        <TouchableOpacity
          style={[s.tabBtn, tab === 'followers' && s.tabBtnActive]}
          onPress={() => setTab('followers')}>
          <Text style={[s.tabText, tab === 'followers' && s.tabTextActive]}>Followers</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.tabBtn, tab === 'requests' && s.tabBtnActive]}
          onPress={() => setTab('requests')}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={[s.tabText, tab === 'requests' && s.tabTextActive]}>Requests</Text>
            {tab !== 'requests' && (
              <View style={s.reqBadge}><Text style={s.reqBadgeText}>{REQUESTS.filter(r => r.unread > 0).length}</Text></View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {tab === 'requests' && (
        <View style={s.notice}>
          <MessageCircle size={14} color="#8B7CFF" />
          <Text style={s.noticeText}>These are from people you don't follow yet.</Text>
        </View>
      )}

      <FlatList
        data={data}
        keyExtractor={i => i.id}
        renderItem={({ item }) => <MsgRow item={item} />}
        contentContainerStyle={{ padding: 16, gap: 8 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#6B7280', marginTop: 40 }}>No messages yet</Text>}
      />
    </View>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 14, gap: 12 },
  back: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#1A2235', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '800', color: '#F7F8FC' },
  tabs: { flexDirection: 'row', marginHorizontal: 16, backgroundColor: '#131929', borderRadius: 16, padding: 4, marginBottom: 12 },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tabBtnActive: { backgroundColor: '#8B7CFF' },
  tabText: { fontSize: 14, fontWeight: '700', color: '#6B7280' },
  tabTextActive: { color: '#FFF' },
  reqBadge: { backgroundColor: '#FF4B4B', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 },
  reqBadgeText: { fontSize: 10, fontWeight: '800', color: '#FFF' },
  notice: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginBottom: 8, backgroundColor: '#1A1235', borderRadius: 10, padding: 10 },
  noticeText: { fontSize: 12, color: '#C4B5FD', fontWeight: '600' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#131929', borderRadius: 16, padding: 14 },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  dot: { position: 'absolute', top: -2, right: -2, backgroundColor: '#8B7CFF', borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  dotText: { fontSize: 10, fontWeight: '800', color: '#FFF' },
  name: { fontSize: 15, fontWeight: '600', color: '#F7F8FC' },
  time: { fontSize: 12, color: '#6B7280' },
  msg: { fontSize: 13, color: '#6B7280', marginTop: 3 },
});