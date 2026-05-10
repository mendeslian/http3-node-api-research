// Centraliza leitura de variáveis de ambiente do k6 para manter
// scripts pequenos e fáceis de comparar entre HTTP/1.1 e HTTP/3.
//
// Observação importante:
// - O k6 não "força" HTTP/3 sozinho. Quem define o protocolo real é o CLIENTE e o PROXY.
// - Para HTTP/3 de verdade, use um cliente que negocie h3/QUIC (ex: curl com --http3)
//   ou rode os testes contra um endpoint que efetivamente atende em HTTP/3.

// eslint-disable-next-line no-undef
const ENV = __ENV;

export function getBaseUrl() {
  // eslint-disable-next-line no-undef
  return ENV.TARGET_URL || 'http://localhost:3000';
}

export function getProfile() {
  // Perfis ajudam a padronizar rodadas de benchmark e comparar resultados
  // sem ficar editando código.
  // eslint-disable-next-line no-undef
  return ENV.PROFILE || 'baseline';
}

export function getUsersSize() {
  // eslint-disable-next-line no-undef
  const v = Number(ENV.USERS_SIZE || 100000);
  return Number.isFinite(v) ? v : 100000;
}

