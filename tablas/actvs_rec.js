import { Alert } from "react-native";
import { supabase } from "../supabase";

export async function getRecientes(userId) {
    const { data, error } = await supabase
        .from('solicitudes')
        .select('tipo, estado')
        .eq('user_id', userId);
    if (error) {
        console.error("Error al obtener las solicitudes:", error);
        Alert.alert("Error", "No se pudieron cargar las solicitudes.");
        return [];
    }

    return data;
}