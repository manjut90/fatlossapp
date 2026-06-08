import React,{useState} from 'react'; 
import {View,Text,StyleSheet,ScrollView,TextInput,TouchableOpacity,Alert} from 'react-native'; 
import {useNavigation} from '@react-navigation/native'; 
import {useSafeAreaInsets} from 'react-native-safe-area-context'; 
import {ArrowLeft,Save} from 'lucide-react-native'; 
import {useAuth} from '../context/AuthContext'; 
import {supabase} from '../services/supabase'; 

const Field=({label,value,onChange,placeholder,hint,unit}:any)=>( 
  <View style={s.field}> 
    <Text style={s.label}>{label}{unit&&<Text style={s.unit}> ({unit})</Text>}</Text> 
    {hint&&<Text style={s.hint}>{hint}</Text>} 
    <TextInput style={s.input} value={String(value||'')} onChangeText={onChange} 
      placeholder={placeholder} placeholderTextColor="#BBB" keyboardType="decimal-pad"/> 
  </View> 
); 

const Picker=({label,options,value,onChange}:any)=>( 
  <View style={s.field}> 
    <Text style={s.label}>{label}</Text> 
    <View style={s.pills}> 
      {options.map((o:string)=>( 
        <TouchableOpacity key={o} onPress={()=>onChange(o)} 
          style={[s.pill,value===o&&s.pillActive]}> 
          <Text style={[s.pillText,value===o&&s.pillTextActive]}>{o}</Text> 
        </TouchableOpacity> 
      ))} 
    </View> 
  </View> 
); 

export default function FitnessGoalsScreen(){ 
  const nav=useNavigation<any>(); 
  const insets=useSafeAreaInsets(); 
  const {profile,refreshProfile}=useAuth(); 
  const [weight,setWeight]=useState(String(profile?.weight||'')); 
  const [height,setHeight]=useState(String(profile?.height||'')); 
  const [targetWeight,setTargetWeight]=useState(String(profile?.target_weight||'')); 
  const [goal,setGoal]=useState(profile?.goal||'fat_loss'); 
  const [activity,setActivity]=useState(profile?.activity_level||'Moderately Active'); 
  const [experience,setExperience]=useState(profile?.training_experience||'Beginner'); 
  const [gym,setGym]=useState(profile?.gym_access||'gym'); 
  const [saving,setSaving]=useState(false); 

  const handleSave=async()=>{ 
    setSaving(true); 
    try{ 
      const {data:{user}}=await supabase.auth.getUser(); 
      if(!user) return; 
      await supabase.from('profiles').update({ 
        weight:parseFloat(weight), 
        height:parseFloat(height), 
        target_weight:parseFloat(targetWeight), 
        goal,activity_level:activity, 
        training_experience:experience, 
        gym_access:gym, 
        updated_at:new Date().toISOString(), 
      }).eq('id',user.id); 
      await refreshProfile?.(); 
      Alert.alert('Saved','Fitness goals updated.'); 
      nav.goBack(); 
    }catch{ 
      Alert.alert('Error','Could not save.'); 
    }finally{setSaving(false);} 
  }; 

  return( 
    <View style={{flex:1,backgroundColor:'#0B1020'}}> 
      <View style={[s.header,{paddingTop:insets.top+8}]}> 
        <TouchableOpacity onPress={()=>nav.goBack()} style={s.back}> 
          <ArrowLeft size={22} color="#F7F8FC"/> 
        </TouchableOpacity> 
        <Text style={s.title}>Fitness Goals</Text> 
        <TouchableOpacity onPress={handleSave} style={s.saveBtn} disabled={saving}> 
          <Save size={16} color="#FFF"/> 
          <Text style={s.saveTxt}>{saving?'Saving...':'Save'}</Text> 
        </TouchableOpacity> 
      </View> 
      <ScrollView contentContainerStyle={{padding:16,paddingBottom:100}} showsVerticalScrollIndicator={false}> 
        <Field label="Current Weight" value={weight} onChange={setWeight} placeholder="70" unit="kg"/> 
        <Field label="Height" value={height} onChange={setHeight} placeholder="170" unit="cm"/> 
        <Field label="Target Weight" value={targetWeight} onChange={setTargetWeight} placeholder="65" unit="kg"/> 
        <Picker label="Goal" options={['fat_loss','muscle_gain','fitness','healthy_lifestyle']} value={goal} onChange={setGoal}/> 
        <Picker label="Activity Level" options={['Sedentary','Lightly Active','Moderately Active','Very Active','Extremely Active']} value={activity} onChange={setActivity}/> 
        <Picker label="Training Experience" options={['Beginner','Intermediate','Advanced']} value={experience} onChange={setExperience}/> 
        <Picker label="Equipment Access" options={['gym','home']} value={gym} onChange={setGym}/> 
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
  field:{marginBottom:18}, 
  label:{fontSize:13,fontWeight:'700',color:'#F7F8FC',marginBottom:6}, 
  unit:{fontSize:12,color:'#6B7280',fontWeight:'400'}, 
  hint:{fontSize:11,color:'#6B7280',marginBottom:4}, 
  input:{backgroundColor:'#131929',borderRadius:12,padding:14,fontSize:14,color:'#F7F8FC',borderWidth:1,borderColor:'rgba(139,124,255,0.2)'}, 
  pills:{flexDirection:'row',flexWrap:'wrap',gap:8}, 
  pill:{paddingHorizontal:14,paddingVertical:8,borderRadius:20,backgroundColor:'#1A2235'}, 
  pillActive:{backgroundColor:'#8B7CFF'}, 
  pillText:{fontSize:13,fontWeight:'600',color:'#6B7280'}, 
  pillTextActive:{color:'#FFF'}, 
});