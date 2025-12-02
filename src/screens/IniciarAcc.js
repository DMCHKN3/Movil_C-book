import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Alert, ActivityIndicator, BackHandler } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import useScale from '../hooks/useScale';
import { LinearGradient } from 'expo-linear-gradient';
import { iniciarSesionConAuth, reenviarConfirmacion } from '../../BD/supabaseAuthService';
import { useUser } from '../context/UserContext';
import SlideToUnlock from 'react-native-slide-to-unlock';

const IniciarSesion = ({ navigation }) => {
  const { login } = useUser();
  const [correo, setCorreo] = useState('');
  const [contra, setContra] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [mantenerSesion, setMantenerSesion] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { s, vs, ms, text } = useScale();
  const [captchaVerif, setCaptchaVerif] = useState(false);

  // Bloquear botón de retroceso para evitar acceder a sesión anterior
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // Retornar true bloquea la navegación hacia atrás
        // pero NO bloquea minimizar/salir de la app
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription.remove();
    }, [])
  );

  const handleLogin = async () => {
    if (isLoading) return; // Prevenir múltiples clicks

    if (!captchaVerif) {
      Alert.alert('Verificación requerida', 'Por favor completa la verificación de captcha deslizando el control.');
      return;
      setCaptchaVerif(false);
    }

    setIsLoading(true);

    try {
      // Iniciar sesión con Supabase Auth
      const resultado = await iniciarSesionConAuth(correo, contra);

      if (resultado.ok) {
        setLoggedIn(true);
        // Guardar usuario en el contexto
        login(resultado.user, resultado.perfil);

        // Guardar sesión si está marcada la opción
        if (mantenerSesion) {
          try {
            await AsyncStorage.setItem('userSession', JSON.stringify({
              user: resultado.user,
              perfil: resultado.perfil,
              session: resultado.session,
              timestamp: Date.now()
            }));
            console.log('Sesión guardada permanentemente');
          } catch (error) {
            console.error('Error guardando sesión:', error);
          }
        }

        Alert.alert(
          'Éxito',
          'Sesión iniciada correctamente',
          [{
            text: 'OK',
            onPress: () => {
              setCorreo('');
              setContra('');
              navigation.navigate('Main');
            }
          }]
        );
      } else {
        // Mostrar error y opción de reenviar correo si no está confirmado
        if (resultado.needsEmailConfirmation) {
          Alert.alert(
            'Correo no confirmado',
            resultado.message,
            [
              { text: 'Cancelar', style: 'cancel' },
              {
                text: 'Reenviar correo',
                onPress: () => handleReenviarCorreo(correo)
              }
            ]
          );
        } else {
          Alert.alert('Error', resultado.message || 'Error al iniciar sesión');
        }
      }
    } catch (error) {
      console.error('Error en handleLogin:', error);
      Alert.alert('Error', 'Ocurrió un error inesperado. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReenviarCorreo = async (email) => {
    if (!email) {
      Alert.alert('Error', 'Por favor ingresa tu correo electrónico');
      return;
    }

    setIsLoading(true);

    try {
      const resultado = await reenviarConfirmacion(email);

      if (resultado.ok) {
        Alert.alert('Éxito', resultado.message || 'Correo de confirmación reenviado exitosamente');
      } else {
        Alert.alert('Error', resultado.message || 'Error al reenviar el correo de confirmación');
      }
    } catch (error) {
      console.error('Error reenviando correo:', error);
      Alert.alert('Error', 'Ocurrió un error al reenviar el correo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/fondo.png')}
      style={[styles.container, { paddingHorizontal: s(30) }]}
      resizeMode="cover"
    >
      <Text style={[styles.title, { fontSize: text(24), marginBottom: vs(40) }]}>INICIAR SESION</Text>

      <TextInput
        style={[styles.input, { height: vs(50), fontSize: text(16) }]}
        placeholder="Correo Electrónico"
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
        value={correo}
        onChangeText={setCorreo}
      />

      <TextInput
        style={[styles.input, { height: vs(50), fontSize: text(16) }]}
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

      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => setMantenerSesion(!mantenerSesion)}
      >
        <View style={[styles.checkbox, mantenerSesion && styles.checkboxChecked]}>
          {mantenerSesion && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>Mantener sesión iniciada</Text>
      </TouchableOpacity>

      <SlideToUnlock
        onEndReached={() => {
          setCaptchaVerif(true);
        }}
        containerStyle={[styles.captchaBox, {height: vs(80)}]}
        sliderElement={
          <View style={styles.sliderButton}>
            <Text style={styles.sliderText}>→</Text>
          </View>
        }
      >
        <Text style={[styles.captchaText, { fontSize: text(13), lineHeight: 16 }]}>
          Desliza para verificar que no eres un robot
        </Text>
      </SlideToUnlock>

      {/* Botón Inicio de Sesión */}
      <TouchableOpacity
        onPress={handleLogin}
        style={[styles.buttonContainer, isLoading && styles.buttonDisabled]}
        disabled={isLoading}
      >
        <LinearGradient
          colors={isLoading ? ['#666', '#888'] : ['#5D2D58', '#C35EB9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={[styles.buttonText, { fontSize: text(16) }]}>INICIAR SESIÓN</Text>
          )}
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
          <Text style={[styles.buttonText, { fontSize: text(16) }]}>CREAR CUENTA</Text>
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
    backgroundColor: 'transparent',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#5D8BF4',
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
    backgroundColor: '#2A2F42',
    borderWidth: 2,
    borderColor: '#5D8BF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    overflow: 'hidden',
  },
  captchaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Segoe UI',
    lineHeight: 16,
    textAlign: 'center',
  },
  sliderButton: {
    width: 60,
    height: '100%',
    backgroundColor: '#5D8BF4',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  sliderText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
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
  buttonDisabled: {
    opacity: 0.7,
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
