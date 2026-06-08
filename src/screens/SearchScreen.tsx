import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Search, UserPlus, Check, Zap } from 'lucide-react-native';

const USERS = [
  { id: 'u1', name: 'Arjun Sharma', handle: '@arjun_lifts', level: 8, avatar: 'https://i.pravatar.cc/150?u=arjun', followed: false, type: 'friend' },
  { id: 'u2', name: 'Priya Nair', handle: '@priya_runs', level: 5, avatar: 'https://i.pravatar.cc/150?u=priya', followed: true, type: 'friend' },
  { id: 'u3', name: 'Rohit Verma', handle: '@rohit_gains', level: 12, avatar: 'https://i.pravatar.cc/150?u=rohit', followed: false, type: 'popular' },
  { id: 'u4', name: 'Sneha Reddy', handle: '@sneha_fit', level: 3, avatar: 'https://i.pravatar.cc/150?u=sneha', followed: false, type: 'nearby' },
  { id: 'u5', name: 'Karan Mehta', handle: '@karan_eats', level: 9, avatar: 'https://i.pravatar.cc/150?u=karan', followed: true, type: 'friend' },
  { id: 'u6', name: 'Anjali Singh', handle: '@anjali_yoga', level: 6, avatar: 'https://i.pravatar.cc/150?u=anjali', followed: false, type: 'popular' },
];

const TABS = ['All', 'Friends', 'Popular', 'Nearby'];

export default function SearchScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('All');
  const [users, setUsers] = useState(USERS);

  const filtered = users.filter(u => {
    const matchTab = tab === 'All' || u.type === tab.toLowerCase();
    const matchQ = !query || u.name.toLowerCase().includes(query.toLowerCase()) || u.handle.toLowerCase().includes(query.toLowerCase());
    return matchTab && matchQ;
  });

  const toggleFollow = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, followed: !u.followed } : u));
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F6F2' }}>
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
          <ArrowLeft size={22} color="#1B1B1B" />
        </TouchableOpacity>
        <View style={s.searchBox}>
          <Search size={16} color="#888" />
          <TextInput
            style={s.searchInput}
            placeholder="Search people..."
            placeholderTextColor="#AAA"
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
        </View>
      </View>

      <View style={s.tabs}>
        {TABS.map(t => (
          <TouchableOpacity key={t} onPress={() => setTab(t)}
            style={[s.tab, tab === t && s.tabActive]}>
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={{ position: 'relative' }}>
              <Image source={{ uri: item.avatar }} style={s.avatar} />
              <View style={s.badge}>
                <Zap size={7} color="#F59E0B" fill="#F59E0B" />
                <Text style={s.badgeText}>{item.level}</Text>
              </View>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={s.name}>{item.name}</Text>
              <Text style={s.handle}>{item.handle}</Text>
            </View>
            <TouchableOpacity
              onPress={() => toggleFollow(item.id)}
              style={[s.followBtn, item.followed && s.followingBtn]}>
              {item.followed
                ? <Check size={14} color="#8B7CFF" strokeWidth={2.5} />
                : <UserPlus size={14} color="#FFF" strokeWidth={2} />}
              <Text style={[s.followText, item.followed && s.followingText]}>
                {item.followed ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#AAA', marginTop: 40 }}>No users found</Text>}
      />
    </View>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, gap: 10, backgroundColor: '#F8F6F2' },
  back: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#1B1B1B' },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 4 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#EFEFEF' },
  tabActive: { backgroundColor: '#1F1F1F' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#555' },
  tabTextActive: { color: '#FFF' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, padding: 14 },
  avatar: { width: 46, height: 46, borderRadius: 23 },
  badge: { position: 'absolute', bottom: -2, right: -2, backgroundColor: '#FEF3C7', borderRadius: 8, paddingHorizontal: 4, paddingVertical: 2, flexDirection: 'row', alignItems: 'center', gap: 2, borderWidth: 1, borderColor: '#FDE68A' },
  badgeText: { fontSize: 9, fontWeight: '800', color: '#D97706' },
  name: { fontSize: 15, fontWeight: '700', color: '#1B1B1B' },
  handle: { fontSize: 12, color: '#888', marginTop: 2 },
  followBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#8B7CFF', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  followingBtn: { backgroundColor: '#F0EBFF' },
  followText: { fontSize: 13, fontWeight: '700', color: '#FFF' },
  followingText: { color: '#8B7CFF' },
});