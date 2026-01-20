import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import useScale from '../hooks/useScale';
import { getUsuario } from '../../tablas/cuenta';
import { getDatos } from '../../tablas/cuenta';
import { useUser } from '../context/UserContext';

const Cuenta = ({ navigation }) => {
  const { logout, getUserBoleta } = useUser();
  const [cuenta, setCuenta] = useState(null);
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const boleta = getUserBoleta() || 1; 
  
  const { s, vs, text } = useScale();

  useEffect(() => {
    const fetchCuenta = async () => {
      try {
        setLoading(true);
        const data = await getUsuario(boleta);
        if (data && data.length > 0) {
          setCuenta(data[0]); 
        }
      } catch (error) {
        console.error('Error cargando cuenta:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchDatos = async () => {
      try {
        setLoading(true);
        const data = await getDatos(boleta);
        if (data && data.length > 0) {
          setDatos(prevDatos => ({ ...prevDatos, ...data[0] }));
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCuenta();
    fetchDatos();
  }, [boleta]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: s(20) }]} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={[styles.title, { fontSize: text(26) }]}>Mi Cuenta</Text>
          <View style={styles.divider} />
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={[styles.avatarCircle, { width: s(80), height: s(80), borderRadius: s(40) }]}>
              <Text style={styles.avatarEmoji}>👤</Text>
            </View>
            <Text style={[styles.userName, { fontSize: text(18) }]}>
              {loading ? 'Cargando...' : `${cuenta?.nombre || 'Usuario'} ${cuenta?.apellido || ''}`}
            </Text>
          </View>

          {/* Info Fields */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Text style={styles.infoEmoji}>🎫</Text>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>BOLETA</Text>
                <Text style={[styles.infoValue, { fontSize: text(15) }]}>
                  {loading ? 'Cargando...' : cuenta?.boleta || 'N/A'}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Text style={styles.infoEmoji}>✉️</Text>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>CORREO</Text>
                <Text style={[styles.infoValue, { fontSize: text(14) }]}>
                  {loading ? 'Cargando...' : datos?.correo || 'N/A'}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Text style={styles.infoEmoji}>👤</Text>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>NOMBRE COMPLETO</Text>
                <Text style={[styles.infoValue, { fontSize: text(15) }]}>
                  {loading ? 'Cargando...' : `${cuenta?.nombre || 'N/A'} ${cuenta?.apellido || ''}`}
                </Text>
              </View>
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'Cerrar Sesión',
                '¿Estás seguro de que quieres cerrar sesión?',
                [
                  {
                    text: 'Cancelar',
                    style: 'cancel'
                  },
                  {
                    text: 'Cerrar Sesión',
                    style: 'destructive',
                    onPress: async () => {
                      await logout();
                      navigation.navigate('IniciarAcc');
                    }
                  }
                ]
              );
            }}
            style={styles.logoutButton}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={[styles.logoutButtonText, { fontSize: text(15) }]}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>

        {/* Back Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Main')}
          style={styles.backButton}
          activeOpacity={0.8}
        >
          <Text style={styles.backIcon}>←</Text>
          <Text style={[styles.backButtonText, { fontSize: text(15) }]}>Regresar al Menú</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111625',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  divider: {
    height: 3,
    width: 50,
    backgroundColor: '#C35EB9',
    borderRadius: 2,
    marginTop: 12,
  },
  profileCard: {
    backgroundColor: '#1A1F2E',
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: '#353A4D',
    marginBottom: 24,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#C35EB930',
    borderWidth: 3,
    borderColor: '#C35EB9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarEmoji: {
    fontSize: 36,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  infoSection: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252A3D',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#353A4D',
  },
  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#C35EB920',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  infoEmoji: {
    fontSize: 20,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC262620',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  logoutIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  logoutButtonText: {
    color: '#DC2626',
    fontSize: 15,
    fontWeight: '600',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C35EB9',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  backIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginRight: 10,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default Cuenta;