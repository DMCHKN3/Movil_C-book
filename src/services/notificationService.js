import { supabase } from '../../supabase'

export async function savePushToken(token, boleta) {
  const { data, error } = await supabase
    .from('push_tokens')
    .upsert(
      {
        token,
        usuario_boleta: typeof boleta === 'string' ? parseInt(boleta) : boleta,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'token' }
    )
    .select();

  if (error) {
    console.error('Error saving push token:', error);
    throw error;
  }
  return data;
}

export async function removePushToken(token) {
  const { error } = await supabase
    .from('push_tokens')
    .delete()
    .eq('token', token);

  if (error) {
    console.error('Error removing push token:', error);
  }
}

export async function removeAllUserTokens(boleta) {
  const { error } = await supabase
    .from('push_tokens')
    .delete()
    .eq(
      'usuario_boleta',
      typeof boleta === 'string' ? parseInt(boleta) : boleta
    );

  if (error) {
    console.error('Error removing user tokens:', error);
  }
}
