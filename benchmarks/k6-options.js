import { envNumber, profiles } from './profiles.js';

function envText(name, fallback) {
  // eslint-disable-next-line no-undef
  return __ENV[name] || fallback;
}

function selectedProfileNames() {
  const raw = envText('BENCH_PROFILE', 'users-small').trim();
  const names =
    raw.toLowerCase() === 'all'
      ? Object.keys(profiles)
      : raw
          .split(',')
          .map((name) => name.trim())
          .filter(Boolean);

  const selected = names.length ? names : ['users-small'];
  const invalid = selected.filter((name) => !profiles[name]);

  if (invalid.length) {
    throw new Error(
      `BENCH_PROFILE invalido: ${invalid.join(', ')}. Use: ${Object.keys(
        profiles,
      ).join(', ')} ou all.`,
    );
  }

  return selected;
}

function scenarioName(profileName) {
  return `profile_${profileName.replaceAll('-', '_')}`;
}

function buildScenario(profileName, totalProfiles, duration) {
  const profile = profiles[profileName];
  const rateFactor = envNumber('RATE_FACTOR', totalProfiles > 1 ? 0.25 : 1);
  const rate = envNumber(
    'RATE',
    Math.max(1, Math.round(profile.rate * rateFactor)),
  );
  const path = envText('BENCH_PATH', profile.path);
  const timeout = envText('REQUEST_TIMEOUT', profile.timeout ?? '60s');
  const minBytes = envNumber('MIN_BYTES', profile.minBytes);
  const preAllocatedVUs = envNumber('PRE_ALLOCATED_VUS', Math.max(10, rate));
  const maxVUs = envNumber('MAX_VUS', Math.max(50, rate * 4));

  return {
    executor: 'constant-arrival-rate',
    rate,
    timeUnit: '1s',
    duration,
    preAllocatedVUs,
    maxVUs,
    env: {
      SCENARIO_PROFILE: profileName,
      SCENARIO_PATH: path,
      SCENARIO_TIMEOUT: timeout,
      SCENARIO_MIN_BYTES: String(minBytes),
    },
    tags: {
      profile: profileName,
      path,
    },
  };
}

function buildOptions() {
  const duration = envText('DURATION', '30s');
  const failedRate = envNumber('FAILED_RATE', 0.01);
  const selectedProfiles = selectedProfileNames();
  const scenarios = Object.fromEntries(
    selectedProfiles.map((name) => [
      scenarioName(name),
      buildScenario(name, selectedProfiles.length, duration),
    ]),
  );

  const thresholds = {
    http_req_failed: [`rate<${failedRate}`],
  };

  for (const name of selectedProfiles) {
    const profile = profiles[name];
    const thresholdP95 = envNumber('THRESHOLD_P95', profile.thresholdP95);

    thresholds[`http_req_duration{profile:${name}}`] = [
      `p(95)<${thresholdP95}`,
    ];
    thresholds[`http_req_failed{profile:${name}}`] = [`rate<${failedRate}`];
  }

  return { options: { scenarios, thresholds }, selectedProfiles };
}

export { buildOptions, envText };
