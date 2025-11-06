import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import useScale from '../hooks/useScale';
import { LinearGradient } from 'expo-linear-gradient';

const Biblioteca = ({ navigation }) => {
  const libros = [
    { nombre: 'El Quijote', enBiblioteca: 20, enPrestamo: 3 },
    { nombre: '1984', enBiblioteca: 15, enPrestamo: 2 },
    { nombre: 'Cien Años de Soledad', enBiblioteca: 18, enPrestamo: 5 },
    { nombre: 'Don Juan Tenorio', enBiblioteca: 12, enPrestamo: 1 },
  ];

  const { s, vs, text } = useScale();

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.content, { paddingHorizontal: s(20) }]}>
        <Text style={[styles.title, { fontSize: text(28), marginBottom: vs(24) }]}>Libros Disponibles</Text>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={[styles.tableHeader, styles.col1]}>Nombre del{'\n'}Libro</Text>
            <Text style={[styles.tableHeader, styles.col2]}>Cantidad en{'\n'}Biblioteca</Text>
            <Text style={[styles.tableHeader, styles.col3]}>Cantidad en{'\n'}Prestamo</Text>
          </View>

          {libros.map((libro, index) => (
            <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.col1, { fontSize: text(12) }]}>{libro.nombre}</Text>
                <Text style={[styles.tableCell, styles.col2, { fontSize: text(12) }]}>{libro.enBiblioteca}</Text>
                <Text style={[styles.tableCell, styles.col3, { fontSize: text(12) }]}>{libro.enPrestamo}</Text>
            </View>
          ))}

          {[...Array(2)].map((_, index) => (
            <View key={`empty-${index}`} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col1]}></Text>
              <Text style={[styles.tableCell, styles.col2]}></Text>
              <Text style={[styles.tableCell, styles.col3]}></Text>
            </View>
          ))}
        </View>

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
    </ScrollView>
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
    paddingBottom: 100,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 40,
    fontFamily: 'Segoe UI',
  },
  table: {
    width: '100%',
    backgroundColor: '#3A3A3A',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 40,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#555',
  },
  tableHeader: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    padding: 12,
    textAlign: 'center',
    backgroundColor: '#2A2A2A',
    fontFamily: 'Segoe UI',
  },
  tableCell: {
    color: '#FFFFFF',
    fontSize: 12,
    padding: 12,
    textAlign: 'center',
    fontFamily: 'Segoe UI',
  },
  col1: {
    flex: 2.5,
    borderRightWidth: 1,
    borderRightColor: '#555',
  },
  col2: {
    flex: 2,
    borderRightWidth: 1,
    borderRightColor: '#555',
  },
  col3: {
    flex: 2,
  },
  buttonContainer: {
    width: '80%',
    marginTop: 20,
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

export default Biblioteca;
