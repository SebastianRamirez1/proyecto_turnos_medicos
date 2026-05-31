# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Full-stack medical appointment management system (Clínica San Martín). Backend in Java/Spring Boot with Clean Architecture; frontend in React/TypeScript.

## Commands

### Backend
```bash
mvn spring-boot:run          # Run dev server on :8080
mvn test                     # All tests (H2 in-memory, no Postgres needed)
mvn test -Dtest=ClassName    # Single test class
mvn package -DskipTests      # Build JAR
docker compose up -d         # Start PostgreSQL 16 for local dev
```

### Frontend
```bash
cd frontend
npm run dev                  # Vite dev server on :5173 (uses production API)
$env:VITE_API_URL="http://localhost:8080"; npm run dev  # Use local backend
npm run build
npm run lint
```

Swagger UI available at `http://localhost:8080/swagger-ui.html` when backend is running.

## Architecture

### Clean Architecture (strict unidirectional dependency)

```
presentation/  →  application/  →  domain/
                                       ↑
infrastructure/ ──────────────────────┘
```

- **domain/model/** — Pure Java entities (`Paciente`, `Medico`, `Turno`) and repository interfaces. Zero Spring/JPA imports allowed here.
- **application/turno|medico|paciente/** — One use case per class, `@Transactional`.
- **infrastructure/persistence/** — Two-class pattern per entity: `Jpa*Repository` implements the domain interface; `SpringData*Repository` extends `JpaRepository`.
- **presentation/controller/** — `@RestController`, delegates to use cases; maps DTOs via static `.from()` methods.

### Key Domain Model

```
Paciente ──< Turno >── Medico
```

`Turno` is a state machine: `PENDIENTE → CONFIRMADO → COMPLETADO | CANCELADO | AUSENTE`. Invalid transitions throw `TransicionEstadoInvalidaException`. Overlapping appointments per doctor are blocked by `TurnoRepository.existeSolapamiento()`.

### Frontend

```
src/api/client.ts       # Base fetch client with timeout
src/api/index.ts        # API methods (pacientesApi, medicosApi, turnosApi)
src/pages/              # Page components (Dashboard, Pacientes, Medicos, Turnos)
src/types/index.ts      # Shared TypeScript interfaces
```

`App.tsx` sets up React Router v7 routes. `Layout.tsx` is the main shell with sidebar navigation.

## Environment

### Backend (`application.properties` / env vars)
- `DATABASE_URL` — JDBC connection string (defaults to `localhost:5432/clinica_turnos`)
- `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` — override individual DB params
- `PORT` — server port (default 8080)
- `CORS_ALLOWED_ORIGINS` — comma-separated allowed origins

### Frontend (Vite)
- `VITE_API_URL` — backend base URL (defaults to production Render URL)

## Testing

| Layer | Strategy |
|---|---|
| Domain | Unit tests with JUnit 5 / Mockito, no DB |
| Application | Unit tests with mocked repositories |
| Presentation | `@SpringBootTest` + MockMvc + H2 in-memory |

Key test files: `TurnoEstadoMaquinaTest`, `ReservarTurnoUseCaseTest`, `PacienteControllerIT`, `TurnoControllerIT`.

## Deployment

- **Backend:** Render (Docker multi-stage build, `render.yaml`). Railway alternative (`railway.toml`).
- **Frontend:** Vercel (`vercel.json`), root directory = `frontend`.
- **CI:** GitHub Actions (`.github/workflows/ci.yml`) — runs `mvn test` then `mvn package` on every push/PR to `main`.

## Important Conventions

- Domain exceptions: `RecursoNoEncontradoException` (404), `ReglaNegocioException` (422), `TransicionEstadoInvalidaException` (422). All handled in `GlobalExceptionHandler`.
- Soft-delete pattern: patients and doctors are never deleted — set `activo=false`. Appointments remain in history.
- Lombok is used throughout backend — enable annotation processing in IDE.
- DTO mappers are static `from(entity)` methods on the response DTO class.
- Default appointment duration is 30 minutes; cancellation requires 2+ hours notice.
