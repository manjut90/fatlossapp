 import React,{useState} from 'react'; 
 import {View,Text,StyleSheet,ScrollView,TouchableOpacity,Switch,Alert} from 'react-native'; 
 import {useNavigation} from '@react-navigation/native'; 
 import {useSafeAreaInsets} from 'react-native-safe-area-context'; 
 import {ArrowLeft,ChevronRight,User,Lock,Bell,Monitor,Ban,Shield,Info,HelpCircle,LogOut} from 'lucide-react-native'; 
 import {useAuth} from '../context/AuthContext'; 
 
 const Row=({label,sub,onPress,right}:any)=>( 
   <TouchableOpacity onPress={onPress} style={ss.row}> 
     <View style={{flex:1}}> 
       <Text style={ss.rowLabel}>{label}</Text> 
       {sub&&<Text style={ss.rowSub}>{sub}</Text>} 
     </View> 
     {right||<ChevronRight size={16} color="#6B7280"/>} 
   </TouchableOpacity> 
 ); 
 
 const Toggle=({label,sub,value,onChange}:any)=>( 
   <View style={ss.row}> 
     <View style={{flex:1}}> 
       <Text style={ss.rowLabel}>{label}</Text> 
       {sub&&<Text style={ss.rowSub}>{sub}</Text>} 
     </View> 
     <Switch value={value} onValueChange={onChange} 
       trackColor={{false:'#1A2235',true:'#B8A8FF'}} 
       thumbColor={value?'#8B7CFF':'#6B7280'}/> 
   </View> 
 ); 
 
 const Card=({title,icon,children}:any)=>( 
   <View style={ss.card}> 
     <View style={ss.cardHeader}> 
       <View style={ss.cardIcon}>{icon}</View> 
       <Text style={ss.cardTitle}>{title}</Text> 
     </View> 
     {children} 
   </View> 
 ); 
 
 const ss=StyleSheet.create({ 
   header:{flexDirection:'row',alignItems:'center',paddingHorizontal:16,paddingBottom:14,gap:12}, 
   back:{width:38,height:38,borderRadius:12,backgroundColor:'#1A2235',alignItems:'center',justifyContent:'center'}, 
   title:{fontSize:20,fontWeight:'800',color:'#F7F8FC'}, 
   card:{backgroundColor:'#131929',borderRadius:20,padding:16,shadowColor:'#8B7CFF',shadowOpacity:0.05,shadowRadius:8,elevation:2}, 
   cardHeader:{flexDirection:'row',alignItems:'center',gap:10,marginBottom:14}, 
   cardIcon:{width:30,height:30,borderRadius:10,backgroundColor:'#1A2235',alignItems:'center',justifyContent:'center'}, 
   cardTitle:{fontSize:13,fontWeight:'800',color:'#F7F8FC',letterSpacing:0.5}, 
   row:{flexDirection:'row',alignItems:'center',paddingVertical:13,borderTopWidth:1,borderTopColor:'rgba(139,124,255,0.15)'}, 
   rowLabel:{fontSize:14,fontWeight:'600',color:'#F7F8FC'}, 
   rowSub:{fontSize:12,color:'#6B7280',marginTop:2}, 
   logoutBtn:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:10,backgroundColor:'#131929',borderRadius:20,padding:18,shadowColor:'#FF4B4B',shadowOpacity:0.1,shadowRadius:8,elevation:2}, 
   logoutText:{fontSize:15,fontWeight:'800',color:'#FF4B4B'}, 
 }); 
 
 export default function SettingsScreen(){ 
   const navigation=useNavigation<any>(); 
   const insets=useSafeAreaInsets(); 
   const {signOut,profile}=useAuth(); 
   const [notifs,setNotifs]=useState(true); 
   const [dark,setDark]=useState(false); 
   const [hq,setHq]=useState(true); 
   const [priv,setPriv]=useState(false); 
 
   const logout=()=>Alert.alert('Log Out','Are you sure?',[ 
     {text:'Cancel',style:'cancel'}, 
     {text:'Log Out',style:'destructive',onPress:signOut}, 
   ]); 
 
   return( 
     <View style={{flex:1,backgroundColor:'#0B1020'}}> 
       <View style={[ss.header,{paddingTop:insets.top+8}]}> 
         <TouchableOpacity onPress={()=>navigation.goBack()} style={ss.back}> 
           <ArrowLeft size={22} color="#F7F8FC"/> 
         </TouchableOpacity> 
         <Text style={ss.title}>Settings</Text> 
       </View> 
       <ScrollView contentContainerStyle={{padding:16,gap:12,paddingBottom:100}} showsVerticalScrollIndicator={false}> 
 
         <Card title="Edit Profile" icon={<User size={16} color="#8B7CFF"/>}> 
           <Row label="Edit Profile Details" sub="Name, bio, username, links" onPress={()=>navigation.navigate('EditProfile')}/> 
           <Row label="Fitness Goals" sub="Update weight, height, targets" onPress={()=>navigation.navigate('FitnessGoals')}/> 
         </Card> 
 
         <Card title="Account Security" icon={<Lock size={16} color="#8B7CFF"/>}> 
           <Row label="Change Password" sub="Requires OTP verification" onPress={()=>navigation.navigate('ChangePassword')}/> 
           <Row label="Email Verification" sub="Verify your email address" onPress={()=>navigation.navigate('EmailVerify')}/> 
           <Row label="Phone Verification" sub="Add or verify phone number" onPress={()=>navigation.navigate('PhoneVerify')}/> 
           <Toggle label="Two-Factor Auth" sub="Coming soon" value={false} onChange={()=>{}}/> 
         </Card> 
 
         <Card title="Notifications" icon={<Bell size={16} color="#8B7CFF"/>}> 
           <Toggle label="Push Notifications" sub={notifs?'Notifications are on':'Notifications are off'} value={notifs} onChange={async(v)=>{ 
             setNotifs(v); 
             try{ 
               const {requestPermissionsAsync}=await import('expo-notifications'); 
               if(v) await requestPermissionsAsync(); 
             }catch{} 
           }}/> 
         </Card> 
 
         <Card title="System" icon={<Monitor size={16} color="#8B7CFF"/>}> 
           <Toggle label="Dark Mode" sub={dark?'Dark theme active':'Light theme active'} value={dark} onChange={setDark}/> 
           <Toggle label="High Media Quality" sub={hq?'Original quality — uses more data':'Compressed — saves data'} value={hq} onChange={setHq}/> 
         </Card> 
 
         <Card title="Privacy" icon={<Shield size={16} color="#8B7CFF"/>}> 
           <Toggle label="Private Account" sub={priv?'Only followers see your posts':'Your posts are public'} value={priv} onChange={setPriv}/> 
           <Row label="Blocked Users" sub="Manage blocked accounts" onPress={()=>navigation.navigate('BlockedUsers')}/> 
         </Card> 
 
         <Card title="About" icon={<Info size={16} color="#8B7CFF"/>}> 
           <Row label="About Your Account" sub={`Joined: ${profile?.created_at?.split('T')[0]||'—'}`} onPress={()=>{}}/> 
           <Row label="Privacy Policy" sub="Tap to read" onPress={()=>Alert.alert('Coming Soon','URL will be added soon.')}/> 
           <Row label="Terms of Use" sub="Tap to read" onPress={()=>Alert.alert('Coming Soon','URL will be added soon.')}/> 
         </Card> 
 
         <Card title="Help & Support" icon={<HelpCircle size={16} color="#8B7CFF"/>}> 
           <Row label="Report a Problem" onPress={()=>navigation.navigate('ReportProblem')}/> 
           <Row label="Frequently Asked Questions" onPress={()=>navigation.navigate('FAQ')}/> 
         </Card> 
 
         <TouchableOpacity style={ss.logoutBtn} onPress={logout}> 
           <LogOut size={18} color="#FF4B4B"/> 
           <Text style={ss.logoutText}>Log Out</Text> 
         </TouchableOpacity> 
 
       </ScrollView> 
     </View> 
   ); 
 }