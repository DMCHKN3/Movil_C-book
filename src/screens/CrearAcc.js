import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import useScale from '../hooks/useScale';
import { crearCuentaConAuth, reenviarConfirmacion, insertTablaUsuarios } from '../../BD/supabaseAuthService';

const CrearCuenta = ({ navigation }) => {
  const { s, vs, text } = useScale();
  const [user, setUser] = useState('');
  const [contra, setContra] = useState('');
  const [repcontra, setRepContra] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [correo, setCorreo] = useState('');
  const [crearc, setCrearc] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [correoParaReenvio, setCorreoParaReenvio] = useState('');

const handleCrearCuenta = async () => {
  if (isLoading) return; // Prevenir múltiples clicks
  
  setIsLoading(true);
  
  try {
    // 1. Crear cuenta con Supabase Auth (con validación local)
    const resultado = await crearCuentaConAuth(user, correo, contra, repcontra);
    // 2. Si la cuenta Auth se creó exitosamente, insertar en tabla personalizada
    const tablaPersonal = await insertTablaUsuarios(user, correo);
    
    if (!resultado.ok && !tablaPersonal.ok) {
      console.error('Error creando cuenta y en tabla personalizada:', resultado.message, tablaPersonal.message);
      Alert.alert('Error', 'Ocurrió un error al crear la cuenta. Intenta nuevamente.');
      return;
    } else if (!resultado.ok) {
      console.error('Error creando cuenta:', resultado.message);
      Alert.alert('Error', resultado.message || 'Ocurrió un error al crear la cuenta. Intenta nuevamente.');
      return;
    } else if (!tablaPersonal.ok) {
      console.error('Error en tabla personalizada:', tablaPersonal.message);
      Alert.alert('Error', 'Cuenta creada pero ocurrió un error al guardar datos adicionales. Contacta soporte.');
      return;
    }

    // 3. Ambas operaciones exitosas
    setCorreoParaReenvio(correo); // Guardar correo para posible reenvío
    Alert.alert(
      'Éxito', 
      resultado.message || 'Cuenta creada exitosamente. Revisa tu correo electrónico para verificar tu cuenta.',
      [
        {
          text: 'OK',
          onPress: () => {
            // Limpiar formulario
            setUser('');
            setContra('');
            setRepContra('');
            setCorreo('');
            setCrearc(true);
            // Navegar a la pantalla de inicio de sesión
            navigation.navigate('IniciarAcc');
          }
        },
        {
          text: '¿No recibiste el correo?',
          onPress: () => handleReenviarCorreo(correo),
          style: 'cancel'
        }
      ] 
    );
  } catch (error) {
    console.error('Error en handleCrearCuenta:', error);
    Alert.alert('Error', 'Ocurrió un error inesperado. Intenta nuevamente.');
  } finally {
    setIsLoading(false);
  }
};

const handleReenviarCorreo = async (email) => {
  const correoAReenviar = email || correoParaReenvio;
  
  if (!correoAReenviar) {
    Alert.alert('Error', 'No hay un correo disponible para reenviar');
    return;
  }

  setIsLoading(true);
  
  try {
    const resultado = await reenviarConfirmacion(correoAReenviar);
    
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
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={[styles.formContainer, { paddingHorizontal: s(24) }]}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={[styles.title, { fontSize: text(26) }]}>Crear Cuenta</Text>
          <View style={styles.titleUnderline} />
          <Text style={styles.subtitle}>Únete a nuestra comunidad</Text>
        </View>

        {/* Input Fields */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Número de Boleta</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>🎫</Text>
            <TextInput
              style={[styles.input, { fontSize: text(15) }]}
              placeholder="Ingresa tu boleta"
              placeholderTextColor="#6B7280"
              value={user}
              onChangeText={setUser}
            />
          </View>
        </View>

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
              placeholder="Crea una contraseña"
              placeholderTextColor="#6B7280"
              secureTextEntry={!mostrarContrasena}
              value={contra}
              onChangeText={setContra}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Confirmar Contraseña</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>🔐</Text>
            <TextInput
              style={[styles.input, { fontSize: text(15) }]}
              placeholder="Repite tu contraseña"
              placeholderTextColor="#6B7280"
              secureTextEntry={!mostrarContrasena}
              value={repcontra}
              onChangeText={setRepContra}
            />
          </View>
        </View>

        {/* Checkbox */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setMostrarContrasena(!mostrarContrasena)}
        >
          <View style={[styles.checkbox, mostrarContrasena && styles.checkboxChecked]}>
            {mostrarContrasena && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>Mostrar contraseñas</Text>
        </TouchableOpacity>

        {/* Buttons */}
        <TouchableOpacity
          onPress={handleCrearCuenta}
          style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={[styles.primaryButtonText, { fontSize: text(16) }]}>Crear Cuenta</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('IniciarAcc')}
          style={styles.secondaryButton}
          activeOpacity={0.8}
        >
          <Text style={[styles.secondaryButtonText, { fontSize: text(15) }]}>Ya tengo cuenta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111625',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  formContainer: {
    backgroundColor: '#1A1F2E',
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: '#353A4D',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 26,
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
  subtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252A3D',
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
    height: 50,
    color: '#FFFFFF',
    fontSize: 15,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#C35EB9',
    backgroundColor: 'transparent',
    marginRight: 10,
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
    fontSize: 14,
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

export default CrearCuenta;
