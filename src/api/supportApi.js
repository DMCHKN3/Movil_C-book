import { api } from './client';

export async function getTicketTypes() {
  return api.get('/soporte/tipos');
}

export async function createTicket(data) {
  return api.post('/soporte/tickets', data);
}

export async function getMyTickets() {
  return api.get('/soporte/tickets?mine=true');
}

export async function getTicket(id) {
  return api.get(`/soporte/tickets/${id}`);
}

export async function addComment(id, body, isInternal = false) {
  return api.post(`/soporte/tickets/${id}/comentarios`, { body, isInternal });
}
