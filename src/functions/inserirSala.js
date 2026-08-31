const { app } = require('@azure/functions');
const { getSalasCollection } = require('../shared/mongo');
const { errorResponse, json, readJson } = require('../shared/http');
const { publicSala, validateSalaInput } = require('../shared/salas');

app.http('inserirSala', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'salas',
  handler: async (request, context) => {
    try {
      const validation = validateSalaInput(await readJson(request));

      if (!validation.ok) {
        return json({ erro: 'Dados inválidos.', detalhes: validation.errors }, 400);
      }

      const agora = new Date();
      const sala = { ...validation.value, criadoEm: agora, atualizadoEm: agora };
      const collection = await getSalasCollection();
      const result = await collection.insertOne(sala);
      const createdSala = await collection.findOne({ _id: result.insertedId });

      return json({ mensagem: 'Sala cadastrada com sucesso.', sala: publicSala(createdSala) }, 201);
    } catch (error) {
      return errorResponse(context, error);
    }
  }
});
