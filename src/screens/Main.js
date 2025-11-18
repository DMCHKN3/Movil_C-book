import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import useScale from '../hooks/useScale';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../context/UserContext';
import { getEstadoGral } from '../../tablas/estado_gral';
import { getRecientes } from '../../tablas/actvs_rec';

const Main = ({ navigation }) => {
  const { s, vs, ms, text } = useScale();
  const cardWidth = s(225); // approx 60% of 375
  const { getUserBoleta, isAuthenticated, perfil } = useUser();
  const [loading, setLoading] = useState(true);
  const [estadoGral, setEstadoGral] = useState([]);
  const [recientes, setRecientes] = useState([]);
  const registro_id = getUserBoleta();

  useEffect(() => {
    const fetchEstadoGral = async () => {
      if (!isAuthenticated() || !registro_id) {
        console.warn('Usuario no autenticado o sin boleta');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await getEstadoGral(registro_id);
        setEstadoGral(data);
      } catch (error) {
        console.error('Error cargando estado general:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchRecientes = async () => {
      if (!isAuthenticated() || !registro_id) {
        console.warn('Usuario no autenticado o sin boleta');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await getRecientes(registro_id);
        setRecientes(data);
      } catch (error) {
        console.error('Error cargando las solicitudes recientes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEstadoGral();
    fetchRecientes();
  }, [registro_id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C35EB9" />
        <Text style={styles.loadingText}>Cargando datos...</Text>
      </View>
    );
  }


  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={[styles.bienvenida, { fontSize: text(32) }]} allowFontScaling>
          Bienvenido
        </Text>
        <Text style={[styles.usuario, { fontSize: text(24), marginBottom: vs(20) }]} allowFontScaling>
          {perfil?.boleta || 'Usuario'}
        </Text>
        <Text style={[styles.actividadesLabel, { fontSize: text(14) }]} allowFontScaling>
          Actividades Recientes
        </Text>

        {/* Scroll horizontal para las cajas SOL X */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rowScroll}
          pagingEnabled={false}
        >
          <TouchableOpacity style={[styles.caja, { width: cardWidth, height: '10%', marginRight: 16 }]}>
            <Text style={[styles.cajaTexto, { fontSize: text(28) }]} allowFontScaling>
              SOL 1
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.caja, { width: cardWidth, height: '10%', marginRight: 16 }]}>
            <Text style={[styles.cajaTexto, { fontSize: text(28) }]} allowFontScaling>
              SOL 2
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.caja, { width: cardWidth, height: '10%', marginRight: 16 }]}>
            <Text style={[styles.cajaTexto, { fontSize: text(28) }]} allowFontScaling>
              SOL 3
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <Text style={[styles.estadoLabel, { fontSize: text(12) }]} allowFontScaling>
          ESTADO GENERAL
        </Text>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={[styles.tableHeader, styles.column]}>Tipo de Solicitud</Text>
            <Text style={[styles.tableHeader, styles.column]}>Fecha de Solicitud</Text>
            <Text style={[styles.tableHeader, styles.column]}>Estado</Text>
          </View>

          {estadoGral.length === 0 ? (
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>No hay solicitudes recientes</Text>
            </View>
          ) : (
            estadoGral.map((estado, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.column, { fontSize: text(12) }]}>{estado.tipo || 'N/A'}</Text>
                <Text style={[styles.tableCell, styles.column, { fontSize: text(12) }]}>{estado.fecha_solicitud || 'N/A'}</Text>
                <Text style={[styles.tableCell, styles.column, { fontSize: text(12) }]}>{estado.estado || 'N/A'}</Text>
              </View>
            ))
          )}
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
            <Text style={[styles.buttonText, { fontSize: text(16) }]} allowFontScaling>Ir a Biblioteca</Text>
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
            <Text style={[styles.buttonText, { fontSize: text(16) }]} allowFontScaling>Ir a Prestamos</Text>
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
            <Text style={[styles.buttonText, { fontSize: text(16) }]} allowFontScaling>Ir a Cuenta</Text>
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
    marginBottom: 50,
    width: '100%',
  },
  rowScroll: {
    paddingVertical: 8,
    paddingLeft: 0,
    paddingRight: 8,
    marginBottom: 24,
  },
  caja: {
    backgroundColor: '#D9D9D9',
    width: 200,
    height: 140,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 0
  },
  cajaTexto: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 32,
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
    backgroundColor: '#2A2A2A',
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1F2E',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'Segoe UI',
  },
});

export default Main;
