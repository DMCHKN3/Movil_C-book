import React from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const CrearCuenta = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>CREA TU CUENTA</Text>

      <TextInput
        style={styles.input}
        placeholder="Número de boleta"
        placeholderTextColor="#999"
      />

      <View style={styles.rowInputs}>
        <TextInput
          style={styles.inputHalf}
          placeholder="Nombre(s)"
          placeholderTextColor="#999"
        />
        <TextInput
          style={styles.inputHalf}
          placeholder="Apellido(s)"
          placeholderTextColor="#999"
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Correo Electronico"
        placeholderTextColor="#999"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#999"
        secureTextEntry={true}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirmar Contraseña"
        placeholderTextColor="#999"
        secureTextEntry={true}
      />

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
          <Text style={styles.buttonText}>INICIO DE SESIÓN</Text>
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
