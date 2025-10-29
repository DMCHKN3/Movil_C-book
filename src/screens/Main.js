import React from 'react';
import { Touchable, TouchableOpacity } from 'react-native';
import { View, Text, Button, StyleSheet } from 'react-native';

const Main = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>ACTIVIDADES RECIENTES</Text>
            <br></br>
            <View style= {styles.row}> 
                <TouchableOpacity style={styles.caja}>
                    <text>SOL 1</text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.caja}>
                    <text>SOL 2</text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.caja}>
                    <text>SOL 3</text>
                </TouchableOpacity>
            </View>
            <br></br>
            <View>
                <Text>Estado General</Text>
                <table>
                    <thead>
                        <tr>
                            <th colSpan={3} style={styles.titulo}>Actividad</th>
                        </tr>
                    </thead>
                </table>
            </View>
            <View>
              <Button title="Ir a Biblioteca" onPress={() => navigation.navigate('Biblioteca')} />
              <Button title="Ir a Prestamos" onPress={() => navigation.navigate('Prestamos')} />
              <Button title="Ir a Cuenta" onPress={() => navigation.navigate('Cuenta')} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  titulo: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 15,
  },
  caja: {
    backgroundColor: "#d3d3d3",
    width: 80,
    height: 80,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  texto: {
    color: "#000",
    fontWeight: "bold",
  },
});
export default Main;
