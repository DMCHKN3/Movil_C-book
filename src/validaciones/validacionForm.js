import { Alert } from "react-native";
import { verifBoleta } from "../../BD/authService";

export const validarform = (user, contra, repcontra, nombre, apellidos, correo) => {
    const resUser = /^[0-9]{10}$/;
    const resContra = /^[A-Za-z0-9\-_.,"#%]{7,16}$/;
    const resRepContra = /^[A-Za-z0-9\-_.,"#%]{7,16}$/;
    const resNombre = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,100}$/;
    const resApellidos = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,100}$/;
    const resCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,100}$/;

    if (!user || !contra || !nombre || !apellidos || !correo || !repcontra) {
        Alert.alert('Error', 'Por favor complete todos los campos');
        return false;
    }

    if (!resUser.test(user)) {
        Alert.alert('Error', 'El usuario debe ser tu boleta de 10 dígitos');
        return false;
    }
    if (!resContra.test(contra)) {
        Alert.alert('Error', 'La contraseña solo puede contener letras, números y los símbolos -_.,”#%');
        return false;
    }
    if (!resRepContra.test(repcontra)) {
        Alert.alert('Error', 'Favor de introducir la misma contraseña')
        return false;
    }

    if (!resNombre.test(nombre)) {
        Alert.alert('Error', 'El nombre solo puede contener letras y espacios con un mínimo de 2 caracteres y máximo de 100');
        return false;
    }

    if (!resApellidos.test(apellidos)) {
        Alert.alert('Error', 'Los apellidos solo pueden contener letras y espacios con un mínimo de 2 caracteres y máximo de 100');
        return false;
    }

    if (!resCorreo.test(correo)) {
        Alert.alert('Error', 'El correo debe de tener un formato válido (ejemplo@dominio.com)');
        return false;
    }

    if (contra !== repcontra) {
        Alert.alert('Error', 'Las contraseñas no coinciden');
        return false;
    }

    return true;
}

// Nueva función asíncrona para validar incluyendo la verificación de boleta
export const validarformConBD = async (user, contra, repcontra, nombre, apellidos, correo) => {
    // Primero ejecutar validaciones locales
    const validacionLocal = validarform(user, contra, repcontra, nombre, apellidos, correo);
    if (!validacionLocal) {
        return false;
    }

    // Luego verificar la boleta en la base de datos
    try {
        const verificacion = await verifBoleta(user);
        if (!verificacion.ok) {
            Alert.alert('Error', 'La boleta no está registrada en el sistema');
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error verificando boleta:', error);
        Alert.alert('Error', 'Error al verificar la boleta. Intenta nuevamente.');
        return false;
    }
}