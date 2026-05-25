
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

export const initPush = async () => {
  if (Capacitor.getPlatform() === 'web') return;

  let perm = await PushNotifications.checkPermissions();
  if (perm.receive === 'prompt') {
    perm = await PushNotifications.requestPermissions();
  }

  if (perm.receive !== 'granted') {
    console.error('Push permission not granted');
    return;
  }

  await PushNotifications.register();

  PushNotifications.addListener('registration', (token) => {
    console.log('Push token:', token.value);
    // Here you would typically save the token to your Supabase profiles table
  });

  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Notification received:', notification);
  });
};
