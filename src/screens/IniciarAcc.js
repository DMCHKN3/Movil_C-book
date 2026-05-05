import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, BackHandler, ScrollView, StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import useScale from '../hooks/useScale';
import { iniciarSesionConAuth, reenviarConfirmacion } from '../../BD/supabaseAuthService';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import SlideToUnlock from 'react-native-slide-to-unlock';

const IniciarSesion = ({ navigation }) => {
  const { login } = useUser();
  const { theme, isDark, toggleTheme } = useTheme();
  const [correo, setCorreo] = useState('');
  const [contra, setContra] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [mantenerSesion, setMantenerSesion] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [captchaVerif, setCaptchaVerif] = useState(false);
  const { s, vs, text } = useScale();

  useFocusEffect(
    React.useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => sub.remove();
    }, [])
  );

  const handleLogin = async () => {
    if (isLoading) return;
    if (!captchaVerif) {
      Alert.alert('Verificación requerida', 'Por favor completa la verificación deslizando el control.');
      return;
    }
    setIsLoading(true);
    try {
      const resultado = await iniciarSesionConAuth(correo, contra);
      if (resultado.ok) {
        login(resultado.user, resultado.perfil);
        if (mantenerSesion) {
          await AsyncStorage.setItem('userSession', JSON.stringify({
            user: resultado.user,
            perfil: resultado.perfil,
            session: resultado.session,
            timestamp: Date.now(),
          }));
        }
        Alert.alert('Éxito', 'Sesión iniciada correctamente', [{
          text: 'OK',
          onPress: () => { setCorreo(''); setContra(''); navigation.navigate('Main'); },
        }]);
      } else {
        if (resultado.needsEmailConfirmation) {
          Alert.alert('Correo no confirmado', resultado.message, [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Reenviar correo', onPress: () => handleReenviarCorreo(correo) },
          ]);
        } else {
          Alert.alert('Error', resultado.message || 'Error al iniciar sesión');
        }
      }
    } catch {
      Alert.alert('Error', 'Ocurrió un error inesperado. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReenviarCorreo = async (email) => {
    if (!email) { Alert.alert('Error', 'Por favor ingresa tu correo'); return; }
    setIsLoading(true);
    try {
      const res = await reenviarConfirmacion(email);
      Alert.alert(res.ok ? 'Éxito' : 'Error', res.message || (res.ok ? 'Correo reenviado' : 'Error al reenviar'));
    } catch {
      Alert.alert('Error', 'Ocurrió un error al reenviar el correo');
    } finally {
      setIsLoading(false);
    }
  };

  const t = theme;

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={t.bg} />

      {/* Theme toggle */}
      <TouchableOpacity style={styles.themeBtn} onPress={toggleTheme}>
        <Text style={[styles.themeBtnText, { color: t.textMuted }]}>{isDark ? '☀' : '⏾'}</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Logo / Branding */}
        <View style={styles.brandSection}>
          <View style={[styles.logoBox, { backgroundColor: t.accentBg, borderColor: t.borderStrong }]}>
            <Text style={styles.logoEmoji}>📚</Text>
          </View>
          <Text style={[styles.appName, { color: t.textPrimary }]}>C-Book</Text>
          <Text style={[styles.appTagline, { color: t.textMuted }]}>Sistema de biblioteca</Text>
        </View>

        {/* Card */}
        <View style={[styles.card, { backgroundColor: t.bgCard, borderColor: t.border }]}>
          <Text style={[styles.cardTitle, { color: t.textPrimary }]}>Iniciar Sesión</Text>
          <View style={[styles.titleBar, { backgroundColor: t.divider }]} />

          {/* Correo */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: t.textMuted }]}>CORREO ELECTRÓNICO</Text>
            <View style={[styles.inputWrap, { backgroundColor: t.bgInput, borderColor: t.border }]}>
              <Text style={styles.inputIcon}>✉</Text>
              <TextInput
                style={[styles.input, { color: t.textPrimary, fontSize: text(15) }]}
                placeholder="ejemplo@correo.com"
                placeholderTextColor={t.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={correo}
                onChangeText={setCorreo}
              />
            </View>
          </View>

          {/* Contraseña */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: t.textMuted }]}>CONTRASEÑA</Text>
            <View style={[styles.inputWrap, { backgroundColor: t.bgInput, borderColor: t.border }]}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={[styles.input, { color: t.textPrimary, fontSize: text(15) }]}
                placeholder="Tu contraseña"
                placeholderTextColor={t.textMuted}
                secureTextEntry={!mostrarContrasena}
                value={contra}
                onChangeText={setContra}
              />
            </View>
          </View>

          {/* Opciones */}
          <View style={styles.optionsRow}>
            <TouchableOpacity style={styles.checkRow} onPress={() => setMostrarContrasena(!mostrarContrasena)}>
              <View style={[styles.checkbox, { borderColor: t.accent }, mostrarContrasena && { backgroundColor: t.accent }]}>
                {mostrarContrasena && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={[styles.checkLabel, { color: t.textSecondary, fontSize: text(12) }]}>Mostrar contraseña</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.checkRow} onPress={() => setMantenerSesion(!mantenerSesion)}>
              <View style={[styles.checkbox, { borderColor: t.accent }, mantenerSesion && { backgroundColor: t.accent }]}>
                {mantenerSesion && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={[styles.checkLabel, { color: t.textSecondary, fontSize: text(12) }]}>Mantener sesión</Text>
            </TouchableOpacity>
          </View>

          {/* Captcha */}
          <SlideToUnlock
            onEndReached={() => setCaptchaVerif(true)}
            containerStyle={[styles.captcha, { backgroundColor: t.bgInput, borderColor: t.border, height: vs(56) }]}
            sliderElement={
              <View style={[styles.slider, { backgroundColor: t.btnPrimary }]}>
                <Text style={[styles.sliderArrow, { fontSize: text(18) }]}>→</Text>
              </View>
            }
          >
            <Text style={[styles.captchaText, { color: t.textMuted, fontSize: text(13) }]}>
              {captchaVerif ? '✓  Verificado' : 'Desliza para verificar'}
            </Text>
          </SlideToUnlock>

          {/* Botón principal */}
          <TouchableOpacity
            style={[styles.btnPrimary, { backgroundColor: t.btnPrimary }, isLoading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading
              ? <ActivityIndicator color={t.btnPrimaryText} size="small" />
              : <Text style={[styles.btnPrimaryText, { color: t.btnPrimaryText, fontSize: text(15) }]}>Iniciar Sesión</Text>}
          </TouchableOpacity>

          {/* Botón secundario */}
          <TouchableOpacity
            style={[styles.btnSecondary, { borderColor: t.btnSecondaryBorder }]}
            onPress={() => navigation.navigate('CrearAcc')}
            activeOpacity={0.85}
          >
            <Text style={[styles.btnSecondaryText, { color: t.btnSecondaryText, fontSize: text(15) }]}>Crear nueva cuenta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 48 },
  themeBtn: { position: 'absolute', top: 52, right: 24, zIndex: 10, padding: 8 },
  themeBtnText: { fontSize: 22 },
  brandSection: { alignItems: 'center', marginBottom: 32 },
  logoBox: {
    width: 64, height: 64, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, marginBottom: 14,
  },
  logoEmoji: { fontSize: 30 },
  appName: { fontSize: 26, fontWeight: '700', letterSpacing: 0.5 },
  appTagline: { fontSize: 13, marginTop: 4 },
  card: {
    borderRadius: 20, padding: 28,
    borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 20, elevation: 8,
  },
  cardTitle: { fontSize: 22, fontWeight: '700', textAlign: 'center', letterSpacing: 0.3 },
  titleBar: { width: 40, height: 3, borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 28 },
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, marginBottom: 8, marginLeft: 2 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 12, borderWidth: 1, paddingHorizontal: 14,
  },
  inputIcon: { fontSize: 15, marginRight: 10 },
  input: { flex: 1, height: 50 },
  optionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  checkRow: { flexDirection: 'row', alignItems: 'center' },
  checkbox: {
    width: 18, height: 18, borderRadius: 5,
    borderWidth: 2, marginRight: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  checkmark: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  checkLabel: { fontWeight: '500' },
  captcha: {
    width: '100%', borderRadius: 12, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20, overflow: 'hidden',
  },
  captchaText: { fontWeight: '600', textAlign: 'center' },
  slider: { width: 48, height: '100%', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sliderArrow: { color: '#fff', fontWeight: 'bold' },
  btnPrimary: {
    height: 52, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  btnPrimaryText: { fontWeight: '700', letterSpacing: 0.3 },
  btnSecondary: {
    height: 52, borderRadius: 12, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  btnSecondaryText: { fontWeight: '600' },
  btnDisabled: { opacity: 0.55 },
});

export default IniciarSesion;
