import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView, StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useScale from '../hooks/useScale';
import { register as apiRegister } from '../api/authApi';
import { useTheme } from '../context/ThemeContext';
import { validarform } from '../validaciones/validacionForm';
import { trackEvent } from '../services/analyticsService';
import TermsModal from '../components/TermsModal';

const CrearCuenta = ({ navigation }) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { s, vs, text } = useScale();
  const [user, setUser] = useState('');
  const [contra, setContra] = useState('');
  const [repcontra, setRepContra] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [correo, setCorreo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [pendingRegister, setPendingRegister] = useState(null);

  const handleCrearCuenta = async () => {
    if (isLoading) return;
    if (!validarform(user, contra, repcontra, correo)) return;
    setIsLoading(true);
    try {
      const resultado = await apiRegister(user, correo, contra, repcontra);
      if (resultado.success) {
        trackEvent('register_completed');
        setPendingRegister({ boleta: user, correo });
        setShowTerms(true);
      }
    } catch (err) {
      if (err.status) {
        Alert.alert('Error', err.message);
      } else {
        Alert.alert('Error', 'Ocurrio un error inesperado. Intenta nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const t = theme;

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={t.bg} />

      <TouchableOpacity style={styles.themeBtn} onPress={toggleTheme}>
        <Text style={[styles.themeBtnText, { color: t.textMuted }]}>{isDark ? '☀' : '⏾'}</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Branding */}
        <View style={styles.brandSection}>
          <View style={[styles.logoBox, { backgroundColor: t.accentBg, borderColor: t.borderStrong }]}>
            <Text style={styles.logoEmoji}>📚</Text>
          </View>
          <Text style={[styles.appName, { color: t.textPrimary }]}>C-Book</Text>
          <Text style={[styles.appTagline, { color: t.textMuted }]}>Crea tu cuenta</Text>
        </View>

        {/* Card */}
        <View style={[styles.card, { backgroundColor: t.bgCard, borderColor: t.border }]}>
          <Text style={[styles.cardTitle, { color: t.textPrimary }]}>Crear Cuenta</Text>
          <View style={[styles.titleBar, { backgroundColor: t.divider }]} />
          <Text style={[styles.subtitle, { color: t.textMuted }]}>Únete a nuestra comunidad</Text>

          {[
            { label: 'NÚMERO DE BOLETA', icon: '🎫', placeholder: 'Ingresa tu boleta', value: user, setter: setUser, secure: false, keyboard: 'default' },
            { label: 'CORREO ELECTRÓNICO', icon: '✉', placeholder: 'ejemplo@correo.com', value: correo, setter: setCorreo, secure: false, keyboard: 'email-address' },
            { label: 'CONTRASEÑA', icon: '🔒', placeholder: 'Crea una contraseña', value: contra, setter: setContra, secure: !mostrarContrasena, keyboard: 'default' },
            { label: 'CONFIRMAR CONTRASEÑA', icon: '🔐', placeholder: 'Repite tu contraseña', value: repcontra, setter: setRepContra, secure: !mostrarContrasena, keyboard: 'default' },
          ].map((field, i) => (
            <View key={i} style={styles.inputGroup}>
              <Text style={[styles.label, { color: t.textMuted }]}>{field.label}</Text>
              <View style={[styles.inputWrap, { backgroundColor: t.bgInput, borderColor: t.border }]}>
                <Text style={styles.inputIcon}>{field.icon}</Text>
                <TextInput
                  style={[styles.input, { color: t.textPrimary, fontSize: text(15) }]}
                  placeholder={field.placeholder}
                  placeholderTextColor={t.textMuted}
                  keyboardType={field.keyboard}
                  autoCapitalize="none"
                  secureTextEntry={field.secure}
                  value={field.value}
                  onChangeText={field.setter}
                />
              </View>
            </View>
          ))}

          {/* Mostrar contraseñas */}
          <TouchableOpacity style={styles.checkRow} onPress={() => setMostrarContrasena(!mostrarContrasena)}>
            <View style={[styles.checkbox, { borderColor: t.accent }, mostrarContrasena && { backgroundColor: t.accent }]}>
              {mostrarContrasena && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.checkLabel, { color: t.textSecondary, fontSize: text(13) }]}>Mostrar contraseñas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnPrimary, { backgroundColor: t.btnPrimary }, isLoading && styles.btnDisabled]}
            onPress={handleCrearCuenta}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading
              ? <ActivityIndicator color={t.btnPrimaryText} size="small" />
              : <Text style={[styles.btnPrimaryText, { color: t.btnPrimaryText, fontSize: text(15) }]}>Crear Cuenta</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnSecondary, { borderColor: t.btnSecondaryBorder }]}
            onPress={() => navigation.navigate('IniciarAcc')}
            activeOpacity={0.85}
          >
            <Text style={[styles.btnSecondaryText, { color: t.btnSecondaryText, fontSize: text(15) }]}>Ya tengo cuenta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TermsModal
        visible={showTerms}
        onAccept={async () => {
          await AsyncStorage.setItem('@pending_verification', JSON.stringify(pendingRegister));
          setShowTerms(false);
          setPendingRegister(null);
          Alert.alert(
            'Cuenta creada',
            'Se envio un correo de verificacion a tu direccion.\n\n' +
            '1. Revisa tu bandeja de entrada\n' +
            '2. Haz clic en el enlace de verificacion\n' +
            '3. Regresa aqui e inicia sesion',
            [{ text: 'OK', onPress: () => { setUser(''); setContra(''); setRepContra(''); setCorreo(''); navigation.navigate('IniciarAcc'); } }]
          );
        }}
        onReject={() => {
          setShowTerms(false);
          setPendingRegister(null);
          navigation.navigate('IniciarAcc');
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 48 },
  themeBtn: { position: 'absolute', top: 52, right: 24, zIndex: 10, padding: 8 },
  themeBtnText: { fontSize: 22 },
  brandSection: { alignItems: 'center', marginBottom: 28 },
  logoBox: { width: 60, height: 60, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, marginBottom: 12 },
  logoEmoji: { fontSize: 28 },
  appName: { fontSize: 24, fontWeight: '700', letterSpacing: 0.5 },
  appTagline: { fontSize: 13, marginTop: 4 },
  card: {
    borderRadius: 20, padding: 28, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12, shadowRadius: 20, elevation: 6,
  },
  cardTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center', letterSpacing: 0.3 },
  titleBar: { width: 40, height: 3, borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 8 },
  subtitle: { fontSize: 13, textAlign: 'center', marginBottom: 24 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, marginBottom: 8, marginLeft: 2 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 14 },
  inputIcon: { fontSize: 15, marginRight: 10 },
  input: { flex: 1, height: 48 },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, marginTop: 4 },
  checkbox: { width: 18, height: 18, borderRadius: 5, borderWidth: 2, marginRight: 10, alignItems: 'center', justifyContent: 'center' },
  checkmark: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  checkLabel: { fontWeight: '500' },
  btnPrimary: { height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  btnPrimaryText: { fontWeight: '700', letterSpacing: 0.3 },
  btnSecondary: { height: 52, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  btnSecondaryText: { fontWeight: '600' },
  btnDisabled: { opacity: 0.55 },
});

export default CrearCuenta;
