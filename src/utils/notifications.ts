import { Platform } from 'react-native';

// Stub implementations for non-Android platforms to prevent loading native modules
export async function registerForPushNotificationsAsync() {
  if (Platform.OS !== 'android') {
    console.log('Skipping push notification registration on non-Android platform.');
    return;
  }

  // Lazily import only on Android
  const Notifications = await import('expo-notifications');
  const Device = await import('expo-device');
  const { supabase } = await import('../services/supabase');

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  async function savePushToken(token: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.log('No user found, skipping push token save.');
      return;
    }

    const { error } = await supabase.from('push_tokens').upsert(
      {
        user_id: user.id,
        token: token,
        platform: Platform.OS,
      },
      { onConflict: 'token' }
    );

    if (error) {
      console.error('❌ Error saving push token:', error);
    } else {
      console.log('✅ Push token saved');
    }
  }

  const permissions = (await Notifications.getPermissionsAsync()) as any;
  console.log('PERMISSIONS:', JSON.stringify(permissions, null, 2));

  if (Device.isDevice) {
    const existingStatus = permissions.status;
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = (await Notifications.requestPermissionsAsync()) as any;
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notification!');
      return;
    }
  }

  try {
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Expo Push Token:', token);
    await savePushToken(token);
  } catch (e) {
    console.error('❌ Failed to get or save push token', e);
  }

  Notifications.addPushTokenListener(async (newToken) => {
    console.log('Push token refreshed:', newToken.data);
    await savePushToken(newToken.data);
  });

  Notifications.setNotificationChannelAsync(
    'default',
    {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#F59E0B',
    }
  );
}

export async function scheduleDailyReminder() {
  if (Platform.OS !== 'android') return;
  const Notifications = await import('expo-notifications');

  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Your mission is ready 🔥',
      body: 'Open LFGO and complete today’s mission.',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 7,
      minute: 0,
    } as any,
  });

  console.log('✅ 7AM mission reminder scheduled');
}

export async function scheduleNoonReminder() {
  if (Platform.OS !== 'android') return;
  const Notifications = await import('expo-notifications');

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Still time today 💪',
      body: 'Your daily mission is waiting.',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 12,
      minute: 0,
    } as any,
  });

  console.log('✅ Noon reminder scheduled');
}