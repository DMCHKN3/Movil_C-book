import { supabase } from "../supabase";////
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Servicio de autenticación con Supabase Auth
 * Maneja registro, confirmación por correo, inicio de sesión y verificaciones
 */

const PENDING_REGISTRATION_KEY = '@cbook_pending_registration';

async function guardarRegistroPendiente(boleta, correo) {
    try {
        const data = { boleta: String(boleta), correo };
        await AsyncStorage.setItem(PENDING_REGISTRATION_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('Error guardando registro pendiente:', e);
    }
}

async function obtenerRegistroPendiente(boleta) {
    try {
        const raw = await AsyncStorage.getItem(PENDING_REGISTRATION_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (data.boleta === String(boleta)) return data;
        return null;
    } catch {
        return null;
    }
}

async function limpiarRegistroPendiente() {
    try {
        await AsyncStorage.removeItem(PENDING_REGISTRATION_KEY);
    } catch {
        // ignorar
    }
}

async function asegurarUsuarioEnTabla(boleta, correo) {
    console.log('Asegurando usuario en usuarios_web_movil:', { boleta, correo });
    try {
        const { data: existente, error: errorBusqueda } = await supabase
            .from('usuarios_web_movil')
            .select('boleta')
            .eq('boleta', parseInt(boleta))
            .maybeSingle();

        if (errorBusqueda) {
            console.error('Error buscando usuario en tabla:', errorBusqueda);
            return { ok: false, message: 'Error al verificar usuario' };
        }

        if (existente) {
            console.log('Usuario ya existe en usuarios_web_movil');
            return { ok: true, yaExistia: true };
        }

        const { error: errorInsert } = await supabase
            .from('usuarios_web_movil')
            .insert([{ boleta: parseInt(boleta), correo: correo, tiene_documentos: false }]);

        if (errorInsert) {
            console.error('Error insertando usuario en tabla:', errorInsert);
            return { ok: false, message: 'Error al activar la cuenta' };
        }

        console.log('Usuario insertado en usuarios_web_movil exitosamente');
        return { ok: true, yaExistia: false };
    } catch (error) {
        console.error('Error inesperado asegurando usuario:', error);
        return { ok: false, message: 'Error al activar la cuenta' };
    }
}

// Función para verificar si la boleta existe en el sistema
export async function verificarBoletaExiste(boleta) {
    console.log('Verificando existencia de boleta:', boleta);
    
    try {
        const boletaNum = parseInt(boleta);
        const { data, error } = await supabase
            .from('boletas')
            .select('boleta')
            .eq('boleta', boletaNum)
            .limit(1);

        if (error) {
            console.error('Error verificando boleta:', error);
            return { ok: false, message: 'Error al verificar la boleta' };
        }

        if (!data || data.length === 0) {
            return { ok: false, message: 'La boleta no está registrada en el sistema' };
        }

        return { ok: true, boleta: data[0] };
    } catch (error) {
        console.error('Error inesperado verificando boleta:', error);
        return { ok: false, message: 'Boleta no encontrada en el sistema' };
    }
}

// Función para validar formato de datos antes del registro
export function validarDatosRegistro(boleta, correo, password, confirmPassword) {
    const errores = [];

    // Validar boleta (10 dígitos)
    const regexBoleta = /^[0-9]{10}$/;
    if (!boleta || !regexBoleta.test(boleta)) {
        errores.push('La boleta debe ser de exactamente 10 dígitos');
    }

    // Validar correo electrónico
    const allowAnyEmail = process.env.EXPO_PUBLIC_ALLOW_ANY_EMAIL === 'true';
    let regexCorreo;
    if (allowAnyEmail) {
        // Regex básico para cualquier email (para pruebas)
        regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    } else {
        // Solo dominio @alumno.ipn.mx
        regexCorreo = /^[a-zA-Z0-9._%+-]+@alumno\.ipn\.mx$/;
    }
    if (!correo || !regexCorreo.test(correo)) {
        errores.push('El correo electrónico no tiene un formato válido');
    }

    // Validar contraseña: entre 7 y 16 caracteres, y debe incluir letras, números y símbolos -_.,"#%
    const regexPassword = /^[A-Za-z0-9\-_.,"#%]{7,16}$/;
    if (!password || !regexPassword.test(password)) {
        errores.push('La contraseña debe tener entre 7 y 16 caracteres y contener letras, números y símbolos -_.,"#%');
    }

    // Validar confirmación de contraseña
    if (password !== confirmPassword) {
        errores.push('Las contraseñas no coinciden');
    }

    return {
        valido: errores.length === 0,
        errores: errores
    };
}

// Función para verificar si ya existe una cuenta con la boleta o correo
export async function verificarCuentaExistente(boleta, correo) {
    console.log('Verificando si ya existe cuenta con boleta o correo');
    
    try {
        // Verificar en la tabla personalizada
        const { data: usuarioExistente, error: errorUsuario } = await supabase
            .from('usuarios_web_movil')
            .select('boleta, correo')
            .or(`boleta.eq.${parseInt(boleta)},correo.eq.${correo}`)
            .limit(1);

        if (errorUsuario) {
            console.error('Error verificando usuario existente:', errorUsuario);
            return { ok: false, message: 'Error al verificar cuentas existentes' };
        }

        if (usuarioExistente && usuarioExistente.length > 0) {
            const cuenta = usuarioExistente[0];
            if (cuenta.boleta === parseInt(boleta)) {
                return { ok: false, message: 'Ya existe una cuenta con esta boleta' };
            }
            if (cuenta.correo === correo) {
                return { ok: false, message: 'Ya existe una cuenta con este correo electrónico' };
            }
        }

        return { ok: true };
    } catch (error) {
        console.error('Error inesperado verificando cuenta existente:', error);
        return { ok: false, message: 'Error inesperado al verificar cuentas existentes' };
    }
}

// Función principal para crear cuenta con Supabase Auth
export async function crearCuentaConAuth(boleta, correo, password, confirmPassword) {
    console.log('Iniciando creación de cuenta con Supabase Auth:', { boleta, correo });
    
    try {
        // 1. Validar datos de entrada (validación local)
        const validacion = validarDatosRegistro(boleta, correo, password, confirmPassword);
        if (!validacion.valido) {
            return { 
                ok: false, 
                message: 'Datos inválidos:\n' + validacion.errores.join('\n') 
            };
        }
        

        // 2. Crear usuario con Supabase Auth
        console.log('Creando usuario en Supabase Auth...');
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: correo,
            password: password,
            options: {
                data: {
                    boleta: parseInt(boleta),
                    custom_boleta: boleta
                },
                //Buscar en el github la liga
                emailRedirectTo: undefined // No necesitamos redirección en mobile
            }
        });

        if (authError) {
            console.error('Error creando usuario en Auth:', authError);
            
            // Manejar errores específicos de Supabase Auth
            if (authError.message.includes('User already registered')) {
                return { ok: false, message: 'Ya existe una cuenta con este correo electrónico' };
            }
            if (authError.message.includes('Invalid email')) {
                return { ok: false, message: 'El formato del correo electrónico no es válido' };
            }
            if (authError.message.includes('Password should be at least')) {
                return { ok: false, message: 'La contraseña debe tener al menos 6 caracteres' };
            }
            
            return { 
                ok: false, 
                message: authError.message || 'Error al crear la cuenta de usuario' 
            };
        }

        console.log('Usuario creado en Auth exitosamente:', authData.user?.id);
        console.log('Correo de confirmación enviado automáticamente a:', correo);

        await guardarRegistroPendiente(boleta, correo);

        return {
            ok: true,
            user: authData.user,
            message: 'Cuenta creada exitosamente. Se ha enviado un correo de verificación a tu dirección de correo electrónico.',
            needsEmailConfirmation: true
        };

    } catch (error) {
        console.error('Error inesperado en crearCuentaConAuth:', error);
        return { 
            ok: false, 
            message: 'Error inesperado al crear la cuenta. Intenta nuevamente.' 
        };
    }
}

export async function insertTablaUsuarios(boleta, correo) {
    console.log('Insertando usuario en tabla usuarios_web_movil:', { boleta, correo });
    // Verificar si ya existe una cuenta con la boleta o correo
    const cuentaExistente = await verificarCuentaExistente(boleta, correo);
    if (!cuentaExistente.ok) {
        return cuentaExistente; // Retornar el error si ya existe
    }

    const {data: CrearUsuarioData, error: CrearUsuarioError} = await supabase
    .from('usuarios_web_movil')
    .insert([
        {boleta: parseInt(boleta), correo: correo, tiene_documentos: false}
    ]);

    if (CrearUsuarioError) {
        console.error('Error insertando usuario en tabla personal:', CrearUsuarioError);
        return { ok: false, message: 'Error inesperado al crear la cuenta' + '\n' + 'Favor de intentar más tarde' };
    }

    console.log('Usuario insertado en tabla usuarios_web_movil exitosamente:', CrearUsuarioData);

    return { ok: true, message: 'Usuario creado exitosamente' };
}

// Función para iniciar sesión con Supabase Auth usando correo
export async function iniciarSesionConAuth(correo, password) {
    console.log('Iniciando sesión con Supabase Auth:', correo);
    
    try {
        // Validaciones básicas
        if (!correo || !password) {
            return { ok: false, message: 'Por favor ingresa correo y contraseña' };
        }

        const allowAnyEmail = process.env.EXPO_PUBLIC_ALLOW_ANY_EMAIL === 'true';
        let regexCorreo;
        if (allowAnyEmail) {
            // Regex básico para cualquier email (para pruebas)
            regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        } else {
            // Solo dominio @alumno.ipn.mx
            regexCorreo = /^[a-zA-Z0-9._%+-]+@alumno\.ipn\.mx$/;
        }
        if (!regexCorreo.test(correo)) {
            return { ok: false, message: 'El formato del correo electrónico no es válido' };
        }

        const regexPassword = /^[A-Za-z0-9\-_.,"#%]{7,16}$/;
        if (!password || !regexPassword.test(password)) {
            return { ok: false, message: 'La contraseña debe tener entre 7 y 16 caracteres y contener letras, números y símbolos -_.,"#%' };
        }

        // Iniciar sesión con Supabase Auth
        console.log('Autenticando con Supabase Auth...');
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: correo,
            password: password
        });

        if (authError) {
            console.error('Error en inicio de sesión:', authError);
            
            // Manejar errores específicos
            if (authError.message.includes('Invalid login credentials')) {
                return { ok: false, message: 'Correo o contraseña incorrectos' };
            }
            if (authError.message.includes('Email not confirmed')) {
                return { 
                    ok: false, 
                    message: 'Por favor confirma tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.',
                    needsEmailConfirmation: true
                };
            }
            
            return { ok: false, message: authError.message || 'Error al iniciar sesión' };
        }

        console.log('Inicio de sesión exitoso');
        
        // Crear objeto perfil con datos de Auth
        const perfil = {
            boleta: authData.user?.user_metadata?.boleta || authData.user?.user_metadata?.custom_boleta,
            correo: authData.user?.email,
            id: authData.user?.id,
            email_confirmed: authData.user?.email_confirmed_at ? true : false
        };

        return {
            ok: true,
            user: authData.user,
            perfil: perfil,
            session: authData.session,
            message: 'Sesión iniciada exitosamente'
        };

    } catch (error) {
        console.error('Error inesperado en iniciarSesionConAuth:', error);
        return { ok: false, message: 'Error inesperado al iniciar sesión' };
    }
}

// Función para cerrar sesión en Supabase Auth
export async function cerrarSesionConAuth() {
    console.log('Cerrando sesión en Supabase Auth...');

    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Error cerrando sesión en Supabase Auth:', error);
            return { ok: false, message: 'Error al cerrar sesión' };
        }

        console.log('Sesión cerrada en Supabase Auth exitosamente');
        return { ok: true, message: 'Sesión cerrada exitosamente' };

    } catch (error) {
        console.error('Error inesperado cerrando sesión:', error);
        return { ok: false, message: 'Error inesperado al cerrar sesión' };
    }
}

// Función para reenviar correo de confirmación
export async function reenviarConfirmacion(correo) {
    console.log('Reenviando correo de confirmación a:', correo);
    
    try {
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: correo
        });

        if (error) {
            console.error('Error reenviando confirmación:', error);
            return { ok: false, message: error.message || 'Error al reenviar correo de confirmación' };
        }

        return { ok: true, message: 'Correo de confirmación reenviado exitosamente' };
        
    } catch (error) {
        console.error('Error inesperado reenviando confirmación:', error);
        return { ok: false, message: 'Error inesperado al reenviar confirmación' };
    }
}

export async function buscarCorreoPorBoleta(boleta) {
    try {
        const { data, error } = await supabase
            .from('usuarios_web_movil')
            .select('correo')
            .eq('boleta', parseInt(boleta))
            .single();

        if (error || !data) {
            return { ok: false, message: 'No se encontró una cuenta con esa boleta' };
        }

        return { ok: true, correo: data.correo };
    } catch {
        return { ok: false, message: 'Error al buscar la boleta' };
    }
}

export async function iniciarSesionConBoleta(boleta, password) {
    try {
        if (!boleta || !password) {
            return { ok: false, message: 'Por favor ingresa boleta y contraseña' };
        }

        const regexBoleta = /^[0-9]{10}$/;
        if (!regexBoleta.test(boleta)) {
            return { ok: false, message: 'La boleta debe ser de exactamente 10 dígitos' };
        }

        const regexPassword = /^[A-Za-z0-9\-_.,"#%]{7,16}$/;
        if (!regexPassword.test(password)) {
            return { ok: false, message: 'La contraseña debe tener entre 7 y 16 caracteres' };
        }

        let correo = null;

        const busqueda = await buscarCorreoPorBoleta(boleta);
        if (busqueda.ok) {
            correo = busqueda.correo;
            console.log('Correo encontrado en usuarios_web_movil:', correo);
        } else {
            console.log('Boleta no encontrada en usuarios_web_movil, buscando registro pendiente...');
            const pendiente = await obtenerRegistroPendiente(boleta);
            if (pendiente) {
                correo = pendiente.correo;
                console.log('Correo encontrado en registro pendiente:', correo);
            }
        }

        if (!correo) {
            return { ok: false, message: 'No existe una cuenta con esa boleta' };
        }

        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: correo,
            password: password
        });

        if (authError) {
            if (authError.message.includes('Invalid login credentials')) {
                return { ok: false, message: 'Boleta o contraseña incorrectos' };
            }
            if (authError.message.includes('Email not confirmed')) {
                return {
                    ok: false,
                    message: 'Por favor confirma tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.',
                    needsEmailConfirmation: true,
                    correo: correo
                };
            }
            return { ok: false, message: authError.message || 'Error al iniciar sesión' };
        }

        const activacion = await asegurarUsuarioEnTabla(boleta, correo);
        if (activacion.ok && !activacion.yaExistia) {
            await limpiarRegistroPendiente();
        }

        const perfil = {
            boleta: parseInt(boleta),
            correo: authData.user?.email,
            id: authData.user?.id,
            email_confirmed: authData.user?.email_confirmed_at ? true : false
        };

        return {
            ok: true,
            user: authData.user,
            perfil: perfil,
            session: authData.session,
            message: 'Sesión iniciada exitosamente'
        };
    } catch {
        return { ok: false, message: 'Error inesperado al iniciar sesión' };
    }
}

export async function cambiarContrasenaPropia(correo, contraseñaActual, nuevaContraseña) {
    console.log('Verificando contraseña actual antes de cambiar...');
    try {
        const { error: loginError } = await supabase.auth.signInWithPassword({
            email: correo,
            password: contraseñaActual,
        });

        if (loginError) {
            console.error('Error verificando contraseña actual:', loginError);
            if (loginError.message.includes('Invalid login credentials')) {
                return { ok: false, message: 'La contraseña actual es incorrecta' };
            }
            return { ok: false, message: 'Error al verificar la contraseña actual' };
        }

        console.log('Contraseña actual verificada, actualizando...');
        const { error: updateError } = await supabase.auth.updateUser({
            password: nuevaContraseña,
        });

        if (updateError) {
            console.error('Error actualizando contraseña:', updateError);
            return { ok: false, message: updateError.message || 'Error al actualizar la contraseña' };
        }

        console.log('Contraseña actualizada exitosamente');
        return { ok: true, message: 'Contraseña actualizada exitosamente' };
    } catch (error) {
        console.error('Error inesperado cambiando contraseña:', error);
        return { ok: false, message: 'Error inesperado al cambiar la contraseña' };
    }
}

export async function solicitarRecuperacionContrasena(boleta) {
    try {
        const regexBoleta = /^[0-9]{10}$/;
        if (!regexBoleta.test(boleta)) {
            return { ok: false, message: 'La boleta debe ser de exactamente 10 dígitos' };
        }

        let busqueda = await buscarCorreoPorBoleta(boleta);
        if (!busqueda.ok) {
            const pendiente = await obtenerRegistroPendiente(boleta);
            if (pendiente) {
                busqueda = { ok: true, correo: pendiente.correo };
            } else {
                return busqueda;
            }
        }

        const { error } = await supabase.auth.resetPasswordForEmail(busqueda.correo);

        if (error) {
            return { ok: false, message: error.message || 'Error al enviar el correo de recuperación' };
        }

        return {
            ok: true,
            message: 'Revisa tu correo electrónico para las instrucciones de recuperación.'
        };
    } catch {
        return { ok: false, message: 'Error inesperado al solicitar recuperación' };
    }
}

// Nota: Verificación de sesión y listeners no son necesarios
// La sesión se maneja localmente con AsyncStorage en UserContext.js

export default {
    crearCuentaConAuth,
    iniciarSesionConAuth,
    cerrarSesionConAuth,
    reenviarConfirmacion,
    verificarBoletaExiste,
    verificarCuentaExistente,
    validarDatosRegistro,
    insertTablaUsuarios,
    iniciarSesionConBoleta,
    solicitarRecuperacionContrasena,
    buscarCorreoPorBoleta
};