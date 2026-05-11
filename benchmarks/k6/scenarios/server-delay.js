import http from 'k6/http';
import { check, sleep } from 'k6';

import { getBaseUrl } from '../lib/env.js';

// Cenário para simular "servidor lento" (delay no backend).
// Isso NÃO é latência de rede (lag), mas é útil para comparar:
// - overhead do proxy
// - comportamento sob respostas mais lentas
//
// Para simular lag/perda de pacotes de rede de verdade no Windows,
// use uma ferramenta como Clumsy ou similar (ver README).
export default function serverDelayScenario() {
  const baseUrl = getBaseUrl();
  const res = http.get(`${baseUrl}/delay?ms=250`);

  check(res, {
    'status é 200': (r) => r.status === 200,
    'delayedMs é 250': (r) => {
      try {
        return JSON.parse(r.body).delayedMs === 250;
      } catch {
        return false;
      }
    },
  });

  sleep(1);
}

