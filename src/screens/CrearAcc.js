import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import useScale from '../hooks/useScale';
import { LinearGradient } from 'expo-linear-gradient';
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
    <View style={[styles.container, { paddingHorizontal: s(30) }] }>
      <Text style={[styles.title, { fontSize: text(24), marginBottom: vs(40) }]}>CREA TU CUENTA</Text>

      <TextInput
        style={[styles.input, { height: vs(50), fontSize: text(16) }]}
        placeholder="Número de boleta"
        placeholderTextColor="#999"
        value= {user}
        onChangeText={setUser}
      />

      <TextInput
        style={[styles.input, { height: vs(50), fontSize: text(16) }]}
        placeholder="Correo Electronico"
        placeholderTextColor="#999"
        keyboardType="email-address"
        value= {correo}
        onChangeText={setCorreo}
      />

      <TextInput
        style={[styles.input, { height: vs(50), fontSize: text(16) }]}
        placeholder="Contraseña"
        placeholderTextColor="#999"
        secureTextEntry={!mostrarContrasena}
        value= {contra}
        onChangeText={setContra}
      />

      <TextInput
        style={[styles.input, { height: vs(50), fontSize: text(16) }]}
        placeholder="Confirmar Contraseña"
        placeholderTextColor="#999"
        secureTextEntry={!mostrarContrasena}
        value= {repcontra}
        onChangeText={setRepContra}
      />

      <TouchableOpacity 
        style={styles.checkboxContainer}
        onPress={() => setMostrarContrasena(!mostrarContrasena)}
      >
        <View style={[styles.checkbox, mostrarContrasena && styles.checkboxChecked]}>
          {mostrarContrasena && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>Mostrar contraseñas</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleCrearCuenta}
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
            <Text style={styles.buttonText}>Crear Cuenta</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate('IniciarAcc')}
        style={styles.buttonContainer}
      >
        <LinearGradient
          colors={['#5D2D58', '#C35EB9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          <Text style={styles.buttonText}>Volver a Iniciar Sesión</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
  },
  inputHalf: {
    width: '48%',
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#F2D9E3',
    backgroundColor: '#111625',
    paddingHorizontal: 20,
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Abel',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 10,
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
});

export default CrearCuenta;
