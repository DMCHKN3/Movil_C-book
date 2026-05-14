import { Alert } from 'react-native';
import { iniciarSesion } from '../../BD/supabaseAuthService';

export const validarLogin = (user, contra, setLoggedIn) => {
    const resUser = /^[0-9]{10}$/;
    const resContra = /^[A-Za-z0-9\-_.,"#%]{7,16}$/;
    
    if (!user || !contra) {
        Alert.alert('Error', 'Por favor complete todos los campos');
        return false;
    }

    if (!resUser.test(user)) {
        Alert.alert('Error', 'El usuario debe ser tu boleta de 10 dígitos');
        return false;
    }

    if (!resContra.test(contra)) {
        Alert.alert('Error', 'La contraseña solo puede contener letras, números y los símbolos -_.,"#%');
        return false;
    }

    return true;
};

// Nueva función asíncrona para login con base de datos
export const validarLoginConBD = async (user, contra) => {
    // Primero validar formato
    const validacionLocal = validarLogin(user, contra);
    if (!validacionLocal) {
        return { ok: false };
    }

    try {
        // Intentar iniciar sesión con la base de datos
        const resultado = await iniciarSesion(user, contra);
        
        if (resultado.ok) {
            return { ok: true, user: resultado.user, perfil: resultado.perfil };
        } else {
            Alert.alert('Error', resultado.message || 'Usuario o contraseña incorrectos');
            return { ok: false };
        }
    } catch (error) {
        console.error('Error en validarLoginConBD:', error);
        Alert.alert('Error', 'Error al iniciar sesión. Intenta nuevamente.');
        return { ok: false };
    }
};
