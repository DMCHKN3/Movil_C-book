import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Si usas Expo
import { validarLogin } from '../validaciones/validacionInicioss';

const IniciarSesion = ({ navigation }) => {
  const [user,setUser] = useState('');
  const [contra,setContra] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);


  const handleLogin = () => {
    const pasa = validarLogin(user,contra, setLoggedIn);
    if (pasa){
      setUser('');
      setContra('');
      navigation.navigate('Main')
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/fondo.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <Text style={styles.title}>INICIAR SESION</Text>

      <TextInput
        style={styles.input}
        placeholder="Usuario"
        placeholderTextColor="#999"
        value={user}
        onChangeText={setUser}
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#999"
        secureTextEntry={!mostrarContrasena}
        value={contra}
        onChangeText={setContra}
      />

      <TouchableOpacity 
        style={styles.checkboxContainer}
        onPress={() => setMostrarContrasena(!mostrarContrasena)}
      >
        <View style={styles.checkbox}>
          {mostrarContrasena && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>Mostrar contraseña</Text>
      </TouchableOpacity>

      <View style={styles.captchaBox}>
        <Text style={styles.captchaText}>CAPTCHA</Text>
      </View>

      <TextInput
        style={styles.captchaInput}
        placeholder="Captcha"
        placeholderTextColor="#999"
      />

      {/* Botón Inicio de Sesión */}
      <TouchableOpacity
        onPress={handleLogin}
        style={styles.buttonContainer}
      >
        <LinearGradient
          colors={['#5D2D58', '#C35EB9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          <Text style={styles.buttonText}>INICIAR SESIÓN</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate('CrearAcc')}
        style={styles.buttonContainer}
      >
        <LinearGradient
          colors={['#5D2D58', '#C35EB9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          <Text style={styles.buttonText}>CREAR CUENTA</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor opcional como fallback
    backgroundColor: '#111625',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 40,
    fontFamily: 'Segoe UI',
  },
  input: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#F2D9E3',
    backgroundColor: '#111625',
    paddingHorizontal: 20,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 15,
    fontFamily: 'Abel',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 20,
    marginTop: 5,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: '#5D8BF4',
    backgroundColor: '#5D8BF4',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  captchaBox: {
    width: '100%',
    height: 80,
    borderRadius: 15,
    backgroundColor: '#D9D9D9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  captchaText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '900',
    fontFamily: 'Segoe UI',
    lineHeight: 16,
  },
  captchaInput: {
    width: '60%',
    height: 45,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#F2D9E3',
    backgroundColor: '#111625',
    paddingHorizontal: 20,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 25,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 15,
  },
  gradientButton: {
    borderRadius: 20,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '350',
    fontFamily: 'Segoe UI',
  },
});

export default IniciarSesion;
