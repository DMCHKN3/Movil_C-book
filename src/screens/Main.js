import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, BackHandler, Alert, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import useScale from '../hooks/useScale';
import { useUser } from '../context/UserContext';
import { getEstadoGral } from '../../tablas/estado_gral';
import { getRecientes } from '../../tablas/actvs_rec';

const { width } = Dimensions.get('window');

const Main = ({ navigation }) => {
  const { s, vs, ms, text } = useScale();
  const cardWidth = s(200);
  const { getUserBoleta, isAuthenticated, perfil, logout } = useUser();
  const [loading, setLoading] = useState(true);
  const [estadoGral, setEstadoGral] = useState([]);
  const [recientes, setRecientes] = useState([]);
  const registro_id = getUserBoleta();

  // Interceptar botón de retroceso para mostrar alerta de cerrar sesión
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        Alert.alert(
          'Cerrar sesión',
          '¿Deseas cerrar sesión?',
          [
            {
              text: 'Cancelar',
              style: 'cancel',
              onPress: () => {}
            },
            {
              text: 'Cerrar sesión',
              onPress: async () => {
                await logout();
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'IniciarAcc' }],
                });
              }
            }
          ],
          { cancelable: false }
        );
        return true; // Bloquear navegación hacia atrás
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription.remove();
    }, [logout, navigation])
  );

  // Función para convertir el estado booleano a texto descriptivo
  const formatearEstado = (estado) => {
    switch (estado) {
      case 1:
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
        return 'Préstamo de libro';
      case 'restirador':
        return 'Préstamo de restirador';
      case 'computadora':
        return 'Préstamo de computadora';
      default:
        return tipo || 'Tipo desconocido';
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated() || !registro_id) {
        console.warn('Usuario no autenticado o sin boleta');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        // Ejecutar ambas consultas en paralelo para mejor rendimiento
        const [estadoData, recientesData] = await Promise.all([
          getEstadoGral(registro_id),
          getRecientes(registro_id)
        ]);
        
        setEstadoGral(estadoData);
        setRecientes(recientesData);
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [registro_id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loaderCard}>
          <ActivityIndicator size="large" color="#C35EB9" />
          <Text style={styles.loadingText}>Cargando datos...</Text>
        </View>
      </View>
    );
  }


  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={[styles.bienvenida, { fontSize: text(28) }]} allowFontScaling>
            ¡Hola de nuevo!
          </Text>
          <Text style={[styles.usuario, { fontSize: text(22), marginBottom: vs(8) }]} allowFontScaling>
            {perfil ? `${perfil.correo.split('@')[0]}` : 'Usuario'}
          </Text>
          <View style={styles.divider} />
        </View>

        {/* Actividades Recientes Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Text style={styles.iconText}>📋</Text>
            </View>
            <Text style={[styles.actividadesLabel, { fontSize: text(16) }]} allowFontScaling>
              Actividades Recientes
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rowScroll}
            pagingEnabled={false}
          >
            {recientes.length === 0 ? (
              <View style={[styles.caja, { width: cardWidth }]}>
                <View style={styles.emptyStateIcon}>
                  <Text style={styles.emptyIcon}>📭</Text>
                </View>
                <Text style={[styles.cajaTextoEmpty, { fontSize: text(14) }]} allowFontScaling>
                  Sin actividades recientes
                </Text>
              </View>
            ) : (
              recientes.slice(0, 5).map((actividad, index) => (
                <View key={index} style={[styles.caja, { width: cardWidth }]}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.statusDot, { backgroundColor: formatearColor(actividad.estado) }]} />
                    <Text style={[styles.cardType, { fontSize: text(11) }]} allowFontScaling>
                      {formatearTipo(actividad.tipo)}
                    </Text>
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={[styles.cajaEstado, { fontSize: text(13) }]} allowFontScaling>
                      Estado
                    </Text>
                    <Text style={[styles.estadoValue, { fontSize: text(16), color: formatearColor(actividad.estado) }]} allowFontScaling>
                      {formatearEstado(actividad.estado)}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>

        {/* Estado General Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Text style={styles.iconText}>📊</Text>
            </View>
            <Text style={[styles.estadoLabel, { fontSize: text(16) }]} allowFontScaling>
              Estado General
            </Text>
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableHeader, styles.column]}>Solicitud</Text>
              <Text style={[styles.tableHeader, styles.column]}>Fecha</Text>
              <Text style={[styles.tableHeader, styles.column]}>Estado</Text>
            </View>

            {estadoGral.length === 0 ? (
              <View style={styles.emptyTableRow}>
                <Text style={styles.emptyTableText}>No hay solicitudes</Text>
              </View>
            ) : (
              estadoGral.map((estado, index) => (
                <View key={index} style={[styles.tableRow, index % 2 === 0 && styles.tableRowAlt]}>
                  <Text style={[styles.tableCell, styles.column, { fontSize: text(11) }]}>{formatearTipo(estado.tipo)}</Text>
                  <Text style={[styles.tableCell, styles.column, { fontSize: text(11) }]}>{estado.fecha_solicitud || 'N/A'}</Text>
                  <View style={[styles.column, styles.statusCell]}>
                    <View style={[styles.statusBadge, { backgroundColor: formatearColor(estado.estado) + '20' }]}>
                      <Text style={[styles.statusText, { fontSize: text(10), color: formatearColor(estado.estado) }]}>
                        {formatearEstado(estado.estado)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Navigation Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Biblioteca')}
            style={styles.navButton}
            activeOpacity={0.8}
          >
            <View style={styles.navButtonIcon}>
              <Text style={styles.navIcon}>📚</Text>
            </View>
            <Text style={[styles.navButtonText, { fontSize: text(14) }]}>Biblioteca</Text>
            <Text style={styles.arrowIcon}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Prestamos')}
            style={styles.navButton}
            activeOpacity={0.8}
          >
            <View style={styles.navButtonIcon}>
              <Text style={styles.navIcon}>📝</Text>
            </View>
            <Text style={[styles.navButtonText, { fontSize: text(14) }]}>Préstamos</Text>
            <Text style={styles.arrowIcon}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Cuenta')}
            style={styles.navButton}
            activeOpacity={0.8}
          >
            <View style={styles.navButtonIcon}>
              <Text style={styles.navIcon}>👤</Text>
            </View>
            <Text style={[styles.navButtonText, { fontSize: text(14) }]}>Mi Cuenta</Text>
            <Text style={styles.arrowIcon}>›</Text>
          </TouchableOpacity>
        </View>
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
    paddingTop: 50,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1F2E',
  },
  loaderCard: {
    backgroundColor: '#252A3D',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  headerSection: {
    marginBottom: 24,
  },
  bienvenida: {
    fontSize: 28,
    fontWeight: '300',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  usuario: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  divider: {
    height: 3,
    width: 60,
    backgroundColor: '#C35EB9',
    borderRadius: 2,
    marginTop: 12,
  },
  sectionContainer: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#252A3D',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 18,
  },
  actividadesLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  rowScroll: {
    paddingVertical: 4,
    paddingRight: 20,
    gap: 14,
  },
  caja: {
    backgroundColor: '#252A3D',
    height: 130,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#353A4D',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  cardType: {
    color: '#9CA3AF',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cajaEstado: {
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  estadoValue: {
    fontWeight: '700',
  },
  emptyStateIcon: {
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyIcon: {
    fontSize: 32,
    opacity: 0.6,
  },
  cajaTextoEmpty: {
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  estadoLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  table: {
    width: '100%',
    backgroundColor: '#252A3D',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#353A4D',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#1E2333',
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#353A4D',
  },
  tableRowAlt: {
    backgroundColor: '#1E233310',
  },
  tableHeader: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableCell: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '400',
  },
  column: {
    flex: 1,
    paddingHorizontal: 4,
  },
  statusCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  emptyTableRow: {
    padding: 24,
    alignItems: 'center',
  },
  emptyTableText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  buttonsContainer: {
    marginTop: 8,
    gap: 12,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252A3D',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#353A4D',
  },
  navButtonIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#C35EB920',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  navIcon: {
    fontSize: 22,
  },
  navButtonText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  arrowIcon: {
    color: '#C35EB9',
    fontSize: 24,
    fontWeight: '300',
  },
});

export default Main;
