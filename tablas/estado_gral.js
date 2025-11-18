import { Alert } from "react-native";
import { supabase } from "../supabase";

export async function getEstadoGral(userId) {
    if (!userId) {
        console.warn("No se proporcionó userId para obtener estado general");
        return [];
    }

    console.log('Obteniendo estado general para usuario:', userId);
    
    const { data, error } = await supabase
        .from('solicitudes')
        .select('tipo, fecha_solicitud, estado')
        .eq('registro_id', parseInt(userId));
        
    if (error) {
        console.error("Error al obtener las solicitudes:", error);
        Alert.alert("Error", "No se pudieron cargar las solicitudes recientes");
        return [];
    }

    console.log('Estado general obtenido:', data?.length || 0);
    return data || [];
}