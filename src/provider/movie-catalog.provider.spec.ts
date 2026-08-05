import { Verifier } from '@pact-foundation/pact';
import path from 'node:path';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:8080';
const PACT_FILE = path.resolve(process.cwd(), 'pacts', 'pact-contract-tests-movie-catalog-api.json');

describe('movie-catalog-api provider verification', () => {
  it('satisfies all consumer pacts', async () => {
    const result = await new Verifier({
      provider: 'movie-catalog-api',
      providerBaseUrl: BASE_URL,
      pactUrls: [PACT_FILE],
      logLevel: 'warn',
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
