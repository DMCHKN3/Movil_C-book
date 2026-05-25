import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView, StatusBar, Keyboard,
} from 'react-native';
import useScale from '../hooks/useScale';
import { forgotPassword } from '../api/authApi';
import { useTheme } from '../context/ThemeContext';

const RecuperarContra = ({ navigation }) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { s, vs, text } = useScale();
  const [boleta, setBoleta] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const t = theme;

  const handleSubmit = async () => {
    Keyboard.dismiss();
    if (isLoading) return;
    if (!boleta) {
      Alert.alert('Error', 'Ingresa tu número de boleta');
      return;
    }
    if (!/^\d{10}$/.test(boleta)) {
      Alert.alert('Error', 'La boleta debe tener 10 dígitos');
      return;
    }
    setIsLoading(true);
    try {
      const resultado = await forgotPassword(boleta);
      if (resultado.success) {
        setSent(true);
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

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={t.bg} />

      <TouchableOpacity style={styles.themeBtn} onPress={toggleTheme}>
        <Text style={[styles.themeBtnText, { color: t.textMuted }]}>{isDark ? '☀' : '⏾'}</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.brandSection}>
          <View style={[styles.logoBox, { backgroundColor: t.accentBg, borderColor: t.borderStrong }]}>
            <Text style={styles.logoEmoji}>🔐</Text>
          </View>
          <Text style={[styles.appName, { color: t.textPrimary }]}>Recuperar Contraseña</Text>
          <Text style={[styles.appTagline, { color: t.textMuted }]}>
            Ingresa tu boleta para recibir instrucciones
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: t.bgCard, borderColor: t.border }]}>
          {!sent ? (
            <>
              <Text style={[styles.cardTitle, { color: t.textPrimary }]}>Recuperar acceso</Text>
              <View style={[styles.titleBar, { backgroundColor: t.divider }]} />
              <Text style={[styles.subtitle, { color: t.textMuted }]}>
                Te enviaremos un enlace a tu correo registrado
              </Text>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: t.textMuted }]}>NÚMERO DE BOLETA</Text>
                <View style={[styles.inputWrap, { backgroundColor: t.bgInput, borderColor: t.border }]}>
                  <Text style={styles.inputIcon}>🎫</Text>
                  <TextInput
                    style={[styles.input, { color: t.textPrimary, fontSize: text(15) }]}
                    placeholder="Ej: 2023630001"
                    placeholderTextColor={t.textMuted}
                    keyboardType="number-pad"
                    maxLength={10}
                    value={boleta}
                    onChangeText={(val) => setBoleta(val.replace(/[^0-9]/g, ''))}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.btnPrimary, { backgroundColor: t.btnPrimary }, isLoading && styles.btnDisabled]}
                onPress={handleSubmit}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading
                  ? <ActivityIndicator color={t.btnPrimaryText} size="small" />
                  : <Text style={[styles.btnPrimaryText, { color: t.btnPrimaryText, fontSize: text(15) }]}>Enviar enlace</Text>}
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.successSection}>
              <View style={[styles.successIcon, { backgroundColor: t.accentBg, borderColor: t.borderStrong }]}>
                <Text style={{ fontSize: 40 }}>✉️</Text>
              </View>
              <Text style={[styles.successTitle, { color: t.textPrimary }]}>Correo enviado</Text>
              <Text style={[styles.successText, { color: t.textMuted }]}>
                Revisa tu bandeja de entrada y sigue el enlace para crear una nueva contraseña.
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.btnSecondary, { borderColor: t.btnSecondaryBorder }]}
            onPress={() => navigation.navigate('IniciarAcc')}
            activeOpacity={0.85}
          >
            <Text style={[styles.btnSecondaryText, { color: t.btnSecondaryText, fontSize: text(15) }]}>
              ← Volver a Iniciar Sesión
            </Text>
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
  logoBox: { width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1, marginBottom: 14 },
  logoEmoji: { fontSize: 30 },
  appName: { fontSize: 26, fontWeight: '700', letterSpacing: 0.5, textAlign: 'center' },
  appTagline: { fontSize: 13, marginTop: 4, textAlign: 'center', paddingHorizontal: 20 },
  card: {
    borderRadius: 20, padding: 28, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 20, elevation: 8,
  },
  cardTitle: { fontSize: 22, fontWeight: '700', textAlign: 'center', letterSpacing: 0.3 },
  titleBar: { width: 40, height: 3, borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 8 },
  subtitle: { fontSize: 13, textAlign: 'center', marginBottom: 24 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, marginBottom: 8, marginLeft: 2 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 14 },
  inputIcon: { fontSize: 15, marginRight: 10 },
  input: { flex: 1, height: 50 },
  btnPrimary: { height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  btnPrimaryText: { fontWeight: '700', letterSpacing: 0.3 },
  btnSecondary: { height: 52, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  btnSecondaryText: { fontWeight: '600' },
  btnDisabled: { opacity: 0.55 },
  successSection: { alignItems: 'center', paddingVertical: 20, marginBottom: 16 },
  successIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', borderWidth: 1, marginBottom: 16 },
  successTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  successText: { fontSize: 14, textAlign: 'center', lineHeight: 20, paddingHorizontal: 10 },
});

export default RecuperarContra;
