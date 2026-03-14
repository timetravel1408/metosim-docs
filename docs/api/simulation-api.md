---
id: simulation-api
title: Simulation API
sidebar_position: 3
---

# Simulation API

## Submit Simulation

### `POST /v1/simulations`

Submit an electromagnetic simulation for GPU execution.

**Headers:** `Authorization: Bearer <key>`, `Content-Type: application/json`

**Request Body:**

```json
{
  "solver": "fdtd",
  "domain": {
    "size": [4e-6, 4e-6, 4e-6],
    "resolution": 20e-9,
    "boundary_conditions": ["pml", "pml", "pml"],
    "pml_layers": 12
  },
  "source": {
    "source_type": "plane_wave",
    "wavelength": 1.55e-6,
    "polarization": "te",
    "direction": [0, 0, 1],
    "amplitude": 1.0
  },
  "structures": [
    {
      "type": "box",
      "center": [0, 0, 0],
      "size": [1e-6, 1e-6, 2.2e-7],
      "material": "Si"
    }
  ],
  "monitors": [
    {
      "name": "field_xy",
      "monitor_type": "field",
      "center": [0, 0, 0],
      "size": [4e-6, 4e-6, 0],
      "components": ["Ex", "Ey", "Ez"]
    }
  ],
  "fdtd_settings": {
    "time_steps": 20000,
    "courant_factor": 0.99,
    "convergence_threshold": 1e-6,
    "check_every_n": 1000
  },
  "metadata": {}
}
```

**Response `202 Accepted`:**

```json
{
  "job_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "QUEUED",
  "created_at": "2026-03-14T10:30:00Z",
  "message": "Simulation queued for execution"
}
```

**Error `409 Conflict`** (job already running):

```json
{
  "detail": "A simulation is already running",
  "active_job_id": "...",
  "retry_after": 30
}
```

---

## Check Status

### `GET /v1/simulations/{job_id}`

Poll the current status of a simulation job.

**Response `200 OK`:**

```json
{
  "job_id": "a1b2c3d4-...",
  "status": "COMPLETED",
  "created_at": "2026-03-14T10:30:00Z",
  "updated_at": "2026-03-14T10:32:45Z",
  "result_url": "https://storage.metosim.io/results/a1b2c3d4.hdf5",
  "checksum": "e3b0c44298fc1c14...",
  "error_detail": null,
  "solver": "fdtd",
  "duration_seconds": 165.3,
  "metadata": {}
}
```

**Job Status Values:**

| Status | Description |
|--------|-------------|
| `QUEUED` | Waiting for GPU worker |
| `RUNNING` | Solver executing |
| `COMPLETED` | Results ready for download |
| `FAILED` | Error — see `error_detail` |

---

## Download Results

### `GET /v1/simulations/{job_id}/results`

Redirects to a pre-signed S3 URL (15-minute expiry) for HDF5 download.

**Response `302 Found`:** Redirect to download URL.

**Error `409 Conflict`:** Job not yet completed.

The SDK handles this redirect and checksum verification automatically via `job.results()`.
