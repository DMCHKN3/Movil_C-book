import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView, StatusBar, Keyboard,
} from 'react-native';
import useScale from '../hooks/useScale';
import { cambiarContrasenaPropia, cerrarSesionConAuth } from '../../BD/supabaseAuthService';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';

const CambiarContra = ({ navigation }) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { perfil, logout } = useUser();
  const { s, vs, text } = useScale();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const t = theme;

  const regexPassword = /^[A-Za-z0-9\-_.,"#%]{7,16}$/;

  const handleCambiar = async () => {
    Keyboard.dismiss();
    if (isLoading) return;

    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }

    if (!regexPassword.test(newPassword)) {
      Alert.alert('Error', 'La nueva contraseña debe tener entre 7 y 16 caracteres y contener letras, números y símbolos -_.,"#%');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas nuevas no coinciden');
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert('Error', 'La nueva contraseña debe ser diferente a la actual');
      return;
    }

    const correo = perfil?.correo;
    if (!correo) {
      Alert.alert('Error', 'No se pudo obtener tu correo. Intenta cerrar sesión y volver a iniciar.');
      return;
    }

    setIsLoading(true);
    try {
      const resultado = await cambiarContrasenaPropia(correo, currentPassword, newPassword);
      if (resultado.ok) {
        await cerrarSesionConAuth();
        await logout();
        Alert.alert('Contraseña cambiada exitosamente', 'Vuelve a iniciar sesión', [
          { text: 'OK', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'IniciarAcc' }] }) },
        ]);
      } else {
        Alert.alert('Error', resultado.message);
      }
    } catch {
      Alert.alert('Error', 'Ocurrió un error inesperado');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={t.bg} />
      <TouchableOpacity style={styles.themeBtn} onPress={toggleTheme}>
        <Text style={[styles.themeBtnText, { color: t.textMuted }]}>{isDark ? '☀' : '⏾'}</Text>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.brandSection}>
          <View style={[styles.logoBox, { backgroundColor: t.accentBg, borderColor: t.borderStrong }]}>
            <Text style={styles.logoEmoji}>🔑</Text>
          </View>
          <Text style={[styles.appName, { color: t.textPrimary }]}>Cambiar Contraseña</Text>
          <Text style={[styles.appTagline, { color: t.textMuted }]}>Ingresa tu contraseña actual y una nueva</Text>
        </View>

        <View style={[styles.card, { backgroundColor: t.bgCard, borderColor: t.border }]}>
          <Text style={[styles.cardTitle, { color: t.textPrimary }]}>Actualizar contraseña</Text>
          <View style={[styles.titleBar, { backgroundColor: t.divider }]} />
          <Text style={[styles.subtitle, { color: t.textMuted }]}>Debe tener entre 7 y 16 caracteres</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: t.textMuted }]}>CONTRASEÑA ACTUAL</Text>
            <View style={[styles.inputWrap, { backgroundColor: t.bgInput, borderColor: t.border }]}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={[styles.input, { color: t.textPrimary, fontSize: text(15) }]}
                placeholder="Tu contraseña actual"
                placeholderTextColor={t.textMuted}
                secureTextEntry={!mostrarContrasena}
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: t.textMuted }]}>NUEVA CONTRASEÑA</Text>
            <View style={[styles.inputWrap, { backgroundColor: t.bgInput, borderColor: t.border }]}>
              <Text style={styles.inputIcon}>🔐</Text>
              <TextInput
                style={[styles.input, { color: t.textPrimary, fontSize: text(15) }]}
                placeholder="Nueva contraseña"
                placeholderTextColor={t.textMuted}
                secureTextEntry={!mostrarContrasena}
                value={newPassword}
                onChangeText={setNewPassword}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: t.textMuted }]}>CONFIRMAR NUEVA CONTRASEÑA</Text>
            <View style={[styles.inputWrap, { backgroundColor: t.bgInput, borderColor: t.border }]}>
              <Text style={styles.inputIcon}>🔐</Text>
              <TextInput
                style={[styles.input, { color: t.textPrimary, fontSize: text(15) }]}
                placeholder="Repite la nueva contraseña"
                placeholderTextColor={t.textMuted}
                secureTextEntry={!mostrarContrasena}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.checkRow} onPress={() => setMostrarContrasena(!mostrarContrasena)}>
            <View style={[styles.checkbox, { borderColor: t.accent }, mostrarContrasena && { backgroundColor: t.accent }]}>
              {mostrarContrasena && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.checkLabel, { color: t.textSecondary, fontSize: text(13) }]}>Mostrar contraseñas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnPrimary, { backgroundColor: t.btnPrimary }, isLoading && styles.btnDisabled]}
            onPress={handleCambiar}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading
              ? <ActivityIndicator color={t.btnPrimaryText} size="small" />
              : <Text style={[styles.btnPrimaryText, { color: t.btnPrimaryText, fontSize: text(15) }]}>Guardar cambios</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnSecondary, { borderColor: t.btnSecondaryBorder }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
          >
            <Text style={[styles.btnSecondaryText, { color: t.btnSecondaryText, fontSize: text(15) }]}>← Regresar</Text>
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
  brandSection: { alignItems: 'center', marginBottom: 28 },
  logoBox: { width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1, marginBottom: 14 },
  logoEmoji: { fontSize: 28 },
  appName: { fontSize: 24, fontWeight: '700', letterSpacing: 0.5, textAlign: 'center' },
  appTagline: { fontSize: 13, marginTop: 4, textAlign: 'center', paddingHorizontal: 20 },
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

export default CambiarContra;
