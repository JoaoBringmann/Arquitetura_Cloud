const test = require('node:test');
const assert = require('node:assert/strict');
const {
  normalizeResources,
  parseSalaId,
  validateSalaInput
} = require('../src/shared/salas');

test('valida e normaliza uma sala completa', () => {
  const result = validateSalaInput({
    nome: '  Laboratório 01 ',
    bloco: 'Bloco A',
    capacidade: '30',
    recursos: 'Projetor, Computadores',
    disponivel: 'true'
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.value, {
    nome: 'Laboratório 01',
    bloco: 'Bloco A',
    capacidade: 30,
    recursos: ['Projetor', 'Computadores'],
    disponivel: true
  });
});

test('rejeita campos obrigatórios ausentes', () => {
  const result = validateSalaInput({});

  assert.equal(result.ok, false);
  assert.deepEqual(Object.keys(result.errors).sort(), ['bloco', 'capacidade', 'nome']);
});

test('rejeita capacidade inválida', () => {
  const result = validateSalaInput({ nome: 'Sala', bloco: 'A', capacidade: 0 });

  assert.equal(result.ok, false);
  assert.match(result.errors.capacidade, /inteiro entre 1 e 10000/);
});

test('normaliza recursos em lista e aceita disponibilidade padrão', () => {
  assert.deepEqual(normalizeResources([' Projetor ', '', 'Quadro']), ['Projetor', 'Quadro']);
  assert.deepEqual(validateSalaInput({ nome: 'Sala', bloco: 'A', capacidade: 1 }).value.recursos, []);
  assert.equal(validateSalaInput({ nome: 'Sala', bloco: 'A', capacidade: 1 }).value.disponivel, true);
});

test('identifica ids MongoDB válidos e inválidos', () => {
  const validId = parseSalaId('507f1f77bcf86cd799439011');

  assert.equal(validId.toString(), '507f1f77bcf86cd799439011');
  assert.equal(parseSalaId('id-invalido'), null);
});
