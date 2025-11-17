// src/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useUser } from '../context/UserContext';

import IniciarSesion from '../screens/IniciarAcc';
import CrearCuenta from '../screens/CrearAcc';
import Main from '../screens/Main';
import Cuenta from '../screens/Cuenta';
import Biblioteca from '../screens/Biblioteca';
import Prestamos from '../screens/Prestamos';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useUser();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C35EB9" />
      </View>
    );
  }

  const initialRouteName = isAuthenticated() ? "Main" : "IniciarAcc";

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{headerShown: false,}}>
        <Stack.Screen name="IniciarAcc" component={IniciarSesion} />
        <Stack.Screen name="CrearAcc" component={CrearCuenta} />
        <Stack.Screen name="Main" component={Main} />
        <Stack.Screen name="Cuenta" component={Cuenta} />
        <Stack.Screen name="Biblioteca" component={Biblioteca} />
        <Stack.Screen name="Prestamos" component={Prestamos} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111625',
  },
});

export default AppNavigator;
