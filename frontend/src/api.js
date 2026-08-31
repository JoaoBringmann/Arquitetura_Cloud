const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:7071/api').replace(/\/$/, '');

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const details = body.detalhes ? ` ${Object.values(body.detalhes).join(' ')}` : '';
    throw new Error(`${body.erro || 'Não foi possível concluir a operação.'}${details}`);
  }

  return body;
}

export function listSalas(query = '') {
  const params = new URLSearchParams();
  if (query.trim()) {
    params.set('q', query.trim());
  }

  const suffix = params.toString() ? `?${params.toString()}` : '';
  return request(`/salas${suffix}`);
}

export function createSala(sala) {
  return request('/salas', { method: 'POST', body: JSON.stringify(sala) });
}

export function updateSala(id, sala) {
  return request(`/salas/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(sala)
  });
}

export function deleteSala(id) {
  return request(`/salas/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
