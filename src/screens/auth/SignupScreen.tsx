import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, Image, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, TouchableWithoutFeedback,
  Keyboard, Alert, Animated, Dimensions, StatusBar, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

const { width: W, height: H } = Dimensions.get('window');

const PARTICLES = [
  { left: '10%', color: '#8B7CFF', size: 4, duration: 6000, delay: 0 },
  { left: '25%', color: '#FF8FA3', size: 6, duration: 8000, delay: 1000 },
  { left: '45%', color: '#F7C873', size: 3, duration: 5000, delay: 2000 },
  { left: '60%', color: '#8B7CFF', size: 5, duration: 7000, delay: 500 },
  { left: '75%', color: '#FF8FA3', size: 4, duration: 6500, delay: 1500 },
  { left: '88%', color: '#F7C873', size: 6, duration: 9000, delay: 800 },
];

function Particle({ left, color, size, duration, delay }: any) {
  const y = useRef(new Animated.Value(H)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animate = () => {
      y.setValue(H);
      opacity.setValue(0.3);
      Animated.parallel([
        Animated.timing(y, { toValue: -50, duration, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0.6, duration: duration * 0.3, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: duration * 0.7, useNativeDriver: true }),
        ]),
      ]).start(() => animate());
    };
    const t = setTimeout(animate, delay);
    return () => clearTimeout(t);
  }, []);
  return (
    <Animated.View style={{
      position: 'absolute', left, width: size, height: size,
      borderRadius: size / 2, backgroundColor: color,
      opacity, transform: [{ translateY: y }],
    }} />
  );
}

export default function SignupScreen({ navigation }: any) {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const logoO = useRef(new Animated.Value(0)).current;
  const logoY = useRef(new Animated.Value(-30)).current;
  const formO = useRef(new Animated.Value(0)).current;
  const formY = useRef(new Animated.Value(40)).current;
  const btn = useRef(new Animated.Value(1)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(logoO, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(logoY, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(formO, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(formY, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
    ]).start();
    Animated.loop(Animated.sequence([
      Animated.timing(btn, { toValue: 1.02, duration: 1500, useNativeDriver: true }),
      Animated.timing(btn, { toValue: 1, duration: 1500, useNativeDriver: true }),
    ])).start();
  }, []);

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long.');
      return;
    }
    setLoading(true);
    const { error } = await signUp(email.trim(), password);
    if (error) {
      Alert.alert('Sign Up Error', error.message);
    }
    // Successful signup is handled by the auth listener in App.tsx
    setLoading(false);
  };

  return (
    <View style={{flex: 1, backgroundColor: '#0B1020'}}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <StatusBar barStyle="light-content" />
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{flex: 1}}>
            <LinearGradient
              colors={['#1A1235', '#2D1B4E', '#1A1235']}
              style={{
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                borderBottomLeftRadius: 50,
                borderBottomRightRadius: 50,
                paddingTop: insets.top + 20,
                paddingBottom: 30,
              }}
              >
              {PARTICLES.map((p, i) => <Particle key={i} {...p} />)}
              <Animated.View style={{ opacity: logoO, transform: [{ translateY: logoY }] }}>
                <View
                  style={{
                    shadowColor: '#8B7CFF',
                    shadowOpacity: 0.8,
                    shadowRadius: 40,
                    shadowOffset: { width: 0, height: 0 },
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Image
                    source={require('../../assets/lfgo_logo.png')}
                    style={{ width: W * 0.8, height: 130, resizeMode: 'contain' }}
                  />
                </View>
              </Animated.View>
            </LinearGradient>

          <Animated.View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 28, paddingBottom: 24, gap: 10, opacity: formO }}>
            <Text style={{ fontSize: 32, fontWeight: '900', color: '#F7F8FC' }}>Create Account</Text>
            <Text style={{ fontSize: 15, color: '#6B7280' }}>Level up. No excuses. </Text>

            <TextInput placeholder="Email" placeholderTextColor="#6B7280" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" onFocus={() => setFocused('email')} onBlur={() => setFocused('')} style={[s.input, focused === 'email' && s.inputFocused]} returnKeyType="next" />
            <TextInput placeholder="Password" placeholderTextColor="#6B7280" secureTextEntry value={password} onChangeText={setPassword} onFocus={() => setFocused('pass')} onBlur={() => setFocused('')} style={[s.input, focused === 'pass' && s.inputFocused]} returnKeyType="next" />
            <TextInput placeholder="Confirm Password" placeholderTextColor="#6B7280" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} onFocus={() => setFocused('confirm')} onBlur={() => setFocused('')} style={[s.input, focused === 'confirm' && s.inputFocused]} returnKeyType="done" onSubmitEditing={handleSignup} />
            
            <Animated.View style={{ transform: [{ scale: btn }] }}>
              <TouchableOpacity onPress={handleSignup} disabled={loading} style={{ borderRadius: 18, overflow: 'hidden' }}>
                <LinearGradient colors={['#8B7CFF', '#FF8FA3']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.button}>
                                      {loading ? <ActivityIndicator color="#FFF" /> : <Text style={s.buttonText}>Create Account</Text>}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <View style={s.dividerRow}>
              <View style={s.dividerLine} />
              <Text style={s.dividerText}>OR CONTINUE WITH</Text>
              <View style={s.dividerLine} />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 20 }}>
              <TouchableOpacity
                style={{
                  width: 46, height: 46, borderRadius: 23,
                  backgroundColor: '#131929',
                  borderWidth: 1, borderColor: 'rgba(139,124,255,0.3)',
                  alignItems: 'center', justifyContent: 'center',
                }}
                onPress={() => Alert.alert('Coming Soon', 'Google login coming soon!')}
              >
                <Text style={{ color: '#EA4335', fontWeight: '900', fontSize: 22 }}>G</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  width: 46, height: 46, borderRadius: 23,
                  backgroundColor: '#131929',
                  borderWidth: 1, borderColor: 'rgba(139,124,255,0.3)',
                  alignItems: 'center', justifyContent: 'center',
                }}
                onPress={() => Alert.alert('Coming Soon', 'Facebook login coming soon!')}
              >
                <Text style={{ color: '#1877F2', fontWeight: '900', fontSize: 26 }}>f</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={s.link}>Already have an account? <Text style={{ color: '#8B7CFF', fontWeight: '800' }}>Login</Text></Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  </View>
  );
}

const s = StyleSheet.create({
  input: { height: 48, borderRadius: 16, backgroundColor: '#131929', paddingHorizontal: 18, color: '#F7F8FC', fontSize: 15, borderWidth: 1, borderColor: 'rgba(139,124,255,0.2)' },
  inputFocused: { borderColor: '#8B7CFF' },
  button: { height: 50, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#F7F8FC', fontWeight: '900', fontSize: 16 },
  dividerRow: { flexDirection: 'row', alignItems: 'center' },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(139,124,255,0.2)' },
  dividerText: { color: '#6B7280', paddingHorizontal: 12, fontSize: 12, fontWeight: '600' },
  link: { textAlign: 'center', color: '#6B7280', fontSize: 13 },
});