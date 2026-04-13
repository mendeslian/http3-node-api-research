import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    // Cenário 1: Carga constante para comparar HTTP/1.1 vs HTTP/3
    constant_load: {
      executor: 'constant-arrival-rate',
      rate: 50, // 50 requisições por segundo
      timeUnit: '1s',
      duration: '30s',
      preAllocatedVUs: 10,
      maxVUs: 50,
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% das reqs devem ser < 500ms
  },
};

// Pega a URL do ambiente ou usa o padrão (Caddy ou API direta)
// eslint-disable-next-line no-undef
const BASE_URL = __ENV.TARGET_URL || 'http://localhost:3000';

export default function () {
  // Testando a rota de listagem com carga massiva (100k registros se o size for grande)
  // Professor sugeriu 100k para ver diferença real no throughput/latência do QUIC
  const res = http.get(`${BASE_URL}/users?size=100000`);

  check(res, {
    'status é 200': (r) => r.status === 200,
    'tamanho do corpo > 1MB': (r) => r.body && r.body.length > 1024 * 1024, // Adicionado check de existência do body
  });

  sleep(1); // Espera 1s entre iterações por VU para não fritar o NeonDB
}
