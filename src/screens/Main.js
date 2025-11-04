import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const Main = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.bienvenida}>Bienvenido</Text>
        <Text style={styles.usuario}>(usuario)</Text>

        <Text style={styles.actividadesLabel}>Actividades Recientes</Text>

        <View style={styles.row}>
          <TouchableOpacity style={styles.caja}>
            <Text style={styles.cajaTexto}>SOL 1</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.caja}>
            <Text style={styles.cajaTexto}>SOL 2</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.caja}>
            <Text style={styles.cajaTexto}>SOL 3</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.estadoLabel}>ESTADO GENERAL</Text>

        <View style={styles.estadoCard}>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Biblioteca')}
          style={styles.buttonContainer}
        >
          <LinearGradient
            colors={['#5D2D58', '#C35EB9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.buttonText}>Ir a Biblioteca</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Prestamos')}
          style={styles.buttonContainer}
        >
          <LinearGradient
            colors={['#5D2D58', '#C35EB9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.buttonText}>Ir a Prestamos</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Cuenta')}
          style={styles.buttonContainer}
        >
          <LinearGradient
            colors={['#5D2D58', '#C35EB9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.buttonText}>Ir a Cuenta</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1F2E',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 100,
    alignItems: 'flex-start',
  },
  bienvenida: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Segoe UI',
  },
  usuario: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 40,
    fontFamily: 'Segoe UI',
  },
  actividadesLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 20,
    fontFamily: 'Segoe UI',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 20,
    marginBottom: 50,
    width: '100%',
  },
  caja: {
    backgroundColor: '#D9D9D9',
    width: 75,
    height: 75,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cajaTexto: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 12,
    fontFamily: 'Segoe UI',
  },
  estadoLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    marginBottom: 15,
    fontFamily: 'Segoe UI',
    letterSpacing: 1,
  },
  estadoCard: {
    backgroundColor: '#D9D9D9',
    width: '100%',
    height: 200,
    borderRadius: 0,
    marginBottom: 40,
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

export default Main;
