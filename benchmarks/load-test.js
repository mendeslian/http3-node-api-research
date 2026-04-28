import http from 'k6/http';
import { check, sleep } from 'k6';

import { buildOptions, envText } from './k6-options.js';
import { envNumber, profiles } from './profiles.js';

// TARGET_URL permite alternar entre API direta e Caddy sem mudar o arquivo.
const BASE_URL = envText('TARGET_URL', 'http://localhost:3000');
const SLEEP_MS = envNumber('SLEEP_MS', 0);
const EXPECTED_STATUS = envNumber('EXPECTED_STATUS', 200);

const built = buildOptions();
const selectedProfiles = built.selectedProfiles;
export const options = built.options;

export default function () {
  // Quando BENCH_PROFILE tem varios perfis, cada scenario injeta seu proprio env.
  // eslint-disable-next-line no-undef
  const profileName = __ENV.SCENARIO_PROFILE || selectedProfiles[0];
  // eslint-disable-next-line no-undef
  const path = __ENV.SCENARIO_PATH || profiles[profileName].path;
  // eslint-disable-next-line no-undef
  const timeout = __ENV.SCENARIO_TIMEOUT || profiles[profileName].timeout || '60s';
  // eslint-disable-next-line no-undef
  const minBytes = Number(__ENV.SCENARIO_MIN_BYTES ?? profiles[profileName].minBytes);
  const url = `${BASE_URL}${path}`;

  const res = http.get(url, {
    timeout,
    tags: { profile: profileName, path },
  });

  check(res, {
    'status esperado': (r) => r.status === EXPECTED_STATUS,
    'corpo tem tamanho minimo': (r) =>
      !minBytes || (r.body && r.body.length >= minBytes),
  });

  // Em constant-arrival-rate, pausa por VU aumenta a quantidade de VUs necessaria.
  if (SLEEP_MS > 0) {
    sleep(SLEEP_MS / 1000);
  }
}
