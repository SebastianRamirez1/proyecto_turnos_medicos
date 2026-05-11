# Clínica San Martín — API de Turnos Médicos

REST API para gestión de turnos médicos, construida con arquitectura limpia y prácticas de desarrollo profesional.

**Demo en vivo:** [clinica-turnos-api.onrender.com/swagger-ui.html](https://clinica-turnos-api.onrender.com/swagger-ui.html)

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Lenguaje | Java 17 |
| Framework | Spring Boot 3.3 |
| Persistencia | Spring Data JPA + Hibernate 6 |
| Base de datos | PostgreSQL 16 |
| Documentación | OpenAPI 3 / Swagger UI |
| Build | Maven 3.9 |
| Containerización | Docker + Docker Compose |
| CI | GitHub Actions |
| Deploy | Render (free tier) |

## Arquitectura

El proyecto sigue **Clean Architecture** en módulo monolítico, con cuatro capas de dependencia unidireccional:

```
presentation/          ← Controllers, DTOs, GlobalExceptionHandler
    ↓
application/           ← Use Cases (un caso de uso por clase)
    ↓
domain/                ← Entities, Repository interfaces, Exceptions, Business rules
    ↑
infrastructure/        ← JPA implementations, Spring Data repositories
```

### Modelo de dominio

```
Paciente ──< Turno >── Medico

Turno — Máquina de estados:
  PENDIENTE → CONFIRMADO → COMPLETADO
  PENDIENTE → CANCELADO
  CONFIRMADO → CANCELADO
  CONFIRMADO → AUSENTE
```

## Reglas de negocio implementadas

- Un médico no puede tener dos turnos solapados (validación por rango de tiempo)
- No se puede cancelar un turno con menos de 2 horas de anticipación
- Las transiciones de estado solo siguen la máquina de estados del dominio
- Soft delete en pacientes y médicos (nunca se eliminan datos médicos)
- Unicidad de DNI y email por paciente; matricula y email por médico

## Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/v1/turnos` | Reservar turno |
| `PATCH` | `/api/v1/turnos/{id}/estado` | Cambiar estado |
| `DELETE` | `/api/v1/turnos/{id}` | Cancelar turno |
| `GET` | `/api/v1/turnos/medico/{id}/agenda` | Agenda del médico por fecha |
| `POST` | `/api/v1/pacientes` | Registrar paciente |
| `POST` | `/api/v1/medicos` | Registrar médico |
| `GET` | `/api/v1/medicos/especialidad/{esp}` | Buscar por especialidad |

Documentación completa en `/swagger-ui.html`.

## Correr localmente

### Requisitos
- Docker Desktop
- JDK 17+
- Maven 3.9+
- Node.js 20+

### Pasos

```bash
# 1. Levantar PostgreSQL
docker compose up -d

# 2. Compilar y ejecutar
mvn spring-boot:run

# 3. Abrir Swagger UI
# http://localhost:8080/swagger-ui.html
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Abrir `http://localhost:5173`. Para apuntar al backend local, configurar `VITE_API_URL=http://localhost:8080`.

### Variables de entorno

| Variable | Default | Descripción |
|---|---|---|
| `DATABASE_URL` | `jdbc:postgresql://localhost:5432/clinica_turnos` | JDBC URL |
| `DATABASE_USERNAME` | `postgres` | Usuario DB |
| `DATABASE_PASSWORD` | `postgres` | Contraseña DB |
| `PORT` | `8080` | Puerto HTTP |

## Tests

```bash
# Ejecutar todos los tests (usa H2 in-memory, no requiere PostgreSQL)
mvn test
```

Cobertura:
- **Unitarios**: Máquina de estados del dominio, casos de uso con Mockito
- **Integración**: Controllers con `@SpringBootTest` + `MockMvc` + H2

## Estructura del proyecto

```
src/
├── main/java/com/clinica/turnos/
│   ├── application/
│   │   ├── paciente/       # CrearPacienteUseCase, ObtenerPacienteUseCase, ...
│   │   ├── medico/
│   │   └── turno/          # ReservarTurnoUseCase, CambiarEstadoTurnoUseCase, ...
│   ├── domain/
│   │   ├── model/          # Paciente, Medico, Turno, EstadoTurno
│   │   ├── repository/     # Interfaces (sin dependencias de framework)
│   │   └── exception/
│   ├── infrastructure/
│   │   └── persistence/    # JpaTurnoRepository, SpringDataTurnoRepository, ...
│   └── presentation/
│       ├── controller/
│       ├── dto/
│       └── exception/      # GlobalExceptionHandler, ApiError
└── test/
    ├── domain/model/       # TurnoEstadoMaquinaTest
    ├── application/turno/  # ReservarTurnoUseCaseTest, CancelarTurnoUseCaseTest
    └── presentation/       # PacienteControllerIT, TurnoControllerIT
```
