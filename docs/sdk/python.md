---
id: python
title: Python SDK
sidebar_position: 1
---

# Python SDK

The official Python SDK for MetoSim. Provides a high-level, Pythonic interface for submitting simulations, managing jobs, and visualizing results.

## Installation

```bash
pip install metosim
```

## Core Classes

### `MetoSimClient`

Primary entry point for interacting with the platform.

```python
client = metosim.MetoSimClient(api_key="mts_your_key")
```

| Method | Returns | Description |
|--------|---------|-------------|
| `client.run(sim)` | `Job` | Submit simulation to GPU |
| `client.get_job(id)` | `Job` | Retrieve existing job |
| `client.health()` | `dict` | Check API status |
| `client.close()` | `None` | Close HTTP connection |

Supports context manager: `with metosim.MetoSimClient() as client: ...`

### `Simulation`

High-level simulation builder with validation.

```python
sim = metosim.Simulation(
    solver="fdtd",           # "fdtd" | "rcwa" (V2) | "fem" (V3)
    wavelength=1.55e-6,      # meters
    geometry=[...],           # list of Box/Cylinder/Sphere
    domain_size=(4e-6, 4e-6, 4e-6),
    resolution=20e-9,         # grid cell size (meters)
    time_steps=20000,
    monitors=[...],           # list of Monitor
    metadata={},              # stored with results
)
```

### `Job`

Tracks a submitted simulation.

```python
job = client.run(sim)

job.job_id          # UUID string
job.status          # JobStatus enum (polls API)
job.is_terminal     # True if COMPLETED or FAILED

job.wait()          # Block until done
job.results()       # Download HDF5 → returns Path
job.results(path="out.hdf5", verify=True)
```

### Geometry Primitives

```python
# Rectangular box
metosim.Box(center=(x,y,z), size=(dx,dy,dz), material="Si")

# Cylinder
metosim.Cylinder(center=(x,y,z), radius=r, height=h, axis="z", material="TiO2")

# Sphere
metosim.Sphere(center=(x,y,z), radius=r, material="Au")
```

### `Monitor`

```python
metosim.Monitor(
    name="output",              # unique label
    monitor_type="field",       # "field" | "power" | "mode"
    center=(0, 0, 1e-6),
    size=(4e-6, 4e-6, 0),      # zero = collapsed axis → 2D plane
    components=["Ex", "Ey", "Ez"],
)
```

### Materials

```python
si = metosim.get_material("Si")
si.eps(1.55e-6)          # complex permittivity
si.n_at_1550nm            # refractive index

# Custom material
mat = metosim.Material(
    name="MyPoly", formula="MP",
    permittivity_fn=lambda wl: complex(2.1**2, 0),
)
```

**Built-in:** Si, SiO₂, TiO₂, Si₃N₄, Au, Al, Air

## Visualization

```python
# Plot field component
metosim.plot_field("results.hdf5", component="Ez",
    slice_axis="z", cmap="RdBu_r", save_path="fig.png")

# Plot structure permittivity
metosim.plot_structure("results.hdf5", slice_axis="z")
```

## Configuration

```python
metosim.configure(
    api_key="mts_...",
    api_url="https://api.metosim.io",
    poll_interval=2.0,         # seconds between polls
    max_poll_time=3600.0,      # max wait time
    verify_checksums=True,
)
```

Or via environment variables: `METOSIM_API_KEY`, `METOSIM_API_URL`.

## Exceptions

```python
from metosim import (
    MetoSimError,              # Base — catch-all
    AuthenticationError,       # 401
    ValidationError,           # 422
    SimulationConflictError,   # 409 — has .retry_after
    JobFailedError,            # Engine error — has .error_detail
    ChecksumMismatchError,     # HDF5 integrity failure
    TimeoutError,              # Polling exceeded max_poll_time
)
```

### Error handling pattern

```python
try:
    job = client.run(sim)
    job.wait()
    results = job.results()
except metosim.SimulationConflictError as e:
    print(f"Busy — retry in {e.retry_after}s")
except metosim.JobFailedError as e:
    print(f"Failed: {e.error_detail}")
except metosim.MetoSimError as e:
    print(f"Error: {e.message}")
```

## Complete Example

```python
import metosim

with metosim.MetoSimClient(api_key="mts_your_key") as client:
    sim = metosim.Simulation(
        solver="fdtd",
        wavelength=1.55e-6,
        geometry=[
            metosim.Box(center=(0,0,-0.5e-6), size=(4e-6,4e-6,1e-6), material="SiO2"),
            metosim.Box(center=(0,0,0.11e-6), size=(4e-6,4e-6,0.22e-6), material="Si"),
        ],
        domain_size=(4e-6, 4e-6, 4e-6),
        resolution=20e-9,
        time_steps=15000,
    )

    job = client.run(sim)
    job.wait()
    path = job.results(path="output.hdf5")
    metosim.plot_field(path, component="Ez")
```
