import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import useScale from '../hooks/useScale';
import { LinearGradient } from 'expo-linear-gradient';
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
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#C35EB9" />
        <Text style={styles.loadingText}>Cargando solicitudes...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.content, { paddingHorizontal: s(20) }]}>
        <Text style={[styles.title, { fontSize: text(28), marginBottom: vs(24) }]}>Solicitudes Actuales</Text>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={[styles.tableHeader, styles.column]}>Tipo de Solicitud</Text>
            <Text style={[styles.tableHeader, styles.column]}>Num. del Recurso</Text>
            <Text style={[styles.tableHeader, styles.column]}>Fecha de Solicitud</Text>
            <Text style={[styles.tableHeader, styles.column]}>Hora de Solicitud</Text>
            <Text style={[styles.tableHeader, styles.column]}>Hora Límite</Text>
            <Text style={[styles.tableHeader, styles.column]}>Estado</Text>
          </View>

          {prestamos.map((prestamo, index) => (
            <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.column, { fontSize: text(12) }]}>{formatearTipo(prestamo.tipo) || 'N/A'}</Text>
                <Text style={[styles.tableCell, styles.column, { fontSize: text(12) }]}>{"No. " + prestamo.recurso_id || 'N/A'}</Text>
                <Text style={[styles.tableCell, styles.column, { fontSize: text(12) }]}>{prestamo.fecha_solicitud || 'N/A'}</Text>
                <Text style={[styles.tableCell, styles.column, { fontSize: text(12) }]}>{prestamo.hora_solicitud || 'N/A'}</Text>
                <Text style={[styles.tableCell, styles.column, { fontSize: text(12) }]}>{prestamo.hora_limite || 'N/A'}</Text>
                <Text style={[styles.tableCell, styles.column, { fontSize: text(12), color: formatearColor(prestamo.estado) }]}>{formatearEstado(prestamo.estado)}</Text>
            </View>
          ))}

          {!isAuthenticated() || !registro_id ? (
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>Debes iniciar sesión para ver tus préstamos</Text>
            </View>
          ) : prestamos.length === 0 && (
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>No tienes préstamos activos</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={handleRefresh}
          style={[styles.buttonContainer, { marginBottom: 15 }]}
          disabled={loading}
        >
          <LinearGradient
            colors={loading ? ['#666', '#888'] : ['#4A90E2', '#7BB3F0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.buttonText}>🔄 Actualizar Solicitudes</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

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

export default Prestamos;