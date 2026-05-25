import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  Alert, StatusBar, ActivityIndicator,
} from 'react-native';
import useScale from '../hooks/useScale';
import { useTheme } from '../context/ThemeContext';
import { getTicketTypes, createTicket, getMyTickets } from '../api/supportApi';
import { useUser } from '../context/UserContext';
import { validarSoporte, enviarSoporte } from '../validaciones/validacionSoporte';
import { trackEvent } from '../services/analyticsService';

const TIPOS_FALLBACK = [
  { id: 'funcional',   label: 'Funcional',   desc: 'Algo no funciona como deberia',   emoji: '🐛', color: '#0284c7' },
  { id: 'visual',      label: 'Visual',      desc: 'Diseno, textos cortados, etc.',   emoji: '👁️', color: '#8b5cf6' },
  { id: 'rendimiento', label: 'Rendimiento', desc: 'Carga lenta o cuelgues',          emoji: '⚡',  color: '#d97706' },
  { id: 'datos',       label: 'Datos',       desc: 'Informacion incorrecta',          emoji: '#️⃣',  color: '#1f9d74' },
  { id: 'acceso',      label: 'Acceso',      desc: 'No puedo entrar o sin permisos',  emoji: '🔒',  color: '#dc4c3f' },
  { id: 'otro',        label: 'Otro',        desc: 'No encaja con lo anterior',       emoji: '⋯',   color: '#64748b' },
];

const KEYWORD_MAP = [
  { keywords: ['acceso', 'sesion', 'login', 'permiso'],    emoji: '🔒', color: '#dc4c3f' },
  { keywords: ['inventario', 'libro', 'ejemplar', 'catalogo'], emoji: '📚', color: '#0284c7' },
  { keywords: ['prestamo', 'devolucion', 'renovacion'],    emoji: '📝', color: '#d97706' },
  { keywords: ['tecnico', 'general', 'otro'],              emoji: '🐛', color: '#8b5cf6' },
  { keywords: ['funcional', 'funciona'],                   emoji: '🐛', color: '#0284c7' },
  { keywords: ['visual', 'diseno', 'interfaz'],            emoji: '👁️', color: '#8b5cf6' },
  { keywords: ['rendimiento', 'lento', 'carga'],           emoji: '⚡',  color: '#d97706' },
  { keywords: ['datos', 'informacion'],                    emoji: '#️⃣',  color: '#1f9d74' },
];

function getEmojiAndColor(name) {
  const lower = name.toLowerCase();
  for (const mapping of KEYWORD_MAP) {
    if (mapping.keywords.some(kw => lower.includes(kw))) {
      return { emoji: mapping.emoji, color: mapping.color };
    }
  }
  return { emoji: '⋯', color: '#64748b' };
}

const PRIORIDADES = [
  { id: 'baja',  label: 'Baja',  desc: 'Puedo seguir trabajando',            color: '#1f9d74' },
  { id: 'media', label: 'Media', desc: 'Afecta una tarea',                   color: '#d97706' },
  { id: 'alta',  label: 'Alta',  desc: 'Bloquea operacion de la biblioteca', color: '#dc4c3f' },
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
  const [tipoSel, setTipoSel] = useState('funcional');
  const [prioSel, setPrioSel] = useState('media');
  const [titulo, setTitulo] = useState('');
  const [desc, setDesc] = useState('');
  const [filterEstado, setFilterEstado] = useState('Todos');

  const [tipos, setTipos] = useState(TIPOS_FALLBACK);
  const [loadingTipos, setLoadingTipos] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchTickets = useCallback(async () => {
    setLoadingTickets(true);
    try {
      const res = await getMyTickets();
      const data = res.tickets || [];
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
    let alive = true;
    setLoadingTipos(true);
    getTicketTypes()
      .then(({ tipos: data }) => {
        if (!alive) return;
        if (!Array.isArray(data) || data.length === 0) {
          setLoadingTipos(false);
          return;
        }
        const mapped = data
          .filter((tp) => tp.is_active !== false && /[A-Za-z]{3,}/.test(String(tp.name)))
          .map((tp) => {
            const { emoji, color } = getEmojiAndColor(tp.name);
            return {
              id: tp.id,
              label: tp.name,
              desc: tp.description || 'Sin descripcion',
              emoji,
              color,
            };
          });
        if (mapped.length > 0) {
          setTipos(mapped);
          if (mapped[0]?.id) setTipoSel(mapped[0].id);
        }
        setLoadingTipos(false);
      })
      .catch(() => {
        if (alive) setLoadingTipos(false);
      });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    trackEvent('support_tab_changed', { tab });
    if (tab === 'mis_reportes') {
      fetchTickets();
    }
  }, [tab, fetchTickets]);

  const handleEnviar = async () => {
    if (submitting) return;

    const tipoNombre = tipos.find(t => t.id === tipoSel)?.label || tipoSel;

    const onSuccess = () => {
      trackEvent('support_ticket_created', { ticket_type: tipoNombre, priority: prioSel });
      setTipoSel(tipos[0]?.id || 'funcional');
      setPrioSel('media');
      setTitulo('');
      setDesc('');
    };

    await enviarSoporte(tipoNombre, titulo, desc, prioSel, onSuccess);
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
              <Text style={[styles.pageSubtitle, { color: t.accent, fontSize: text(10) }]}>Soporte C-Book</Text>
              <Text style={[styles.pageTitle, { color: t.textPrimary, fontSize: text(22) }]}>
                {tab === 'reportar' ? 'Reportar un error' : 'Mis reportes'}
              </Text>
              <Text style={[styles.pageDesc, { color: t.textMuted, fontSize: text(12) }]}>
                {tab === 'reportar' ? 'Describe el problema para poder ayudarte.' : 'Historial de tus tickets enviados.'}
              </Text>
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
              <Text style={[styles.fieldLabel, { color: t.textPrimary, fontSize: text(13) }]}>Tipo de error</Text>
              {loadingTipos ? (
                <View style={styles.loadingGrid}>
                  <ActivityIndicator size="large" color={t.accent} />
                </View>
              ) : (
              <View style={styles.tipoGrid}>
                {tipos.map(tp => (
                  <TouchableOpacity
                    key={tp.id}
                    style={[
                      styles.tipoCard,
                      { backgroundColor: t.bgCard, borderColor: t.border },
                      tipoSel === tp.id && { backgroundColor: tp.color + '18', borderColor: tp.color },
                    ]}
                    onPress={() => setTipoSel(tp.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.tipoCardHeader}>
                      <Text style={{ fontSize: 18 }}>{tp.emoji}</Text>
                      {tipoSel === tp.id && <View style={[styles.tipoCheck, { backgroundColor: tp.color }]}><Text style={{ color: '#fff', fontSize: 9, fontWeight: '800' }}>✓</Text></View>}
                    </View>
                    <Text style={[styles.tipoLabel, { color: tipoSel === tp.id ? tp.color : t.textPrimary, fontSize: text(11) }]}>
                      {tp.label}
                    </Text>
                    <Text style={[styles.tipoDesc, { color: t.textMuted, fontSize: text(9) }]}>{tp.desc}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              )}

              <Text style={[styles.fieldLabel, { color: t.textPrimary, fontSize: text(13) }]}>Prioridad sugerida</Text>
              <View style={styles.prioRow}>
                {PRIORIDADES.map(p => (
                  <TouchableOpacity
                    key={p.id}
                    style={[
                      styles.prioCard,
                      { borderColor: t.border },
                      prioSel === p.id && { borderColor: p.color, backgroundColor: p.color + '12' },
                    ]}
                    onPress={() => setPrioSel(p.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.prioText, { color: prioSel === p.id ? p.color : t.textPrimary, fontSize: text(12) }]}>
                      {p.label}
                    </Text>
                    <Text style={[styles.prioDesc, { color: t.textMuted, fontSize: text(9) }]}>{p.desc}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.fieldLabel, { color: t.textPrimary, fontSize: text(13) }]}>Asunto</Text>
              <TextInput
                style={[styles.input, { backgroundColor: t.bgCard, borderColor: t.border, color: t.textPrimary, fontSize: text(13) }]}
                placeholder="Ej: No puedo enviar una solicitud de libro"
                placeholderTextColor={t.textMuted}
                value={titulo}
                onChangeText={setTitulo}
                maxLength={160}
              />
              <View style={styles.charRow}>
                <Text style={[styles.charHint, { color: titulo.trim().length >= 4 ? '#22c55e' : t.textMuted, fontSize: text(10) }]}>
                  {titulo.trim().length >= 4 ? 'Asunto valido' : 'Minimo 4 caracteres'}
                </Text>
                <Text style={[styles.charCount, { color: t.textMuted, fontSize: text(10) }]}>{titulo.length} / 160</Text>
              </View>

              <Text style={[styles.fieldLabel, { color: t.textPrimary, fontSize: text(13) }]}>Descripcion</Text>
              <TextInput
                style={[styles.textarea, { backgroundColor: t.bgCard, borderColor: t.border, color: t.textPrimary, fontSize: text(13) }]}
                placeholder="Explica que intentabas hacer, que paso y que esperabas que ocurriera..."
                placeholderTextColor={t.textMuted}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                value={desc}
                onChangeText={setDesc}
                maxLength={2000}
              />
              <View style={styles.charRow}>
                <Text style={[styles.charHint, { color: desc.trim().length >= 15 ? '#22c55e' : t.textMuted, fontSize: text(10) }]}>
                  {desc.trim().length >= 15 ? 'Descripcion suficiente' : 'Minimo 15 caracteres'}
                </Text>
                <Text style={[styles.charCount, { color: t.textMuted, fontSize: text(10) }]}>{desc.length} / 2000</Text>
              </View>

              <TouchableOpacity
                style={[styles.sendBtn, { backgroundColor: t.accent }, submitting && { opacity: 0.5 }]}
                onPress={handleEnviar}
                disabled={submitting}
                activeOpacity={0.85}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Text style={{ fontSize: 16, marginRight: 8 }}>📤</Text>
                    <Text style={[styles.sendBtnText, { color: '#fff', fontSize: text(15) }]}>Enviar reporte</Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={[styles.infoCard, { backgroundColor: t.bgCard, borderColor: t.border }]}>
                <View style={styles.infoSteps}>
                  <Text style={[styles.infoCardTitle, { color: t.textPrimary, fontSize: text(13) }]}>Que pasa al enviar</Text>
                  {[
                    ['Se crea un ticket', 'Se genera folio y queda en estado Nuevo.'],
                    ['Queda en bandeja', 'Los administradores lo ven en soporte.'],
                    ['Se atiende', 'Un agente puede tomarlo y cambiar estado.'],
                    ['Puedes seguirlo', 'Aparece en Mis reportes con su historial.'],
                  ].map((step, i) => (
                    <View key={step[0]} style={styles.infoStep}>
                      <View style={[styles.stepNum, { backgroundColor: t.accent }]}>
                        <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>{i + 1}</Text>
                      </View>
                      <View style={styles.stepText}>
                        <Text style={[styles.stepTitle, { color: t.textPrimary, fontSize: text(11) }]}>{step[0]}</Text>
                        <Text style={[styles.stepDesc, { color: t.textMuted, fontSize: text(10) }]}>{step[1]}</Text>
                      </View>
                    </View>
                  ))}
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
                    <View style={[styles.statCard, { backgroundColor: t.bgCard, borderColor: t.border }]}>
                      <Text style={[styles.statValue, { color: t.textPrimary, fontSize: text(20) }]}>{stats.activos}</Text>
                      <Text style={[styles.statLabel, { color: t.textMuted, fontSize: text(10) }]}>activos</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: t.bgCard, borderColor: t.border }]}>
                      <Text style={[styles.statValue, { color: '#22c55e', fontSize: text(20) }]}>{stats.resueltos}</Text>
                      <Text style={[styles.statLabel, { color: t.textMuted, fontSize: text(10) }]}>resueltos</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: t.bgCard, borderColor: t.border }]}>
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
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
          >
            <Text style={[styles.backBtnText, { color: t.btnPrimaryText, fontSize: text(15) }]}>← Regresar</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingTop: 54, paddingBottom: 100 },

  header: { marginBottom: 20 },
  headerLeft: { flex: 1 },
  pageSubtitle: { fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 4 },
  pageTitle: { fontWeight: '700', letterSpacing: 0.4 },
  pageDesc: { marginTop: 4, lineHeight: 16 },

  segmented: { flexDirection: 'row', borderRadius: 14, padding: 3, borderWidth: 1, marginBottom: 24 },
  segBtn: { flex: 1, borderRadius: 11, paddingVertical: 10, alignItems: 'center' },
  segText: { fontWeight: '600' },

  fieldLabel: { fontWeight: '700', marginBottom: 10, letterSpacing: 0.3 },

  tipoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 22 },
  tipoCard: {
    width: '48%', borderRadius: 14, padding: 12, borderWidth: 1,
    position: 'relative',
  },
  tipoCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  tipoLabel: { fontWeight: '700' },
  tipoDesc: { marginTop: 2, lineHeight: 13 },
  tipoCheck: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },

  prioRow: { flexDirection: 'row', gap: 8, marginBottom: 22 },
  prioCard: { flex: 1, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 10, borderWidth: 1.5, alignItems: 'center' },
  prioText: { fontWeight: '700' },
  prioDesc: { marginTop: 2, textAlign: 'center', lineHeight: 12 },

  input: { borderRadius: 14, borderWidth: 1, padding: 14, minHeight: 48, marginBottom: 22 },
  textarea: { borderRadius: 14, borderWidth: 1, padding: 14, minHeight: 120 },
  charRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, marginBottom: 22 },
  charHint: { fontWeight: '500' },
  charCount: { fontWeight: '400' },

  sendBtn: { flexDirection: 'row', borderRadius: 14, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  sendBtnText: { fontWeight: '700' },

  infoCard: { borderRadius: 14, padding: 16, borderWidth: 1, marginBottom: 28 },
  infoCardTitle: { fontWeight: '700', marginBottom: 14 },
  infoSteps: { gap: 12 },
  infoStep: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  stepNum: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stepText: { flex: 1 },
  stepTitle: { fontWeight: '700', marginBottom: 1 },
  stepDesc: { lineHeight: 14 },

  loadingCenter: { padding: 40, alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 13 },
  loadingGrid: { height: 180, justifyContent: 'center', alignItems: 'center' },

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
