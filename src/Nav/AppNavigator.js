import React, { useEffect } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';

import IniciarSesion from '../screens/IniciarAcc';
import CrearCuenta from '../screens/CrearAcc';
import Main from '../screens/Main';
import Cuenta from '../screens/Cuenta';
import Biblioteca from '../screens/Biblioteca';
import Prestamos from '../screens/Prestamos';
import Soporte from '../screens/Soporte';
import RecuperarContra from '../screens/RecuperarContra';

const Stack = createNativeStackNavigator();

const NotificationHandler = () => {
  const navigation = useNavigation();
  const { notificationData, clearNotificationData } = useNotifications();

  useEffect(() => {
    if (notificationData) {
      const { screen, ...rest } = notificationData;
      if (screen) {
        navigation.navigate(screen, rest);
      }
      clearNotificationData();
    }
  }, [notificationData]);

  return null;
};

const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useUser();
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  const initialRouteName = isAuthenticated() ? 'Main' : 'IniciarAcc';

  return (
    <NavigationContainer>
      <NotificationHandler />
      <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="IniciarAcc" component={IniciarSesion} />
        <Stack.Screen name="CrearAcc" component={CrearCuenta} />
        <Stack.Screen name="Main" component={Main} />
        <Stack.Screen name="Cuenta" component={Cuenta} />
        <Stack.Screen name="Biblioteca" component={Biblioteca} />
        <Stack.Screen name="Prestamos" component={Prestamos} />
        <Stack.Screen name="Soporte" component={Soporte} />
        <Stack.Screen name="RecuperarContra" component={RecuperarContra} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppNavigator;
