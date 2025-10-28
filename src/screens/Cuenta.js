import React from 'react';
import { Touchable, TouchableOpacity } from 'react-native';
import { View, Text, Button, StyleSheet } from 'react-native';

const Cuenta = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <img src='../assets/user-icon.png' alt='User Icon' width={100} height={100}/>
            <Text>Datos Personales</Text>
            <View style={styles.container}>
                <label>Nombre: </label>
                <br></br>
                <label>Juan Perez</label>
                <label>Boleta: </label>
                <br></br>
                <label>2024567891</label>
                <label>Correo: </label>
                <br></br>
                <label>juanperez@example.com</label>
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
});

export default Cuenta;