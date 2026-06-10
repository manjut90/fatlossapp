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

console.log('DEVICE IS DEVICE:', Device.isDevice);
export async function registerForPushNotificationsAsync() {
  
  const permissions =
  await Notifications.getPermissionsAsync();

console.log(
  'PERMISSIONS:',
  JSON.stringify(permissions, null, 2)
);
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
      title: 'Your mission is ready 🔥',
      body: 'Open LFGO and complete today’s mission.',
      sound: true,
    },

    trigger: {
  type: Notifications.SchedulableTriggerInputTypes.DAILY,
  hour: 7,
  minute: 0,
},
  });

  console.log(
    '✅ 7AM mission reminder scheduled'
  );
}
export async function scheduleNoonReminder() {
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
},
  });

  console.log(
    '✅ Noon reminder scheduled'
  );
}