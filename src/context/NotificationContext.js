import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { savePushToken, removePushToken } from '../services/notificationService';
import { useUser } from './UserContext';

const PUSH_TOKEN_KEY = 'expo_push_token';

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
  const [pushStatus, setPushStatus] = useState('idle');
  const [pushError, setPushError] = useState(null);
  const notificationListener = useRef();
  const responseListener = useRef();
  const tokenRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const registerForPushNotifications = async () => {
      if (!Device.isDevice) {
        setPushStatus('no_device');
        return;
      }

      setPushStatus('requesting_permission');

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
        setPushStatus('permission_denied');
        return;
      }

      setPushStatus('getting_token');

      try {
        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId,
        });
        tokenRef.current = tokenData.data;

        if (isMounted) {
          const storedToken = await AsyncStorage.getItem(PUSH_TOKEN_KEY);

          if (tokenData.data === storedToken) {
            setPushStatus('registered');
            return;
          }

          const boleta = getUserBoleta();
          if (boleta) {
            setPushStatus('registering');
            const result = await savePushToken(tokenData.data, boleta);
            if (result?.ok) {
              await AsyncStorage.setItem(PUSH_TOKEN_KEY, tokenData.data);
              setPushStatus('registered');
            } else {
              setPushStatus('error');
              setPushError(result?.error || 'Error al guardar token');
            }
          }
        }
      } catch (error) {
        setPushStatus('error');
        setPushError(error?.message || error?.toString() || 'Error desconocido');
      }
    };

    const boleta = perfil?.boleta;
    if (boleta) {
      registerForPushNotifications();
    } else {
      setPushStatus('not_logged_in');
      AsyncStorage.removeItem(PUSH_TOKEN_KEY).catch(() => {});
      if (tokenRef.current) {
        removePushToken(tokenRef.current);
        tokenRef.current = null;
      }
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
    <NotificationContext.Provider
      value={{ notificationData, clearNotificationData, tokenRef, pushStatus, pushError }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
