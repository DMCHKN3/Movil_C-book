// src/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import IniciarSesion from '../screens/IniciarAcc';
import CrearCuenta from '../screens/CrearAcc';
import Main from '../screens/Main';
import Cuenta from '../screens/Cuenta';
import Biblioteca from '../screens/Biblioteca';
import Prestamos from '../screens/Prestamos';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="IniciarAcc" screenOptions={{headerShown: false,}}>
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

export default AppNavigator;
