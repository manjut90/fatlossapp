import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, ScrollView, ActivityIndicator, Alert, TextInput,
} from 'react-native';
import { ChevronLeft, HeartPulse, Upload, FileText } from 'lucide-react-native';
import { useOnboarding } from '../../context/OnboardingContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import * as DocumentPicker from 'expo-document-picker';

const CONDITIONS = [
  'None', 'Diabetes', 'Hypertension', 'Heart Disease',
  'Thyroid Issues', 'Joint Pain', 'Asthma', 'Other',
];

export default function MedicalScreen({ navigation }: any) {
  const { onboardingData, setOnboardingData } = useOnboarding();
  const { user, refreshProfile } = useAuth();
  const [selected, setSelected] = useState<string[]>(
    onboardingData.healthConditions || []
  );
  const [loading, setLoading] = useState(false);
  const [uploadedDoc, setUploadedDoc] = useState<any>(null);
  const [otherText, setOtherText] = useState('');

  const toggle = (item: string) => {
    if (item === 'None') { setSelected(['None']); return; }
    setSelected(prev => {
      const without = prev.filter(x => x !== 'None');
      return without.includes(item)
        ? without.filter(x => x !== item)
        : [...without, item];
    });
  };

  const handleDocumentPick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets?.[0]) {
        setUploadedDoc(result.assets[0]);
      }
    } catch (e) {
      Alert.alert('Error', 'Could not open document picker.');
    }
  };

  const handleContinue = async () => {
    if (!user?.id) return;

    const finalConditions = selected.includes('Other') && otherText
      ? [...selected.filter(x => x !== 'Other'), `Other: ${otherText}`]
      : selected;

    const updatedOnboardingData = { ...onboardingData, healthConditions: finalConditions };
    setOnboardingData(updatedOnboardingData);
    setLoading(true);

    try {
      const profileUpdate = {
        full_name: updatedOnboardingData.name,
        gender: updatedOnboardingData.sex,
        height: parseFloat(updatedOnboardingData.height) || null,
        current_weight: parseFloat(updatedOnboardingData.currentWeight) || null,
        target_weight: parseFloat(updatedOnboardingData.targetWeight) || null,
        goals: updatedOnboardingData.goals,
        activity_level: updatedOnboardingData.activityLevel,
        sleep_hours: updatedOnboardingData.sleepHours,
        training_experience: updatedOnboardingData.trainingExperience,
        work_style: updatedOnboardingData.workStyle,
        health_conditions: finalConditions,
        onboarding_completed: true,
      };

      const { error } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      await refreshProfile();

    } catch (e) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={s.topBar}>
          <TouchableOpacity style={s.backButton} onPress={() => navigation.goBack()}>
            <ChevronLeft size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={s.topTitle}>Health Profile</Text>
          <TouchableOpacity onPress={handleContinue} style={{ position: 'absolute', right: 16, top: 16 }}>
            <Text style={{ color: '#6B7280', fontSize: 13, fontWeight: '600' }}>Skip</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.subtitle}>
          Optional — skip if you prefer.
        </Text>
        <View style={s.card}>
          <View style={s.sectionTop}>
            <FileText size={18} color="#4AA9FF" />
            <Text style={s.sectionTitle}>Medical Documents</Text>
          </View>
          <Text style={{ color: '#6B7280', fontSize: 12, marginBottom: 10 }}>Upload reports, prescriptions or lab results (optional)</Text>
          <TouchableOpacity
            style={{
              height: 80, borderRadius: 16,
              borderWidth: 1.5, borderColor: 'rgba(74,169,255,0.3)',
              borderStyle: 'dashed', alignItems: 'center',
              justifyContent: 'center', backgroundColor: 'rgba(74,169,255,0.05)',
              flexDirection: 'row', gap: 10,
            }}
            onPress={handleDocumentPick}
          >
            <Upload size={20} color="#4AA9FF" />
            <Text style={{ color: '#4AA9FF', fontWeight: '700', fontSize: 13 }}>
              {uploadedDoc ? uploadedDoc.name : 'Tap to upload document'}
            </Text>
          </TouchableOpacity>
          {uploadedDoc && (
            <TouchableOpacity onPress={() => setUploadedDoc(null)} style={{ marginTop: 8, alignSelf: 'flex-end' }}>
              <Text style={{ color: '#FF6B6B', fontSize: 12 }}>Remove</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={s.card}>
          <View style={s.sectionTop}>
            <HeartPulse size={18} color="#FF6B6B" />
            <Text style={s.sectionTitle}>Health Conditions</Text>
          </View>
          <View style={s.row}>
            {CONDITIONS.map(item => (
              <TouchableOpacity key={item}
                style={[s.pill, selected.includes(item) && s.activePill]}
                onPress={() => toggle(item)}>
                <Text style={[s.pillText, selected.includes(item) && s.activePillText]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {selected.includes('Other') && (
            <TextInput
              style={{
                marginTop: 10, backgroundColor: '#0B1020',
                borderRadius: 12, padding: 12, color: '#F7F8FC',
                fontSize: 13, borderWidth: 1,
                borderColor: 'rgba(139,124,255,0.3)',
              }}
              placeholder="Describe your condition..."
              placeholderTextColor="#6B7280"
              value={otherText}
              onChangeText={setOtherText}
              multiline
              numberOfLines={3}
            />
          )}
        </View>
        <TouchableOpacity style={s.nextButton} onPress={handleContinue} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#0B1020" />
            : <Text style={s.nextText}>Complete Profile</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1020' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, marginTop: 16, position: 'relative' },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', position: 'absolute', left: 16, top: 0 },
  topTitle: { color: '#FFFFFF', fontSize: 26, fontWeight: '900' },
  subtitle: { color: '#9E9E9E', lineHeight: 22, marginTop: 14, marginBottom: 20, paddingHorizontal: 28, textAlign: 'center', fontSize: 13 },
  card: { marginHorizontal: 20, marginBottom: 14, borderRadius: 24, padding: 16, backgroundColor: '#131929' },
  sectionTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { color: '#FFFFFF', fontWeight: '800', fontSize: 15, marginLeft: 10 },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  pill: { backgroundColor: '#1A2235', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8, marginBottom: 8 },
  activePill: { backgroundColor: '#8B7CFF' },
  pillText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
  activePillText: { color: '#F7F8FC' },
  nextButton: { height: 56, borderRadius: 22, backgroundColor: '#8B7CFF', justifyContent: 'center', alignItems: 'center', marginHorizontal: 20, marginTop: 10 },
  nextText: { color: '#F7F8FC', fontSize: 15, fontWeight: '900' },
});