---
id: quickstart
title: Quick Start
sidebar_position: 2
---

# Quick Start

Get from zero to your first simulation result in under 5 minutes.

## Prerequisites

- Python 3.9 or later
- A MetoSim API key ([get one here](https://metosim.com))

## 1. Install the SDK

```bash
pip install metosim
```

Verify:

```python
import metosim
print(metosim.__version__)  # "1.0.0-dev"
```

## 2. Set your API key

```bash
export METOSIM_API_KEY=mts_your_key_here
```

Or pass it directly in Python:

```python
client = metosim.MetoSimClient(api_key="mts_your_key_here")
```

## 3. Define a simulation

This example simulates a 220 nm silicon slab illuminated by a 1550 nm plane wave:

```python
import metosim

client = metosim.MetoSimClient()

sim = metosim.Simulation(
    solver="fdtd",
    wavelength=1.55e-6,              # telecom C-band
    geometry=[
        metosim.Box(
            center=(0, 0, 0),
            size=(2e-6, 2e-6, 0.22e-6),  # 2μm × 2μm × 220nm
            material="Si",
        ),
    ],
    domain_size=(4e-6, 4e-6, 4e-6),  # 4μm cube
    resolution=20e-9,                  # 20 nm grid
    time_steps=10000,
)
```

## 4. Submit to cloud GPU

```python
job = client.run(sim)
print(f"Job submitted: {job.job_id}")
```

## 5. Wait for results

```python
job.wait()  # Blocks and prints progress
# [  2.0s] Job a1b2c3d4... → QUEUED
# [ 15.3s] Job a1b2c3d4... → RUNNING
# [142.7s] Job a1b2c3d4... → COMPLETED
```

## 6. Download and visualize

```python
result_path = job.results(path="my_first_sim.hdf5")
metosim.plot_field(result_path, component="Ez")
```

This downloads the HDF5 file (with checksum verification) and renders the Ez field component.

## 7. Inspect the results

```python
import h5py
import numpy as np

with h5py.File("my_first_sim.hdf5", "r") as f:
    Ez = f["fields/Ez"][:]
    eps = f["structure/permittivity"][:]
    wall_time = f["metadata"].attrs["wall_time"]
    converged = f["metadata"].attrs["converged"]

print(f"Grid shape: {Ez.shape}")
print(f"Wall time: {wall_time:.1f}s")
print(f"Converged: {converged}")
```

## What's next

- **[Tutorials →](/tutorials/first-simulation)** — Step-by-step guided simulations
- **[SDK Reference →](/sdk/python)** — Full Python SDK documentation
- **[API Reference →](/api/overview)** — REST endpoint details
- **[Materials →](/platform/simulation-engine#materials-library)** — Available optical materials

:::tip Cost
Only `client.run()` costs credits. Everything else — config validation, visualization, HDF5 analysis — runs locally and is free.
:::
