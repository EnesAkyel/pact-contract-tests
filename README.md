# pact-contract-tests

Consumer-driven contract tests (CDC) for [movie-catalog-api](https://github.com/EnesAkyel/movie-catalog-api) using [Pact](https://docs.pact.io/).

## What is CDC?

In consumer-driven contract testing, the **consumer** defines what it expects from the provider and publishes a **pact** (a JSON contract file). The **provider** then verifies it can satisfy that contract against its real implementation. If the provider breaks an agreed interaction, verification fails before the change reaches production.

This differs from schema validation (which checks shape) and integration testing (which checks behavior end-to-end) — CDC pinpoints exactly which consumer is broken by a provider change.

## Tech Stack

| Tool                  | Version | Purpose                          |
|-----------------------|---------|----------------------------------|
| @pact-foundation/pact | 17.x    | Pact consumer + provider library |
| TypeScript            | 6.0.3   | Type-safe test scripts           |
| Jest                  | 30.x    | Test runner                      |
| ts-jest               | 29.x    | Test runner                      |
| Node.js               | 24      | Runtime                          |

## Project Structure

```
src/
├── consumer/
│   └── movie-catalog.consumer.spec.ts   # defines interactions, generates pacts/
└── provider/
    └── movie-catalog.provider.spec.ts   # verifies real API against pact file
pacts/
└── pact-contract-tests-movie-catalog-api.json  # generated contract (committed)
```

## Interactions Covered

| Interaction            | Method | Path                          | State               |
|------------------------|--------|-------------------------------|---------------------|
| List all movies        | GET    | `/api/v1/movies`              | movies exist        |
| Filter by genre        | GET    | `/api/v1/movies?genre=Action` | action movies exist |
| Filter by rating       | GET    | `/api/v1/movies?rating=PG-13` | PG-13 movies exist  |
| Get movie by ID        | GET    | `/api/v1/movie/1001`          | movie 1001 exists   |
| Get non-existent movie | GET    | `/api/v1/movie/9999`          | → 404               |
| List all studios       | GET    | `/api/v1/studios`             | studios exist       |
| Get movies by studio   | GET    | `/api/v1/studios/1/movies`    | studio 1 has movies |
| Studio with no movies  | GET    | `/api/v1/studios/99/movies`   | → 404               |

## Running Locally

### Prerequisites

- Node.js 24+
- `npm install`

For provider verification only:
- movie-catalog-api running on `http://localhost:8080`

```bash
# Option 1 - Maven
cd ../movie-catalog-api && ./mvnw spring-boot:run

# Option 2 - Docker
cd ../movie-catalog-api
./mvnw package -DskipTests -q && docker compose up
```

### Run consumer tests (generates pact file)

```bash
npm run test:consumer
```

The pact file is written to `pacts/pact-contract-tests-movie-catalog-api.json`.

### Run provider verification (requires API running)

```bash
npm run test:provider

# Against a different URL
BASE_URL=https://your-api.example.com npm run test:provider
```

### Run both in sequence

```bash
npm test
```

## Checking for Dependency Upgrades

```bash
# List outdated npm packages (current vs. wanted vs. latest)
npm outdated

# Explain why a package is pinned to its current range (peer dependency chain)
npm explain <package>
```

## CI/CD

The `pact-tests.yml` workflow runs in two sequential jobs:

1. **consumer** — runs consumer tests, uploads the generated pact file as an artifact
2. **provider** — downloads the pact file, bootstraps `movie-catalog-api` from source, runs provider verification against the live API

No Pact Broker is used — the pact file is passed between jobs via GitHub Actions artifacts and committed to the repository.
