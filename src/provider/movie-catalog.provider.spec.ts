import { Verifier } from '@pact-foundation/pact';
import path from 'node:path';
import axios from 'axios';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:8080';
const PACT_FILE = path.resolve(process.cwd(), 'pacts', 'pact-contract-tests-movie-catalog-api.json');

async function getAuthToken(): Promise<string> {
  const res = await axios.post<{ token: string }>(`${BASE_URL}/api/v1/auth/login`, {
    username: process.env.AUTH_USERNAME ?? '',
    password: process.env.AUTH_PASSWORD ?? '',
  });
  return res.data.token;
}

describe('movie-catalog-api provider verification', () => {
  it('satisfies all consumer pacts', async () => {
    const token = await getAuthToken();

    const result = await new Verifier({
      provider: 'movie-catalog-api',
      providerBaseUrl: BASE_URL,
      pactUrls: [PACT_FILE],
      logLevel: 'warn',
      // Recorded pacts carry a fake bearer token; swap it for a real one
      // before replaying requests against the live API.
      requestFilter: (req, _res, next) => {
        req.headers['authorization'] = `Bearer ${token}`;
        next();
      },
      // State handlers map each "given(...)" state to a no-op because the
      // Flyway-seeded dataset already satisfies all interactions.
      // Replace with real setup calls if the seed data ever changes.
      stateHandlers: {
        'movies exist': async () => {},
        'action movies exist': async () => {},
        'PG-13 movies exist': async () => {},
        'movie with ID 1001 exists': async () => {},
        'movie with ID 9999 does not exist': async () => {},
        'studios exist': async () => {},
        'studio 1 has movies': async () => {},
        'studio 99 has no movies': async () => {},
      },
    }).verifyProvider();

    expect(result).toContain('movie-catalog-api');
  });
});
