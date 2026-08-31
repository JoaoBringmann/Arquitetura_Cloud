const { MongoClient, ServerApiVersion } = require('mongodb');

let clientPromise;

function getMongoClient() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    const error = new Error('A variável de ambiente MONGO_URI não foi configurada.');
    error.statusCode = 500;
    throw error;
  }

  if (!clientPromise) {
    const client = new MongoClient(mongoUri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
      }
    });

    clientPromise = client.connect().catch((error) => {
      clientPromise = undefined;
      throw error;
    });
  }

  return clientPromise;
}

async function getSalasCollection() {
  const client = await getMongoClient();
  const databaseName = process.env.MONGO_DB_NAME || 'pucpr_db';
  return client.db(databaseName).collection('salas');
}

module.exports = { getSalasCollection };
