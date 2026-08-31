const baseCorsHeaders = {
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
};

function corsHeaders() {
  return {
    ...baseCorsHeaders,
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || 'http://localhost:5173'
  };
}

function json(body, status = 200) {
  return {
    status,
    headers: {
      ...corsHeaders(),
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify(body)
  };
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function errorResponse(context, error) {
  context.error(error instanceof Error ? error.message : error);

  return json(
    { erro: 'Não foi possível concluir a operação.' },
    Number.isInteger(error.statusCode) ? error.statusCode : 500
  );
}

module.exports = { errorResponse, json, readJson };
