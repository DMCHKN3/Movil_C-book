import { supabase } from "../supabase";

export async function crearSolicitudLibro(boleta, ejemplarId) {
  try {
    const { data: ejemplar } = await supabase
      .from('ejemplares')
      .select('Disponible')
      .eq('id', ejemplarId)
      .single();

    if (!ejemplar) {
      return { ok: false, message: 'Ejemplar no encontrado' };
    }

    if (ejemplar.Disponible === false) {
      return { ok: false, message: 'El libro no está disponible actualmente' };
    }

    const { count } = await supabase
      .from('solicitudes_libros')
      .select('id', { count: 'exact' })
      .eq('usuario_boleta', String(boleta))
      .eq('estado_asistencia_id', 1);

    if (count >= 3) {
      return {
        ok: false,
        message: 'Ya tienes 3 solicitudes activas. Debes concluir alguna antes de solicitar otro.'
      };
    }

    const { error } = await supabase
      .from('solicitudes_libros')
      .insert([{
        usuario_boleta: String(boleta),
        ejemplar_id: ejemplarId,
      }]);

    if (error) {
      return { ok: false, message: error.message || 'Error al crear la solicitud' };
    }

    return { ok: true, message: 'Solicitud creada exitosamente' };
  } catch (err) {
    return { ok: false, message: 'Error inesperado al crear la solicitud' };
  }
}

export async function cancelarSolicitud(id, boleta) {
  try {
    const { error } = await supabase
      .from('solicitudes_libros')
      .update({ estado_asistencia_id: 4 })
      .eq('id', id)
      .eq('usuario_boleta', String(boleta))
      .eq('estado_asistencia_id', 1);

    if (error) {
      return { ok: false, message: error.message || 'Error al cancelar la solicitud' };
    }

    return { ok: true, message: 'Solicitud cancelada exitosamente' };
  } catch (err) {
    return { ok: false, message: 'Error inesperado al cancelar la solicitud' };
  }
}

export async function contarSolicitudesActivas(boleta) {
  try {
    const { count, error } = await supabase
      .from('solicitudes_libros')
      .select('id', { count: 'exact' })
      .eq('usuario_boleta', String(boleta))
      .eq('estado_asistencia_id', 1);

    if (error) return 0;
    return count || 0;
  } catch {
    return 0;
  }
}

export async function getSolicitudesCompletas(boleta) {
  try {
    const { data, error } = await supabase
      .from('solicitudes_libros')
      .select(`
        id, usuario_boleta, ejemplar_id, fecha_solicitud,
        fecha_limite_respuesta, fecha_aprobacion,
        fecha_limite_recoleccion, motivo_rechazo,
        fecha_rechazo, estado_asistencia_id,
        fecha_devolucion_real,
        ejemplares (
          id, numero_ejemplar,
          libros ( titulo, autor, clasificacion )
        ),
        prestamos_libros (
          id, estado, fecha_prestamo, fecha_devolucion
        )
      `)
      .eq('usuario_boleta', String(boleta))
      .order('fecha_solicitud', { ascending: false });

    if (error) {
      return [];
    }

    return (data || []).map(s => ({
      ...s,
      tipo_solicitud: 'libro',
      recurso_id: s.ejemplar_id,
      titulo: s.ejemplares?.libros?.titulo || null,
      autor: s.ejemplares?.libros?.autor || null,
      prestamo: s.prestamos_libros?.[0] || null,
    }));
  } catch {
    return [];
  }
}
