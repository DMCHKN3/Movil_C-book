import { Alert } from "react-native";

export const validarform = (user, contra, repcontra, correo) => {
    const resUser = /^[0-9]{10}$/;
    const resContra = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{7,16}$/;
    const resCorreo = /^(?=.{2,100}$)[a-zA-Z0-9._%+-]+@alumno.ipn.mx$/;

    if (!user || !contra || !correo || !repcontra) {
        Alert.alert('Error', 'Por favor complete todos los campos');
        return false;
    }

    if (!resUser.test(user)) {
        Alert.alert('Error', 'El usuario debe ser tu boleta de 10 dígitos');
        return false;
    }

    if (!resCorreo.test(correo)) {
        Alert.alert('Error', 'El correo debe de tener un formato válido (ejemplo@alumno.ipn.mx)');
        return false;
    }

    if (contra.length < 7 || contra.length > 16) {
        Alert.alert('Error', 'La contraseña debe tener entre 7 y 16 caracteres');
        return false;
    }

    if (!resContra.test(contra)) {
        Alert.alert('Error', 'La contraseña debe incluir al menos una mayúscula, una minúscula y un carácter especial (! @ # $ % ^ & * ( ) _ + - = [ ] { } ; \' : " \\ | , . < > / ?)');
        return false;
    }

    if (contra !== repcontra) {
        Alert.alert('Error', 'Favor de introducir la misma contraseña');
        return false;
    }

    return true;
}