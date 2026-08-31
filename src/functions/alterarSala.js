const { app } = require('@azure/functions');
const { getSalasCollection } = require('../shared/mongo');
const { errorResponse, json, readJson } = require('../shared/http');
const { parseSalaId, publicSala, validateSalaInput } = require('../shared/salas');

app.http('alterarSala', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'salas/{id}',
  handler: async (request, context) => {
    try {
      const salaId = parseSalaId(request.params.id);

      if (!salaId) {
        return json({ erro: 'O id informado não é válido.' }, 400);
      }

      const validation = validateSalaInput(await readJson(request));

      if (!validation.ok) {
        return json({ erro: 'Dados inválidos.', detalhes: validation.errors }, 400);
      }

      const collection = await getSalasCollection();
      const result = await collection.updateOne(
        { _id: salaId },
        { $set: { ...validation.value, atualizadoEm: new Date() } }
      );

      if (result.matchedCount === 0) {
        return json({ erro: 'Sala não encontrada.' }, 404);
      }

      const updatedSala = await collection.findOne({ _id: salaId });
      return json({ mensagem: 'Sala alterada com sucesso.', sala: publicSala(updatedSala) });
    } catch (error) {
      return errorResponse(context, error);
    }
  }
});
