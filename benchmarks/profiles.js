function envNumber(name, fallback) {
  const runtimeEnv =
    // eslint-disable-next-line no-undef
    typeof __ENV !== 'undefined' ? __ENV : process.env;
  const value = runtimeEnv[name];
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

const profiles = {
  // Requisicao pequena: boa para medir latencia basica e overhead do protocolo.
  health: {
    path: '/health',
    minBytes: 1,
    rate: 100,
    thresholdP95: 100,
  },

  // Consulta pequena no banco: mede API + banco sem payload enorme.
  'users-small': {
    path: `/users?size=${envNumber('USERS_SIZE', 100)}`,
    minBytes: 1_000,
    rate: 50,
    thresholdP95: 500,
  },

  // Consulta maior: comeca a mostrar custo de JSON, compressao e rede.
  'users-medium': {
    path: `/users?size=${envNumber('USERS_SIZE', 5_000)}`,
    minBytes: 50_000,
    rate: 10,
    thresholdP95: 2_000,
  },

  // Carga pesada: util para throughput, mas nao deve ser usada com rate alto.
  'users-large': {
    path: `/users?size=${envNumber('USERS_SIZE', 100_000)}`,
    minBytes: 1024 * 1024,
    rate: 1,
    thresholdP95: 60_000,
    timeout: '120s',
  },

  // Payload gerado sem consultar banco: isola melhor o custo de transferencia.
  'stream-medium': {
    path: `/stream?chunks=${envNumber('STREAM_CHUNKS', 128)}&chunkSize=${envNumber(
      'STREAM_CHUNK_SIZE',
      16_384,
    )}`,
    minBytes: 1024 * 1024,
    rate: 10,
    thresholdP95: 2_000,
  },

  // CPU no servidor: ajuda a ver quando o gargalo nao e o protocolo/rede.
  compute: {
    path: `/compute?iterations=${envNumber('COMPUTE_ITERATIONS', 500_000)}`,
    minBytes: 1,
    rate: 20,
    thresholdP95: 1_000,
  },

  // Latencia artificial: util para comparar comportamento com espera no servidor.
  delay: {
    path: `/delay?ms=${envNumber('DELAY_MS', 100)}`,
    minBytes: 1,
    rate: 20,
    thresholdP95: 300,
  },
};

export { envNumber, profiles };
