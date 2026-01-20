import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import useScale from '../hooks/useScale';
import { getSolicitudes } from '../../tablas/solicitudes';
import { useUser } from '../context/UserContext';

const Prestamos = ({ navigation }) => {
  const { getUserBoleta, isAuthenticated } = useUser();
  const [prestamos, setPrestamos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { s, vs, text } = useScale();
  
  const registro_id = getUserBoleta();

  const formatearEstado = (estado) => {
    switch (estado) {
      case 1 :
        return 'Pendiente';
      case 2:
        return 'Aprobado';
      case 3:
        return 'Rechazado';
      case 4:
        return 'Cancelada';
      default:
        return estado || 'Estado desconocido';
    }
  };

  const formatearColor = (estado) => {
    switch (estado) {
      case 1:
        return 'orange';
      case 2:
        return 'green';
      case 3:
        return 'red';
      case 4:
        return 'red';
      default:
        return 'black';
    }
  };

  const formatearTipo = (tipo) => {
    switch (tipo) {
      case 'libro':
        return 'Libro';
      case 'restirador':
        return 'Restirador';
      case 'computadora':
        return 'Computadora';
      default:
        return tipo || 'Tipo desconocido';
    }
  };

  useEffect(() => {
    const fetchPrestamos = async () => {
      if (!isAuthenticated() || !registro_id) {
        console.warn('Usuario no autenticado o sin boleta');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const data = await getSolicitudes(registro_id);
        setPrestamos(data);
      } catch (error) {
        console.error('Error cargando préstamos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrestamos();
  }, [registro_id]);

  const handleRefresh = async () => {
    if (!isAuthenticated() || !registro_id) {
      console.warn('Usuario no autenticado o sin boleta');
      return;
    }
    
    try {
      setLoading(true);
      const data = await getSolicitudes(registro_id);
      setPrestamos(data);
    } catch (error) {
      console.error('Error recargando préstamos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loaderCard}>
          <ActivityIndicator size="large" color="#C35EB9" />
          <Text style={styles.loadingText}>Cargando solicitudes...</Text>
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
            <Text style={styles.iconEmoji}>📝</Text>
          </View>
          <Text style={[styles.title, { fontSize: text(26) }]}>Mis Préstamos</Text>
          <Text style={styles.subtitle}>{prestamos.length} solicitudes activas</Text>
          <View style={styles.divider} />
        </View>

        {/* Table */}
        <View style={styles.table}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableHeader, styles.columnMedium]}>Tipo</Text>
                <Text style={[styles.tableHeader, styles.columnSmall]}>Recurso</Text>
                <Text style={[styles.tableHeader, styles.columnMedium]}>Fecha</Text>
                <Text style={[styles.tableHeader, styles.columnMedium]}>Hora</Text>
                <Text style={[styles.tableHeader, styles.columnMedium]}>Límite</Text>
                <Text style={[styles.tableHeader, styles.columnMedium]}>Estado</Text>
              </View>

              {!isAuthenticated() || !registro_id ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>🔐</Text>
                  <Text style={styles.emptyText}>Inicia sesión para ver tus préstamos</Text>
                </View>
              ) : prestamos.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>📭</Text>
                  <Text style={styles.emptyText}>No tienes préstamos activos</Text>
                </View>
              ) : (
                prestamos.map((prestamo, index) => (
                  <View key={index} style={[styles.tableRow, index % 2 === 0 && styles.tableRowAlt]}>
                    <Text style={[styles.tableCell, styles.columnMedium, { fontSize: text(11) }]}>
                      {formatearTipo(prestamo.tipo) || 'N/A'}
                    </Text>
                    <View style={[styles.columnSmall, styles.resourceCell]}>
                      <View style={styles.resourceBadge}>
                        <Text style={styles.resourceText}>#{prestamo.recurso_id || '?'}</Text>
                      </View>
                    </View>
                    <Text style={[styles.tableCell, styles.columnMedium, { fontSize: text(10) }]}>
                      {prestamo.fecha_solicitud || 'N/A'}
                    </Text>
                    <Text style={[styles.tableCell, styles.columnMedium, { fontSize: text(10) }]}>
                      {prestamo.hora_solicitud || 'N/A'}
                    </Text>
                    <Text style={[styles.tableCell, styles.columnMedium, { fontSize: text(10) }]}>
                      {prestamo.hora_limite || 'N/A'}
                    </Text>
                    <View style={[styles.columnMedium, styles.statusCell]}>
                      <View style={[styles.statusBadge, { backgroundColor: formatearColor(prestamo.estado) + '25' }]}>
                        <Text style={[styles.statusText, { fontSize: text(9), color: formatearColor(prestamo.estado) }]}>
                          {formatearEstado(prestamo.estado)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          onPress={handleRefresh}
          style={styles.refreshButton}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Text style={styles.refreshIcon}>🔄</Text>
              <Text style={[styles.refreshButtonText, { fontSize: text(14) }]}>Actualizar</Text>
            </>
          )}
        </TouchableOpacity>

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
    marginBottom: 24,
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
    fontSize: 10,
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
  columnSmall: {
    width: 70,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  columnMedium: {
    width: 85,
    paddingHorizontal: 4,
  },
  resourceCell: {
    justifyContent: 'center',
  },
  resourceBadge: {
    backgroundColor: '#4A90E230',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  resourceText: {
    color: '#4A90E2',
    fontWeight: '700',
    fontSize: 11,
  },
  statusCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
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
    textAlign: 'center',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  refreshIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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

export default Prestamos;