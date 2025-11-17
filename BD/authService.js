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

    // Verificar si el usuario ya existe
    const { data: existingUser, error: checkError } = await supabase
        .from('usuarios_web_movil')
        .select('boleta')
        .eq('boleta', parseInt(boleta))
        .limit(1);

    if (checkError) {
        console.error('Error verificando usuario existente:', checkError);
        return {ok: false, message: 'Error verificando usuario existente'};
    }

    if (existingUser && existingUser.length > 0) {
        return {ok: false, message: 'Ya existe una cuenta con esta boleta'};
    }

    // Verificar si el correo ya existe
    const { data: existingEmail, error: emailCheckError } = await supabase
        .from('usuarios_web_movil')
        .select('correo')
        .eq('correo', correo)
        .limit(1);

    if (emailCheckError) {
        console.error('Error verificando correo existente:', emailCheckError);
        return {ok: false, message: 'Error verificando correo existente'};
    }

    if (existingEmail && existingEmail.length > 0) {
        return {ok: false, message: 'Ya existe una cuenta con este correo electrónico'};
    }

    // Preparar datos para insertar (solo en la base de datos, sin Supabase Auth)
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
    return {ok: true, user: null, perfil: insertData?.[0] || null};
}

export async function iniciarSesion(boleta, password) {
    console.log('Iniciando sesión para boleta:', boleta);
    
    try {
        // Buscar el usuario en la tabla usuarios_web_movil
        const { data: userData, error: userError } = await supabase
            .from('usuarios_web_movil')
            .select('*')
            .eq('boleta', parseInt(boleta))
            .limit(1);

        if (userError) {
            console.error('Error buscando usuario:', userError);
            return { ok: false, message: 'Error al buscar usuario' };
        }

        if (!userData || userData.length === 0) {
            console.log('Usuario no encontrado');
            return { ok: false, message: 'Usuario no encontrado' };
        }

        const usuario = userData[0];
        console.log('Usuario encontrado:', usuario);

        // Verificar la contraseña (comparación directa ya que está almacenada en texto plano)
        if (usuario.password !== password) {
            console.log('Contraseña incorrecta');
            return { ok: false, message: 'Contraseña incorrecta' };
        }

        // Autenticación exitosa solo con la base de datos
        // No usamos Supabase Auth para evitar problemas de confirmación de email
        console.log('Sesión iniciada exitosamente');
        return { 
            ok: true, 
            user: null, // No necesitamos el objeto user de Supabase Auth
            perfil: usuario,
            message: 'Sesión iniciada exitosamente' 
        };

    } catch (error) {
        console.error('Error en iniciarSesion:', error);
        return { ok: false, message: 'Error inesperado al iniciar sesión' };
    }
}