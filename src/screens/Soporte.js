import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  Alert, StatusBar, ActivityIndicator,
} from 'react-native';
import useScale from '../hooks/useScale';
import { useTheme } from '../context/ThemeContext';
import { getTicketTypes, createTicket, getMyTickets } from '../api/supportApi';
import { useUser } from '../context/UserContext';

const TIPOS_FALLBACK = [
  { id: 'funcional',   label: 'Funcional',   emoji: '🐛', color: '#0284c7' },
  { id: 'visual',      label: 'Visual',      emoji: '👁️', color: '#8b5cf6' },
  { id: 'rendimiento', label: 'Rendimiento', emoji: '⚡',  color: '#d97706' },
  { id: 'datos',       label: 'Datos',       emoji: '#️⃣',  color: '#1f9d74' },
  { id: 'acceso',      label: 'Acceso',      emoji: '🔒',  color: '#dc4c3f' },
  { id: 'otro',        label: 'Otro',        emoji: '⋯',   color: '#64748b' },
];

const PRIORIDADES = [
  { id: 'baja',  label: 'Baja',  color: '#22c55e' },
  { id: 'media', label: 'Media', color: '#d97706' },
  { id: 'alta',  label: 'Alta',  color: '#ef4444' },
];

const ESTADO_MAP = {
  'New': 'Abierto',
  'Open': 'Abierto',
  'Pending': 'Pendiente',
  'Waiting': 'Pendiente',
  'Resolved': 'Resuelto',
  'Closed': 'Cerrado',
};

const estadoStyle = (estado) => {
  switch (estado) {
    case 'Abierto':   return { bg: '#0284c722', color: '#0284c7' };
    case 'Pendiente': return { bg: '#d9770622', color: '#d97706' };
    case 'Resuelto':  return { bg: '#22c55e22', color: '#22c55e' };
    case 'Cerrado':   return { bg: '#64748b22', color: '#64748b' };
    default:          return { bg: '#64748b22', color: '#64748b' };
  }
};

const fmtFecha = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const Soporte = ({ navigation }) => {
  const { s, vs, text } = useScale();
  const { theme, isDark } = useTheme();
  const { perfil } = useUser();
  const t = theme;

  const [tab, setTab] = useState('reportar');
  const [tipoSel, setTipoSel] = useState(null);
  const [prioSel, setPrioSel] = useState(null);
  const [desc, setDesc] = useState('');
  const [filterEstado, setFilterEstado] = useState('Todos');

  const [tipos, setTipos] = useState(TIPOS_FALLBACK);
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchTickets = useCallback(async () => {
    setLoadingTickets(true);
    try {
      const res = await getMyTickets();
      const data = res.data || [];
      setTickets(data.map(tk => ({
        id: tk.ticket_number || `TK-${tk.id}`,
        titulo: tk.title,
        tipo: tk.incident_type_name || tk.module || 'General',
        estado: ESTADO_MAP[tk.status] || tk.status,
        prioridad: tk.priority || 'Media',
        fecha: fmtFecha(tk.created_at),
        raw: tk,
      })));
    } catch (err) {
      console.error('Error cargando tickets:', err);
    } finally {
      setLoadingTickets(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'mis_reportes') {
      fetchTickets();
    }
  }, [tab, fetchTickets]);

  const handleEnviar = async () => {
    if (!tipoSel) {
      Alert.alert('Selecciona tipo', 'Elige que tipo de error reportar.');
      return;
    }
    if (!desc.trim()) {
      Alert.alert('Describe el error', 'Cuentanos que paso para poder ayudarte.');
      return;
    }
    setSubmitting(true);
    try {
      await createTicket({
        title: desc.slice(0, 80),
        description: desc,
        incident_type_id: tipoSel,
        priority: prioSel || 'media',
        module: 'movil',
      });
      Alert.alert(
        'Reporte enviado',
        'Hemos recibido tu reporte. Te notificaremos cuando haya actualizaciones.',
        [{ text: 'OK', onPress: () => { setTipoSel(null); setPrioSel(null); setDesc(''); } }]
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo enviar el reporte.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTickets = filterEstado === 'Todos'
    ? tickets
    : tickets.filter(tk => tk.estado === filterEstado);

  const stats = {
    activos: tickets.filter(tk => tk.estado === 'Abierto' || tk.estado === 'Pendiente').length,
    resueltos: tickets.filter(tk => tk.estado === 'Resuelto').length,
  };

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={t.bg} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.content, { paddingHorizontal: s(20) }]}>

          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={[styles.pageTitle, { color: t.textPrimary, fontSize: text(24) }]}>Soporte</Text>
              <View style={[styles.divider, { backgroundColor: t.divider }]} />
            </View>
          </View>

          <View style={[styles.segmented, { backgroundColor: t.bgCardAlt, borderColor: t.border }]}>
            {['reportar', 'mis_reportes'].map(s => (
              <TouchableOpacity
                key={s}
                style={[styles.segBtn, tab === s && { backgroundColor: t.bgCard }]}
                onPress={() => setTab(s)}
                activeOpacity={0.8}
              >
                <Text style={[styles.segText, { color: tab === s ? t.textPrimary : t.textMuted, fontSize: text(13) }]}>
                  {s === 'reportar' ? 'Reportar error' : 'Mis reportes'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {tab === 'reportar' ? (
            <>
              <Text style={[styles.fieldLabel, { color: t.textSecondary, fontSize: text(13) }]}>Tipo de error</Text>
              <View style={styles.tipoGrid}>
                {tipos.map(tp => (
                  <TouchableOpacity
                    key={tp.id}
                    style={[
                      styles.tipoCard,
                      { backgroundColor: t.bgCardAlt, borderColor: t.border },
                      tipoSel === tp.id && { backgroundColor: tp.color + '22', borderColor: tp.color },
                    ]}
                    onPress={() => setTipoSel(tp.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={{ fontSize: 20, marginBottom: 4 }}>{tp.emoji}</Text>
                    <Text style={[styles.tipoLabel, { color: tipoSel === tp.id ? tp.color : t.textSecondary, fontSize: text(11) }]}>
                      {tp.label}
                    </Text>
                    {tipoSel === tp.id && <View style={[styles.tipoCheck, { backgroundColor: tp.color }]}><Text style={{ color: '#fff', fontSize: 9, fontWeight: '800' }}>✓</Text></View>}
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.fieldLabel, { color: t.textSecondary, fontSize: text(13) }]}>Prioridad</Text>
              <View style={styles.prioRow}>
                {PRIORIDADES.map(p => (
                  <TouchableOpacity
                    key={p.id}
                    style={[
                      styles.prioCard,
                      { borderColor: t.border },
                      prioSel === p.id && { borderColor: p.color, backgroundColor: p.color + '18' },
                    ]}
                    onPress={() => setPrioSel(p.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.prioText, { color: prioSel === p.id ? p.color : t.textSecondary, fontSize: text(13) }]}>
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.fieldLabel, { color: t.textSecondary, fontSize: text(13) }]}>Descripcion</Text>
              <TextInput
                style={[styles.textarea, { backgroundColor: t.bgInput || t.bgCardAlt, borderColor: t.border, color: t.textPrimary, fontSize: text(13) }]}
                placeholder="Cuentanos que paso, que esperabas que pasara y como podemos reproducirlo..."
                placeholderTextColor={t.textMuted}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                value={desc}
                onChangeText={setDesc}
              />
              <View style={styles.charRow}>
                <Text style={[styles.charHint, { color: desc.length > 100 ? '#22c55e' : t.textMuted, fontSize: text(10) }]}>
                  {desc.length > 100 ? 'Buena descripcion' : 'Describe con detalles'}
                </Text>
                <Text style={[styles.charCount, { color: t.textMuted, fontSize: text(10) }]}>{desc.length} / 2000</Text>
              </View>

              <TouchableOpacity
                style={[styles.sendBtn, { backgroundColor: t.btnPrimary }, submitting && { opacity: 0.6 }]}
                onPress={handleEnviar}
                disabled={submitting}
                activeOpacity={0.85}
              >
                {submitting ? (
                  <ActivityIndicator color={t.btnPrimaryText} size="small" />
                ) : (
                  <>
                    <Text style={{ fontSize: 16, marginRight: 8 }}>📤</Text>
                    <Text style={[styles.sendBtnText, { color: t.btnPrimaryText, fontSize: text(15) }]}>Enviar reporte</Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={[styles.infoCard, { backgroundColor: t.bgCardAlt, borderColor: t.border }]}>
                <Text style={{ fontSize: 16, marginRight: 10 }}>⚡</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.infoTitle, { color: t.textPrimary, fontSize: text(12) }]}>Se creara un ticket nuevo</Text>
                  <Text style={[styles.infoDesc, { color: t.textMuted, fontSize: text(11) }]}>
                    Recibiras notificaciones cuando un agente lo tome o solicite mas informacion.
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <>
              {loadingTickets ? (
                <View style={styles.loadingCenter}>
                  <ActivityIndicator size="large" color={t.accent} />
                  <Text style={[styles.loadingText, { color: t.textMuted }]}>Cargando reportes...</Text>
                </View>
              ) : (
                <>
                  <View style={styles.statsRow}>
                    <View style={[styles.statCard, { backgroundColor: t.bgCardAlt, borderColor: t.border }]}>
                      <Text style={[styles.statValue, { color: t.textPrimary, fontSize: text(20) }]}>{stats.activos}</Text>
                      <Text style={[styles.statLabel, { color: t.textMuted, fontSize: text(10) }]}>activos</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: t.bgCardAlt, borderColor: t.border }]}>
                      <Text style={[styles.statValue, { color: '#22c55e', fontSize: text(20) }]}>{stats.resueltos}</Text>
                      <Text style={[styles.statLabel, { color: t.textMuted, fontSize: text(10) }]}>resueltos</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: t.bgCardAlt, borderColor: t.border }]}>
                      <Text style={[styles.statValue, { color: t.textPrimary, fontSize: text(20) }]}>{tickets.length}</Text>
                      <Text style={[styles.statLabel, { color: t.textMuted, fontSize: text(10) }]}>total</Text>
                    </View>
                  </View>

                  <View style={styles.chipRow}>
                    {['Todos', 'Abierto', 'Pendiente', 'Resuelto', 'Cerrado'].map(c => (
                      <TouchableOpacity
                        key={c}
                        style={[
                          styles.chip,
                          { borderColor: t.border },
                          filterEstado === c && { backgroundColor: t.accent, borderColor: t.accent },
                        ]}
                        onPress={() => setFilterEstado(c)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.chipText, { color: filterEstado === c ? '#fff' : t.textSecondary, fontSize: text(11) }]}>
                          {c}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {filteredTickets.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Text style={{ fontSize: 40, marginBottom: 10, opacity: 0.6 }}>📭</Text>
                      <Text style={[styles.emptyText, { color: t.textMuted, fontSize: text(13) }]}>No hay reportes</Text>
                    </View>
                  ) : (
                    <View style={styles.ticketList}>
                      {filteredTickets.map(tk => {
                        const es = estadoStyle(tk.estado);
                        return (
                          <View key={tk.id} style={[styles.ticketCard, { backgroundColor: t.bgCard, borderColor: t.border }]}>
                            <View style={styles.ticketTop}>
                              <Text style={[styles.ticketId, { color: t.textMuted, fontSize: text(10) }]}>{tk.id}</Text>
                              <View style={[styles.ticketBadge, { backgroundColor: es.bg }]}>
                                <Text style={[styles.ticketBadgeText, { color: es.color, fontSize: text(9) }]}>{tk.estado}</Text>
                              </View>
                            </View>
                            <Text style={[styles.ticketTitle, { color: t.textPrimary, fontSize: text(13) }]} numberOfLines={2}>
                              {tk.titulo}
                            </Text>
                            <View style={styles.ticketBottom}>
                              <Text style={[styles.ticketMeta, { color: t.textMuted, fontSize: text(10) }]}>{tk.tipo}</Text>
                              <Text style={[styles.ticketMeta, { color: t.textMuted, fontSize: text(10) }]}>{tk.fecha}</Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </>
              )}
            </>
          )}

          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: t.btnPrimary, marginTop: tab === 'reportar' ? 0 : 16 }]}
            onPress={() => navigation.navigate('Cuenta')}
            activeOpacity={0.85}
          >
            <Text style={[styles.backBtnText, { color: t.btnPrimaryText, fontSize: text(15) }]}>← Regresar a Cuenta</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingTop: 54, paddingBottom: 40 },

  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 },
  headerLeft: { flex: 1 },
  pageTitle: { fontWeight: '700', letterSpacing: 0.4 },
  divider: { height: 3, width: 44, borderRadius: 2, marginTop: 10 },

  segmented: { flexDirection: 'row', borderRadius: 14, padding: 3, borderWidth: 1, marginBottom: 24 },
  segBtn: { flex: 1, borderRadius: 11, paddingVertical: 10, alignItems: 'center' },
  segText: { fontWeight: '600' },

  fieldLabel: { fontWeight: '700', marginBottom: 10, letterSpacing: 0.3 },

  tipoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 22 },
  tipoCard: {
    width: '48%', borderRadius: 14, padding: 14, borderWidth: 1,
    alignItems: 'center', position: 'relative',
  },
  tipoLabel: { fontWeight: '600' },
  tipoCheck: { position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },

  prioRow: { flexDirection: 'row', gap: 8, marginBottom: 22 },
  prioCard: { flex: 1, borderRadius: 12, paddingVertical: 12, borderWidth: 1.5, alignItems: 'center' },
  prioText: { fontWeight: '700' },

  textarea: { borderRadius: 14, borderWidth: 1, padding: 14, minHeight: 120 },
  charRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, marginBottom: 22 },
  charHint: { fontWeight: '500' },
  charCount: { fontWeight: '400' },

  sendBtn: { flexDirection: 'row', borderRadius: 14, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  sendBtnText: { fontWeight: '700' },

  infoCard: { flexDirection: 'row', borderRadius: 14, padding: 14, borderWidth: 1, alignItems: 'center', marginBottom: 28 },
  infoTitle: { fontWeight: '700', marginBottom: 2 },
  infoDesc: { lineHeight: 16 },

  loadingCenter: { padding: 40, alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 13 },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, borderRadius: 14, padding: 14, borderWidth: 1, alignItems: 'center' },
  statValue: { fontWeight: '800' },
  statLabel: { fontWeight: '600', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.3 },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  chipText: { fontWeight: '600' },

  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { fontWeight: '500', textAlign: 'center' },

  ticketList: { gap: 10, marginBottom: 20 },
  ticketCard: { borderRadius: 16, padding: 14, borderWidth: 1 },
  ticketTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  ticketId: { fontWeight: '600', letterSpacing: 0.3 },
  ticketBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  ticketBadgeText: { fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  ticketTitle: { fontWeight: '600', lineHeight: 18, marginBottom: 8 },
  ticketBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  ticketMeta: { fontWeight: '500' },

  backBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontWeight: '600' },
});

export default Soporte;
