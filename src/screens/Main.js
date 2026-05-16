import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, BackHandler, Alert, Dimensions, StatusBar,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import useScale from '../hooks/useScale';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';

import { getSolicitudesAprobadas } from '../../tablas/actvs_rec';
import { getUsuario, getDatos } from '../../tablas/cuenta';
import { cerrarSesionConAuth } from '../../BD/supabaseAuthService';

const { width } = Dimensions.get('window');

const statusColor = (estado) => {
  switch (Number(estado)) {
    case 1: return '#d97706';
    case 2: return '#3b82f6';
    case 3: return '#ef4444';
    case 4: return '#ef4444';
    case 5: return '#22c55e';
    case 6: return '#c46f21';
    default: return '#6b7280';
  }
};

const statusLabel = (estado) => {
  switch (Number(estado)) {
    case 1: return 'Pendiente';
    case 2: return 'Aprobada';
    case 3: return 'Rechazada';
    case 4: return 'Cancelada';
    case 5: return 'Entregado';
    case 6: return 'Devuelto';
    default: return 'Desconocido';
  }
};

const Main = ({ navigation }) => {
  const { s, vs, ms, text } = useScale();
  const { getUserBoleta, isAuthenticated, perfil, logout } = useUser();
  const { theme, isDark, toggleTheme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [aprobadas, setAprobadas] = useState([]);
  const [tieneDocumentos, setTieneDocumentos] = useState(null);
  const [nombreAlumno, setNombreAlumno] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const registro_id = getUserBoleta();
  const cardWidth = s(180);
  const t = theme;

  useFocusEffect(
    React.useCallback(() => {
      const onBack = () => {
        Alert.alert('Cerrar sesión', '¿Deseas cerrar sesión?', [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Cerrar sesión',
                onPress: async () => {
              try {
                const resultado = await cerrarSesionConAuth();
                if (resultado.ok) {
                  await logout();
                  navigation.navigate('IniciarAcc');
                  console.log('Sesión cerrada exitosamente');
                  Alert.alert('Sesión Cerrada', 'Has cerrado sesión exitosamente.');
                } else {
                  Alert.alert('Error', resultado.message || 'No se pudo cerrar sesión. Intenta de nuevo.');
                }
              } catch (error) {
                console.error('Error en   logout:', error);
                Alert.alert('Error', 'Ocurrió un error al cerrar sesión.');
              }
            },
          },
        ], { cancelable: false });
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
      return () => sub.remove();
    }, [logout, navigation])
  );

  const fetchData = async () => {
    if (!isAuthenticated() || !registro_id) return;
    try {
      const [solicitudesData, usuarioData, datosData] = await Promise.all([
        getSolicitudesAprobadas(registro_id),
        getUsuario(registro_id),
        getDatos(registro_id),
      ]);
      setAprobadas(solicitudesData);
      if (usuarioData?.length > 0) {
        const u = usuarioData[0];
        const nombre = [u.nombre, u.apellido].filter(Boolean).join(' ') || u.nombre || '';
        setNombreAlumno(nombre);
      }
      if (datosData?.length > 0) {
        setTieneDocumentos(datosData[0].tiene_documentos);
      }
    } catch (err) {
      console.error('Error cargando datos:', err);
    }
  };

  useEffect(() => {
    const initialLoad = async () => {
      if (!isAuthenticated() || !registro_id) { setLoading(false); return; }
      setLoading(true);
      await fetchData();
      setLoading(false);
    };
    initialLoad();
  }, [registro_id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: t.bg }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={t.bg} />
        <View style={[styles.loaderCard, { backgroundColor: t.bgCard, borderColor: t.border }]}>
          <ActivityIndicator size="large" color={t.accent} />
          <Text style={[styles.loaderText, { color: t.textSecondary }]}>Cargando datos...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={t.bg} />
      <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
        <View style={styles.content}>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={[styles.greeting, { color: t.textMuted, fontSize: text(14) }]}>¡Hola de nuevo!</Text>
              <Text style={[styles.username, { color: t.textPrimary, fontSize: text(22) }]}>
                {nombreAlumno || (perfil ? String(perfil.boleta) : 'Usuario')}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.themeBtn, { backgroundColor: t.accentBg, borderColor: t.border }]}
              onPress={toggleTheme}
            >
              <Text style={{ fontSize: 18 }}>{isDark ? '☀' : '⏾'}</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.divider, { backgroundColor: t.divider }]} />

          {/* Estado de documentación */}
          <View style={styles.docStatusRow}>
            <View style={[styles.docStatusDot, {
              backgroundColor: tieneDocumentos === true ? '#22c55e' : tieneDocumentos === false ? '#ef4444' : '#6b7280'
            }]} />
            <Text style={[styles.docStatusLabel, { color: t.textSecondary, fontSize: text(13) }]}>
              Estado de documentación: {tieneDocumentos === true ? 'Activo' : tieneDocumentos === false ? 'Inactivo' : 'Cargando...'}
            </Text>
          </View>

          {/* Solicitudes Aprobadas */}
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <View style={[styles.sectionIconBox, { backgroundColor: t.accentBg, borderColor: t.borderStrong }]}>
                <Text style={styles.sectionEmoji}>✅</Text>
              </View>
              <Text style={[styles.sectionTitle, { color: t.textPrimary, fontSize: text(15) }]}>Solicitudes Aprobadas</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsRow}>
              {aprobadas.length === 0 ? (
                <View style={[styles.actCard, styles.emptyCard, { width: cardWidth, backgroundColor: t.bgCard, borderColor: t.border }]}>
                  <Text style={styles.emptyEmoji}>📭</Text>
                  <Text style={[styles.emptyText, { color: t.textMuted, fontSize: text(13) }]}>Sin solicitudes aprobadas</Text>
                </View>
              ) : (
                aprobadas.slice(0, 5).map((act, i) => {
                  const color = statusColor(act.estado);
                  return (
                    <View key={i} style={[styles.actCard, { width: cardWidth, backgroundColor: t.bgCard, borderColor: t.border }]}>
                      <Text style={[styles.actBookTitle, { color: t.textPrimary, fontSize: text(12) }]} numberOfLines={2}>
                        {act.titulo}
                      </Text>
                      <View style={styles.actCardBottom}>
                        <View style={[styles.badge, { backgroundColor: color + '22' }]}>
                          <Text style={[styles.badgeText, { color, fontSize: text(10) }]}>{statusLabel(act.estado)}</Text>
                        </View>
                        <Text style={[styles.actDate, { color: t.textMuted, fontSize: text(9) }]}>
                          {act.fecha_solicitud ? new Date(act.fecha_solicitud).toLocaleDateString() : ''}
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>



          {/* Navegación */}
          <View style={styles.navButtons}>
            {[
              { label: 'Biblioteca', icon: '📚', screen: 'Biblioteca' },
              { label: 'Préstamos', icon: '📝', screen: 'Prestamos' },
              { label: 'Mi Cuenta', icon: '👤', screen: 'Cuenta' },
            ].map((item) => (
              <TouchableOpacity
                key={item.screen}
                style={[styles.navBtn, { backgroundColor: t.bgCard, borderColor: t.border }]}
                onPress={() => navigation.navigate(item.screen)}
                activeOpacity={0.8}
              >
                <View style={[styles.navIconBox, { backgroundColor: t.accentBg, borderColor: t.borderStrong }]}>
                  <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                </View>
                <Text style={[styles.navLabel, { color: t.textPrimary, fontSize: text(14) }]}>{item.label}</Text>
                <Text style={[styles.navArrow, { color: t.accentBright }]}>›</Text>
              </TouchableOpacity>
            ))}
          </View>

        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderCard: { borderRadius: 20, padding: 40, alignItems: 'center', borderWidth: 1 },
  loaderText: { marginTop: 14, fontSize: 15, fontWeight: '500' },

  content: { paddingHorizontal: 20, paddingTop: 54, paddingBottom: 40 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  headerLeft: { flex: 1 },
  greeting: { fontWeight: '400', letterSpacing: 0.3 },
  username: { fontWeight: '700', letterSpacing: 0.2, marginTop: 2 },
  themeBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  divider: { height: 2, borderRadius: 2, marginBottom: 28 },

  section: { marginBottom: 28 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  sectionIconBox: { width: 34, height: 34, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  sectionEmoji: { fontSize: 16 },
  sectionTitle: { fontWeight: '600', letterSpacing: 0.2 },

  cardsRow: { paddingVertical: 4, paddingRight: 20, gap: 12 },
  actCard: { borderRadius: 16, padding: 16, borderWidth: 1, height: 120, justifyContent: 'space-between' },
  emptyCard: { alignItems: 'center', justifyContent: 'center', height: 100 },
  emptyEmoji: { fontSize: 28, marginBottom: 8, opacity: 0.6 },
  emptyText: { fontWeight: '500', textAlign: 'center' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  badgeText: { fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },

  docStatusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 8 },
  docStatusDot: { width: 10, height: 10, borderRadius: 5 },
  docStatusLabel: { fontWeight: '500', letterSpacing: 0.2 },
  actBookTitle: { fontWeight: '700', lineHeight: 18 },
  actCardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  actDate: { fontWeight: '400' },

  navButtons: { gap: 10 },
  navBtn: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 14, borderWidth: 1 },
  navIconBox: { width: 42, height: 42, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  navLabel: { flex: 1, fontWeight: '600' },
  navArrow: { fontSize: 24, fontWeight: '300' },
});

export default Main;
