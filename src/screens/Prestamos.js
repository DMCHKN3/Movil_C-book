import React from 'react';
import { Touchable, TouchableOpacity } from 'react-native';
import { View, Text, Button, StyleSheet } from 'react-native';

const Prestamos = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Prestamos Actuales de Libros</Text>
            <View>
                <table>
                    <thead>
                        <tr>
                            <th>Nombre del Libro</th>
                            <th>Dia de Solicitud</th>
                            <th>Fecha de Devolucion</th>
                            <th>Dias Restantes</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>El Quijote</td>
                            <td>01/01/2023</td>
                            <td>06/01/2023</td>
                            <td>1</td>
                        </tr>
                        <tr>
                            <td>1984</td>
                            <td>05/01/2023</td>
                            <td>10/01/2023</td>
                            <td>5</td>
                        </tr>
                    </tbody>
                </table>
            </View>
            <Button title="Regresar al Inicio" onPress={() => navigation.navigate('Main')} />
        </View>
    );
}

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

export default Prestamos;