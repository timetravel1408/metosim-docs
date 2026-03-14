---
id: overview
title: API Overview
sidebar_position: 1
---

# API Overview

The MetoSim REST API provides programmatic access to cloud-hosted electromagnetic simulations. All SDK operations translate to HTTP calls against this API.

## Base URL

```
https://api.metosim.io/v1
```

For local development: `http://localhost:8000/v1`

## Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/v1/simulations` | Submit a simulation job |
| `GET` | `/v1/simulations/{id}` | Check job status |
| `GET` | `/v1/simulations/{id}/results` | Download HDF5 results |
| `GET` | `/v1/health` | Health check (no auth) |
| `GET` | `/v1/metrics` | Runtime metrics (no auth) |

## Authentication

All simulation endpoints require an API key as a Bearer token:

```
Authorization: Bearer mts_your_api_key_here
```

See [Authentication](/api/authentication) for details.

## Content Type

All request and response bodies use JSON:

```
Content-Type: application/json
```

## Versioning

The API is versioned via URL prefix: `/v1/`. Breaking changes increment the version number. Additive changes (new fields, new endpoints) do not.

## Response Format

### Success

```json
{
  "job_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "QUEUED",
  "created_at": "2026-03-14T10:30:00Z"
}
```

### Error

```json
{
  "detail": "Human-readable error description",
  "error_code": "OPTIONAL_CODE"
}
```

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success (synchronous read) |
| `202` | Accepted (async job submitted) |
| `302` | Redirect (result download) |
| `401` | Unauthorized (bad/missing key) |
| `404` | Not found |
| `409` | Conflict (job already running) |
| `422` | Validation error |
| `429` | Rate limited |
| `500` | Internal server error |

## Response Headers

Every response includes:

| Header | Description |
|--------|-------------|
| `X-Correlation-ID` | Request trace ID |
| `X-Response-Time-Ms` | Server processing time |
| `Retry-After` | Wait seconds (on 409/429) |

## Rate Limits

| Tier | Submissions/min | Concurrent Jobs |
|------|----------------|-----------------|
| Free | 5 | 1 |
| Pro | 30 | 5 (V2) |

Exceeded limits return `429` with `Retry-After` header.

## Interactive Docs

When running locally or on staging, interactive Swagger docs are available at:

```
http://localhost:8000/docs        # Swagger UI
http://localhost:8000/openapi.json  # OpenAPI 3.0 schema
```
