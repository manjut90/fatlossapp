import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { achievementOrchestrator } from './gamification/services/AchievementOrchestrator';
import { useGamificationStore } from './gamification/store/useGamificationStore';
import { X } from 'lucide-react-native';

const MAX_CHARACTERS = 280;

export default function CreatePostScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const setPendingAchievement = useGamificationStore(
    (state) => state.setPendingAchievement
  );
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePost = useCallback(async () => {
    if (!content.trim() || !user) {
      return;
    }

    setIsLoading(true);
    try {
      console.log('USER_ID', user?.id);
      const session = await supabase.auth.getSession();
      console.log('SESSION_USER_ID', session.data.session?.user?.id);
      const { error } = await supabase.from('posts').insert({
        user_id: user.id,
        content: content.trim(),
        type: 'text',
      });

      if (error) {
        throw error;
      }

      const newAchievement =
        await achievementOrchestrator.checkForNewAchievements(user.id);
      if (newAchievement) {
        console.log(
          'FIRST_POST_ACHIEVEMENT',
          newAchievement
        );
        setPendingAchievement(newAchievement);
      }

      // In a real app, you'd use a toast notification library
      Alert.alert('Success', 'Your post has been published!');
      navigation.goBack();
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to publish your post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [content, user, navigation]);

  const characterCount = content.length;
  const isPostDisabled = !content.trim() || characterCount > MAX_CHARACTERS || isLoading;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelButton}>
          <X size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handlePost}
          style={[styles.postButton, isPostDisabled && styles.postButtonDisabled]}
          disabled={isPostDisabled}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.postButtonText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          multiline
          placeholder="What's on your mind?"
          placeholderTextColor="#5A5A5A"
          value={content}
          onChangeText={setContent}
          autoFocus
        />
      </View>
      <Text style={styles.charCount}>
        {characterCount}/{MAX_CHARACTERS}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1020',
    paddingTop: 60,
    paddingHorizontal: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cancelButton: {
    padding: 5,
  },
  postButton: {
    backgroundColor: '#8B7CFF',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  postButtonDisabled: {
    backgroundColor: '#5A5A5A',
  },
  postButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  inputContainer: {
    flex: 1,
  },
  textInput: {
    color: '#FFF',
    fontSize: 18,
    lineHeight: 24,
    textAlignVertical: 'top',
    flex: 1,
  },
  charCount: {
    color: '#5A5A5A',
    textAlign: 'right',
    marginBottom: 20,
    paddingBottom: 20,
  },
});