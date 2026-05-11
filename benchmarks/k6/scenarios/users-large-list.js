import http from 'k6/http';
import { check, sleep } from 'k6';

import { getBaseUrl, getUsersSize } from '../lib/env.js';

// Cenário principal: lista grande (boa para throughput/latência sob carga).
// Se sua base não tiver 100k usuários, a API limita via MAX_LIST_SIZE,
// mas ainda é útil para comparar overhead/proxy/protocolo em carga constante.
export default function usersLargeListScenario() {
  const baseUrl = getBaseUrl();
  const size = getUsersSize();

  const res = http.get(`${baseUrl}/users?size=${size}`);

  check(res, {
    'status é 200': (r) => r.status === 200,
    'tem body': (r) => typeof r.body === 'string' && r.body.length > 0,
  });

  // Pausa pequena para reduzir ruído em ambientes com DB compartilhado.
  sleep(1);
}

