import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Alert, ActivityIndicator, BackHandler } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import useScale from '../hooks/useScale';
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
      style={styles.container}
      resizeMode="cover"
    >
      <View style={[styles.formContainer, { paddingHorizontal: s(30) }]}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={[styles.title, { fontSize: text(28) }]}>Iniciar Sesión</Text>
          <View style={styles.titleUnderline} />
        </View>

        {/* Input Fields */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Correo Electrónico</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>✉️</Text>
            <TextInput
              style={[styles.input, { fontSize: text(15) }]}
              placeholder="ejemplo@correo.com"
              placeholderTextColor="#6B7280"
              keyboardType="email-address"
              autoCapitalize="none"
              value={correo}
              onChangeText={setCorreo}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Contraseña</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={[styles.input, { fontSize: text(15) }]}
              placeholder="Tu contraseña"
              placeholderTextColor="#6B7280"
              secureTextEntry={!mostrarContrasena}
              value={contra}
              onChangeText={setContra}
            />
          </View>
        </View>

        {/* Checkboxes */}
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setMostrarContrasena(!mostrarContrasena)}
          >
            <View style={[styles.checkbox, mostrarContrasena && styles.checkboxChecked]}>
              {mostrarContrasena && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.checkboxLabel, { fontSize: text(13) }]}>Mostrar contraseña</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setMantenerSesion(!mantenerSesion)}
          >
            <View style={[styles.checkbox, mantenerSesion && styles.checkboxChecked]}>
              {mantenerSesion && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.checkboxLabel, { fontSize: text(13) }]}>Mantener sesión</Text>
          </TouchableOpacity>
        </View>

        {/* Captcha */}
        <SlideToUnlock
          onEndReached={() => {
            setCaptchaVerif(true);
          }}
          containerStyle={[styles.captchaBox, { height: vs(60) }]}
          sliderElement={
            <View style={styles.sliderButton}>
              <Text style={[styles.sliderText, { fontSize: text(20) }]}>→</Text>
            </View>
          }
        >
          <Text style={[styles.captchaText, { fontSize: text(13) }]}>
            {captchaVerif ? <Text style={{ fontWeight: 'bold' }}>✓ Verificado</Text> : 'Desliza para verificar'}
          </Text>
        </SlideToUnlock>

        {/* Buttons */}
        <TouchableOpacity
          onPress={handleLogin}
          style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={[styles.primaryButtonText, { fontSize: text(16) }]}>Iniciar Sesión</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('CrearAcc')}
          style={styles.secondaryButton}
          activeOpacity={0.8}
        >
          <Text style={[styles.secondaryButtonText, { fontSize: text(15) }]}>Crear nueva cuenta</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111625',
    justifyContent: 'center',
  },
  formContainer: {
    backgroundColor: 'rgba(17, 22, 37, 0.92)',
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: '#353A4D',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  titleUnderline: {
    height: 3,
    width: 50,
    backgroundColor: '#C35EB9',
    borderRadius: 2,
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E2333',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#353A4D',
    paddingHorizontal: 16,
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 52,
    color: '#FFFFFF',
    fontSize: 15,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#C35EB9',
    backgroundColor: 'transparent',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#C35EB9',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    color: '#9CA3AF',
    fontSize: 13,
  },
  captchaBox: {
    width: '100%',
    height: 60,
    borderRadius: 14,
    backgroundColor: '#1E2333',
    borderWidth: 1,
    borderColor: '#353A4D',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  captchaText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  sliderButton: {
    width: 50,
    height: '100%',
    backgroundColor: '#C35EB9',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  primaryButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#C35EB9',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    width: '100%',
    height: 52,
    backgroundColor: 'transparent',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#C35EB9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#C35EB9',
    fontSize: 15,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default IniciarSesion;
