import request from 'supertest';

// Helper pequeno para padronizar como os testes "apontam" para:
// - app local (Express)  -> request(app)
// - URL externa (proxy)  -> request('https://localhost:8443')
//
// Isso deixa explícito no output do teste qual "target" está sendo exercitado.

export function getTestTarget() {
  const target = process.env.TEST_URL;

  if (target?.startsWith('https')) {
    // Proxy com TLS self-signed (cert gerado no container do nginx)
    // Para testes locais isso simplifica, mas não use em produção.
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }

  return target ?? null;
}

export function makeRequester(app) {
  const target = getTestTarget();
  return target ? request(target) : request(app);
}

