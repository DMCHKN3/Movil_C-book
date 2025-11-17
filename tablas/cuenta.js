import { Alert } from "react-native";
import { supabase } from "../supabase";

export async function getUsuario(userId) {
    const { data, error } = await supabase
        .from('boletas')
        .select('*')
        .eq('boleta', parseInt(userId));
    if (error) {
        console.error("Error al obtener la cuenta:", error);
        Alert.alert("Error", "No se pudo cargar la cuenta.");
        return null;
    }

    return data;
}

export async function getDatos(userId) {
    const { data, error } = await supabase
        .from('usuarios_web_movil')
        .select('correo, tiene_documentos')
        .eq('boleta', parseInt(userId));
    if (error) {
        console.error("Error al obtener los datos del usuario:", error);
        Alert.alert("Error", "No se pudieron cargar los datos del usuario.");
        return null;
    }
    return data;
}