import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import useScale from '../hooks/useScale';
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
      <View style={styles.loadingContainer}>
        <View style={styles.loaderCard}>
          <ActivityIndicator size="large" color="#C35EB9" />
          <Text style={styles.loadingText}>Cargando libros...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={[styles.content, { paddingHorizontal: s(20) }]}>
        {/* Header */}
        <View style={styles.headerSection}>
          <View style={styles.headerIcon}>
            <Text style={styles.iconEmoji}>📚</Text>
          </View>
          <Text style={[styles.title, { fontSize: text(26) }]}>Biblioteca</Text>
          <Text style={styles.subtitle}>{libros.length} libros disponibles</Text>
          <View style={styles.divider} />
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeader, styles.columnSmall]}>ID</Text>
            <Text style={[styles.tableHeader, styles.columnLarge]}>Título</Text>
            <Text style={[styles.tableHeader, styles.columnMedium]}>Clasificación</Text>
            <Text style={[styles.tableHeader, styles.columnMedium]}>Tipo</Text>
            <Text style={[styles.tableHeader, styles.columnMedium]}>Autor</Text>
          </View>

          {libros.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>No hay libros disponibles</Text>
            </View>
          ) : (
            libros.map((libro, index) => (
              <View key={libro.id || index} style={[styles.tableRow, index % 2 === 0 && styles.tableRowAlt]}>
                <View style={[styles.columnSmall, styles.idCell]}>
                  <View style={styles.idBadge}>
                    <Text style={[styles.idText, { fontSize: text(11) }]}>{libro.id}</Text>
                  </View>
                </View>
                <Text style={[styles.tableCell, styles.columnLarge, styles.titleCell, { fontSize: text(11) }]}>
                  {libro.titulo || 'N/A'}
                </Text>
                <Text style={[styles.tableCell, styles.columnMedium, { fontSize: text(10) }]}>
                  {libro.clasificacion || 'N/A'}
                </Text>
                <Text style={[styles.tableCell, styles.columnMedium, { fontSize: text(10) }]}>
                  {libro.tipo_material || 'N/A'}
                </Text>
                <Text style={[styles.tableCell, styles.columnMedium, { fontSize: text(10) }]}>
                  {libro.autor || 'N/A'}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Back Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Main')}
          style={styles.backButton}
          activeOpacity={0.8}
        >
          <Text style={styles.backIcon}>←</Text>
          <Text style={[styles.backButtonText, { fontSize: text(15) }]}>Regresar al Menú</Text>
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
    paddingTop: 50,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111625',
  },
  loaderCard: {
    backgroundColor: '#1A1F2E',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#353A4D',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#C35EB920',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconEmoji: {
    fontSize: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 8,
  },
  divider: {
    height: 3,
    width: 50,
    backgroundColor: '#C35EB9',
    borderRadius: 2,
    marginTop: 16,
  },
  table: {
    width: '100%',
    backgroundColor: '#1A1F2E',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#353A4D',
    marginBottom: 28,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#252A3D',
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#252A3D',
  },
  tableRowAlt: {
    backgroundColor: '#1E233315',
  },
  tableHeader: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  tableCell: {
    color: '#FFFFFF',
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '400',
  },
  titleCell: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
  columnSmall: {
    flex: 0.6,
    paddingHorizontal: 2,
    alignItems: 'center',
  },
  columnMedium: {
    flex: 1.2,
    paddingHorizontal: 4,
  },
  columnLarge: {
    flex: 1.8,
    paddingHorizontal: 4,
  },
  idCell: {
    justifyContent: 'center',
  },
  idBadge: {
    backgroundColor: '#C35EB930',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  idText: {
    color: '#C35EB9',
    fontWeight: '700',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
    opacity: 0.6,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C35EB9',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  backIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginRight: 10,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default Biblioteca;
