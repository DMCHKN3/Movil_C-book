import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const CrearCuenta = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>CREAR CUENTA</Text>
      <form>
        <label>Usuario: <input type='text' placeholder='Ingrese su boleta: '></input></label><br></br>
        <label>Nombre: <input type='text' placeholder='Ingrese su nombre: '></input></label><br></br>
        <label>Apellidos: <input type='text' placeholder='Ingrese sus apellidos: '></input></label><br></br>
        <label>Correo Electrónico: <input type='text' placeholder='Ingrese su correo: '></input></label><br></br>
        <label>Contraseña: <input type='text' placeholder='Ingrese su contraseña: '></input></label><br></br>
        <label>Confirmar Contraseña: <input type='text' placeholder='Confirme su contraseña: '></input></label><br></br>
        <Button title='Crear Cuenta' type='submit' onPress={() => navigation.navigate('IniciarAcc')}></Button>
      </form>
      <br></br>
      <Button title="Regresar" onPress={() => navigation.navigate('IniciarAcc')} />
    </View>
  );};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22 }
});

export default CrearCuenta;
