import { api } from './client';

export async function getBooks(tipo) {
  return api.get(`/recursos?tipo=${encodeURIComponent(tipo)}`);
}

export async function getMostRequested() {
  return api.get('/libros/mas-solicitados');
}
