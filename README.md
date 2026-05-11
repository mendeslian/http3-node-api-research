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
- Para rodar o proxy HTTP/3: Docker Desktop (Windows/macOS/Linux) com suporte a `docker compose`

## Como rodar

```bash
npm install
npm run dev
```

### Rodar com proxy HTTP/3 (NGINX)

Em um terminal:

```bash
npm run dev:nginx
```

Isso sobe o NGINX com HTTP/3 em `https://localhost:8443` (TCP+UDP) e a API em `http://localhost:3000`.

## Scripts

- `npm run dev`: sobe a API com reload
- `npm start`: sobe a API sem reload
- `npm run dev:nginx`: sobe NGINX (HTTP/3) + API com reload
- `npm run start:nginx`: sobe o proxy NGINX (HTTP/3) e a API
- `npm run proxy:up`: sobe apenas o proxy NGINX (HTTP/3)
- `npm run proxy:down`: derruba o proxy NGINX
- `npm run lint`: checagem de lint
- `npm run format`: formata o projeto
- `npm run test`: roda os testes unitários/integração
- `npm run test:nginx`: roda os testes contra o proxy NGINX (https/http3)

## Benchmarks Avançados

O projeto inclui scripts de teste de carga com **k6** para comparar o desempenho entre HTTP/1.1 e HTTP/3 (QUIC) em cenários reais de estresse.

### Como rodar o benchmark:
1. Instale o [k6](https://k6.io/docs/get-started/installation/)
2. Sobe a API e o NGINX (`npm run start:nginx`)
3. Em outro terminal, rode:
   - `npm run bench:h1` (Teste direto contra Node - HTTP/1.1)
   - `npm run bench:h3` (Teste via proxy - objetivo é HTTP/3)

#### Perfis e cenários (k6)
- **Profiles** (controlam carga): `baseline` (default), `smoke`, `high_rps`
- **Scenarios** (qual endpoint exercitar): `users_large_list` (default), `server_delay`

Exemplos:

```bash
# HTTP/1.1 direto, smoke
npm run bench:h1:smoke

# Via proxy, smoke
npm run bench:h3:smoke

# Via proxy, cenário de backend lento
k6 run -e TARGET_URL=https://localhost:8443 -e SCENARIO=server_delay benchmarks/k6/run.js
```

### Simulação de Cenários Críticos (Feedback do Professor)
Para simular **alta latência**, **perda de pacotes** ou **internet instável** no Windows (onde o comando `tc` não está disponível), recomendamos o uso da ferramenta [Clumsy](https://jagt.github.io/clumsy/).

Configurações recomendadas no Clumsy para testes de HTTP/3:
- **Filtering**: `ip.DstAddr == 127.0.0.1 or ip.SrcAddr == 127.0.0.1`
- **Lag**: 100ms a 500ms (Simula internet de longa distância/ruim)
- **Drop**: 1% a 5% (Simula perda de pacotes, onde o QUIC deve performar melhor que o TCP)

## Rotas de Benchmark
- `GET /users?size=100000`: Busca de grande volume de dados (100k registros)
- `GET /delay?ms=500`: Simulação de latência artificial no servidor
- `GET /compute?iterations=5000000`: Carga pesada de CPU
- `GET /stream`: Transferência de dados via chunks (ideal para testar throughput do H3)

## Rotas iniciais
- `GET /health`
- `POST /v1/echo` (body: `{ "message": "..." }`)
