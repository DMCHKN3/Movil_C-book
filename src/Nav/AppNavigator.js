// src/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import IniciarSesion from '../screens/IniciarAcc';
import CrearCuenta from '../screens/CrearAcc';
import Main from '../screens/Main';
import Cuenta from '../screens/Cuenta';
import Biblioteca from '../screens/Biblioteca';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="IniciarAcc">
        <Stack.Screen name="IniciarAcc" component={IniciarSesion} options={{ title: 'Iniciar Sesion' }} />
        <Stack.Screen name="CrearAcc" component={CrearCuenta} options={{ title: 'Crear Cuenta' }} />
        <Stack.Screen name="Main" component={Main} options={{ title: 'Main' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
