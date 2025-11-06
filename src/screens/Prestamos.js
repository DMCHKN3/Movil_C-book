import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import useScale from '../hooks/useScale';
import { LinearGradient } from 'expo-linear-gradient';

const Prestamos = ({ navigation }) => {
  const prestamos = [
    { libro: 'El Quijote', solicitud: '01/01/2023', devolucion: '06/01/2023', dias: 1 },
    { libro: '1984', solicitud: '05/01/2023', devolucion: '10/01/2023', dias: 5 },
  ];

  const { s, vs, text } = useScale();

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.content, { paddingHorizontal: s(20) }]}>
        <Text style={[styles.title, { fontSize: text(28), marginBottom: vs(24) }]}>Prestamos Actuales</Text>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={[styles.tableHeader, styles.col1]}>Nombre de{'\n'}Libro</Text>
            <Text style={[styles.tableHeader, styles.col2]}>Dia de{'\n'}solicitud</Text>
            <Text style={[styles.tableHeader, styles.col3]}>Fecha para{'\n'}entrega</Text>
            <Text style={[styles.tableHeader, styles.col4]}>Dias{'\n'}restantes</Text>
          </View>

          {prestamos.map((prestamo, index) => (
            <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.col1, { fontSize: text(12) }]}>{prestamo.libro}</Text>
                <Text style={[styles.tableCell, styles.col2, { fontSize: text(12) }]}>{prestamo.solicitud}</Text>
                <Text style={[styles.tableCell, styles.col3, { fontSize: text(12) }]}>{prestamo.devolucion}</Text>
                <Text style={[styles.tableCell, styles.col4, { fontSize: text(12) }]}>{prestamo.dias}</Text>
            </View>
          ))}

          {[...Array(3)].map((_, index) => (
            <View key={`empty-${index}`} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col1]}></Text>
              <Text style={[styles.tableCell, styles.col2]}></Text>
              <Text style={[styles.tableCell, styles.col3]}></Text>
              <Text style={[styles.tableCell, styles.col4]}></Text>
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
    borderRightWidth: 1,
    borderRightColor: '#555',
  },
  col4: {
    flex: 1.5,
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

export default Prestamos;