import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, BackHandler, Alert, Dimensions, StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import useScale from '../hooks/useScale';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { getEstadoGral } from '../../tablas/estado_gral';
import { getRecientes } from '../../tablas/actvs_rec';
import { cerrarSesionConAuth } from '../../BD/supabaseAuthService';

const { width } = Dimensions.get('window');

const statusColor = (estado) => {
  switch (estado) {
    case 1: return '#d97706';
    case 2: return '#1f9d74';
    case 3: return '#dc4c3f';
    case 4: return '#dc4c3f';
    default: return '#738296';
  }
};

const statusLabel = (estado) => {
  switch (estado) {
    case 1: return 'Pendiente';
    case 2: return 'Aprobado';
    case 3: return 'Rechazado';
    case 4: return 'Cancelada';
    default: return estado || 'Desconocido';
  }
};

const tipoLabel = (tipo) => {
  switch (tipo) {
    case 'libro': return 'Préstamo de libro';
    case 'restirador': return 'Préstamo de restirador';
    case 'computadora': return 'Préstamo de computadora';
    default: return tipo || 'Tipo desconocido';
  }
};

const Main = ({ navigation }) => {
  const { s, vs, ms, text } = useScale();
  const { getUserBoleta, isAuthenticated, perfil, logout } = useUser();
  const { theme, isDark, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [estadoGral, setEstadoGral] = useState([]);
  const [recientes, setRecientes] = useState([]);
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

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated() || !registro_id) { setLoading(false); return; }
      try {
        setLoading(true);
        const [estadoData, recientesData] = await Promise.all([
          getEstadoGral(registro_id),
          getRecientes(registro_id),
        ]);
        setEstadoGral(estadoData);
        setRecientes(recientesData);
      } catch (err) {
        console.error('Error cargando datos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [registro_id]);

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
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={[styles.greeting, { color: t.textMuted, fontSize: text(14) }]}>¡Hola de nuevo!</Text>
              <Text style={[styles.username, { color: t.textPrimary, fontSize: text(22) }]}>
                {perfil ? perfil.correo.split('@')[0] : 'Usuario'}
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

          {/* Actividades recientes */}
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <View style={[styles.sectionIconBox, { backgroundColor: t.accentBg, borderColor: t.borderStrong }]}>
                <Text style={styles.sectionEmoji}>📋</Text>
              </View>
              <Text style={[styles.sectionTitle, { color: t.textPrimary, fontSize: text(15) }]}>Actividades Recientes</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsRow}>
              {recientes.length === 0 ? (
                <View style={[styles.actCard, styles.emptyCard, { width: cardWidth, backgroundColor: t.bgCard, borderColor: t.border }]}>
                  <Text style={styles.emptyEmoji}>📭</Text>
                  <Text style={[styles.emptyText, { color: t.textMuted, fontSize: text(13) }]}>Sin actividades recientes</Text>
                </View>
              ) : (
                recientes.slice(0, 5).map((act, i) => {
                  const color = statusColor(act.estado);
                  return (
                    <View key={i} style={[styles.actCard, { width: cardWidth, backgroundColor: t.bgCard, borderColor: t.border }]}>
                      <View style={styles.actCardTop}>
                        <View style={[styles.dot, { backgroundColor: color }]} />
                        <Text style={[styles.actType, { color: t.textMuted, fontSize: text(10) }]} numberOfLines={1}>
                          {tipoLabel(act.tipo)}
                        </Text>
                      </View>
                      <Text style={[styles.actStateLabel, { color: t.textMuted, fontSize: text(11) }]}>Estado</Text>
                      <Text style={[styles.actStateValue, { color, fontSize: text(15) }]}>{statusLabel(act.estado)}</Text>
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>

          {/* Estado general */}
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <View style={[styles.sectionIconBox, { backgroundColor: t.accentBg, borderColor: t.borderStrong }]}>
                <Text style={styles.sectionEmoji}>📊</Text>
              </View>
              <Text style={[styles.sectionTitle, { color: t.textPrimary, fontSize: text(15) }]}>Estado General</Text>
            </View>

            <View style={[styles.table, { backgroundColor: t.bgCard, borderColor: t.border }]}>
              <View style={[styles.tableHead, { backgroundColor: t.bgCardAlt, borderBottomColor: t.border }]}>
                {['Solicitud', 'Fecha', 'Estado'].map((h) => (
                  <Text key={h} style={[styles.thCell, { color: t.textMuted, flex: h === 'Solicitud' ? 1.4 : 1, fontSize: text(10) }]}>{h}</Text>
                ))}
              </View>

              {estadoGral.length === 0 ? (
                <View style={styles.emptyTableRow}>
                  <Text style={[styles.emptyText, { color: t.textMuted }]}>No hay solicitudes</Text>
                </View>
              ) : (
                estadoGral.map((row, i) => {
                  const color = statusColor(row.estado);
                  return (
                    <View key={i} style={[styles.tableRow, { borderBottomColor: t.border }, i % 2 !== 0 && { backgroundColor: t.bgCardAlt }]}>
                      <Text style={[styles.tdCell, { color: t.textSecondary, flex: 1.4, fontSize: text(10) }]} numberOfLines={2}>
                        {tipoLabel(row.tipo)}
                      </Text>
                      <Text style={[styles.tdCell, { color: t.textSecondary, flex: 1, fontSize: text(10) }]}>
                        {row.fecha_solicitud || 'N/A'}
                      </Text>
                      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <View style={[styles.badge, { backgroundColor: color + '22' }]}>
                          <Text style={[styles.badgeText, { color, fontSize: text(9) }]}>{statusLabel(row.estado)}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
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
  actCardTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  actType: { fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4, flex: 1 },
  actStateLabel: { fontWeight: '500' },
  actStateValue: { fontWeight: '700' },
  emptyEmoji: { fontSize: 28, marginBottom: 8, opacity: 0.6 },
  emptyText: { fontWeight: '500', textAlign: 'center' },

  table: { borderRadius: 14, overflow: 'hidden', borderWidth: 1 },
  tableHead: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 10, borderBottomWidth: 1 },
  thCell: { fontWeight: '700', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.4 },
  tableRow: { flexDirection: 'row', alignItems: 'center', minHeight: 50, paddingVertical: 10, paddingHorizontal: 10, borderBottomWidth: 1 },
  tdCell: { textAlign: 'center', paddingHorizontal: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  badgeText: { fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  emptyTableRow: { padding: 24, alignItems: 'center' },

  navButtons: { gap: 10 },
  navBtn: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 14, borderWidth: 1 },
  navIconBox: { width: 42, height: 42, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  navLabel: { flex: 1, fontWeight: '600' },
  navArrow: { fontSize: 24, fontWeight: '300' },
});

export default Main;
