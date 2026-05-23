import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import SupportFAB from '../components/SupportFAB';
import SessionCaptcha from '../components/SessionCaptcha';

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

const AUTH_ROUTES = ['Main', 'Cuenta', 'Biblioteca', 'Prestamos'];

function getCurrentRouteName(state) {
  if (!state) return null;
  const route = state.routes[state.index];
  if (route.state) {
    return getCurrentRouteName(route.state);
  }
  return route.name;
}

const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useUser();
  const { theme } = useTheme();
  const navRef = useRef(null);
  const [currentRoute, setCurrentRoute] = useState(null);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  const initialRouteName = isAuthenticated() ? 'Main' : 'IniciarAcc';
  const showFAB = AUTH_ROUTES.includes(currentRoute);

  return (
    <NavigationContainer
      ref={navRef}
      onStateChange={(state) => {
        const name = getCurrentRouteName(state);
        setCurrentRoute(name);
      }}
    >
      <NotificationHandler />
      <SessionCaptcha />
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
      {showFAB && <SupportFAB />}
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
