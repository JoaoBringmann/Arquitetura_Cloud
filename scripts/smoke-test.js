const assert = require('node:assert/strict');

const baseUrl = (process.env.API_BASE_URL || 'http://localhost:7071/api').replace(/\/$/, '');
let createdId;

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  const body = await response.json().catch(() => ({}));
  return { response, body };
}

async function run() {
  const uniqueName = `Sala Smoke ${Date.now()}`;
  const sala = {
    nome: uniqueName,
    bloco: 'Bloco Smoke',
    capacidade: 10,
    recursos: ['Projetor'],
    disponivel: true
  };

  try {
    const created = await request('/salas', { method: 'POST', body: JSON.stringify(sala) });
    assert.equal(created.response.status, 201);
    createdId = created.body.sala.id;
    assert.ok(createdId);

    const searched = await request(`/salas?q=${encodeURIComponent(uniqueName)}`);
    assert.equal(searched.response.status, 200);
    assert.equal(searched.body.total, 1);
    assert.equal(searched.body.salas[0].id, createdId);

    const updated = await request(`/salas/${createdId}`, {
      method: 'PUT',
      body: JSON.stringify({ ...sala, nome: `${uniqueName} Atualizada`, capacidade: 20 })
    });
    assert.equal(updated.response.status, 200);
    assert.equal(updated.body.sala.capacidade, 20);

    const invalidId = await request('/salas/id-invalido', { method: 'DELETE' });
    assert.equal(invalidId.response.status, 400);

    const invalidBody = await request('/salas', { method: 'POST', body: JSON.stringify({}) });
    assert.equal(invalidBody.response.status, 400);

    const deleted = await request(`/salas/${createdId}`, { method: 'DELETE' });
    assert.equal(deleted.response.status, 200);

    const afterDelete = await request(`/salas?q=${encodeURIComponent(uniqueName)}`);
    assert.equal(afterDelete.response.status, 200);
    assert.equal(afterDelete.body.total, 0);

    createdId = undefined;
    console.log('Smoke test CRUD: inserção, pesquisa, alteração, exclusão e validações passaram.');
  } finally {
    if (createdId) {
      await request(`/salas/${createdId}`, { method: 'DELETE' });
    }
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
