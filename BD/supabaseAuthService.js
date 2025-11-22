import { supabase } from "../supabase";
import { Alert } from "react-native"; //

/**
 * Servicio de autenticación con Supabase Auth
 * Maneja registro, confirmación por correo, inicio de sesión y verificaciones
 */

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
        return { ok: false, message: 'Error inesperado al verificar la boleta' };
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
    const regexCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,100}$/;
    if (!correo || !regexCorreo.test(correo)) {
        errores.push('El correo electrónico no tiene un formato válido');
    }

    // Validar contraseña
    if (!password || password.length < 6) {
        errores.push('La contraseña debe tener al menos 6 caracteres');
    }

    if (password.length > 16) {
        errores.push('La contraseña no puede tener más de 16 caracteres');
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

// Función para iniciar sesión (solo validación local - usuario y contraseña)
// Nota: Esta función NO usa Supabase Auth, solo valida localmente
// El inicio de sesión se maneja con la lógica existente de authService.js
export async function iniciarSesionLocal(boleta, password) {
    console.log('Validando inicio de sesión local para boleta:', boleta);
    
    try {
        // Validaciones locales
        if (!boleta || !password) {
            return { ok: false, message: 'Por favor ingresa boleta y contraseña' };
        }

        const regexBoleta = /^[0-9]{10}$/;
        if (!regexBoleta.test(boleta)) {
            return { ok: false, message: 'La boleta debe ser de 10 dígitos' };
        }

        // Nota: La validación de contraseña y CAPTCHA se debe hacer en el componente
        // Esta función solo valida el formato básico
        
        console.log('Validación local exitosa');
        return {
            ok: true,
            message: 'Validación local completada. Proceder con autenticación en authService.js'
        };

    } catch (error) {
        console.error('Error en validación local:', error);
        return { ok: false, message: 'Error en validación local' };
    }
}

// Nota: El cierre de sesión se maneja localmente con AsyncStorage
// No es necesario cerrar sesión en Supabase Auth ya que el inicio de sesión no lo usa

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

// Nota: Verificación de sesión y listeners no son necesarios
// La sesión se maneja localmente con AsyncStorage en UserContext.js

export default {
    crearCuentaConAuth,
    iniciarSesionLocal,
    reenviarConfirmacion,
    verificarBoletaExiste,
    verificarCuentaExistente,
    validarDatosRegistro
};