import { Alert } from 'react-native';

export const validarLogin = (user,contra,setLoggedIn) => {
    const resUser = /^[0-9]{10}$/;
    const resContra = /^[A-Za-z0-9\-_.,"#%]{7,16}$/;

    const validUser = '2024090412';
    const validPass = 'Pep1t0_perez';
    if (user === validUser && contra === validPass) {
      Alert.alert('Correcto emntra jeje');
      setLoggedIn(true);
      return true;
    } else {
      Alert.alert('Error', 'Usuario o contraseña incorrectos');
      return false;
    }
    
    if (!user || !contra) {
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

    
};
