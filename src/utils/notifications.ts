import * as Notifications from 'expo-notifications';

import * as Device from 'expo-device';

import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync() {
  if (Device.isDevice) {
    const {
      status: existingStatus,
    } =
      await Notifications.getPermissionsAsync();

    let finalStatus =
      existingStatus;

    if (
      existingStatus !== 'granted'
    ) {
      const {
        status,
      } =
        await Notifications.requestPermissionsAsync();

      finalStatus = status;
    }

    if (
      finalStatus !== 'granted'
    ) {
      return;
    }
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync(
      'default',
      {
        name: 'default',

        importance:
          Notifications.AndroidImportance.MAX,

        vibrationPattern: [
          0,
          250,
          250,
          250,
        ],

        lightColor:
          '#F59E0B',
      }
    );
  }
}

export async function scheduleDailyReminder() {
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
  title: 'LFGO TEST 🚀',
  body: 'If you see this, notifications are working.',
  sound: true,
},

    trigger: {
  type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
  seconds: 30,
},
  });
}