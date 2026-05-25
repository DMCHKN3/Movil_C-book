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

async function handleRegister(payload) {
  const { token, boleta } = payload

  if (!token || !boleta) {
    return new Response(JSON.stringify({ ok: false, error: 'token and boleta required' }), { status: 400 })
  }

  const headers = {
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates',
  }

  const body = {
    token,
    usuario_boleta: Number(boleta),
    updated_at: new Date().toISOString(),
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/push_tokens`, {
    method: 'POST',
    headers: { ...headers },
    body: JSON.stringify(body),
  })

  const resBody = await res.text()
  console.log(`Register response: status=${res.status}, body=${resBody}`)

  if (res.ok) {
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ ok: false, error: resBody, status: res.status }), { status: 500 })
}

async function handleWebhook(record, old_record) {
  const estadoAnterior = old_record.estado_asistencia_id
  const estadoNuevo = record.estado_asistencia_id

  if (estadoAnterior === estadoNuevo) {
    return new Response(JSON.stringify({ sent: 0, reason: 'no_change' }), { status: 200 })
  }

  const estadoLabel = STATUS_LABELS[estadoNuevo] || 'Desconocido'
  const usuarioBoleta = Number(record.usuario_boleta)

  const headers = {
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
  }

  const [ejemplarRes, tokensRes] = await Promise.all([
    fetch(
      `${SUPABASE_URL}/rest/v1/ejemplares?id=eq.${record.ejemplar_id}&select=libros(titulo)`,
      { headers }
    ),
    fetch(
      `${SUPABASE_URL}/rest/v1/push_tokens?usuario_boleta=eq.${usuarioBoleta}&select=token`,
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
      solicitudId: record.id,
    },
  }))

  const expoRes = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(messages),
  })
  const expoResult = await expoRes.json()
  const expoData = Array.isArray(expoResult) ? expoResult : expoResult?.data || []

  const deleteHeaders = {
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
  }

  let sentCount = 0
  for (let i = 0; i < expoData.length; i++) {
    if (expoData[i].status === 'error') {
      const errMsg = expoData[i].message || ''
      if (errMsg.includes('DeviceNotRegistered') || errMsg.includes('InvalidToken')) {
        const token = messages[i].to
        await fetch(
          `${SUPABASE_URL}/rest/v1/push_tokens?token=eq.${encodeURIComponent(token)}`,
          { method: 'DELETE', headers: deleteHeaders }
        )
      }
    } else {
      sentCount++
    }
  }

  return new Response(JSON.stringify({ sent: sentCount, total: messages.length, removed: messages.length - sentCount }), {
    headers: { 'Content-Type': 'application/json' },
  })
}

serve(async (req) => {
  const payload = await req.json()

  if (payload.type === 'register') {
    return await handleRegister(payload)
  }

  const { record, old_record } = payload
  if (!record || !old_record) {
    return new Response(JSON.stringify({ sent: 0, reason: 'invalid_webhook_format' }), { status: 400 })
  }

  return await handleWebhook(record, old_record)
})
