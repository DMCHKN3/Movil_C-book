import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, StatusBar } from 'react-native';
import useScale from '../hooks/useScale';
import { getLibros } from '../../tablas/libros';
import { useTheme } from '../context/ThemeContext';

const Biblioteca = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const [libros, setLibros] = useState([]);
  const [loading, setLoading] = useState(true);
  const { s, vs, text } = useScale();
  const t = theme;

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setLibros(await getLibros());
      } catch (err) {
        console.error('Error cargando libros:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: t.bg }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={t.bg} />
        <View style={[styles.loaderCard, { backgroundColor: t.bgCard, borderColor: t.border }]}>
          <ActivityIndicator size="large" color={t.accent} />
          <Text style={[styles.loaderText, { color: t.textSecondary }]}>Cargando libros...</Text>
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
              <Text style={{ fontSize: 30 }}>📚</Text>
            </View>
            <Text style={[styles.title, { color: t.textPrimary, fontSize: text(24) }]}>Biblioteca</Text>
            <Text style={[styles.subtitle, { color: t.textMuted }]}>{libros.length} libros disponibles</Text>
            <View style={[styles.divider, { backgroundColor: t.divider }]} />
          </View>

          {/* Table */}
          <View style={[styles.table, { backgroundColor: t.bgCard, borderColor: t.border }]}>
            <View style={[styles.tableHead, { backgroundColor: t.bgCardAlt, borderBottomColor: t.border }]}>
              <Text style={[styles.th, styles.cSmall, { color: t.textMuted, fontSize: text(10) }]}>ID</Text>
              <Text style={[styles.th, styles.cLarge, { color: t.textMuted, fontSize: text(10) }]}>Título</Text>
              <Text style={[styles.th, styles.cMed, { color: t.textMuted, fontSize: text(10) }]}>Clasif.</Text>
              <Text style={[styles.th, styles.cMed, { color: t.textMuted, fontSize: text(10) }]}>Tipo</Text>
              <Text style={[styles.th, styles.cMed, { color: t.textMuted, fontSize: text(10) }]}>Autor</Text>
            </View>

            {libros.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={{ fontSize: 36, marginBottom: 10, opacity: 0.6 }}>📭</Text>
                <Text style={[styles.emptyText, { color: t.textMuted }]}>No hay libros disponibles</Text>
              </View>
            ) : (
              libros.map((libro, i) => (
                <View
                  key={libro.id || i}
                  style={[styles.tableRow, { borderBottomColor: t.border }, i % 2 !== 0 && { backgroundColor: t.bgCardAlt }]}
                >
                  <View style={[styles.cSmall, { alignItems: 'center' }]}>
                    <View style={[styles.idBadge, { backgroundColor: t.accentBg }]}>
                      <Text style={[styles.idText, { color: t.accentBright, fontSize: text(10) }]}>{libro.id}</Text>
                    </View>
                  </View>
                  <Text style={[styles.td, styles.cLarge, styles.tdTitle, { color: t.textPrimary, fontSize: text(11) }]}>
                    {libro.titulo || 'N/A'}
                  </Text>
                  <Text style={[styles.td, styles.cMed, { color: t.textSecondary, fontSize: text(10) }]}>
                    {libro.clasificacion || 'N/A'}
                  </Text>
                  <Text style={[styles.td, styles.cMed, { color: t.textSecondary, fontSize: text(10) }]}>
                    {libro.tipo_material || 'N/A'}
                  </Text>
                  <Text style={[styles.td, styles.cMed, { color: t.textSecondary, fontSize: text(10) }]}>
                    {libro.autor || 'N/A'}
                  </Text>
                </View>
              ))
            )}
          </View>

          {/* Back */}
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

  table: { borderRadius: 14, overflow: 'hidden', borderWidth: 1, marginBottom: 24 },
  tableHead: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: 1 },
  th: { fontWeight: '700', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.3 },
  tableRow: { flexDirection: 'row', alignItems: 'center', minHeight: 54, paddingVertical: 10, paddingHorizontal: 8, borderBottomWidth: 1 },
  td: { textAlign: 'center', paddingHorizontal: 2 },
  tdTitle: { fontWeight: '600' },

  cSmall: { flex: 0.6, paddingHorizontal: 2 },
  cMed: { flex: 1.1, paddingHorizontal: 2 },
  cLarge: { flex: 1.8, paddingHorizontal: 2 },

  idBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  idText: { fontWeight: '700' },

  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, fontWeight: '500' },

  backBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontWeight: '600' },
});

export default Biblioteca;
