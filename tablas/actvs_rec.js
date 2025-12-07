import { Alert } from "react-native";
import { supabase } from "../supabase";//

export async function getRecientes(userId) {
    if (!userId) {
        console.warn("No se proporcionó userId para obtener actividades recientes");
        return [];
    }

    console.log('Obteniendo actividades recientes para usuario:', userId);
    
    const { data, error } = await supabase
        .from('v_solicitudes_alumno')
        .select('tipo, estado')
        .eq('registro_id', parseInt(userId))
        .order('fecha_solicitud', { ascending: false })
        .order('hora_solicitud', { ascending: false })
        .limit(5);
        
    if (error) {
        console.error("Error al obtener las solicitudes recientes:", error);
        Alert.alert("Error", "No se pudieron cargar las solicitudes recientes.");
        return [];
    }

    console.log('Actividades recientes obtenidas:', data?.length || 0);
    return data || [];
}