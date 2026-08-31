const { app } = require('@azure/functions');
const { getSalasCollection } = require('../shared/mongo');
const { errorResponse, json } = require('../shared/http');
const { parseSalaId } = require('../shared/salas');

app.http('excluirSala', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'salas/{id}',
  handler: async (request, context) => {
    try {
      const salaId = parseSalaId(request.params.id);

      if (!salaId) {
        return json({ erro: 'O id informado não é válido.' }, 400);
      }

      const collection = await getSalasCollection();
      const result = await collection.deleteOne({ _id: salaId });

      if (result.deletedCount === 0) {
        return json({ erro: 'Sala não encontrada.' }, 404);
      }

      return json({ mensagem: 'Sala excluída com sucesso.', id: request.params.id });
    } catch (error) {
      return errorResponse(context, error);
    }
  }
});
