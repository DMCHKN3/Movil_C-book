import { api } from './client';

export async function getBooks(tipo, options = {}) {
  const { limit, page } = options;
  let q = `/recursos?tipo=${encodeURIComponent(tipo)}`;
  if (limit != null) q += `&limit=${limit}`;
  if (page != null) q += `&page=${page}`;
  return api.get(q);
}

export async function getMostRequested() {
  return api.get('/libros/mas-solicitados');
}
