import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import path from 'node:path';
import axios from 'axios';

const { like, eachLike, integer, decimal, string } = MatchersV3;

const provider = new PactV3({
  consumer: 'pact-contract-tests',
  provider: 'movie-catalog-api',
  dir: path.resolve(process.cwd(), 'pacts'),
  logLevel: 'warn',
});

describe('movie-catalog-api consumer pact', () => {

  describe('GET /api/v1/movies', () => {
    it('returns a paginated list of movies', async () => {
      await provider
        .given('movies exist')
        .uponReceiving('a request for all movies')
        .withRequest({ method: 'GET', path: '/api/v1/movies' })
        .willRespondWith({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: like({
            content: eachLike({
              mid: integer(1001),
              name: string('Inception'),
              genre: string('Sci-Fi'),
              price: decimal(9.99),
              rating: string('PG-13'),
              studio: integer(1),
            }),
            totalElements: integer(10),
            totalPages: integer(1),
            page: integer(0),
            size: integer(10),
          }),
        })
        .executeTest(async (mockServer) => {
          const res = await axios.get(`${mockServer.url}/api/v1/movies`);
          expect(res.status).toBe(200);
          expect(Array.isArray(res.data.content)).toBe(true);
          expect(res.data.content[0]).toMatchObject({
            mid: expect.any(Number),
            name: expect.any(String),
            genre: expect.any(String),
            price: expect.any(Number),
            rating: expect.any(String),
            studio: expect.any(Number),
          });
        });
    });

    it('returns movies filtered by genre', async () => {
      await provider
        .given('action movies exist')
        .uponReceiving('a request for movies filtered by genre Action')
        .withRequest({
          method: 'GET',
          path: '/api/v1/movies',
          query: { genre: 'Action' },
        })
        .willRespondWith({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: like({
            content: eachLike({
              mid: integer(1002),
              name: string('Die Hard'),
              genre: string('Action'),
              price: decimal(7.99),
              rating: string('R'),
              studio: integer(1),
            }),
            totalElements: integer(1),
            totalPages: integer(1),
            page: integer(0),
            size: integer(10),
          }),
        })
        .executeTest(async (mockServer) => {
          const res = await axios.get(`${mockServer.url}/api/v1/movies`, {
            params: { genre: 'Action' },
          });
          expect(res.status).toBe(200);
          expect(
            res.data.content.every((m: { genre: string }) => m.genre === 'Action'),
          ).toBe(true);
        });
    });

    it('returns movies filtered by rating', async () => {
      await provider
        .given('PG-13 movies exist')
        .uponReceiving('a request for movies filtered by rating PG-13')
        .withRequest({
          method: 'GET',
          path: '/api/v1/movies',
          query: { rating: 'PG-13' },
        })
        .willRespondWith({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: like({
            content: eachLike({
              mid: integer(1001),
              name: string('Inception'),
              genre: string('Sci-Fi'),
              price: decimal(9.99),
              rating: string('PG-13'),
              studio: integer(1),
            }),
            totalElements: integer(1),
            totalPages: integer(1),
            page: integer(0),
            size: integer(10),
          }),
        })
        .executeTest(async (mockServer) => {
          const res = await axios.get(`${mockServer.url}/api/v1/movies`, {
            params: { rating: 'PG-13' },
          });
          expect(res.status).toBe(200);
          expect(
            res.data.content.every((m: { rating: string }) => m.rating === 'PG-13'),
          ).toBe(true);
        });
    });
  });

  describe('GET /api/v1/movie/{mid}', () => {
    it('returns a movie by ID', async () => {
      await provider
        .given('movie with ID 1001 exists')
        .uponReceiving('a request for movie with ID 1001')
        .withRequest({ method: 'GET', path: '/api/v1/movie/1001' })
        .willRespondWith({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: like({
            mid: integer(1001),
            name: string('Inception'),
            genre: string('Sci-Fi'),
            price: decimal(9.99),
            rating: string('PG-13'),
            studio: integer(1),
          }),
        })
        .executeTest(async (mockServer) => {
          const res = await axios.get(`${mockServer.url}/api/v1/movie/1001`);
          expect(res.status).toBe(200);
          expect(res.data.mid).toBe(1001);
        });
    });

    it('returns 404 for a non-existent movie', async () => {
      await provider
        .given('movie with ID 9999 does not exist')
        .uponReceiving('a request for a non-existent movie ID 9999')
        .withRequest({ method: 'GET', path: '/api/v1/movie/9999' })
        .willRespondWith({ status: 404 })
        .executeTest(async (mockServer) => {
          const res = await axios.get(`${mockServer.url}/api/v1/movie/9999`, {
            validateStatus: () => true,
          });
          expect(res.status).toBe(404);
        });
    });
  });

  describe('GET /api/v1/studios', () => {
    it('returns a paginated list of studios', async () => {
      await provider
        .given('studios exist')
        .uponReceiving('a request for all studios')
        .withRequest({ method: 'GET', path: '/api/v1/studios' })
        .willRespondWith({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: like({
            content: eachLike({
              sid: integer(1),
              name: string('Warner Bros'),
            }),
            totalElements: integer(5),
            totalPages: integer(1),
            page: integer(0),
            size: integer(10),
          }),
        })
        .executeTest(async (mockServer) => {
          const res = await axios.get(`${mockServer.url}/api/v1/studios`);
          expect(res.status).toBe(200);
          expect(Array.isArray(res.data.content)).toBe(true);
          expect(res.data.content[0]).toMatchObject({
            sid: expect.any(Number),
            name: expect.any(String),
          });
        });
    });
  });

  describe('GET /api/v1/studios/{sid}/movies', () => {
    it('returns movies for a given studio', async () => {
      await provider
        .given('studio 1 has movies')
        .uponReceiving('a request for movies belonging to studio 1')
        .withRequest({ method: 'GET', path: '/api/v1/studios/1/movies' })
        .willRespondWith({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: eachLike({
            mid: integer(1001),
            name: string('Inception'),
            genre: string('Sci-Fi'),
            price: decimal(9.99),
            rating: string('PG-13'),
            studio: integer(1),
          }),
        })
        .executeTest(async (mockServer) => {
          const res = await axios.get(`${mockServer.url}/api/v1/studios/1/movies`);
          expect(res.status).toBe(200);
          expect(Array.isArray(res.data)).toBe(true);
        });
    });

    it('returns 404 for a studio with no movies', async () => {
      await provider
        .given('studio 99 has no movies')
        .uponReceiving('a request for movies belonging to studio 99')
        .withRequest({ method: 'GET', path: '/api/v1/studios/99/movies' })
        .willRespondWith({ status: 404 })
        .executeTest(async (mockServer) => {
          const res = await axios.get(`${mockServer.url}/api/v1/studios/99/movies`, {
            validateStatus: () => true,
          });
          expect(res.status).toBe(404);
        });
    });
  });

});
