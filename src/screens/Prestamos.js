import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, StatusBar } from 'react-native';
import useScale from '../hooks/useScale';
import { getSolicitudes } from '../../tablas/solicitudes';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';

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
    case 'libro': return 'Libro';
    case 'restirador': return 'Restirador';
    case 'computadora': return 'Computadora';
    default: return tipo || 'Desconocido';
  }
};

const Prestamos = ({ navigation }) => {
  const { getUserBoleta, isAuthenticated } = useUser();
  const { theme, isDark } = useTheme();
  const [prestamos, setPrestamos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { s, vs, text } = useScale();
  const registro_id = getUserBoleta();
  const t = theme;

  const fetchPrestamos = async () => {
    if (!isAuthenticated() || !registro_id) { setLoading(false); return; }
    try {
      setLoading(true);
      setPrestamos(await getSolicitudes(registro_id));
    } catch (err) {
      console.error('Error cargando préstamos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPrestamos(); }, [registro_id]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: t.bg }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={t.bg} />
        <View style={[styles.loaderCard, { backgroundColor: t.bgCard, borderColor: t.border }]}>
          <ActivityIndicator size="large" color={t.accent} />
          <Text style={[styles.loaderText, { color: t.textSecondary }]}>Cargando solicitudes...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={t.bg} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.content, { paddingHorizontal: s(20) }]}>

          {/* Header */}
          <View style={styles.headerSection}>
            <View style={[styles.headerIcon, { backgroundColor: t.accentBg, borderColor: t.borderStrong }]}>
              <Text style={{ fontSize: 30 }}>📝</Text>
            </View>
            <Text style={[styles.title, { color: t.textPrimary, fontSize: text(24) }]}>Mis Préstamos</Text>
            <Text style={[styles.subtitle, { color: t.textMuted }]}>{prestamos.length} solicitudes activas</Text>
            <View style={[styles.divider, { backgroundColor: t.divider }]} />
          </View>

          {/* Table (horizontal scroll) */}
          <View style={[styles.tableWrap, { backgroundColor: t.bgCard, borderColor: t.border }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>
                {/* Header row */}
                <View style={[styles.tableHead, { backgroundColor: t.bgCardAlt, borderBottomColor: t.border }]}>
                  {['Tipo', 'Recurso', 'Fecha', 'Hora', 'Límite', 'Estado'].map((h) => (
                    <Text key={h} style={[styles.th, { color: t.textMuted, fontSize: text(10) }]}>{h}</Text>
                  ))}
                </View>

                {!isAuthenticated() || !registro_id ? (
                  <View style={styles.emptyState}>
                    <Text style={{ fontSize: 36, marginBottom: 10, opacity: 0.6 }}>🔐</Text>
                    <Text style={[styles.emptyText, { color: t.textMuted }]}>Inicia sesión para ver tus préstamos</Text>
                  </View>
                ) : prestamos.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={{ fontSize: 36, marginBottom: 10, opacity: 0.6 }}>📭</Text>
                    <Text style={[styles.emptyText, { color: t.textMuted }]}>No tienes préstamos activos</Text>
                  </View>
                ) : (
                  prestamos.map((p, i) => {
                    const color = statusColor(p.estado);
                    return (
                      <View
                        key={i}
                        style={[styles.tableRow, { borderBottomColor: t.border }, i % 2 !== 0 && { backgroundColor: t.bgCardAlt }]}
                      >
                        <Text style={[styles.td, styles.cMed, { color: t.textSecondary, fontSize: text(11) }]}>
                          {tipoLabel(p.tipo)}
                        </Text>
                        <View style={[styles.cSmall, { alignItems: 'center' }]}>
                          <View style={[styles.resourceBadge, { backgroundColor: t.infoBg }]}>
                            <Text style={[styles.resourceText, { color: t.info, fontSize: text(10) }]}>#{p.recurso_id || '?'}</Text>
                          </View>
                        </View>
                        <Text style={[styles.td, styles.cMed, { color: t.textSecondary, fontSize: text(10) }]}>{p.fecha_solicitud || 'N/A'}</Text>
                        <Text style={[styles.td, styles.cMed, { color: t.textSecondary, fontSize: text(10) }]}>{p.hora_solicitud || 'N/A'}</Text>
                        <Text style={[styles.td, styles.cMed, { color: t.textSecondary, fontSize: text(10) }]}>{p.hora_limite || 'N/A'}</Text>
                        <View style={[styles.cMed, { alignItems: 'center' }]}>
                          <View style={[styles.statusBadge, { backgroundColor: color + '22' }]}>
                            <Text style={[styles.statusText, { color, fontSize: text(9) }]}>{statusLabel(p.estado)}</Text>
                          </View>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            </ScrollView>
          </View>

          {/* Buttons */}
          <TouchableOpacity
            style={[styles.refreshBtn, { backgroundColor: t.accentBg, borderColor: t.borderStrong }]}
            onPress={fetchPrestamos}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={[styles.refreshBtnText, { color: t.accentBright, fontSize: text(14) }]}>🔄  Actualizar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: t.btnPrimary }]}
            onPress={() => navigation.navigate('Main')}
            activeOpacity={0.85}
          >
            <Text style={[styles.backBtnText, { color: t.btnPrimaryText, fontSize: text(15) }]}>← Regresar al Menú</Text>
          </TouchableOpacity>

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

  content: { paddingTop: 54, paddingBottom: 40 },

  headerSection: { alignItems: 'center', marginBottom: 28 },
  headerIcon: { width: 68, height: 68, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  title: { fontWeight: '700', letterSpacing: 0.4 },
  subtitle: { fontSize: 13, marginTop: 6 },
  divider: { height: 3, width: 44, borderRadius: 2, marginTop: 14 },

  tableWrap: { borderRadius: 14, overflow: 'hidden', borderWidth: 1, marginBottom: 20 },
  tableHead: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 4, borderBottomWidth: 1 },
  th: { width: 88, fontWeight: '700', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.3 },
  tableRow: { flexDirection: 'row', alignItems: 'center', minHeight: 52, paddingVertical: 10, paddingHorizontal: 4, borderBottomWidth: 1 },
  td: { textAlign: 'center', paddingHorizontal: 2 },

  cSmall: { width: 70, paddingHorizontal: 4 },
  cMed: { width: 88, paddingHorizontal: 4 },

  resourceBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  resourceText: { fontWeight: '700' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  statusText: { fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },

  emptyState: { padding: 36, alignItems: 'center' },
  emptyText: { fontSize: 13, fontWeight: '500', textAlign: 'center' },

  refreshBtn: { borderRadius: 12, borderWidth: 1, paddingVertical: 14, alignItems: 'center', marginBottom: 10 },
  refreshBtnText: { fontWeight: '600' },
  backBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  backBtnText: { fontWeight: '600' },
});

export default Prestamos;
