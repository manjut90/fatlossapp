import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { ENABLE_REELS } from '../constants/featureFlags';
import { supabase } from '../services/supabase';
import { achievementOrchestrator } from './gamification/services/AchievementOrchestrator';
import { useGamificationStore } from './gamification/store/useGamificationStore';
import { X, Image as ImageIcon, Video } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

const MAX_CHARACTERS = 280;

export default function CreatePostScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { user } = useAuth();
  const setPendingAchievement = useGamificationStore(
    (state) => state.setPendingAchievement
  );

  const initialMediaUri = route.params?.mediaUri || null;
  const initialMediaType = route.params?.mediaType || null;

  const [content, setContent] = useState('');
  const [mediaUri, setMediaUri] = useState<string | null>(initialMediaUri);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(initialMediaType);
  const [isLoading, setIsLoading] = useState(false);

  const [isMediaSelected, setIsMediaSelected] = useState(!!initialMediaUri);

  // Trigger media picker immediately on load if media not passed from params
  useEffect(() => {
    if (initialMediaUri) return;

    const timer = setTimeout(() => {
      pickMedia();
    }, 100);
    return () => clearTimeout(timer);
  }, [initialMediaUri]);

  const pickMedia = async () => {
    try {

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'We need camera roll permission to select media.');
        navigation.goBack();
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ENABLE_REELS ? ['images', 'videos'] : ['images'],
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.8,
      });



      if (result.canceled || !result.assets?.[0]) {
        navigation.goBack();
        return;
      }

      const asset = result.assets[0];
      setMediaUri(asset.uri);
      
      // Determine if image or video based on mimeType, type, or uri extension
      const isVideo = ENABLE_REELS && (
        asset.mimeType?.startsWith('video/') || 
        asset.type === 'video' || 
        asset.uri.toLowerCase().endsWith('.mp4') || 
        asset.uri.toLowerCase().endsWith('.mov')
      );
      
      if (isVideo) {
        setMediaType('video');
      } else {
        setMediaType('image');
      }
      setIsMediaSelected(true);
    } catch (e: any) {
      Alert.alert('Error picking media', e.message || 'Something went wrong.');
      navigation.goBack();
    }
  };

  const handlePost = useCallback(async () => {
    if (!user || !mediaUri || !mediaType) {
      return;
    }

    setIsLoading(true);
    try {
      // 1. Prepare upload
      const ext = mediaUri.split('.').pop() || (mediaType === 'video' ? 'mp4' : 'jpg');
      const fileName = `${mediaType}_${Date.now()}.${ext}`;
      const filePath = `${user.id}/${fileName}`;
      const contentType = mediaType === 'video' ? `video/${ext}` : `image/${ext}`;
      const bucketName = mediaType === 'video' ? 'reels' : 'posts';

      // 2. Read as base64
      const base64 = await FileSystem.readAsStringAsync(mediaUri, { encoding: 'base64' });

      // 3. Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, decode(base64), { contentType, upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // 4. Get public URL
      const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL.');
      }

      // 5. Insert into posts database table
      // Media URL goes into 'image_url' for compatibility with post renderers
      const { error } = await supabase.from('posts').insert({
        user_id: user.id,
        content: content.trim(),
        image_url: urlData.publicUrl,
        type: mediaType, // 'image' or 'video'
      });

      if (error) {
        throw error;
      }

      const newAchievement = await achievementOrchestrator.checkForNewAchievements(user.id);
      if (newAchievement) {
        setPendingAchievement(newAchievement);
      }

      Alert.alert('Success', `Your ${mediaType === 'video' ? 'Reel' : 'Post'} has been published!`);
      navigation.goBack();
    } catch (error: any) {
      console.error('Error creating post:', error);
      Alert.alert('Error', error.message || 'Failed to publish. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [content, mediaUri, mediaType, user, navigation]);

  const characterCount = content.length;
  const isPostDisabled = characterCount > MAX_CHARACTERS || isLoading || !mediaUri;

  if (!isMediaSelected) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#8B7CFF" />
      </View>
    );
  }

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
            <Text style={styles.postButtonText}>Share</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.mediaPreviewContainer}>
        {mediaUri && mediaType === 'image' && (
          <Image source={{ uri: mediaUri }} style={styles.mediaPreview} />
        )}
        {mediaUri && mediaType === 'video' && (
          <View style={[styles.mediaPreview, styles.videoPlaceholder]}>
            <Video size={48} color="#8B7CFF" />
            <Text style={styles.videoPlaceholderText}>Video Selected (Reel)</Text>
          </View>
        )}
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          multiline
          placeholder="Write a caption..."
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
  mediaPreviewContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#131929',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  mediaPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  videoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  videoPlaceholderText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
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