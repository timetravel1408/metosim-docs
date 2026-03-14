---
id: architecture
title: Architecture
sidebar_position: 1
---

# Platform Architecture

MetoSim uses a **Hybrid Async API + Modal GPU Workers** architecture — separate deployable units for the API and engine, connected by a lightweight Redis task broker.

## Layered Overview

| Layer | Runs On | Component | Responsibility |
|-------|---------|-----------|----------------|
| **Client** | Researcher's machine | Python SDK | Config validation, job polling, visualization |
| **Gateway** | Railway / Cloud Run | FastAPI REST API | Auth, rate-limit, job state machine |
| **Compute** | Modal (B200/A100) | FDTD Engine | Mesh → Solve → Serialize → Store |
| **Storage** | S3 / Cloudflare R2 | HDF5 Files | Checksum-verified, immutable results |
| **Observability** | SaaS | Prometheus + Sentry | Structured logs, correlation IDs |

## Component Diagram

```
SDK ────HTTPS────► FastAPI (API Container) ────Redis────► Engine Worker (GPU)
                        │                                       │
                   PostgreSQL                            S3 Object Store
                   (Job State)                           (HDF5 Results)
```

## End-to-End Data Flow

1. User creates `Simulation(config)` and calls `client.run(sim)`
2. SDK validates config with Pydantic, serialises to JSON
3. SDK POSTs to `/v1/simulations` with Bearer token
4. API validates auth, checks no active job (V1 single-job constraint)
5. API creates job record (QUEUED), returns `job_id`
6. API dispatches async task to engine via Redis
7. Engine worker generates mesh, runs FDTD solver on GPU
8. Engine writes field arrays + metadata to HDF5
9. HDF5 uploaded to S3; job status updated to COMPLETED
10. SDK polls until COMPLETED, then downloads via pre-signed URL
11. SDK verifies SHA-256 checksum on download
12. Researcher calls `plot_field()` on local results

## Job State Machine

```
QUEUED → RUNNING → COMPLETED
  │         │
  └─────────┴──→ FAILED
```

**V1 Constraint:** One job per API key at a time. Submitting while active returns `409 Conflict` with `Retry-After` header.

## Why This Architecture

Five options were evaluated. The hybrid approach won because it builds production-ready separation between API and Engine from day one, without paying the full microservices tax at MVP stage.

| Criterion | Monolith | Microservices | Serverless | Event-Driven | **Hybrid (Chosen)** |
|-----------|----------|---------------|------------|--------------|---------------------|
| Dev Speed | ★★★★★ | ★★★ | ★★★★ | ★★★ | ★★★★ |
| Scalability | ★★ | ★★★★★ | ★★★★ | ★★★★★ | ★★★★ |
| GPU Flexibility | ★★ | ★★★★★ | ★★★ | ★★★★ | ★★★★★ |
| Ops Overhead | ★★★★★ | ★★ | ★★★ | ★★ | ★★★★ |

The hybrid architecture maps cleanly to V2 (batch = N tasks), V3 (dataset = batch export), and V4 (inverse = iterative task chains) without re-architecting.

## Technology Stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| SDK | Python + Pydantic + httpx | Type-safe, Jupyter-friendly |
| API | FastAPI + SQLAlchemy | Auto OpenAPI, async, mature |
| Task Queue | Redis + Celery | Simple, proven at scale |
| Engine | JAX / NumPy | GPU arrays with CPU fallback |
| Database | PostgreSQL | ACID for job state |
| Storage | S3-compatible | Cheap, pre-signed URLs |
| GPU | Modal (B200/A100) | On-demand, zero idle cost |
| Hosting | Railway / Cloud Run | Auto-scale, deploy from Git |
| CI/CD | GitHub Actions | Native to repo |

## Security

- API keys stored as SHA-256 hashes — never logged in plaintext
- All traffic over TLS 1.3 with HSTS
- Pre-signed S3 URLs with 15-minute expiry
- Simulation configs sanitised — no shell execution from user input
- Dependency scanning via `pip-audit` and Dependabot
