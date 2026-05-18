import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, StatusBar, Alert, Modal,
} from 'react-native';
import useScale from '../hooks/useScale';
import { getSolicitudesCompletas, cancelarSolicitud } from '../../tablas/solicitudesAcciones';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { getDatos } from '../../tablas/cuenta';

function getEstado(id) {
  const e = Number(id);
  let label, color;
  switch (e) {
    case 1: label = 'Pendiente';  color = '#d97706'; break;
    case 2: label = 'Aprobada';   color = '#3b82f6'; break;
    case 3: label = 'Rechazada';  color = '#ef4444'; break;
    case 4: label = 'Cancelada';  color = '#ef4444'; break;
    case 5: label = 'Entregado';  color = '#22c55e'; break;
    case 6: label = 'Devuelto';   color = '#c46f21'; break;
    default: label = `Estado ${e}`; color = '#6b7280';
  }
  return { label, color, bg: color + '22' };
}

function getEstadoPrestamo(prestamo) {
  if (!prestamo || !prestamo.estado) return null;
  const e = prestamo.estado;
  let label, color;
  switch (e) {
    case 'en_espera': label = 'En espera';  color = '#8b5cf6'; break;
    case 'recogido':  label = 'Recogido';   color = '#22c55e'; break;
    case 'devuelto':  label = 'Devuelto';   color = '#c46f21'; break;
    case 'perdido':   label = 'Perdido';    color = '#ef4444'; break;
    default: label = e; color = '#6b7280';
  }
  return { label, color, bg: color + '22' };
}

function estadoEfectivo(s) {
  const eid = Number(s.estado_asistencia_id);
  if (eid === 5 && s.fecha_devolucion_real) return 6;
  return eid;
}

function fmtFecha(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function estaVencido(s) {
  const estado = Number(s.estado_asistencia_id);
  if (estado === 2 && s.fecha_limite_recoleccion) {
    return new Date(s.fecha_limite_recoleccion) < new Date();
  }
  if (estado === 5 && s.fecha_limite_devolucion && !s.fecha_devolucion_real) {
    return new Date(s.fecha_limite_devolucion) < new Date();
  }
  return false;
}

const Prestamos = ({ navigation }) => {
  const { getUserBoleta, isAuthenticated } = useUser();
  const { theme, isDark } = useTheme();
  const { s, vs, text } = useScale();
  const boleta = getUserBoleta();
  const t = theme;

  const [items, setItems] = useState([]);
  const [tieneDocumentos, setTieneDocumentos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const PER_PAGE = 5;

  const fetchPrestamos = useCallback(async () => {
    if (!isAuthenticated() || !boleta) { setLoading(false); return; }
    try {
      setLoading(true);
      const [data, datos] = await Promise.all([
        getSolicitudesCompletas(boleta),
        getDatos(boleta),
      ]);
      setItems(data);
      setTieneDocumentos(datos?.[0]?.tiene_documentos ?? false);
    } catch (err) {
      console.error('Error cargando préstamos:', err);
    } finally {
      setLoading(false);
    }
  }, [boleta, isAuthenticated]);

  useEffect(() => { fetchPrestamos(); }, [fetchPrestamos]);
  useEffect(() => { setPage(1); }, [search, filterEstado]);

  const filteredItems = items.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = q
      ? (s.titulo || '').toLowerCase().includes(q) || String(s.id).includes(q)
      : true;
    const matchEstado = filterEstado
      ? String(estadoEfectivo(s)) === filterEstado
      : true;
    return matchSearch && matchEstado;
  });

  const pendientes = items.filter(s => Number(s.estado_asistencia_id) === 1);
  const vencidas = items.filter(s => estaVencido(s));
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PER_PAGE));
  const paged = filteredItems.slice((page - 1) * PER_PAGE, page * PER_PAGE);

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
          <View style={styles.headerSection}>
            <View style={[styles.headerIcon, { backgroundColor: t.accentBg, borderColor: t.borderStrong }]}>
              <Text style={{ fontSize: 30 }}>📝</Text>
            </View>
            <Text style={[styles.title, { color: t.textPrimary, fontSize: text(24) }]}>Mis Préstamos</Text>
            <Text style={[styles.subtitle, { color: t.textMuted }]}>
              {items.length} solicitud{items.length !== 1 ? 'es' : ''}
            </Text>
            <View style={[styles.divider, { backgroundColor: t.divider }]} />
          </View>

          {tieneDocumentos === false && (
            <View style={[styles.infoBanner, { backgroundColor: '#ef444418', borderColor: '#ef444444' }]}>
              <Text style={[styles.infoBannerText, { color: '#ef4444' }]}>
                Acude a biblioteca a solicitar tu permiso para préstamo de libros
              </Text>
            </View>
          )}

          {pendientes.length > 0 && (
            <View style={[styles.infoBanner, { backgroundColor: t.warningBg || '#f59e0b18', borderColor: t.warning || '#f59e0b44' }]}>
              <Text style={[styles.infoBannerText, { color: t.warning || '#f59e0b' }]}>
                Tienes {pendientes.length} solicitud{pendientes.length !== 1 ? 'es' : ''} pendiente{pendientes.length !== 1 ? 's' : ''}
              </Text>
            </View>
          )}

          {vencidas.length > 0 && (
            <View style={[styles.infoBanner, { backgroundColor: '#ef444418', borderColor: '#ef444444' }]}>
              <Text style={[styles.infoBannerText, { color: '#ef4444' }]}>
                ⚠️ Tienes {vencidas.length} solicitud{vencidas.length !== 1 ? 'es' : ''} vencida{vencidas.length !== 1 ? 's' : ''}
              </Text>
            </View>
          )}

          <View style={[styles.searchInputWrap, { backgroundColor: t.bgInput, borderColor: t.border }]}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={[styles.searchInput, { color: t.textPrimary, fontSize: text(13) }]}
              placeholder="Buscar por título o ID..."
              placeholderTextColor={t.textMuted}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <View style={styles.filterChips}>
            <Text style={[styles.filterLabel, { color: t.textMuted, fontSize: text(10) }]}>ESTADO</Text>
            <View style={styles.chipRow}>
              {[
                { key: '', label: 'Todos' },
                { key: '1', label: 'Pendiente' },
                { key: '2', label: 'Aprobada' },
                { key: '3', label: 'Rechazada' },
                { key: '4', label: 'Cancelada' },
                { key: '5', label: 'Entregado' },
                { key: '6', label: 'Devuelto' },
              ].map(opt => (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.chip, filterEstado === opt.key && styles.chipActive, { backgroundColor: filterEstado === opt.key ? t.accent : t.bgCardAlt, borderColor: t.border }]}
                  onPress={() => setFilterEstado(opt.key)}
                >
                  <Text style={[styles.chipText, { color: filterEstado === opt.key ? '#fff' : t.textSecondary, fontSize: text(11) }]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {filteredItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 40, marginBottom: 10, opacity: 0.6 }}>📭</Text>
              <Text style={[styles.emptyText, { color: t.textMuted }]}>
                {search || filterEstado ? 'No hay solicitudes con esos filtros' : 'No tienes solicitudes de libros'}
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.list}>
                {paged.map((s) => {
                  const estadoNum = estadoEfectivo(s);
                  const est = getEstado(estadoNum);
                  const ep = getEstadoPrestamo(s.prestamo);
                  return (
                    <View key={s.id} style={[styles.card, { backgroundColor: t.bgCard, borderColor: estaVencido(s) ? '#ef4444' : t.border }]}>
                      <View style={styles.cardTop}>
                        <View style={styles.cardTopLeft}>
                          <Text style={[styles.cardTitle, { color: t.textPrimary, fontSize: text(14) }]} numberOfLines={1}>
                            {s.titulo || `Libro #${s.ejemplar_id}`}
                          </Text>
                        </View>
                        <View style={styles.cardBadgeColumn}>
                          <View style={[styles.cardBadge, { backgroundColor: est.bg }]}>
                            <Text style={[styles.cardBadgeText, { color: est.color, fontSize: text(9) }]}>
                              {est.label}
                            </Text>
                          </View>
                          {estaVencido(s) && (
                            <Text style={[styles.overdueText, { color: '#ef4444', fontSize: text(9) }]}>
                              ⚠ Vencido
                            </Text>
                          )}
                          {ep && (
                            <View style={[styles.cardBadge, { backgroundColor: ep.bg }]}>
                              <Text style={[styles.cardBadgeText, { color: ep.color, fontSize: text(8) }]}>
                                📖 {ep.label}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>

                      {s.autor && (
                        <Text style={[styles.cardAutor, { color: t.textMuted, fontSize: text(11) }]}>
                          {s.autor}
                        </Text>
                      )}

                      <View style={[styles.cardDivider, { backgroundColor: t.divider }]} />

                      <View style={styles.cardInfo}>
                        <View style={styles.infoRow}>
                          <Text style={[styles.infoLabel, { color: t.textMuted, fontSize: text(10) }]}>SOLICITUD #</Text>
                          <Text style={[styles.infoValue, { color: t.textSecondary, fontSize: text(12) }]}>{s.id}</Text>
                        </View>
                        <View style={styles.infoRow}>
                          <Text style={[styles.infoLabel, { color: t.textMuted, fontSize: text(10) }]}>FECHA</Text>
                          <Text style={[styles.infoValue, { color: t.textSecondary, fontSize: text(12) }]}>
                            {fmtFecha(s.fecha_solicitud) || 'N/A'}
                          </Text>
                        </View>
                        {s.fecha_aprobacion && (
                          <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, { color: t.textMuted, fontSize: text(10) }]}>APROBACIÓN</Text>
                            <Text style={[styles.infoValue, { color: t.textSecondary, fontSize: text(12) }]}>
                              {fmtFecha(s.fecha_aprobacion)}
                            </Text>
                          </View>
                        )}
                        {s.fecha_limite_devolucion && (
                          <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, { color: t.textMuted, fontSize: text(10) }]}>LÍMITE DEV.</Text>
                            <Text style={[styles.infoValue, { color: t.textSecondary, fontSize: text(12) }]}>
                              {fmtFecha(s.fecha_limite_devolucion)}
                            </Text>
                          </View>
                        )}
                        {s.fecha_devolucion_real && (
                          <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, { color: t.textMuted, fontSize: text(10) }]}>DEVUELTO</Text>
                            <Text style={[styles.infoValue, { color: t.success || '#22c55e', fontSize: text(12) }]}>
                              {fmtFecha(s.fecha_devolucion_real)}
                            </Text>
                          </View>
                        )}
                      </View>

                      {estadoNum === 1 && (
                        <TouchableOpacity
                          style={[styles.cancelBtn, { backgroundColor: t.dangerBg || '#ef444422', borderColor: t.danger || '#ef4444' }]}
                          onPress={() => setCancelModal(s)}
                          activeOpacity={0.85}
                        >
                          <Text style={{ fontSize: 14, marginRight: 6 }}>✕</Text>
                          <Text style={[styles.cancelBtnText, { color: t.danger || '#ef4444', fontSize: text(12) }]}>Cancelar solicitud</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </View>

              {filteredItems.length > PER_PAGE && (
                <View style={styles.pagination}>
                  <TouchableOpacity
                    style={[styles.pageBtn, { backgroundColor: t.bgCardAlt, borderColor: t.border }, page <= 1 && styles.pageBtnDisabled]}
                    onPress={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    <Text style={[styles.pageBtnText, { color: page <= 1 ? t.textMuted : t.textPrimary }]}>‹ Anterior</Text>
                  </TouchableOpacity>
                  <Text style={[styles.pageInfo, { color: t.textMuted }]}>{page} / {totalPages}</Text>
                  <TouchableOpacity
                    style={[styles.pageBtn, { backgroundColor: t.bgCardAlt, borderColor: t.border }, page >= totalPages && styles.pageBtnDisabled]}
                    onPress={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    <Text style={[styles.pageBtnText, { color: page >= totalPages ? t.textMuted : t.textPrimary }]}>Siguiente ›</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}

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

      <Modal visible={!!cancelModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: t.bgCard, borderColor: t.border }]}>
            <Text style={[styles.modalTitle, { color: t.textPrimary }]}>Cancelar Solicitud</Text>
            <View style={[styles.modalDivider, { backgroundColor: t.divider }]} />
            <Text style={[styles.modalBody, { color: t.textSecondary }]}>
              ¿Estás seguro de cancelar la solicitud <Text style={{ fontWeight: '700', color: t.textPrimary }}>#{cancelModal?.id}</Text>?
            </Text>
            {cancelModal?.titulo && (
              <Text style={[styles.modalDetail, { color: t.textMuted }]}>
                Libro: {cancelModal.titulo}
              </Text>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { borderColor: t.btnSecondaryBorder, borderWidth: 1.5 }]}
                onPress={() => setCancelModal(null)}
              >
                <Text style={[styles.modalBtnText, { color: t.textSecondary }]}>Cerrar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnDanger, { backgroundColor: t.danger || '#ef4444' }]}
                disabled={submitting}
                onPress={handleCancel}
              >
                {submitting
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={[styles.modalBtnText, { color: '#fff' }]}>Sí, cancelar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderCard: { borderRadius: 20, padding: 40, alignItems: 'center', borderWidth: 1 },
  loaderText: { marginTop: 14, fontSize: 15, fontWeight: '500' },

  content: { paddingTop: 54, paddingBottom: 40 },

  headerSection: { alignItems: 'center', marginBottom: 24 },
  headerIcon: { width: 68, height: 68, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  title: { fontWeight: '700', letterSpacing: 0.4 },
  subtitle: { fontSize: 13, marginTop: 6, textAlign: 'center' },
  divider: { height: 3, width: 44, borderRadius: 2, marginTop: 14 },

  infoBanner: { borderRadius: 12, padding: 12, borderWidth: 1, marginBottom: 16 },
  infoBannerText: { fontSize: 12, fontWeight: '500' },

  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, fontWeight: '500', textAlign: 'center' },

  searchInputWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, marginBottom: 12 },
  searchIcon: { fontSize: 14, marginRight: 8 },
  searchInput: { flex: 1, height: 44 },

  filterChips: { marginBottom: 16 },
  filterLabel: { fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6, marginLeft: 2 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  chipActive: { borderColor: 'transparent' },
  chipText: { fontWeight: '600' },

  list: { gap: 14, marginBottom: 20 },

  card: { borderRadius: 16, padding: 16, borderWidth: 1 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTopLeft: { flex: 1, marginRight: 10 },
  cardTitle: { fontWeight: '700' },
  cardBadgeColumn: { alignItems: 'flex-end', gap: 4 },
  cardBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  cardBadgeText: { fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  overdueText: { fontWeight: '700' },
  cardAutor: { marginTop: 4, fontStyle: 'italic' },
  cardDivider: { height: 1, marginVertical: 12 },

  cardInfo: { gap: 6 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' },
  infoValue: { fontWeight: '500' },

  cancelBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 10, paddingVertical: 10, marginTop: 12,
    borderWidth: 1,
  },
  cancelBtnText: { fontWeight: '700' },

  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 20 },
  pageBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  pageBtnDisabled: { opacity: 0.4 },
  pageBtnText: { fontWeight: '600', fontSize: 13 },
  pageInfo: { fontWeight: '600', fontSize: 13, minWidth: 50, textAlign: 'center' },

  refreshBtn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, marginBottom: 12 },
  refreshBtnText: { fontWeight: '600' },
  backBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontWeight: '600' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 32 },
  modalCard: { width: '100%', borderRadius: 20, padding: 24, borderWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  modalDivider: { width: 36, height: 3, borderRadius: 2, alignSelf: 'center', marginVertical: 12 },
  modalBody: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 8 },
  modalDetail: { fontSize: 12, textAlign: 'center', marginBottom: 20 },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalBtn: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  modalBtnDanger: {},
  modalBtnText: { fontWeight: '700', fontSize: 14 },
});

export default Prestamos;
