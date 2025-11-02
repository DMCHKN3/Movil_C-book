import React from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';

const Cuenta = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Datos Personales</Text>

        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <View style={styles.iconHead} />
              <View style={styles.iconBody} />
            </View>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.label}>NOMBRE</Text>
            <Text style={styles.value}>Juan Perez Perez</Text>

            <Text style={styles.label}>BOLETA</Text>
            <Text style={styles.value}>123456789</Text>

            <Text style={styles.label}>CORREO</Text>
            <Text style={styles.value}>texto@texto.com</Text>
          </View>
        </View>
      </ScrollView>

      <View style={{ padding: 16 }}>
        <Button title="Regresar al Inicio" onPress={() => navigation.navigate('Main')} />
      </View>
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
});

export default Cuenta;