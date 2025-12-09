import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import useScale from '../hooks/useScale';
import { LinearGradient } from 'expo-linear-gradient';
import { getLibros } from '../../tablas/libros';

const Biblioteca = ({ navigation }) => {
  const [libros, setLibros] = useState([]);
  const [loading, setLoading] = useState(true);

  const { s, vs, text } = useScale();

  useEffect(() => {
    const fetchLibros = async () => {
      try {
        setLoading(true);
        const data = await getLibros();
        setLibros(data);
      } catch (error) {
        console.error('Error cargando libros:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLibros();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#C35EB9" />
        <Text style={styles.loadingText}>Cargando libros...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.content, { paddingHorizontal: s(20) }]}>
        <Text style={[styles.title, { fontSize: text(28), marginBottom: vs(24) }]}>Libros Disponibles</Text>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={[styles.tableHeader, styles.column]}>ID</Text>
            <Text style={[styles.tableHeader, styles.column]}>Nombre del{'\n'}Libro</Text>
            <Text style={[styles.tableHeader, styles.column]}>Clasificación</Text>
            <Text style={[styles.tableHeader, styles.column]}>Tipo del Material</Text>
            <Text style={[styles.tableHeader, styles.column]}>Autor</Text>
          </View>

          {libros.map((libro, index) => (
            <View key={libro.id || index} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.column, { fontSize: text(12) }]}>{libro.id}</Text>
                <Text style={[styles.tableCell, styles.column, { fontSize: text(12) }]}>{libro.titulo || 'N/A'}</Text>
                <Text style={[styles.tableCell, styles.column, { fontSize: text(12) }]}>{libro.clasificacion || 'N/A'}</Text>
                <Text style={[styles.tableCell, styles.column, { fontSize: text(12) }]}>{libro.tipo_material || 'N/A'}</Text>
                <Text style={[styles.tableCell, styles.column, { fontSize: text(12) }]}>{libro.autor || 'N/A'}</Text>
            </View>
          ))}

          {libros.length === 0 && (
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>No hay libros disponibles</Text>
            </View>
          )}
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
    alignItems: 'center',
    minHeight: 48,
    paddingVertical: 6,
  },
  tableHeader: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    paddingVertical: 12,
    paddingHorizontal: 8,
    textAlign: 'center',
    fontFamily: 'Segoe UI',
    flexWrap: 'wrap',
  },
  tableCell: {
    color: '#FFFFFF',
    fontSize: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    textAlign: 'center',
    fontFamily: 'Segoe UI',
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  column: {
    flex: 1.5,
    borderRightColor: '#555',
    paddingHorizontal: 4,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'Segoe UI',
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
