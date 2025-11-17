import { supabase } from "../supabase";

export async function verifBoleta(boleta) {
    console.log('Verificando boleta:', boleta, 'Tipo:', typeof boleta);
    const boletaNum = parseInt(boleta);
    console.log('Boleta convertida a número:', boletaNum);
    
    const { data, error } = await supabase
    .from('boletas')
    .select('boleta')
    .eq('boleta', boletaNum)
    .limit(1);

    if (error) {
        console.error('Error verificando boleta:', error);
        throw error;
    }

    console.log('Resultado de verificación de boleta:', data);

    if(!data || data.length === 0) return {ok: false, message: 'Boleta no encontrada'};
    const fila = data[0];
    return {ok: true, fila};
}

export async function crearUsuario({boleta, nombre, apellidos, correo, contra}) {
    console.log('Iniciando creación de usuario:', { boleta, nombre, apellidos, correo });
    
    // Primero verificar que la boleta existe
    const verificacion = await verifBoleta(boleta);
    if (!verificacion.ok) {
        console.log('Verificación de boleta falló:', verificacion.message);
        return {ok: false, message: verificacion.message};
    }

    console.log('Boleta verificada exitosamente');

    // Crear usuario en Supabase Auth
    const { data: signData, error: signError } = await supabase.auth.signUp({
        email: correo, 
        password: contra
    });

    if (signError) {
        console.error('Error en signUp:', signError);
        return {ok: false, message: signError.message || 'Error al crear usuario', error: signError};
    }

    console.log('Usuario creado en Auth exitosamente');

    // Preparar datos para insertar
    const datosUsuario = {
        boleta: parseInt(boleta),
        correo: correo,
        password: contra,
        tiene_documentos: false
    };

    console.log('Datos a insertar:', datosUsuario);

    // Insertar datos del usuario en la tabla usuarios_web_movil
    const {data: insertData, error: insertError} = await supabase
    .from('usuarios_web_movil')
    .insert([datosUsuario])
    .select();

    if (insertError) {
        console.error('Error insertando usuario en la base de datos:', insertError);
        return {ok: false, message: insertError.message || 'Error al insertar usuario en la base de datos', error: insertError};
    }

    console.log('Usuario insertado exitosamente:', insertData);
    return {ok: true, user: signData.user, perfil: insertData?.[0] || null};
}