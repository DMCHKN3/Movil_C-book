import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, StatusBar } from 'react-native';
import useScale from '../hooks/useScale';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { logout as apiLogout } from '../api/authApi';
import { trackEvent } from '../services/analyticsService';

const Cuenta = ({ navigation }) => {
  const { logout, perfil } = useUser();
  const { theme, isDark, toggleTheme } = useTheme();
  const { s, vs, text } = useScale();
  const t = theme;

  const handleLogout = () => {
    Alert.alert('Cerrar Sesion', 'Estas seguro de que quieres cerrar sesion?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar Sesion', style: 'destructive',
        onPress: async () => {
          await logout();
          trackEvent('logout');
          navigation.reset({ index: 0, routes: [{ name: 'IniciarAcc' }] });
          try {
            await apiLogout();
          } catch (error) {
            console.error('Error en logout API:', error);
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={t.bg} />
      <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: s(20) }]} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.pageTitle, { color: t.textPrimary, fontSize: text(24) }]}>Mi Cuenta</Text>
            <View style={[styles.divider, { backgroundColor: t.divider }]} />
          </View>
          <TouchableOpacity
            style={[styles.themeBtn, { backgroundColor: t.accentBg, borderColor: t.border }]}
            onPress={toggleTheme}
          >
            <Text style={{ fontSize: 18 }}>{isDark ? '☀' : '⏾'}</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.profileCard, { backgroundColor: t.bgCard, borderColor: t.border }]}>
          <View style={styles.avatarSection}>
            <View style={[styles.avatar, { backgroundColor: t.accentBg, borderColor: t.accentBright }]}>
              <Text style={{ fontSize: 38 }}>👤</Text>
            </View>
            <Text style={[styles.userName, { color: t.textPrimary, fontSize: text(18) }]}>
              {perfil?.nombre || 'Usuario'}
            </Text>
          </View>

          {[
            { emoji: '🎫', label: 'BOLETA', value: String(perfil?.boleta || 'N/A') },
            { emoji: '✉', label: 'CORREO', value: perfil?.email || 'N/A' },
            { emoji: '👤', label: 'NOMBRE COMPLETO', value: perfil?.nombre || 'N/A' },
          ].map((row, i) => (
            <View key={i} style={[styles.infoRow, { backgroundColor: t.bgCardAlt, borderColor: t.border }]}>
              <View style={[styles.infoIcon, { backgroundColor: t.accentBg }]}>
                <Text style={{ fontSize: 18 }}>{row.emoji}</Text>
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: t.textMuted }]}>{row.label}</Text>
                <Text style={[styles.infoValue, { color: t.textPrimary, fontSize: text(14) }]}>{row.value}</Text>
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={[styles.logoutBtn, { backgroundColor: t.dangerBg, borderColor: t.danger }]}
            onPress={handleLogout}
            activeOpacity={0.85}
          >
            <Text style={{ fontSize: 18, marginRight: 10 }}>🚪</Text>
            <Text style={[styles.logoutText, { color: t.danger, fontSize: text(15) }]}>Cerrar Sesion</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: t.btnPrimary }]}
          onPress={() => navigation.navigate('Main')}
          activeOpacity={0.85}
        >
          <Text style={[styles.backBtnText, { color: t.btnPrimaryText, fontSize: text(15) }]}>← Regresar al Menu</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingTop: 54, paddingBottom: 100 },

  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 },
  headerLeft: { flex: 1 },
  pageTitle: { fontWeight: '700', letterSpacing: 0.4 },
  divider: { height: 3, width: 44, borderRadius: 2, marginTop: 10 },
  themeBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginTop: 4 },

  profileCard: { borderRadius: 22, padding: 24, borderWidth: 1, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },

  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 84, height: 84, borderRadius: 42, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  userName: { fontWeight: '700', textAlign: 'center' },

  infoRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1 },
  infoIcon: { width: 42, height: 42, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  infoValue: { fontWeight: '500' },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 14, paddingVertical: 14, borderWidth: 1, marginTop: 6 },
  logoutText: { fontWeight: '600' },

  backBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  backBtnText: { fontWeight: '600' },
});

export default Cuenta;
