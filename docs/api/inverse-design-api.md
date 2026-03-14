---
id: inverse-design-api
title: Inverse Design API
sidebar_position: 4
---

# Inverse Design API

:::info Coming in V4
The inverse design API is planned for MetoSim V4 (Q4 2026). This page documents the planned interface.
:::

## Overview

The inverse design API provides endpoints for running adjoint-based topology optimization on cloud GPUs. It extends the simulation API with iterative optimization loops.

## Planned Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/v1/optimizations` | Start an optimization run |
| `GET` | `/v1/optimizations/{id}` | Check optimization status + current iteration |
| `GET` | `/v1/optimizations/{id}/results` | Download optimized geometry |
| `POST` | `/v1/optimizations/{id}/stop` | Early-stop a running optimization |
| `GET` | `/v1/optimizations/{id}/history` | Iteration-by-iteration loss history |

## Planned Request Format

```json
{
  "target": {
    "monitor": "transmission",
    "wavelength": 1.55e-6,
    "target_value": 0.95,
    "objective": "maximize"
  },
  "design_region": {
    "center": [0, 0, 0],
    "size": [4e-6, 4e-6, 0.22e-6],
    "materials": ["Air", "Si"],
    "min_feature_size": 100e-9
  },
  "optimization": {
    "method": "adjoint_gradient",
    "max_iterations": 100,
    "learning_rate": 0.01,
    "convergence_threshold": 1e-4
  },
  "simulation": {
    "domain_size": [8e-6, 8e-6, 4e-6],
    "resolution": 20e-9,
    "fdtd_settings": { "time_steps": 20000 }
  }
}
```

## Planned Response

Each iteration produces:

```json
{
  "optimization_id": "opt-abc123",
  "status": "RUNNING",
  "current_iteration": 42,
  "max_iterations": 100,
  "current_loss": 0.0823,
  "best_loss": 0.0712,
  "convergence_history": [0.45, 0.32, 0.21, ...],
  "estimated_remaining_time": 1200
}
```

## WebSocket Streaming

For real-time optimization monitoring, a WebSocket endpoint will stream iteration updates:

```
wss://api.metosim.io/v1/optimizations/{id}/stream
```

The SDK will handle this automatically with a progress callback:

```python
result = metosim.inverse_design(
    target=target,
    design_region=region,
    on_iteration=lambda i, loss: print(f"Iter {i}: loss={loss:.4f}"),
)
```

## Cost Estimation

Each iteration requires 2 FDTD simulations (forward + adjoint). A typical 100-iteration optimization on a 200³ grid:

- ~200 FDTD runs × ~4 min each = ~13 hours GPU time
- Estimated cost: ~$325 at $25/hour

Surrogate model acceleration (V4) can reduce this by 10-100×.
