import React, {
  forwardRef,
  useRef,
  useState,
} from 'react';

import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';

import BottomSheet, {
  BottomSheetView,
  BottomSheetFlatList,
} from '@gorhom/bottom-sheet';

import { Send } from 'lucide-react-native';
import MessageBubble from './MessageBubble';

type Message = {
  id: string;
  role: 'user' | 'coach';
  message: string;
  timestamp: Date;
};

type Props = {
  processMessage: (
    text: string,
    history: { role: string; content: string }[],
  ) => Promise<string>;
};

const CoachChatSheet = forwardRef<BottomSheet, Props>(
  ({ processMessage }, ref) => {
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
      {
        id: '0',
        role: 'coach',
        message:
          "Hey! I'm Neo, your personal fitness coach 👋 Tell me about your meals, workouts, water or sleep — or just ask me anything.",
        timestamp: new Date(),
      },
    ]);

    const flatListRef = useRef<any>(null);

    const getHistory = () =>
      messages
        .filter(m => m.id !== '0')
        .slice(-6)
        .map(m => ({
          role: m.role === 'coach' ? 'assistant' : 'user',
          content: m.message,
        }));

    const handleSend = async () => {
      const text = input.trim();
      if (!text || typing) return;

      const userMsg: Message = {
        id: Date.now().toString(),
        role: 'user',
        message: text,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMsg]);
      setInput('');
      setTyping(true);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      try {
        const history = getHistory();
        const reply = await processMessage(text, history);

        const coachMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'coach',
          message: reply,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, coachMsg]);
      } catch {
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'coach',
            message: "Sorry, I'm having trouble right now. Try again in a moment 🙏",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setTyping(false);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 200);
      }
    };

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={['95%']}
        enablePanDownToClose
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        backgroundStyle={styles.sheetBg}
      >
        <BottomSheetView style={styles.container}>

          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.neoOrb}>
              <Text style={styles.neoText}>N</Text>
            </View>
            <View>
              <Text style={styles.headerTitle}>Neo Coach</Text>
              <View style={styles.onlineRow}>
                <View style={styles.onlineDot} />
                <Text style={styles.headerSub}>Online · Your AI fitness coach</Text>
              </View>
            </View>
          </View>

          {/* MESSAGES */}
          <BottomSheetFlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id}
            style={styles.flatList}
            contentContainerStyle={styles.messageList}
            renderItem={({ item }) => (
              <MessageBubble role={item.role} message={item.message} />
            )}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
          />

          {/* TYPING INDICATOR */}
          {typing && (
            <View style={styles.typingWrap}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>N</Text>
              </View>
              <View style={styles.typingBubble}>
                <ActivityIndicator size="small" color="#8B7CFF" />
                <Text style={styles.typingText}>Neo is thinking...</Text>
              </View>
            </View>
          )}

          {/* INPUT */}
          <View style={styles.inputWrap}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Message Neo..."
              placeholderTextColor="#9E9E9E"
              style={styles.input}
              returnKeyType="send"
              onSubmitEditing={handleSend}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!input.trim() || typing) && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!input.trim() || typing}
            >
              <Send size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

        </BottomSheetView>
      </BottomSheet>
    );
  },
);

export default CoachChatSheet;

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: '#F7F8FC',
    borderRadius: 36,
  },
  container: {
    flex: 1,
  },
  flatList: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  neoOrb: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#8B7CFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  neoText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0B1020',
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#8B7CFF',
    marginRight: 5,
  },
  headerSub: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  messageList: {
    padding: 18,
    paddingBottom: 20,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8B7CFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  typingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  typingText: {
    color: '#8B7CFF',
    fontSize: 13,
    fontWeight: '600',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#F7F8FC',
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 100,
    borderRadius: 24,
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0B1020',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8B7CFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});