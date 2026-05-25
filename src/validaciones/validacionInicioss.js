import { Alert } from 'react-native';

export const validarLogin = (user, contra) => {
    const resUser = /^[0-9]{10}$/;
    const resContra = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{7,16}$/;

    if (!user || !contra) {
        Alert.alert('Error', 'Por favor complete todos los campos');
        return false;
    }

    if (!resUser.test(user)) {
        Alert.alert('Error', 'El usuario debe ser tu boleta de 10 dígitos');
        return false;
    }

    if (!resContra.test(contra)) {
        Alert.alert('Error', 'La contraseña debe incluir al menos una mayúscula, una minúscula y un carácter especial (! @ # $ % ^ & * ( ) _ + - = [ ] { } ; \' : " \\ | , . < > / ?)');
        return false;
    }

    return true;
};
