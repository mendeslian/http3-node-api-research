# Tema do projeto

Avaliação da viabilidade e desempenho do HTTP/3 em APIs desenvolvidas com Node.js

## Descrição

O projeto tem como objetivo investigar o uso do protocolo HTTP/3 em APIs desenvolvidas com Node.js, analisando sua viabilidade prática, desempenho e possíveis desafios de implementação. Para isso, será desenvolvido um protótipo de API REST utilizando Node.js, com suporte experimental ao HTTP/3.

Durante o desenvolvimento, serão realizados experimentos para medir métricas como:
• latência
• tempo de resposta
• throughput
• estabilidade da conexão
• impacto em cenários de múltiplas requisições simultâneas

Além disso, será investigado o nível de suporte atual do HTTP/3 no ecossistema Node.js, incluindo bibliotecas, frameworks e limitações técnicas. Caso necessário, o projeto também poderá propor melhorias.

### Questão de pesquisa

Qual é o impacto do uso do HTTP/3 no desempenho e na eficiência de APIs desenvolvidas em Node.js quando comparado aos outros protocolos?

### Objetivo da pesquisa

Avaliar a viabilidade técnica e o desempenho da utilização do protocolo HTTP/3 em APIs desenvolvidas com Node.js.

### Integrantes do grupo

Lian Mendes, Lucas Cardoso

### Repositório de código do projeto

- GitHub: https://github.com/mendeslian/http3-node-api-research

## Requisitos do projeto

- Node.js >= 18

## Como rodar

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev`: sobe a API com reload
- `npm start`: sobe a API sem reload
- `npm run lint`: checagem de lint
- `npm run format`: formata o projeto

## Rotas iniciais

- `GET /health`
- `POST /v1/echo` (body: `{ "message": "..." }`)
