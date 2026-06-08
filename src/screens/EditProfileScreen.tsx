import React,{useState} from 'react'; 
import {View,Text,StyleSheet,ScrollView,TextInput,TouchableOpacity,Alert} from 'react-native'; 
import {useNavigation} from '@react-navigation/native'; 
import {useSafeAreaInsets} from 'react-native-safe-area-context'; 
import {ArrowLeft,Save} from 'lucide-react-native'; 
import {useAuth} from '../context/AuthContext'; 
import {supabase} from '../services/supabase'; 

const Field=({label,value,onChange,placeholder,multiline=false,hint}:any)=>( 
  <View style={s.field}> 
    <Text style={s.label}>{label}</Text> 
    {hint&&<Text style={s.hint}>{hint}</Text>} 
    <TextInput 
      style={[s.input,multiline&&{height:90,textAlignVertical:'top'}]} 
      value={value} onChangeText={onChange} 
      placeholder={placeholder||label} 
      placeholderTextColor="#BBB" 
      multiline={multiline} 
    /> 
  </View> 
); 

export default function EditProfileScreen(){ 
  const nav=useNavigation<any>(); 
  const insets=useSafeAreaInsets(); 
  const {profile,refreshProfile}=useAuth(); 
  const [name,setName]=useState(profile?.full_name||''); 
  const [username,setUsername]=useState(profile?.username||''); 
  const [bio,setBio]=useState(profile?.bio||''); 
  const [gender,setGender]=useState(profile?.gender||''); 
  const [birthday,setBirthday]=useState(profile?.birthday||''); 
  const [location,setLocation]=useState(profile?.location||''); 
  const [instagram,setInstagram]=useState(profile?.social_instagram||''); 
  const [twitter,setTwitter]=useState(profile?.social_twitter||''); 
  const [saving,setSaving]=useState(false); 

  const handleSave=async()=>{ 
    setSaving(true); 
    try{ 
      const {data:{user}}=await supabase.auth.getUser(); 
      if(!user) return; 
      await supabase.from('profiles').update({ 
        full_name:name, 
        username,bio,gender, 
        birthday,location, 
        social_instagram:instagram, 
        social_twitter:twitter, 
        updated_at:new Date().toISOString(), 
      }).eq('id',user.id); 
      await refreshProfile?.(); 
      Alert.alert('Saved','Profile updated successfully.'); 
      nav.goBack(); 
    }catch(e){ 
      Alert.alert('Error','Could not save. Try again.'); 
    }finally{setSaving(false);} 
  }; 

  return( 
    <View style={{flex:1,backgroundColor:'#0B1020'}}> 
      <View style={[s.header,{paddingTop:insets.top+8}]}> 
        <TouchableOpacity onPress={()=>nav.goBack()} style={s.back}> 
          <ArrowLeft size={22} color="#F7F8FC"/> 
        </TouchableOpacity> 
        <Text style={s.title}>Edit Profile</Text> 
        <TouchableOpacity onPress={handleSave} style={s.saveBtn} disabled={saving}> 
          <Save size={16} color="#FFF"/> 
          <Text style={s.saveTxt}>{saving?'Saving...':'Save'}</Text> 
        </TouchableOpacity> 
      </View> 
      <ScrollView contentContainerStyle={{padding:16,gap:4,paddingBottom:100}} showsVerticalScrollIndicator={false}> 
        <Field label="Full Name" value={name} onChange={setName}/> 
        <Field label="Username" value={username} onChange={setUsername} hint="Can be changed once per month"/> 
        <Field label="Bio" value={bio} onChange={setBio} placeholder="Tell your story..." multiline/> 
        <Field label="Gender" value={gender} onChange={setGender} placeholder="e.g. Male / Female / Other"/> 
        <Field label="Birthday" value={birthday} onChange={setBirthday} placeholder="YYYY-MM-DD"/> 
        <Field label="Location" value={location} onChange={setLocation} placeholder="City, Country"/> 
        <Text style={s.sectionHead}>SOCIAL LINKS</Text> 
        <Field label="Instagram" value={instagram} onChange={setInstagram} placeholder="@handle"/> 
        <Field label="Twitter / X" value={twitter} onChange={setTwitter} placeholder="@handle"/> 
      </ScrollView> 
    </View> 
  ); 
} 

const s=StyleSheet.create({ 
  header:{flexDirection:'row',alignItems:'center',paddingHorizontal:16,paddingBottom:14,gap:12}, 
  back:{width:38,height:38,borderRadius:12,backgroundColor:'#1A2235',alignItems:'center',justifyContent:'center'}, 
  title:{flex:1,fontSize:20,fontWeight:'800',color:'#F7F8FC'}, 
  saveBtn:{flexDirection:'row',alignItems:'center',gap:6,backgroundColor:'#8B7CFF',borderRadius:12,paddingHorizontal:14,paddingVertical:9}, 
  saveTxt:{fontSize:13,fontWeight:'700',color:'#FFF'}, 
  field:{marginBottom:14}, 
  label:{fontSize:13,fontWeight:'700',color:'#F7F8FC',marginBottom:6}, 
  hint:{fontSize:11,color:'#6B7280',marginBottom:4}, 
  input:{backgroundColor:'#131929',borderRadius:12,padding:14,fontSize:14,color:'#F7F8FC',borderWidth:1,borderColor:'rgba(139,124,255,0.2)'}, 
  sectionHead:{fontSize:11,fontWeight:'800',color:'#6B7280',letterSpacing:1,marginTop:8,marginBottom:4}, 
});