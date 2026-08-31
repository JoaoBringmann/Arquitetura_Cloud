const { app } = require('@azure/functions');
const { getSalasCollection } = require('../shared/mongo');
const { errorResponse, json } = require('../shared/http');
const { escapeRegex, publicSala } = require('../shared/salas');

app.http('pesquisarSalas', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'salas',
  handler: async (request, context) => {
    try {
      const query = (request.query.get('q') || '').trim();
      const filter = query
        ? {
            $or: [
              { nome: { $regex: escapeRegex(query), $options: 'i' } },
              { bloco: { $regex: escapeRegex(query), $options: 'i' } }
            ]
          }
        : {};

      const collection = await getSalasCollection();
      const salas = await collection.find(filter).sort({ nome: 1 }).toArray();

      return json({ salas: salas.map(publicSala), total: salas.length });
    } catch (error) {
      return errorResponse(context, error);
    }
  }
});
