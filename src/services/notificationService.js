import { supabase, supabaseUrl, supabaseAnonKey } from '../../supabase'

export async function savePushToken(token, boleta) {
  try {
    const url = `${supabaseUrl}/functions/v1/send-push-status`
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        type: 'register',
        token,
        boleta: typeof boleta === 'string' ? parseInt(boleta) : boleta,
      }),
    })
    const data = await res.json()
    if (!data.ok) {
      console.error('Error registering push token:', data.error)
    }
    return data
  } catch (error) {
    console.error('Error calling edge function for token registration:', error)
    throw error
  }
}

export async function removePushToken(token) {
  const { error } = await supabase
    .from('push_tokens')
    .delete()
    .eq('token', token)

  if (error) {
    console.error('Error removing push token:', error)
  }
}

export async function removeAllUserTokens(boleta) {
  const { error } = await supabase
    .from('push_tokens')
    .delete()
    .eq(
      'usuario_boleta',
      typeof boleta === 'string' ? parseInt(boleta) : boleta
    )

  if (error) {
    console.error('Error removing user tokens:', error)
  }
}
