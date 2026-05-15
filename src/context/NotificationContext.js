import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { savePushToken, removePushToken } from '../services/notificationService';
import { useUser } from './UserContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications debe ser usado dentro de NotificationProvider');
  }
  return context;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const NotificationProvider = ({ children }) => {
  const { perfil, getUserBoleta } = useUser();
  const [notificationData, setNotificationData] = useState(null);
  const notificationListener = useRef();
  const responseListener = useRef();
  const tokenRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const registerForPushNotifications = async () => {
      if (!Device.isDevice) {
        console.log('Push notifications require a physical device');
        return;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Push notification permission not granted');
        return;
      }

      try {
        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId,
        });
        tokenRef.current = tokenData.data;

        if (isMounted) {
          const boleta = getUserBoleta();
          if (boleta) {
            await savePushToken(tokenData.data, boleta);
          }
        }
      } catch (error) {
        console.error('Error getting push token:', error);
      }
    };

    const boleta = perfil?.boleta;
    if (boleta) {
      registerForPushNotifications();
    } else if (tokenRef.current) {
      removePushToken(tokenRef.current);
      tokenRef.current = null;
    }

    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
      }
    );

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        if (data) {
          setNotificationData(data);
        }
      }
    );

    return () => {
      isMounted = false;
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [perfil?.boleta]);

  const clearNotificationData = () => {
    setNotificationData(null);
  };

  return (
    <NotificationContext.Provider value={{ notificationData, clearNotificationData, tokenRef }}>
      {children}
    </NotificationContext.Provider>
  );
};
