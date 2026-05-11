// Perfis de carga para facilitar:
// - repetir rodadas idênticas
// - comparar "HTTP/1.1 direto" vs "via proxy HTTP/3"
// - alternar cenários sem bagunçar o código do teste
//
// Dica: você pode criar novos perfis aqui, e rodar com:
//   k6 run -e PROFILE=baseline ...

export function getK6Options(profileName) {
  switch (profileName) {
    case 'smoke':
      return {
        scenarios: {
          smoke: {
            executor: 'constant-vus',
            vus: 2,
            duration: '10s',
          },
        },
        thresholds: {
          http_req_failed: ['rate<0.01'],
        },
      };

    case 'high_rps':
      return {
        scenarios: {
          high_rps: {
            executor: 'constant-arrival-rate',
            rate: 200,
            timeUnit: '1s',
            duration: '30s',
            preAllocatedVUs: 50,
            maxVUs: 200,
          },
        },
        thresholds: {
          http_req_failed: ['rate<0.01'],
          http_req_duration: ['p(95)<1200'],
        },
      };

    case 'baseline':
    default:
      return {
        scenarios: {
          baseline: {
            executor: 'constant-arrival-rate',
            rate: 50,
            timeUnit: '1s',
            duration: '30s',
            preAllocatedVUs: 10,
            maxVUs: 50,
          },
        },
        thresholds: {
          http_req_failed: ['rate<0.01'],
          http_req_duration: ['p(95)<500'],
        },
      };
  }
}

