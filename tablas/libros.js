import { supabase } from "../supabase";

export async function getLibros() {
    const { data, error } = await supabase
        .from('libros')
        .select('*');
    if (error) {
        console.error("Error al obtener los libros:", error);
        return [];
    }
    return data;
}

export async function getEjemplaresConLibros() {
    const { data, error } = await supabase
        .from('ejemplares')
        .select(`
            id, numero_ejemplar, Disponible, anio,
            libros ( id, titulo, autor, isbn, clasificacion, tipo_material )
        `)
        .order('id', { ascending: true });

    if (error) {
        console.error("Error al obtener ejemplares:", error);
        return [];
    }
    return data || [];
}

export async function getLibrosMasSolicitados() {
    try {
        const { data, error } = await supabase
            .from('solicitudes_libros')
            .select(`
                ejemplar_id,
                ejemplares!inner (
                    id,
                    libros!inner ( id, titulo, autor, clasificacion )
                )
            `)
            .limit(100);

        if (error) {
            return [];
        }

        const conteo = {};
        (data || []).forEach(s => {
            const id = s.ejemplar_id;
            if (!conteo[id]) {
                conteo[id] = {
                    id,
                    titulo: s.ejemplares?.libros?.titulo || 'Sin título',
                    autor: s.ejemplares?.libros?.autor || '-',
                    clasificacion: s.ejemplares?.libros?.clasificacion || '-',
                    solicitudes_count: 0
                };
            }
            conteo[id].solicitudes_count++;
        });

        return Object.values(conteo)
            .sort((a, b) => b.solicitudes_count - a.solicitudes_count)
            .slice(0, 5);
    } catch {
        return [];
    }
}
