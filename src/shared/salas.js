const { ObjectId } = require('mongodb');

function normalizeResources(resources) {
  if (resources === undefined || resources === null || resources === '') {
    return [];
  }

  if (typeof resources === 'string') {
    return resources
      .split(',')
      .map((resource) => resource.trim())
      .filter(Boolean);
  }

  if (Array.isArray(resources) && resources.every((resource) => typeof resource === 'string')) {
    return resources.map((resource) => resource.trim()).filter(Boolean);
  }

  return null;
}

function parseAvailability(value) {
  if (value === undefined) {
    return true;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return null;
}

function validateSalaInput(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, errors: { corpo: 'O corpo da requisição deve ser um objeto JSON.' } };
  }

  const errors = {};
  const nome = typeof body.nome === 'string' ? body.nome.trim() : '';
  const bloco = typeof body.bloco === 'string' ? body.bloco.trim() : '';
  const capacidade = typeof body.capacidade === 'string' && body.capacidade.trim() !== ''
    ? Number(body.capacidade)
    : body.capacidade;
  const recursos = normalizeResources(body.recursos);
  const disponivel = parseAvailability(body.disponivel);

  if (!nome) {
    errors.nome = 'Informe o nome da sala.';
  } else if (nome.length > 120) {
    errors.nome = 'O nome da sala deve ter no máximo 120 caracteres.';
  }

  if (!bloco) {
    errors.bloco = 'Informe o bloco da sala.';
  } else if (bloco.length > 80) {
    errors.bloco = 'O bloco deve ter no máximo 80 caracteres.';
  }

  if (!Number.isInteger(capacidade) || capacidade < 1 || capacidade > 10000) {
    errors.capacidade = 'A capacidade deve ser um número inteiro entre 1 e 10000.';
  }

  if (recursos === null) {
    errors.recursos = 'Recursos deve ser uma lista de textos ou uma string separada por vírgulas.';
  }

  if (disponivel === null) {
    errors.disponivel = 'Disponibilidade deve ser true ou false.';
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: { nome, bloco, capacidade, recursos, disponivel }
  };
}

function parseSalaId(id) {
  return typeof id === 'string' && ObjectId.isValid(id) ? new ObjectId(id) : null;
}

function publicSala(sala) {
  return {
    id: sala._id.toString(),
    nome: sala.nome,
    bloco: sala.bloco,
    capacidade: sala.capacidade,
    recursos: sala.recursos || [],
    disponivel: sala.disponivel,
    criadoEm: sala.criadoEm instanceof Date ? sala.criadoEm.toISOString() : sala.criadoEm,
    atualizadoEm: sala.atualizadoEm instanceof Date ? sala.atualizadoEm.toISOString() : sala.atualizadoEm
  };
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = {
  escapeRegex,
  parseSalaId,
  publicSala,
  validateSalaInput,
  normalizeResources
};
