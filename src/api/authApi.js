import { api } from './client';

export async function login(boleta, password) {
  return api.post('/login', { boleta, password });
}

export async function register(boleta, correo, password, confPsw) {
  return api.post('/registro', { boleta, correo, password, confPsw });
}

export async function verifyEmail(boleta, correo) {
  return api.post('/verificar', { boleta, correo });
}

export async function getSession() {
  return api.get('/session');
}

export async function logout() {
  try {
    return await api.post('/logout');
  } finally {
    const { clearJwt } = await import('./client');
    await clearJwt();
  }
}

export async function forgotPassword(boleta) {
  return api.post('/forgot-password', { boleta });
}

export async function resetPassword(access_token, newPassword, confPassword) {
  return api.post('/reset-password', { access_token, newPassword, confPassword });
}

export async function changePassword(correo, currentPassword, newPassword) {
  return api.post('/cambiar-contrasena', { correo, currentPassword, newPassword });
}

export async function updateAccount(boleta, TipoDatoACambiar, value) {
  const body = { boleta, TipoDatoACambiar };
  if (TipoDatoACambiar === 'correo') {
    body.nuevoCorreo = value;
  } else {
    body.nuevaContraseña = value;
  }
  return api.patch('/CuentaUpdate', body);
}
