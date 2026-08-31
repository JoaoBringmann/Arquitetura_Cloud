# Arquitetura Cloud — Semana 5 PJBL

Aplicação de gerenciamento de salas universitárias criada para demonstrar quatro Azure Functions integradas a um frontend React e ao MongoDB Atlas.

## Integrantes

Consulte [GRUPO.md](GRUPO.md).

## Arquitetura

- **Backend:** Azure Functions v4 com Node.js.
- **Frontend:** React + Vite.
- **Banco:** MongoDB Atlas, banco `pucpr_db`, coleção `salas`.
- **Operações:** inserir, pesquisar, alterar e excluir salas.

## Modelo de dados

```json
{
  "nome": "Laboratório 01",
  "bloco": "Bloco A",
  "capacidade": 30,
  "recursos": ["Projetor", "Computadores"],
  "disponivel": true
}
```

Os campos `criadoEm` e `atualizadoEm` são gerados pelo backend. O MongoDB `ObjectId` é retornado pela API como o campo textual `id`.

## Configuração local

### Pré-requisitos

- Node.js 22 ou compatível;
- Azure Functions Core Tools v4;
- usuário de banco criado no MongoDB Atlas;
- IP atual liberado no MongoDB Atlas em **Network Access**.

Não use `0.0.0.0/0` apenas para facilitar o teste e nunca publique a senha do MongoDB.

### Backend

Na raiz do repositório:

```bash
npm install
cp local.settings.example.json local.settings.json
```

Edite o arquivo local e substitua `MONGO_URI` pela string de conexão do seu usuário do Atlas. Mantenha:

```json
"MONGO_DB_NAME": "pucpr_db"
```

Inicie as Functions:

```bash
npm start
```

Por padrão, a API local ficará em `http://localhost:7071/api`.

### Frontend

Em outro terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Abra o endereço informado pelo Vite, normalmente `http://localhost:5173`.

## Endpoints

### Inserir sala

`POST /api/salas`

### Pesquisar salas

`GET /api/salas` ou `GET /api/salas?q=Laboratório`

### Alterar sala

`PUT /api/salas/{id}`

### Excluir sala

`DELETE /api/salas/{id}`

Erros de entrada retornam `400`, sala inexistente retorna `404` e as respostas são JSON em português.

## Testes locais

Testes de validação:

```bash
npm test
```

Depois de iniciar as Functions e configurar o MongoDB, o teste de fluxo completo é:

```bash
npm run test:api
```

Esse teste cria uma sala temporária, pesquisa, altera, verifica IDs e campos inválidos, exclui e confirma a remoção.

Para validar o build do frontend:

```bash
npm run test:frontend
```

## Publicação futura no Azure

A conta utilizada atualmente não apresenta assinatura Azure ativa. Quando uma assinatura estiver disponível:

1. criar uma Function App Node.js no plano serverless adequado;
2. publicar o backend a partir deste repositório;
3. adicionar `MONGO_URI`, `MONGO_DB_NAME=pucpr_db` e `CORS_ORIGIN` nas configurações da Function App;
4. criar um Static Web App conectado ao GitHub;
5. usar `frontend` como localização da aplicação e `dist` como saída do build;
6. configurar `VITE_API_BASE_URL` com a URL pública da Function App;
7. atualizar este README com os links finais.

## Links da entrega

- GitHub: https://github.com/JoaoBringmann/Arquitetura_Cloud
- Azure Function App: **preencher após a publicação**
- Azure Static Web App: **preencher após a publicação**

O roteiro de captura dos prints está em [docs/evidencias.md](docs/evidencias.md).
