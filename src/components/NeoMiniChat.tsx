import React,{useState,useRef} from 'react'; 
import {View,Text,Image,StyleSheet,TextInput,TouchableOpacity,ScrollView,KeyboardAvoidingView,Platform,Modal} from 'react-native';
import {X,Send} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context'; 

type Msg={role:'user'|'assistant';text:string;}; 

type Props={visible:boolean;onClose:()=>void;}; 

export default function NeoMiniChat({visible,onClose}:Props){ 
  const insets=useSafeAreaInsets(); 
  const [msgs,setMsgs]=useState<Msg[]>([ 
    {role:'assistant',text:"Hey! I'm Neo. Ask me anything about your fitness, nutrition, or goals."} 
  ]); 
  const [input,setInput]=useState(''); 
  const [loading,setLoading]=useState(false); 
  const scrollRef=useRef<ScrollView>(null); 

  const send=async()=>{ 
    if(!input.trim()||loading) return; 
    const userMsg=input.trim(); 
    setInput(''); 
    setMsgs(p=>[...p,{role:'user',text:userMsg}]); 
    setLoading(true); 
    try{ 
      const key=process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY; 
      const history=msgs.slice(-6).map(m=>({role:m.role,content:m.text})); 
      const res=await fetch('https://api.anthropic.com/v1/messages',{ 
        method:'POST', 
        headers:{'Content-Type':'application/json','x-api-key':key||'','anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'}, 
        body:JSON.stringify({ 
          model:'claude-haiku-4-5-20251001', 
          max_tokens:300, 
          system:'You are Neo, a witty Gen-Z fitness coach. Keep responses short, direct, under 3 sentences. No fluff.', 
          messages:[...history,{role:'user',content:userMsg}], 
        }), 
      }); 
      const data=await res.json(); 
      const reply=data?.content?.[0]?.text?.trim()||'Sorry, try again.'; 
      setMsgs(p=>[...p,{role:'assistant',text:reply}]); 
    }catch{ 
      setMsgs(p=>[...p,{role:'assistant',text:'Network error. Try again.'}]); 
    }finally{ 
      setLoading(false); 
      setTimeout(()=>scrollRef.current?.scrollToEnd({animated:true}),100); 
    } 
  }; 

  return( 
    <Modal visible={visible} transparent animationType="slide"> 
      <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}> 
        <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={onClose}/> 
        <View style={[s.sheet,{paddingBottom:insets.bottom+8}]}> 
          <View style={s.header}> 
            <View style={s.neoRow}> 
              <View style={s.neoIcon}><Image source={require('../assets/neo_logo.png')} style={{ width: 18, height: 18, borderRadius: 9 }} /></View>
              <Text style={s.neoLabel}>Neo</Text> 
            </View> 
            <TouchableOpacity onPress={onClose} style={s.closeBtn}> 
              <X size={18} color="#888"/> 
            </TouchableOpacity> 
          </View> 
          <ScrollView ref={scrollRef} style={s.msgs} contentContainerStyle={{padding:12,gap:8}} showsVerticalScrollIndicator={false}> 
            {msgs.map((m,i)=>( 
              <View key={i} style={[s.bubble,m.role==='user'&&s.userBubble]}> 
                <Text style={[s.bubbleText,m.role==='user'&&s.userText]}>{m.text}</Text> 
              </View> 
            ))} 
            {loading&&( 
              <View style={s.bubble}> 
                <Text style={s.bubbleText}>Neo is thinking...</Text> 
              </View> 
            )} 
          </ScrollView> 
          <View style={s.inputRow}> 
            <TextInput style={s.input} value={input} onChangeText={setInput} 
              placeholder="Ask Neo anything..." placeholderTextColor="#AAA" 
              onSubmitEditing={send} returnKeyType="send"/> 
            <TouchableOpacity style={s.sendBtn} onPress={send} disabled={loading}> 
              <Send size={16} color="#FFF"/> 
            </TouchableOpacity> 
          </View> 
        </View> 
      </KeyboardAvoidingView> 
    </Modal> 
  ); 
} 

const s=StyleSheet.create({ 
  backdrop:{flex:1}, 
  sheet:{backgroundColor:'#F7F8FC',borderTopLeftRadius:24,borderTopRightRadius:24,maxHeight:'65%',shadowColor:'#000',shadowOpacity:0.15,shadowRadius:20,elevation:10}, 
  header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:16,borderBottomWidth:1,borderBottomColor:'#F2F3F7'}, 
  neoRow:{flexDirection:'row',alignItems:'center',gap:8}, 
  neoIcon:{width:30,height:30,borderRadius:15,backgroundColor:'#E8E4FF',alignItems:'center',justifyContent:'center'}, 
  neoLabel:{fontSize:15,fontWeight:'800',color:'#8B7CFF'}, 
  closeBtn:{width:30,height:30,borderRadius:15,backgroundColor:'#F2F3F7',alignItems:'center',justifyContent:'center'}, 
  msgs:{maxHeight:260}, 
  bubble:{backgroundColor:'#F2F3F7',borderRadius:14,padding:12,alignSelf:'flex-start',maxWidth:'85%'}, 
  userBubble:{backgroundColor:'#8B7CFF',alignSelf:'flex-end'}, 
  bubbleText:{fontSize:14,color:'#0B1020',lineHeight:20}, 
  userText:{color:'#FFF'}, 
  inputRow:{flexDirection:'row',gap:8,paddingHorizontal:12,paddingTop:8}, 
  input:{flex:1,backgroundColor:'#F2F3F7',borderRadius:20,paddingHorizontal:16,paddingVertical:10,fontSize:14,color:'#0B1020'}, 
  sendBtn:{width:40,height:40,borderRadius:20,backgroundColor:'#8B7CFF',alignItems:'center',justifyContent:'center'}, 
});