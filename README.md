# Tema do projeto

Avaliação da viabilidade e desempenho do HTTP/3 em APIs desenvolvidas com Node.js

## Descrição

O projeto tem como objetivo investigar o uso do protocolo HTTP/3 em APIs desenvolvidas com Node.js, analisando sua viabilidade prática, desempenho e possíveis desafios de implementação. Para isso, foi desenvolvido um protótipo de API REST em Node.js (HTTP/1.1) com **terminação HTTP/3 no proxy NGINX**, já que o Node não suporta QUIC nativamente.

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
- **Docker obrigatório** para o proxy HTTP/3 (NGINX com suporte QUIC/UDP)

## Arquitetura HTTP/3

O Node.js não suporta HTTP/3 nativamente. A simulação usa um proxy reverso:

```text
Cliente --HTTP/3 (QUIC/UDP)--> NGINX :8443 --HTTP/1.1--> API Node :3000
```

- **Cliente → NGINX**: HTTP/3 (ou HTTP/2 via TLS na mesma porta 8443)
- **NGINX → Node**: HTTP/1.1 (`proxy_pass` para `host.docker.internal:3000`)
- O header `Alt-Svc` anuncia HTTP/3 para clientes compatíveis

> Em `dev:nginx`, o proxy e a API sobem em paralelo. Se a API demorar alguns segundos para iniciar, o NGINX pode registrar erros temporários de upstream até a porta 3000 ficar disponível.

## Como rodar

```bash
npm install
npm run dev
```

A API estará disponível em `http://localhost:3000`.

### Rodar com proxy HTTP/3 (NGINX)

```bash
npm run dev:nginx
```

Isso sobe o NGINX com HTTP/3 em `https://localhost:8443` (TCP+UDP) e a API em `http://localhost:3000`.

Para subir apenas o proxy:

```bash
npm run proxy:up
```

Para derrubar o proxy:

```bash
npm run proxy:down
```

## Scripts

- `npm run dev`: sobe a API com reload
- `npm start`: sobe a API sem reload
- `npm run dev:nginx`: sobe NGINX (HTTP/3) + API com reload
- `npm run start:nginx`: sobe o proxy NGINX (HTTP/3) e a API
- `npm run proxy:up`: sobe apenas o proxy NGINX (HTTP/3)
- `npm run proxy:down`: derruba o proxy NGINX
- `npm run lint`: checagem de lint
- `npm run format`: formata o projeto

## Rotas

- `GET /health` — retorna `{ "status": "ok", "time": "<ISO8601>" }`

## Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste conforme necessário:

| Variável | Descrição | Padrão |
|---|---|---|
| `PORT` | Porta da API | `3000` |
| `TRUST_PROXY_HOPS` | Hops de proxy confiável (NGINX) | `1` |
| `LOG_LEVEL` | Nível de log do Pino | `info` |
| `RATE_LIMIT_WINDOW_MS` | Janela do rate limit (ms) | `60000` |
| `RATE_LIMIT_MAX` | Máximo de requisições por janela | `100` |
