import { getJwt } from '../auth/user';

// Konfiguruje żądanie HTTP typu GET wysyłane na serwer.
const get = (path) => fetch(path, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${getJwt()}`
  },
});

// Konfiguruje żądanie HTTP typu GET z parametrem wysyłane na serwer.
const getById = (path, id) => fetch(`${path}/${id}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${getJwt()}`
  },
});

// Konfiguruje żądanie HTTP typu POST wysyłane na serwer.
const post = (path, data) => fetch(path, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Authorization': `Bearer ${getJwt()}`
  },
  body: JSON.stringify(data),
});

// Konfiguruje żądanie HTTP typu PUT wysyłane na serwer.
const put = (path, id, data) => fetch(`${path}/${id}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Authorization': `Bearer ${getJwt()}`
  },
  body: JSON.stringify(data),
});

// Konfiguruje żądanie HTTP typu DELETE wysyłane na serwer.
const destroy = (path, id) => fetch(`${path}/${id}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${getJwt()}`
  },
});

export { get, getById, post, put, destroy };
