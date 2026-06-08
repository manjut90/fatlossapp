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
      title:
        'Daily Check-In 🔥',

      body:
        'Track your progress today and protect your streak.',

      sound: true,
    },

    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 8,
      minute: 0,
    },
  });
}