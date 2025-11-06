import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import useScale from '../hooks/useScale';
import { LinearGradient } from 'expo-linear-gradient';

const Main = ({ navigation }) => {
  const { s, vs, ms, text } = useScale();
  const cardWidth = s(225); // approx 60% of 375
  const cardHeight = vs(131); // approx 35% of 375 width

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={[styles.bienvenida, { fontSize: text(32) }]} allowFontScaling>
          Bienvenido
        </Text>
        <Text style={[styles.usuario, { fontSize: text(24), marginBottom: vs(20) }]} allowFontScaling>
          (usuario)
        </Text>
        <Text style={[styles.actividadesLabel, { fontSize: text(14) }]} allowFontScaling>
          Actividades Recientes
        </Text>

        {/* Scroll horizontal para las cajas SOL X */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rowScroll}
          pagingEnabled={false}
        >
          <TouchableOpacity style={[styles.caja, { width: cardWidth, height: cardHeight, marginRight: 16 }]}> 
            <Text style={[styles.cajaTexto, { fontSize: text(28) }]} allowFontScaling>
              SOL 1
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.caja, { width: cardWidth, height: cardHeight, marginRight: 16 }]}> 
            <Text style={[styles.cajaTexto, { fontSize: Math.round(28 * scale) }]} allowFontScaling>
              SOL 2
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.caja, { width: cardWidth, height: cardHeight, marginRight: 16 }]}> 
            <Text style={[styles.cajaTexto, { fontSize: Math.round(28 * scale) }]} allowFontScaling>
              SOL 3
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <Text style={[styles.estadoLabel, { fontSize: text(12) }]} allowFontScaling>
          ESTADO GENERAL
        </Text>

        <View style={[styles.estadoCard, { height: vs(200) }]}>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Biblioteca')}
          style={styles.buttonContainer}
        >
          <LinearGradient
            colors={['#5D2D58', '#C35EB9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={[styles.buttonText, { fontSize: text(16) }]} allowFontScaling>Ir a Biblioteca</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Prestamos')}
          style={styles.buttonContainer}
        >
          <LinearGradient
            colors={['#5D2D58', '#C35EB9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={[styles.buttonText, { fontSize: text(16) }]} allowFontScaling>Ir a Prestamos</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Cuenta')}
          style={styles.buttonContainer}
        >
          <LinearGradient
            colors={['#5D2D58', '#C35EB9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={[styles.buttonText, { fontSize: text(16) }]} allowFontScaling>Ir a Cuenta</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1F2E',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 100,
    alignItems: 'flex-start',
  },
  bienvenida: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Segoe UI',
  },
  usuario: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 40,
    fontFamily: 'Segoe UI',
  },
  actividadesLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 20,
    fontFamily: 'Segoe UI',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 50,
    width: '100%',
  },
  rowScroll: {
    paddingVertical: 8,
    paddingLeft: 0,
    paddingRight: 8,
    marginBottom: 24,
  },
  caja: {
    backgroundColor: '#D9D9D9',
    width: 200,
    height: 140,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 0
  },
  cajaTexto: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 32,
    fontFamily: 'Segoe UI',
  },
  estadoLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    marginBottom: 15,
    fontFamily: 'Segoe UI',
    letterSpacing: 1,
  },
  estadoCard: {
    backgroundColor: '#D9D9D9',
    width: '100%',
    height: 200,
    borderRadius: 0,
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 15,
  },
  gradientButton: {
    borderRadius: 20,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '350',
    fontFamily: 'Segoe UI',
  },
});

export default Main;
