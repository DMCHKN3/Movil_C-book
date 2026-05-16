import { Alert } from "react-native";
import { supabase } from "../supabase";//

export async function getSolicitudesAprobadas(userId) {
    if (!userId) {
        return [];
    }

    const { data, error } = await supabase
        .from('solicitudes_libros')
        .select('id, usuario_boleta, ejemplar_id, estado_asistencia_id, fecha_solicitud, ejemplares(libros(titulo))')
        .eq('usuario_boleta', parseInt(userId))
        .eq('estado_asistencia_id', 2)
        .order('fecha_solicitud', { ascending: false })
        .limit(10);
        
    if (error) {
        console.error("Error al obtener solicitudes aprobadas:", error);
        Alert.alert("Error", "No se pudieron cargar las solicitudes aprobadas.");
        return [];
    }

    return (data || []).map(item => ({
        id: item.id,
        titulo: item.ejemplares?.libros?.titulo || 'Sin título',
        estado: item.estado_asistencia_id,
        fecha_solicitud: item.fecha_solicitud,
    }));
}