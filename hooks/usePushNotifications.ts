import { useState, useEffect, useRef } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';

// Configuração do comportamento da notificação quando a aplicação está aberta
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function usePushNotifications(userId?: string) {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notification, setNotification] = useState<Notifications.Notification | undefined>();
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    if (!userId) return;

    registerForPushNotificationsAsync(userId).then(token => setExpoPushToken(token));

    // Ouvinte para quando a notificação é recebida com a app aberta
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    // Ouvinte para quando o utilizador clica na notificação
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notificação clicada pelo utilizador:', response);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [userId]);

  return { expoPushToken, notification };
}

async function registerForPushNotificationsAsync(userId: string) {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Permissão para notificações push negada!');
      return;
    }

    try {
      const pushTokenData = await Notifications.getExpoPushTokenAsync();
      token = pushTokenData.data;

      // Guarda ou atualiza o token na tabela user_tokens do Supabase
      await supabase
        .from('user_tokens')
        .upsert({ user_id: userId, token, updated_at: new Date() }, { onConflict: 'user_id,token' });
    } catch (e) {
      console.error('Erro ao obter o token push:', e);
    }
  } else {
    console.log('As notificações push requerem um dispositivo físico.');
  }

  return token;
}