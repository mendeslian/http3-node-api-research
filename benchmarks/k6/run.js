import { getProfile } from './lib/env.js';
import { getK6Options } from './lib/profiles.js';

import usersLargeListScenario from './scenarios/users-large-list.js';
import serverDelayScenario from './scenarios/server-delay.js';

// Entrada única do k6 com "cenários" selecionáveis por env.
// Isso evita duplicar lógica e deixa as comparações mais previsíveis.

export const options = getK6Options(getProfile());

// eslint-disable-next-line no-undef
const scenario = __ENV.SCENARIO || 'users_large_list';

export default function () {
  switch (scenario) {
    case 'server_delay':
      return serverDelayScenario();
    case 'users_large_list':
    default:
      return usersLargeListScenario();
  }
}

