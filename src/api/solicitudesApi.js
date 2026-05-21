import { api } from './client';

export async function getMyRequests() {
  return api.get('/recursos/usuario');
}

export async function createRequest(tipo, boleta, idRecurso) {
  return api.post('/solicitud', { tipo, boleta, idRecurso });
}

export async function cancelRequest(tipo, id) {
  return api.delete(`/solicitud/${tipo}/${id}`);
}
