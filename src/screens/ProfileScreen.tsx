// ======================================================
// PROFILE SCREEN — PREMIUM SOCIAL PROFILE V2
// COMPLETE REPLACEMENT
// ======================================================

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar, Share, Modal, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Plus, Settings, Share2, Zap } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../services/supabase';
import PostViewerModal from '../components/profile/PostViewerModal';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { profile, user, refreshProfile } = useAuth();
  const [posts, setPosts] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [postViewerVisible, setPostViewerVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
      }
      if (data) {
        setPosts(data);
      }
    };

    fetchPosts();
  }, [user]);

  const handleAvatarChange = async () => {
    if (uploading) return;
    try {
      const {launchImageLibraryAsync,requestMediaLibraryPermissionsAsync,MediaTypeOptions} = await import('expo-image-picker');
      const {status} = await requestMediaLibraryPermissionsAsync();
      if(status!=='granted') {
        Alert.alert('Permission required', 'Please grant permission to access your photos to change your avatar.');
        return;
      }
      const result = await launchImageLibraryAsync({mediaTypes:MediaTypeOptions.Images,quality:0.8, allowsEditing: true, aspect: [1,1]});
      if(!result.canceled && result.assets?.[0]?.uri) {
        await uploadAvatar(result.assets[0].uri);
      }
    } catch(e: any){
      console.error('Image selection error:', e);
      Alert.alert('Error', e.message || 'An error occurred while selecting an image.');
    }
  };

  const uploadAvatar = async (uri: string) => {
    if (!user) return;
    setUploading(true);
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
      const filePath = `${user.id}/avatar.jpg`;
      const contentType = 'image/jpeg';

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, {uri, base64}, { contentType, upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

      if (!publicUrl) {
        throw new Error('Could not get public URL');
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      await refreshProfile();

    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      Alert.alert('Upload Failed', error.message || 'An error occurred during avatar upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleShareProfile = async () => {
    try {
      await Share.share({
        message: `Follow my transformation as ${profile?.full_name || 'a user'} on LFGO.`,
      });
    } catch (error: any) {
      console.error('Error sharing profile:', error);
      Alert.alert('Share Error', error.message || 'Could not share profile.');
    }
  };

  const insets = useSafeAreaInsets();
  return ( 
   <View style={{flex:1,backgroundColor:'#0B1020',paddingTop:insets.top}}> 
     <StatusBar barStyle="light-content"/> 
     <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom:100}}> 
 
       <View style={ps.card}> 
         <View style={ps.headerRow}> 
           <View style={{width:36}}/> 
           <Text style={ps.username}>@{profile?.username||'username'}</Text> 
           <TouchableOpacity style={ps.iconBtn} onPress={()=>navigation.navigate('Settings')}> 
             <Settings size={20} color="#F7F8FC"/> 
           </TouchableOpacity> 
         </View> 
 
         <View style={ps.avatarRow}> 
           <View style={ps.avatarWrap}> 
             <TouchableOpacity onPress={()=>setPreviewVisible(true)}> 
               {profile?.avatar_url 
                 ?<Image source={{uri:profile.avatar_url}} style={ps.avatar}/> 
                 :<View style={ps.avatarFallback}> 
                   <Text style={ps.avatarInitial}>{(profile?.full_name||'U')[0]}</Text> 
                 </View>} 
             </TouchableOpacity> 
             <TouchableOpacity style={ps.avatarAdd} onPress={handleAvatarChange} disabled={uploading}>
               {uploading ? <ActivityIndicator size="small" color="#FFF" /> : <Plus size={12} color="#FFF"/>}
             </TouchableOpacity> 
             <View style={ps.levelBadge}> 
               <Zap size={9} color="#F7C873" fill="#F7C873"/> 
               <Text style={ps.levelText}>{profile?.level||1}</Text> 
             </View> 
           </View> 
           <View style={ps.statsRow}> 
             {[{label:'Posts',value:posts?.length||0},{label:'Followers',value:profile?.followers_count||0},{label:'Following',value:profile?.following_count||0}].map(s=>( 
               <View key={s.label} style={ps.statItem}> 
                 <Text style={ps.statNum}>{s.value}</Text> 
                 <Text style={ps.statLabel}>{s.label}</Text> 
               </View> 
             ))} 
           </View> 
         </View> 
 
         <View style={{marginTop:14}}> 
           <Text style={ps.name}>{profile?.full_name||'Your Name'}</Text> 
           {profile?.bio&&<Text style={ps.bio}>{profile.bio}</Text>} 
         </View> 
 
         <TouchableOpacity style={ps.shareBtn} onPress={async()=>{ 
           try{await Share.share({message:`Check out ${profile?.full_name} on LFGO!`})}catch{} 
         }}> 
           <Share2 size={14} color="#F7F8FC"/> 
           <Text style={ps.shareBtnText}>Share Profile</Text> 
         </TouchableOpacity> 
       </View> 
 
       <View style={ps.card2}> 
         <Text style={ps.sectionTitle}>ACHIEVEMENTS</Text> 
         <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginTop:10}}> 
           {[{icon:'Flame',label:'7-Day Streak'},{icon:'Zap',label:'First Log'},{icon:'Dumbbell',label:'10 Workouts'}].map((a,i)=>( 
             <View key={i} style={ps.badge}> 
               <Text style={ps.badgeLabel}>{a.label}</Text> 
             </View> 
           ))} 
         </ScrollView> 
       </View> 
 
       <View style={ps.card2}> 
         <Text style={ps.sectionTitle}>POSTS</Text> 
         {posts?.length>0 
           ?<View style={ps.grid}> 
             {posts.map((p,i)=>( 
               <TouchableOpacity key={p.id||i} style={ps.gridItem} onPress={() => { setSelectedPost(p); setPostViewerVisible(true); }}> 
                 {p.image_url 
                   ?<Image source={{uri:p.image_url}} style={ps.gridImg}/> 
                   :<View style={[ps.gridImg,{backgroundColor:'#E8E4FF',alignItems:'center',justifyContent:'center'}]}> 
                     <Text style={{fontSize:11,color:'#8B7CFF',fontWeight:'700',padding:6,textAlign:'center'}}>{p.content?.slice(0,40)}</Text> 
                   </View>} 
               </TouchableOpacity> 
             ))} 
           </View> 
           :<View style={{padding:24,alignItems:'center'}}> 
             <Text style={{color:'#6B7280',fontSize:13}}>No posts yet. Share your first win.</Text> 
           </View> 
         } 
       </View> 
 
     </ScrollView> 
     <Modal visible={previewVisible} transparent animationType="fade"> 
       <TouchableOpacity style={{flex:1,backgroundColor:'rgba(0,0,0,0.85)',alignItems:'center',justifyContent:'center'}} onPress={()=>setPreviewVisible(false)}> 
         {profile?.avatar_url 
           ?<Image source={{uri:profile.avatar_url}} style={{width:280,height:280,borderRadius:140}}/> 
           :<View style={{width:280,height:280,borderRadius:140,backgroundColor:'#E8E4FF',alignItems:'center',justifyContent:'center'}}> 
             <Text style={{fontSize:80,fontWeight:'900',color:'#8B7CFF'}}>{(profile?.full_name||'U')[0]}</Text> 
           </View>} 
       </TouchableOpacity> 
     </Modal> 
     <PostViewerModal 
        visible={postViewerVisible} 
        onClose={() => setPostViewerVisible(false)} 
        post={selectedPost} 
      />
   </View> 
 );
}

const ps = StyleSheet.create({
  card:{backgroundColor:'#131929',marginHorizontal:16,marginTop:16,borderRadius:24,padding:20,shadowColor:'#8B7CFF',shadowOpacity:0.07,shadowRadius:12,elevation:3},
  card2:{backgroundColor:'#131929',marginHorizontal:16,marginTop:12,borderRadius:24,padding:20,shadowColor:'#8B7CFF',shadowOpacity:0.05,shadowRadius:8,elevation:2},
  headerRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:16},
  username:{fontSize:16,fontWeight:'800',color:'#F7F8FC'},
  iconBtn:{width:36,height:36,borderRadius:12,backgroundColor:'#1A2235',alignItems:'center',justifyContent:'center'},
  avatarRow:{flexDirection:'row',alignItems:'center',gap:24},
  avatarWrap:{position:'relative'},
  avatar:{width:80,height:80,borderRadius:40,borderWidth:2,borderColor:'rgba(139,124,255,0.4)'},
  avatarFallback:{width:80,height:80,borderRadius:40,backgroundColor:'#1A2235',alignItems:'center',justifyContent:'center'},
  avatarInitial:{fontSize:30,fontWeight:'900',color:'#8B7CFF'},
  levelBadge:{position:'absolute',bottom:-2,right:-2,backgroundColor:'#1A2235',borderRadius:10,paddingHorizontal:5,paddingVertical:2,flexDirection:'row',alignItems:'center',gap:2,borderWidth:1,borderColor:'rgba(247,200,115,0.3)'},
  levelText:{fontSize:10,fontWeight:'800',color:'#F7C873'},
  statsRow:{flex:1,flexDirection:'row',justifyContent:'space-around'},
  statItem:{alignItems:'center'},
  statNum:{fontSize:20,fontWeight:'900',color:'#F7F8FC'},
  statLabel:{fontSize:11,color:'#6B7280',fontWeight:'600',marginTop:2},
  name:{fontSize:17,fontWeight:'800',color:'#F7F8FC'},
  bio:{fontSize:13,color:'#6B7280',marginTop:4,lineHeight:18},
  avatarAdd:{position:'absolute',top:0,right:0,width:22,height:22,borderRadius:11,backgroundColor:'#8B7CFF',alignItems:'center',justifyContent:'center',borderWidth:2,borderColor:'#0B1020'},
  shareBtn:{flexDirection:'row',alignItems:'center',gap:8,backgroundColor:'#1A2235',borderRadius:12,paddingVertical:10,paddingHorizontal:20,alignSelf:'flex-start',marginTop:16},
  shareBtnText:{fontSize:13,fontWeight:'700',color:'#F7F8FC'},
  sectionTitle:{fontSize:11,fontWeight:'800',color:'#6B7280',letterSpacing:1},
  badge:{alignItems:'center',backgroundColor:'#131929',borderRadius:14,padding:12,marginRight:10,minWidth:80},
  badgeLabel:{fontSize:11,fontWeight:'600',color:'#6B7280',marginTop:6,textAlign:'center'},
  grid:{flexDirection:'row',flexWrap:'wrap',gap:4,marginTop:10},
  gridItem:{width:'32%'},
  gridImg:{width:'100%',aspectRatio:1,borderRadius:10},
});