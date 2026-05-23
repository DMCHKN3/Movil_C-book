import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import SlideToUnlock from 'react-native-slide-to-unlock';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';

const SessionCaptcha = () => {
  const { needsCaptcha, resolveCaptcha } = useUser();
  const { theme } = useTheme();

  if (!needsCaptcha) return null;

  return (
    <Modal transparent animationType="fade" visible={needsCaptcha}>
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
        <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Verificación de seguridad</Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>
            Ha pasado un tiempo. Desliza para verificar tu identidad.
          </Text>
          <SlideToUnlock
            onEndReached={resolveCaptcha}
            containerStyle={[styles.captcha, { backgroundColor: theme.bgInput, borderColor: theme.border }]}
            sliderElement={
              <View style={[styles.slider, { backgroundColor: theme.btnPrimary }]}>
                <Text style={styles.sliderArrow}>→</Text>
              </View>
            }
          >
            <Text style={[styles.captchaText, { color: theme.textMuted }]}>Desliza para verificar</Text>
          </SlideToUnlock>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  captcha: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    height: 56,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  captchaText: {
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 13,
  },
  slider: {
    width: 48,
    height: '100%',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderArrow: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SessionCaptcha;
