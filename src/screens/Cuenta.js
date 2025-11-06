import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import useScale from '../hooks/useScale';
import { LinearGradient } from 'expo-linear-gradient';

const Cuenta = ({ navigation }) => {
  const { s, vs, text } = useScale();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: s(20) }] }>
        <Text style={[styles.title, { fontSize: text(28), marginBottom: vs(24) }]}>Datos Personales</Text>

        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <View style={[styles.iconCircle, { width: s(60), height: s(60), borderRadius: s(30) }]}>
              <View style={[styles.iconHead, { width: s(20), height: s(20), borderRadius: s(10), top: s(12) }]} />
              <View style={[styles.iconBody, { width: s(35), height: s(35), borderRadius: s(20), bottom: -s(10) }]} />
            </View>
          </View>

          <View style={styles.infoContainer}>
            <Text style={[styles.label, { fontSize: text(16) }]}>NOMBRE</Text>
            <Text style={[styles.value, { fontSize: text(16) }]}>Juan Perez Perez</Text>

            <Text style={[styles.label, { fontSize: text(16) }]}>BOLETA</Text>
            <Text style={[styles.value, { fontSize: text(16) }]}>123456789</Text>

            <Text style={[styles.label, { fontSize: text(16) }]}>CORREO</Text>
            <Text style={[styles.value, { fontSize: text(16) }]}>texto@texto.com</Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        onPress={() => navigation.navigate('Main')}
        style={styles.buttonContainer}
      >
        <LinearGradient
          colors={['#5D2D58', '#C35EB9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          <Text style={styles.buttonText}>Regresar al Menu Principal</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111625',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 40,
    fontFamily: 'Segoe UI',
  },
  card: {
    backgroundColor: '#D3D3D3',
    width: '90%',
    borderRadius: 20,
    padding: 25,
    minHeight: 400,
  },
  iconContainer: {
    marginBottom: 30,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  iconHead: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#000000',
    position: 'absolute',
    top: 12,
  },
  iconBody: {
    width: 35,
    height: 35,
    borderRadius: 20,
    backgroundColor: '#000000',
    position: 'absolute',
    bottom: -10,
  },
  infoContainer: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 15,
    marginBottom: 5,
    fontFamily: 'Segoe UI',
  },
  value: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 10,
    fontFamily: 'Segoe UI',
  },
  buttonContainer: {
    width: '80%',
    alignSelf: 'center',
    marginBottom: 20,
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

export default Cuenta;