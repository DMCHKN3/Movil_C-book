// src/screens/HomeScreen.js
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { CheckBox } from 'react-native-web';

const IniciarSesion = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>INICIAR SESION</Text>
      <br></br>
      <form>
        <label>Usuario: <input type='text' placeholder='Ingrese su boleta: '></input></label><br></br>
        <label>Contraseña: <input type='text' placeholder='Ingrese su contraseña: '></input></label><br></br>
        <text>Mostrar Contraseña: </text><CheckBox value=''></CheckBox>
        <text>Recordar Usuario: </text><CheckBox value=''></CheckBox>
        <label>Captcha1</label> <br></br>
        <label>Captcha2</label><br></br>
        <Button title='Iniciar Sesión' type='submit' onPress={() => navigation.navigate('Main')}></Button>
      </form><br></br>
      <text>¿No tienes una cuenta?</text><br></br>
      <Button title="Crear Cuenta" onPress={() => navigation.navigate('CrearAcc')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold'
  }
});

export default IniciarSesion;
