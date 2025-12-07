import { Alert } from "react-native";
import { supabase } from "../supabase";

export async function getSolicitudes(userId) {
    if (!userId) {
        console.warn("No se proporcionó userId para obtener solicitudes");
        return [];
    }

    console.log('Obteniendo solicitudes para usuario:', userId);
    
    const { data, error } = await supabase
        .from('v_solicitudes_alumno')
        .select('id, tipo, recurso_id, fecha_solicitud, hora_solicitud, hora_limite, estado')
        .eq('registro_id', parseInt(userId))
        .order('fecha_solicitud', { ascending: false });
        
    if (error) {
        console.error("Error al obtener las solicitudes:", error);
        Alert.alert("Error", "No se pudieron cargar las solicitudes.");
        return [];
    }

    console.log('Solicitudes obtenidas:', data?.length || 0);
    return data || [];
}