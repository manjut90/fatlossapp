import React,{useState,useRef} from 'react'; 
import {View,Text,TouchableOpacity,StyleSheet,Animated,Modal,Pressable} from 'react-native'; 
import {useNavigation} from '@react-navigation/native'; 
import {Plus,X,Sparkles, Zap} from 'lucide-react-native';
import {Image} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context'; 
import {LinearGradient} from 'expo-linear-gradient'; 

type Props = { 
  onNeoPress:()=>void; 
  onMediaPress:()=>void; 
}; 

export default function FloatingActionButton({onNeoPress,onMediaPress}:Props){ 
  const [open,setOpen]=useState(false); 
  const anim=useRef(new Animated.Value(0)).current; 
  const navigation=useNavigation<any>(); 
  const insets=useSafeAreaInsets(); 

  const toggle=()=>{ 
    Animated.spring(anim,{ 
      toValue:open?0:1, 
      useNativeDriver:true, 
      friction:6, 
    }).start(); 
    setOpen(o=>!o); 
  }; 

  const close=()=>{ 
    Animated.timing(anim,{toValue:0,duration:150,useNativeDriver:true}).start(); 
    setOpen(false); 
  }; 

  const rotate=anim.interpolate({inputRange:[0,1],outputRange:['0deg','45deg']}); 

  const option=(idx:number)=>({ 
    opacity:anim, 
    transform:[{ 
      translateY:anim.interpolate({inputRange:[0,1],outputRange:[0,-(idx*64)]}) 
    },{ 
      scale:anim.interpolate({inputRange:[0,1],outputRange:[0.5,1]}) 
    }] 
  }); 

  const ACTIONS = [ 
   { 
     label: 'Post', 
     icon: <Sparkles size={20} color="#FFF" />, 
     color: '#F7C873', 
     onPress: () => { close(); onMediaPress(); } 
   }, 
   { 
     label: 'Neo', 
     icon: <Image source={require('../assets/neo_logo.png')} style={{ width: 22, height: 22, resizeMode: 'contain' }} />, 
     color: '#8B7CFF', 
     onPress: () => { close(); onNeoPress(); } 
   }, 
   { 
     label: 'Check In', 
     icon: <Zap size={20} color="#FFF" />, 
     color: '#FF8FA3', 
     onPress: () => { close(); navigation.navigate('CheckIn'); } 
   }, 
 ]; 

  return( 
    <> 
      {open&&( 
        <Pressable style={s.backdrop} onPress={close}/> 
      )} 
      <View style={[s.wrap,{bottom:insets.bottom+70}]}> 
        {ACTIONS.map((a,i)=>( 
          <Animated.View key={i} style={[s.optionWrap,option(i+1)]}> 
            <TouchableOpacity style={[s.optionBtn,{backgroundColor:a.color}]} onPress={a.onPress}> 
              {a.icon} 
            </TouchableOpacity> 
            <View style={s.labelWrap}> 
              <Text style={s.labelText}>{a.label}</Text> 
            </View> 
          </Animated.View> 
        ))} 
        <TouchableOpacity style={s.fab} onPress={toggle} activeOpacity={0.85}> 
          <LinearGradient 
            colors={['#8B7CFF', '#FF8FA3']} 
            start={{ x: 0, y: 0 }} 
            end={{ x: 1, y: 1 }} 
            style={{ width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' }} 
          > 
            <Animated.View style={{transform:[{rotate}]}}> 
              {open?<X size={24} color="#FFF"/>:<Plus size={24} color="#FFF"/>} 
            </Animated.View> 
          </LinearGradient> 
        </TouchableOpacity> 
      </View> 
    </> 
  ); 
} 

const s=StyleSheet.create({ 
  backdrop:{position:'absolute',top:0,left:0,right:0,bottom:0,zIndex:98}, 
  wrap:{position:'absolute',right:20,alignItems:'center',zIndex:99}, 
  fab:{width:56,height:56,borderRadius:28,backgroundColor:'#8B7CFF',alignItems:'center',justifyContent:'center',shadowColor:'#8B7CFF',shadowOpacity:0.4,shadowRadius:12,elevation:8}, 
  optionWrap:{position:'absolute',alignItems:'center',right:0}, 
  optionBtn:{width:50,height:50,borderRadius:25,alignItems:'center',justifyContent:'center',shadowColor:'#000',shadowOpacity:0.2,shadowRadius:8,elevation:6}, 
  labelWrap:{position:'absolute',right:54,backgroundColor:'#131929',borderRadius:10,paddingHorizontal:14,paddingVertical:7,borderWidth:1,borderColor:'rgba(139,124,255,0.3)'}, 
  labelText:{fontSize:13,fontWeight:'700',color:'#F7F8FC'}, 
});