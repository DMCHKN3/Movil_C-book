import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, StatusBar, Modal, Alert,
} from 'react-native';
import useScale from '../hooks/useScale';
import { getEjemplaresConLibros, getLibrosMasSolicitados } from '../../tablas/libros';
import { crearSolicitudLibro, contarSolicitudesActivas } from '../../tablas/solicitudesAcciones';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { getDatos } from '../../tablas/cuenta';

const MAX_LIBROS = 3;

const Biblioteca = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { getUserBoleta, isAuthenticated } = useUser();
  const { s, vs, text } = useScale();
  const boleta = getUserBoleta();

  const [items, setItems] = useState([]);
  const [masSolicitados, setMasSolicitados] = useState([]);
  const [activasCount, setActivasCount] = useState(0);
  const [tieneDocumentos, setTieneDocumentos] = useState(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterDisp, setFilterDisp] = useState('');
  const [page, setPage] = useState(1);
  const PER_PAGE = 3;

  const [confirmItem, setConfirmItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const t = theme;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ejemplares, masSol, activas, datos] = await Promise.all([
        getEjemplaresConLibros(),
        getLibrosMasSolicitados(),
        isAuthenticated() && boleta ? contarSolicitudesActivas(boleta) : Promise.resolve(0),
        isAuthenticated() && boleta ? getDatos(boleta) : Promise.resolve(null),
      ]);
      setItems(ejemplares);
      setMasSolicitados(masSol);
      setActivasCount(activas);
      setTieneDocumentos(datos?.[0]?.tiene_documentos ?? false);
    } catch (err) {
      console.error('Error cargando biblioteca:', err);
    } finally {
      setLoading(false);
    }
  }, [boleta, isAuthenticated]);

  useEffect(() => { load(); }, [load]);

  const tipos = useMemo(() => {
    return [...new Set(items.map(b => b.libros?.tipo_material).filter(Boolean))];
  }, [items]);

  useEffect(() => { setPage(1); }, [search, filterTipo, filterDisp]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter(b => {
      const titulo = (b.libros?.titulo || '').toLowerCase();
      const autor = (b.libros?.autor || '').toLowerCase();
      const isbn = (b.libros?.isbn || '').toLowerCase();
      const clasificacion = (b.libros?.clasificacion || '').toLowerCase();
      const tipo = b.libros?.tipo_material || '';
      const disponible = b.Disponible;

      if (q && !(
        titulo.includes(q) || autor.includes(q) ||
        isbn.includes(q) || clasificacion.includes(q)
      )) return false;

      if (filterTipo && tipo !== filterTipo) return false;
      if (filterDisp === 'si' && !disponible) return false;
      if (filterDisp === 'no' && disponible) return false;

      return true;
    });
  }, [items, search, filterTipo, filterDisp]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSolicitar = async () => {
    if (!confirmItem || submitting) return;
    if (!tieneDocumentos) {
      Alert.alert('Permiso requerido', 'Acude a biblioteca a solicitar tu permiso para préstamo de libros');
      setConfirmItem(null);
      return;
    }
    setSubmitting(true);
    try {
      const resultado = await crearSolicitudLibro(boleta, confirmItem.id);
      if (resultado.ok) {
        setItems(prev => prev.map(b =>
          b.id === confirmItem.id ? { ...b, Disponible: false } : b
        ));
        setActivasCount(prev => prev + 1);
        setConfirmItem(null);
        Alert.alert('Éxito', resultado.message);
      } else {
        Alert.alert('Error', resultado.message);
        setConfirmItem(null);
      }
    } catch {
      Alert.alert('Error', 'Error al crear la solicitud');
      setConfirmItem(null);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: t.bg }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={t.bg} />
        <View style={[styles.loaderCard, { backgroundColor: t.bgCard, borderColor: t.border }]}>
          <ActivityIndicator size="large" color={t.accent} />
          <Text style={[styles.loaderText, { color: t.textSecondary }]}>Cargando biblioteca...</Text>
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
              <Text style={{ fontSize: 30 }}>📚</Text>
            </View>
            <Text style={[styles.title, { color: t.textPrimary, fontSize: text(24) }]}>Biblioteca</Text>
            <Text style={[styles.subtitle, { color: t.textMuted }]}>Busca y solicita libros del acervo</Text>
            <View style={[styles.divider, { backgroundColor: t.divider }]} />
          </View>

          {tieneDocumentos === false && (
            <View style={[styles.warningBanner, { backgroundColor: '#ef444418', borderColor: '#ef444444' }]}>
              <Text style={[styles.warningText, { color: '#ef4444' }]}>
                Acude a biblioteca a solicitar tu permiso para préstamo de libros
              </Text>
            </View>
          )}

          {activasCount >= MAX_LIBROS && (
            <View style={[styles.warningBanner, { backgroundColor: t.warningBg || '#f59e0b18', borderColor: t.warning || '#f59e0b44' }]}>
              <Text style={[styles.warningText, { color: t.warning || '#f59e0b' }]}>
                Ya tienes {activasCount} solicitudes activas (máximo {MAX_LIBROS}). Concluye alguna antes de solicitar otro.
              </Text>
            </View>
          )}

          {masSolicitados.length > 0 && (
            <View style={styles.topSection}>
              <View style={styles.topHead}>
                <Text style={[styles.topTitle, { color: t.accentBright, fontSize: text(13) }]}>🔥 Más solicitados</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topRow}>
                {masSolicitados.map((b, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.topCard, { backgroundColor: t.bgCard, borderColor: t.borderStrong }]}
                    onPress={() => {
                      setSearch(b.titulo);
                      setFilterTipo('');
                      setFilterDisp('');
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.topCardTitle, { color: t.textPrimary, fontSize: text(12) }]} numberOfLines={2}>
                      {b.titulo}
                    </Text>
                    <Text style={[styles.topCardAutor, { color: t.textMuted, fontSize: text(10) }]} numberOfLines={1}>
                      {b.autor}
                    </Text>
                    <Text style={[styles.topCardCount, { color: t.accentBright, fontSize: text(11) }]}>
                      {b.solicitudes_count} solicitudes
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.searchRow}>
            <View style={[styles.searchInputWrap, { backgroundColor: t.bgInput, borderColor: t.border }]}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={[styles.searchInput, { color: t.textPrimary, fontSize: text(13) }]}
                placeholder="Buscar por título, autor, ISBN..."
                placeholderTextColor={t.textMuted}
                value={search}
                onChangeText={setSearch}
              />
            </View>
          </View>

          <View style={styles.filterChips}>
            <Text style={[styles.filterLabel, { color: t.textMuted, fontSize: text(10) }]}>TIPO</Text>
            <View style={styles.chipRow}>
              <TouchableOpacity
                style={[styles.chip, filterTipo === '' && styles.chipActive, { backgroundColor: filterTipo === '' ? t.accent : t.bgCardAlt, borderColor: t.border }]}
                onPress={() => setFilterTipo('')}
              >
                <Text style={[styles.chipText, { color: filterTipo === '' ? '#fff' : t.textSecondary, fontSize: text(11) }]}>Todos</Text>
              </TouchableOpacity>
              {tipos.map(tipo => (
                <TouchableOpacity
                  key={tipo}
                  style={[styles.chip, filterTipo === tipo && styles.chipActive, { backgroundColor: filterTipo === tipo ? t.accent : t.bgCardAlt, borderColor: t.border }]}
                  onPress={() => setFilterTipo(filterTipo === tipo ? '' : tipo)}
                >
                  <Text style={[styles.chipText, { color: filterTipo === tipo ? '#fff' : t.textSecondary, fontSize: text(11) }]}>{tipo}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterChips}>
            <Text style={[styles.filterLabel, { color: t.textMuted, fontSize: text(10) }]}>DISPONIBILIDAD</Text>
            <View style={styles.chipRow}>
              {[
                { key: '', label: 'Todas' },
                { key: 'si', label: 'Disponible' },
                { key: 'no', label: 'No disponible' },
              ].map(opt => (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.chip, filterDisp === opt.key && styles.chipActive, { backgroundColor: filterDisp === opt.key ? t.accent : t.bgCardAlt, borderColor: t.border }]}
                  onPress={() => setFilterDisp(opt.key)}
                >
                  <Text style={[styles.chipText, { color: filterDisp === opt.key ? '#fff' : t.textSecondary, fontSize: text(11) }]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 40, marginBottom: 10, opacity: 0.6 }}>📭</Text>
              <Text style={[styles.emptyText, { color: t.textMuted }]}>No se encontraron libros</Text>
            </View>
          ) : (
            <View style={styles.cardGrid}>
              {paged.map((b) => {
                const disponible = b.Disponible;
                return (
                  <View key={b.id} style={[styles.card, { backgroundColor: t.bgCard, borderColor: t.border }]}>
                    <View style={styles.cardTitleRow}>
                      <Text style={[styles.cardTitle, { color: t.textPrimary, fontSize: text(13) }]} numberOfLines={2}>
                        {b.libros?.titulo || 'Sin título'}
                      </Text>
                      <View style={[styles.badge, { backgroundColor: disponible ? (t.successBg || '#22c55e22') : (t.dangerBg || '#ef444422') }]}>
                        <Text style={[styles.badgeText, { color: disponible ? (t.success || '#22c55e') : (t.danger || '#ef4444'), fontSize: text(9) }]}>
                          {disponible ? 'Disponible' : 'No disponible'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cardBody}>
                      <Text style={[styles.cardLabel, { color: t.textMuted, fontSize: text(10) }]}>Autor</Text>
                      <Text style={[styles.cardValue, { color: t.textSecondary, fontSize: text(11) }]} numberOfLines={1}>{b.libros?.autor || '-'}</Text>

                      <Text style={[styles.cardLabel, { color: t.textMuted, fontSize: text(10) }]}>Clasificación</Text>
                      <Text style={[styles.cardValue, { color: t.textSecondary, fontSize: text(11) }]} numberOfLines={1}>{b.libros?.clasificacion || '-'}</Text>

                      <Text style={[styles.cardLabel, { color: t.textMuted, fontSize: text(10) }]}>ISBN</Text>
                      <Text style={[styles.cardValue, { color: t.textSecondary, fontSize: text(11) }]} numberOfLines={1}>{b.libros?.isbn || '-'}</Text>

                      <View style={styles.cardRow}>
                        <View style={styles.cardCol}>
                          <Text style={[styles.cardLabel, { color: t.textMuted, fontSize: text(10) }]}>Tipo</Text>
                          <Text style={[styles.cardValue, { color: t.textSecondary, fontSize: text(11) }]}>
                            {b.libros?.tipo_material || '-'}
                          </Text>
                        </View>
                        <View style={styles.cardCol}>
                          <Text style={[styles.cardLabel, { color: t.textMuted, fontSize: text(10) }]}>Ejemplar #</Text>
                          <Text style={[styles.cardValue, { color: t.textSecondary, fontSize: text(11) }]}>
                            {b.numero_ejemplar || '-'}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.solicitarBtn,
                        { backgroundColor: disponible && tieneDocumentos !== false ? t.btnPrimary : t.bgCardAlt },
                        (!disponible || activasCount >= MAX_LIBROS || tieneDocumentos !== true) && styles.solicitarBtnDisabled,
                      ]}
                      disabled={!disponible || activasCount >= MAX_LIBROS || tieneDocumentos !== true}
                      onPress={() => {
                        if (!tieneDocumentos) {
                          Alert.alert('Permiso requerido', 'Acude a biblioteca a solicitar tu permiso para préstamo de libros');
                          return;
                        }
                        setConfirmItem(b);
                      }}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.solicitarBtnText, {
                        color: disponible ? t.btnPrimaryText : t.textMuted,
                        fontSize: text(12),
                      }]}>
                        {activasCount >= MAX_LIBROS ? 'Límite alcanzado' : 'Solicitar'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}

          {filtered.length > PER_PAGE && (
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

          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: t.btnPrimary }]}
            onPress={() => navigation.navigate('Main')}
            activeOpacity={0.85}
          >
            <Text style={[styles.backBtnText, { color: t.btnPrimaryText, fontSize: text(15) }]}>← Regresar al Menú</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={!!confirmItem} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: t.bgCard, borderColor: t.border }]}>
            <Text style={[styles.modalTitle, { color: t.textPrimary }]}>Confirmar Solicitud</Text>
            <View style={[styles.modalDivider, { backgroundColor: t.divider }]} />
            <Text style={[styles.modalBody, { color: t.textSecondary }]}>
              ¿Deseas solicitar el libro <Text style={{ fontWeight: '700', color: t.textPrimary }}>{confirmItem?.libros?.titulo || ''}</Text>?
            </Text>
            <Text style={[styles.modalDetail, { color: t.textMuted }]}>
              Autor: {confirmItem?.libros?.autor || '-'} | ISBN: {confirmItem?.libros?.isbn || '-'}
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel, { borderColor: t.btnSecondaryBorder }]}
                onPress={() => setConfirmItem(null)}
              >
                <Text style={[styles.modalBtnText, { color: t.textSecondary }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnConfirm, { backgroundColor: t.btnPrimary }]}
                disabled={submitting}
                onPress={handleSolicitar}
              >
                {submitting
                  ? <ActivityIndicator color={t.btnPrimaryText} size="small" />
                  : <Text style={[styles.modalBtnText, { color: t.btnPrimaryText }]}>Confirmar</Text>}
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

  warningBanner: { borderRadius: 12, padding: 12, borderWidth: 1, marginBottom: 16 },
  warningText: { fontSize: 12, fontWeight: '500', lineHeight: 18 },

  topSection: { marginBottom: 20 },
  topHead: { marginBottom: 10 },
  topTitle: { fontWeight: '700' },
  topRow: { gap: 10, paddingRight: 20 },
  topCard: { width: 150, borderRadius: 12, padding: 12, borderWidth: 1 },
  topCardTitle: { fontWeight: '600', marginBottom: 4 },
  topCardAutor: { marginBottom: 6 },
  topCardCount: { fontWeight: '700' },

  searchRow: { marginBottom: 12 },
  searchInputWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 12 },
  searchIcon: { fontSize: 14, marginRight: 8 },
  searchInput: { flex: 1, height: 44 },

  filterChips: { marginBottom: 12 },
  filterLabel: { fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6, marginLeft: 2 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  chipActive: { borderColor: 'transparent' },
  chipText: { fontWeight: '600' },

  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, fontWeight: '500', textAlign: 'center' },

  cardGrid: { gap: 14, marginBottom: 20 },
  card: { borderRadius: 16, overflow: 'hidden', borderWidth: 1 },
  cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 14, paddingBottom: 8 },
  cardTitle: { flex: 1, fontWeight: '700', marginRight: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },

  cardBody: { paddingHorizontal: 14, paddingBottom: 10, gap: 2 },
  cardLabel: { fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 4 },
  cardValue: { fontWeight: '500' },
  cardRow: { flexDirection: 'row', gap: 16, marginTop: 4 },
  cardCol: { flex: 1 },

  solicitarBtn: { marginHorizontal: 14, marginBottom: 14, borderRadius: 10, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  solicitarBtnDisabled: { opacity: 0.5 },
  solicitarBtnText: { fontWeight: '700', letterSpacing: 0.3 },

  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 20 },
  pageBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  pageBtnDisabled: { opacity: 0.4 },
  pageBtnText: { fontWeight: '600', fontSize: 13 },
  pageInfo: { fontWeight: '600', fontSize: 13, minWidth: 50, textAlign: 'center' },

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
  modalBtnCancel: { borderWidth: 1.5 },
  modalBtnConfirm: {},
  modalBtnText: { fontWeight: '700', fontSize: 14 },
});

export default Biblioteca;
