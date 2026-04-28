# HTTP/3 Node API Research

Projeto de pesquisa sobre viabilidade e desempenho do HTTP/3 em APIs
desenvolvidas com Node.js.

## Objetivo

Avaliar o comportamento de uma API REST Node.js ao ser acessada diretamente e
por meio do Caddy, comparando latencia, tempo de resposta, throughput,
estabilidade e comportamento sob carga.

Questao de pesquisa:

> Qual e o impacto do uso do HTTP/3 no desempenho e na eficiencia de APIs
> desenvolvidas em Node.js quando comparado aos outros protocolos?

## Integrantes

Lian Mendes, Lucas Cardoso

## Requisitos

- Node.js >= 18
- PostgreSQL
- Caddy
- k6
- Opcional: Clumsy, para simular latencia, perda de pacotes e rede instavel

## Configuracao

Crie o arquivo `.env`:

```powershell
Copy-Item .env.example .env
```

Variaveis importantes para benchmarks:

```env
DB_USERS_TABLE=users
MAX_LIST_SIZE=100000
RATE_LIMIT_MAX=100000
```

Depois de alterar o `.env`, reinicie a API.

## Como Rodar

Instale as dependencias:

```powershell
npm install
```

Use tres terminais para rodar API, Caddy e benchmark.

Terminal 1: API Node.

```powershell
npm run start
```

Terminal 2: Caddy.

```powershell
caddy run
```

Terminal 3: benchmark.

```powershell
npm run bench:caddy
```

Portas usadas pelo Caddy:

- `https://localhost:8443`: porta principal, com `h1`, `h2` e `h3` habilitados
- `https://localhost:8444`: porta de controle, forçando HTTP/1.1 sobre TLS

## Scripts

- `npm run dev`: sobe a API com reload
- `npm run start`: sobe a API sem reload
- `npm run start:caddy`: sobe Caddy + API no mesmo comando
- `npm run lint`: executa lint
- `npm run format`: formata o projeto
- `npm run test`: roda testes de API
- `npm run test:caddy`: roda testes contra o Caddy

## Rotas

Rotas principais:

- `GET /health`
- `POST /v1/echo`
- `GET /users?size=100`
- `GET /users/:id`
- `POST /users`

Rotas de benchmark:

- `GET /delay?ms=100`: simula latencia no servidor
- `GET /compute?iterations=500000`: simula carga de CPU
- `GET /stream?chunks=128&chunkSize=16384`: envia dados em chunks

## Benchmarks

Os testes de carga usam k6.

Arquivos principais:

- `benchmarks/load-test.js`: entrada do k6
- `benchmarks/profiles.js`: perfis de teste
- `benchmarks/k6-options.js`: montagem dos cenarios e thresholds
- `scripts/run-k6.js`: carrega o `.env` e chama o k6

Perfis disponiveis:

- `health`: latencia basica
- `users-small`: consulta pequena no banco
- `users-medium`: consulta media no banco
- `users-large`: resposta grande
- `stream-medium`: transferencia de payload sem depender do banco
- `compute`: carga de CPU
- `delay`: latencia artificial
- `all`: todos os perfis

### Rodadas Principais

API direta, sem Caddy:

```powershell
npm run bench:api
```

Caddy na porta principal (`8443`):

```powershell
npm run bench:caddy
```

Caddy forçando HTTP/1.1 (`8444`):

```powershell
npm run bench:caddy:h1
```

Todos os perfis:

```powershell
npm run bench:all:api
npm run bench:all:caddy
npm run bench:all:caddy:h1
```

Perfis especificos:

```powershell
npm run bench:latency:api
npm run bench:latency:caddy
npm run bench:payload:api
npm run bench:payload:caddy
npm run bench:users-large:api
npm run bench:users-large:caddy
```

Tambem e possivel controlar pelo `.env`:

```env
BENCH_PROFILE=health,stream-medium,compute
RATE_FACTOR=0.25
DURATION=30s
```

Os scripts `npm run bench:*` carregam o `.env`. Se o k6 for executado
diretamente, as variaveis precisam ser passadas com `-e`.

## Comparacao

Para comparar os resultados, rode o mesmo perfil nas duas portas:

```powershell
npm run bench:caddy:h1
npm run bench:caddy
```

Metricas principais:

- `http_req_duration`: tempo total da requisicao
- `http_req_failed`: taxa de falha
- `dropped_iterations`: requisicoes que o k6 nao conseguiu iniciar
- `data_received`: volume de dados recebido

Para conclusoes mais confiaveis, execute cada teste mais de uma vez e compare
principalmente `p95`, falhas e throughput.

## Clumsy

O Clumsy pode ser usado para simular rede ruim no Windows.

Matriz sugerida:

| Cenario | Configuracao |
| --- | --- |
| Base | Clumsy desligado |
| Latencia | `lag` de 100 ms |
| Perda leve | `drop` de 1% |
| Perda media | `drop` de 3% |
| Rede instavel | `lag` de 80 ms + `drop` de 1% |

Filtro geral:

```text
tcp or udp
```

Filtro para a porta principal do Caddy:

```text
tcp.DstPort == 8443 or udp.DstPort == 8443 or tcp.SrcPort == 8443 or udp.SrcPort == 8443
```

Filtro para a porta HTTP/1.1:

```text
tcp.DstPort == 8444 or tcp.SrcPort == 8444
```
