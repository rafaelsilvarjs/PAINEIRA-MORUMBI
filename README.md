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
6. Depois do deploy, abra a URL gerada pelo Railway.

## Importante

- O projeto ja usa `process.env.PORT`, entao funciona no Railway.
- Hoje os registros ficam em `feedbacks.json`.
- No Railway, esse arquivo nao e uma base persistente confiavel para producao.
- Para publicar agora, funciona como demonstracao.
- Para uso real, o proximo passo e trocar `feedbacks.json` por banco de dados.

## Rotas

- `/` formulario
- `/dashboard` painel
- `/detalhamento` visao individual
- `/health` status simples da aplicacao
