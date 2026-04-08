# Exit Feedback

Projeto de formulario de desligamento com dashboard em React e servidor Node.js.

## Publicar no Railway

1. Suba este projeto para um repositorio no GitHub.
2. No Railway, clique em `New Project`.
3. Escolha `Deploy from GitHub repo`.
4. Selecione este repositorio.
5. O Railway vai usar:
   - build: `npm run build`
   - start: `npm start`
6. Adicione as variaveis:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_TABLE=exit_feedbacks`
7. Depois do deploy, abra a URL gerada pelo Railway.

## Publicar no Render

1. Suba este projeto para um repositorio no GitHub.
2. No Render, clique em `New +`.
3. Escolha `Web Service`.
4. Conecte seu GitHub e selecione este repositorio.
5. O Render deve usar:
   - build: `npm run build`
   - start: `npm start`
6. Se quiser, ele pode ler automaticamente o arquivo `render.yaml`.
7. Depois do deploy, abra a URL gerada pelo Render.

## Importante

- O projeto ja usa `process.env.PORT`, entao funciona no Railway.
- O projeto ja usa `process.env.PORT`, entao funciona no Railway e no Render.
- O projeto usa Node.js 20+ por causa do cliente do Supabase.
- Hoje os registros ficam em `feedbacks.json`.
- No Railway e no Render, esse arquivo nao e uma base persistente confiavel para producao.
- O projeto agora pode usar Supabase com as variaveis de ambiente.

## Rotas

- `/` formulario
- `/dashboard` painel
- `/detalhamento` visao individual
- `/health` status simples da aplicacao
