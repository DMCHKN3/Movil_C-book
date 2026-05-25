import { Alert } from 'react-native';
import { createTicket } from '../api/supportApi';

export const validarSoporte = (tipoSel, titulo, desc) => {
    const resTitulo = /^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñüÜ\s.,;:!?¿¡\-_()]{4,160}$/;
    const resDesc = /^[\s\S]{15,2000}$/;

    if (!tipoSel) {
        Alert.alert('Error', 'Selecciona un tipo de error');
        return false;
    }

    if (!titulo || titulo.length === 0) {
        Alert.alert('Error', 'El asunto es obligatorio');
        return false;
    }

    if (!resTitulo.test(titulo)) {
        Alert.alert('Error', 'El asunto debe tener entre 4 y 160 caracteres');
        return false;
    }

    if (!desc || desc.length === 0) {
        Alert.alert('Error', 'La descripcion es obligatoria');
        return false;
    }

    if (!resDesc.test(desc)) {
        Alert.alert('Error', 'La descripcion debe tener entre 15 y 2000 caracteres');
        return false;
    }

    return true;
};

export const enviarSoporte = async (tipoSel, titulo, desc, prioSel, onSuccess) => {
    const validacionLocal = validarSoporte(tipoSel, titulo, desc);
    if (!validacionLocal) {
        return { ok: false };
    }

    try {
        await createTicket({
            titulo: titulo,
            descripcion: desc,
            tipo: tipoSel,
            prioridad: prioSel,
            modulo: 'movil',
        });

        Alert.alert(
            'Reporte enviado',
            'Se creo tu ticket. Te notificaremos cuando haya actualizaciones.',
            [{ text: 'OK', onPress: onSuccess }]
        );

        return { ok: true };
    } catch (error) {
        console.error('Error en enviarSoporte:', error);
        if (error.status) {
          Alert.alert('Error', error.message);
        } else {
          Alert.alert('Error', 'Ocurrio un error inesperado. Intenta nuevamente.');
        }
        return { ok: false };
    }
};
