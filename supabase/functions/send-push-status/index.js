import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const STATUS_LABELS = {
  1: 'Pendiente',
  2: 'Aprobada',
  3: 'Rechazada',
  4: 'Cancelada',
  5: 'Entregado',
  6: 'Devuelto',
}

serve(async (req) => {
  const payload = await req.json()

  if (payload.estado_anterior === payload.estado_nuevo) {
    return new Response(JSON.stringify({ sent: 0, reason: 'no_change' }), { status: 200 })
  }

  const estadoLabel = STATUS_LABELS[payload.estado_nuevo] || 'Desconocido'

  const headers = {
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
  }

  const [ejemplarRes, tokensRes] = await Promise.all([
    fetch(
      `${SUPABASE_URL}/rest/v1/ejemplares?id=eq.${payload.ejemplar_id}&select=libros(titulo)`,
      { headers }
    ),
    fetch(
      `${SUPABASE_URL}/rest/v1/push_tokens?usuario_boleta=eq.${payload.usuario_boleta}&select=token`,
      { headers }
    ),
  ])

  const [ejemplares, tokens] = await Promise.all([
    ejemplarRes.json(),
    tokensRes.json(),
  ])

  const titulo = ejemplares?.[0]?.libros?.titulo || 'el libro'

  if (!tokens?.length) {
    return new Response(JSON.stringify({ sent: 0, reason: 'no_tokens' }), { status: 200 })
  }

  const messages = tokens.map((t) => ({
    to: t.token,
    sound: 'default',
    title: 'Estado de solicitud actualizado',
    body: `Tu solicitud de "${titulo}" ahora está: ${estadoLabel}`,
    data: {
      screen: 'Prestamos',
      solicitudId: payload.solicitud_id,
    },
  }))

  const expoResult = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(messages),
  }).then(r => r.json())

  return new Response(JSON.stringify({ sent: messages.length, expoResult }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
