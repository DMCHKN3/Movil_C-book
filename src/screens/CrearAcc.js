import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import useScale from '../hooks/useScale';
import { LinearGradient } from 'expo-linear-gradient';
import { validarformConBD } from '../validaciones/validacionForm';
import { crearUsuario } from '../../BD/authService';

const CrearCuenta = ({ navigation }) => {
  const { s, vs, text } = useScale();
  const [user, setUser] = useState('');
  const [contra, setContra] = useState('');
  const [repcontra, setRepContra] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [correo, setCorreo] = useState('');
  const [crearc, setCrearc] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

const handleCrearCuenta = async () => {
  if (isLoading) return; // Prevenir múltiples clicks
  
  setIsLoading(true);
  
  try {
    // Validar formulario incluyendo verificación de boleta
    const esValido = await validarformConBD(user, contra, repcontra, nombre, apellidos, correo);
    
    if (esValido) {
      // Crear usuario en Supabase
      const resultado = await crearUsuario({
        boleta: user,
        nombre: nombre,
        apellidos: apellidos,
        correo: correo,
        contra: contra
      });
      
      if (resultado.ok) {
        Alert.alert(
          'Éxito', 
          'Cuenta creada exitosamente. Por favor verifica tu correo electrónico.',
          [{
            text: 'OK',
            onPress: () => {
              // Limpiar formulario
              setUser('');
              setContra('');
              setRepContra('');
              setNombre('');
              setApellidos('');
              setCorreo('');
              setCrearc(true);
              // Navegar a la pantalla de inicio de sesión
              navigation.navigate('IniciarAcc');
            }
          }]
        );
      } else {
        Alert.alert('Error', resultado.message || 'Error al crear la cuenta');
      }
    }
  } catch (error) {
    console.error('Error en handleCrearCuenta:', error);
    Alert.alert('Error', 'Ocurrió un error inesperado. Intenta nuevamente.');
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

      <View style={styles.rowInputs}>
        <TextInput
          style={[styles.inputHalf, { height: vs(50), fontSize: text(16) }]}
          placeholder="Nombre(s)"
          placeholderTextColor="#999"
          value= {nombre}
        onChangeText={setNombre}
        />
        <TextInput
          style={[styles.inputHalf, { height: vs(50), fontSize: text(16) }]}
          placeholder="Apellido(s)"
          placeholderTextColor="#999"
          value= {apellidos}
        onChangeText={setApellidos}
        />
      </View>

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
        secureTextEntry={true}
        value= {contra}
        onChangeText={setContra}
      />

      <TextInput
        style={[styles.input, { height: vs(50), fontSize: text(16) }]}
        placeholder="Confirmar Contraseña"
        placeholderTextColor="#999"
        secureTextEntry={true}
        value= {repcontra}
        onChangeText={setRepContra}
      />

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
});

export default CrearCuenta;
