import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

const SupportFAB = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const t = theme;

  return (
    <TouchableOpacity
      style={[styles.fab, { backgroundColor: t.accent, shadowColor: t.accent }]}
      onPress={() => navigation.navigate('Soporte')}
      activeOpacity={0.85}
    >
      <Text style={styles.fabIcon}>💬</Text>
      <Text style={styles.fabText}>Soporte</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    elevation: 6,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    zIndex: 100,
  },
  fabIcon: {
    fontSize: 16,
  },
  fabText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
});

export default SupportFAB;
