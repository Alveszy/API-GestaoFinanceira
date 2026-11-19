# API de Gestão Financeira

API REST para controle financeiro pessoal. As rotas e regras de negócio estão na [documentação do projeto](docs/Documentacao.md).

## Executar localmente

Copie `.env.example` para `.env`, substitua `JWT_SECRET` por um segredo aleatório com pelo menos 32 caracteres e execute `docker compose up --build --wait`.

- Swagger UI em `http://localhost:3000/docs`
- Contrato OpenAPI em `http://localhost:3000/docs-json`
- Verificação de saúde em `http://localhost:3000/api/v1/health`

Para testar uma rota privada no Swagger, use o token retornado pelo login no botão **Authorize**. Para criar contas, categorias, transações e orçamentos, preencha também `Idempotency-Key`.

## Comprovantes de transações

Configure `R2_BUCKET`, `R2_ENDPOINT`, `R2_ACCESS_KEY_ID` e `R2_SECRET_ACCESS_KEY` no `.env`. Use um bucket privado do Cloudflare R2 e credenciais S3 com permissão **Object Read & Write** restrita ao bucket. O Compose passa as variáveis ao contêiner da API. Mantenha as credenciais no `.env` local ou no gerenciador de segredos da hospedagem.

1. Crie a transação pelo Swagger e copie o `id` da resposta.
2. Em `PUT /api/v1/transactions/{id}/receipt`, informe o `id` e selecione um PDF ou JPG/JPEG de até 5 MiB no campo `receipt`. Um novo upload substitui o comprovante anterior.
3. Use `GET /api/v1/transactions/{id}/receipt` para baixar o arquivo. As duas rotas exigem o JWT do proprietário da transação.
4. Para exibir um JPG no Swagger, execute `GET /api/v1/transactions/{id}/receipt/preview` com o mesmo `id` e JWT. Para PDF, use o download.

Excluir uma transação também remove seu comprovante do bucket configurado. Sem configuração do R2, as rotas de comprovante ficam indisponíveis e os fluxos financeiros continuam disponíveis.

## Publicar a demonstração N2 em uma VPS

1. Em uma VPS com Docker e Compose, coloque uma cópia do código da entrega e copie `.env.example` para `.env`.
2. Configure segredos próprios para `JWT_SECRET` e `JWT_REFRESH_SECRET` e senhas próprias para `DB_PASSWORD` e `REDIS_PASSWORD`. Configure `ADMIN_EMAIL` e `ADMIN_PASSWORD` se precisar demonstrar as rotas administrativas. Em um banco novo da demonstração, `DB_SYNCHRONIZE=true` cria o esquema inicial.
3. Execute `docker compose up --build -d --wait` e verifique `docker compose ps`.
4. Configure o ingresso HTTPS para encaminhar ao serviço na porta `PORT`. Se o proxy estiver na VPS, permita acesso externo somente às portas do proxy e ao SSH.
5. A partir de outra máquina, verifique `/api/v1/health`, abra `/docs` e confirme que `/docs-json` retorna o contrato.
