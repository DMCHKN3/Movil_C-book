import React from 'react';
import { Touchable, TouchableOpacity } from 'react-native';
import { View, Text, Button, StyleSheet } from 'react-native';

const Biblioteca = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Libros Disponibles</Text>
            <View>
                <table>
                    <thead>
                        <tr>
                            <th>Nombre del Libro</th>
                            <th>Cantidad en Biblioteca</th>
                            <th>Cantidad en prestamo</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>El Quijote</td>
                            <td>20</td>
                            <td>3</td>
                        </tr>
                        <tr>
                            <td>1984</td>
                            <td>15</td>
                            <td>2</td>
                        </tr>
                    </tbody>
                </table>
            </View>
            <Button title="Regresar al Inicio" onPress={() => navigation.navigate('Main')} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
});

export default Biblioteca;
