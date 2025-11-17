import { Alert } from "react-native";
import { supabase } from "../supabase";

export async function getCuenta(userId) {
    const { data, error } = await supabase
        .from('usuarios_web_movil')
        .select('nombre, apellido, boleta, correo')
        .eq('user_id', userId);
    if (error) {
        console.error("Error al obtener la cuenta:", error);
        Alert.alert("Error", "No se pudo cargar la cuenta.");
        return null;
    }

    return data;
}