import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { TERMS_AND_CONDITIONS, PRIVACY_NOTICE } from '../data/terms';

const TermsModal = ({ visible, onAccept, onReject }) => {
  const { theme } = useTheme();
  const [tab, setTab] = useState('terms');
  const [accepted, setAccepted] = useState(false);

  const content = tab === 'terms' ? TERMS_AND_CONDITIONS : PRIVACY_NOTICE;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.6)" />
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
        <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Términos y condiciones
          </Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>
            Lee y acepta nuestros términos para continuar
          </Text>

          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tab, tab === 'terms' && { backgroundColor: theme.accent + '22' }]}
              onPress={() => setTab('terms')}
            >
              <Text style={[styles.tabText, { color: tab === 'terms' ? theme.accent : theme.textMuted }]}>
                Términos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, tab === 'privacy' && { backgroundColor: theme.accent + '22' }]}
              onPress={() => setTab('privacy')}
            >
              <Text style={[styles.tabText, { color: tab === 'privacy' ? theme.accent : theme.textMuted }]}>
                Aviso de privacidad
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollArea}
            showsVerticalScrollIndicator={true}
          >
            <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
              {content}
            </Text>
          </ScrollView>

          <TouchableOpacity
            style={styles.checkRow}
            onPress={() => setAccepted(!accepted)}
          >
            <View style={[
              styles.checkbox,
              { borderColor: theme.accent },
              accepted && { backgroundColor: theme.accent }
            ]}>
              {accepted && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.checkLabel, { color: theme.textSecondary }]}>
              He leído y acepto los términos y condiciones y el aviso de privacidad
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.acceptBtn, { backgroundColor: accepted ? theme.accent : theme.border }]}
            disabled={!accepted}
            onPress={onAccept}
          >
            <Text style={[styles.acceptBtnText, { color: accepted ? '#fff' : theme.textMuted }]}>
              Aceptar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.rejectBtn} onPress={onReject}>
            <Text style={[styles.rejectBtnText, { color: theme.textMuted }]}>Rechazar</Text>
          </TouchableOpacity>
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
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scrollArea: {
    maxHeight: 320,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  bodyText: {
    fontSize: 13,
    lineHeight: 20,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkLabel: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  acceptBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  acceptBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  rejectBtn: {
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  rejectBtnText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default TermsModal;
