---
id: introduction
title: Introduction
sidebar_position: 1
slug: /
---

# MetoSim Documentation

**MetoSim** is a cloud-native simulation platform for nanophotonics and meta-optics device design. Researchers interact through a Python SDK while GPU-accelerated FDTD computation runs remotely on cloud infrastructure.

MetoSim is the first pillar of the **Meto Platform** — a full-stack development environment for meta-optics technologies.

| Platform | Purpose | Status |
|----------|---------|--------|
| **MetoSim** | Simulation & computational design | V1 MVP |
| **MetoFab** | Nanofabrication workflows | Planned |
| **MetoLab** | Experimental validation | Planned |

## What MetoSim does

- **FDTD electromagnetic simulation** on cloud GPUs (NVIDIA B200 / A100)
- **Python-first SDK** — `pip install metosim`, submit from Jupyter
- **Pydantic-validated configs** — catch errors before burning GPU time
- **HDF5 results** with SHA-256 checksums for reproducibility
- **Built-in materials** — Si, SiO₂, TiO₂, Au, Al, Si₃N₄ at telecom wavelengths
- **Visualization** — `plot_field()` renders publication-ready figures

## Who it's for

**Research Scientists** — Run EM simulations without managing infrastructure. No COMSOL license, no local GPU, no IT tickets.

**Photonic Engineers** — Iterate on metasurface geometry with structured configs that feed directly into MetoFab.

**ML Researchers** (V3) — Generate large simulation datasets for training surrogate models.

## How it works

```
Your Python script
       ↓
  MetoSim SDK (validates config locally)
       ↓
  Cloud API (queues job, dispatches to GPU)
       ↓
  FDTD Engine (solves Maxwell's equations on B200)
       ↓
  HDF5 results (downloaded + checksum-verified)
       ↓
  plot_field() (visualize locally)
```

## Quick example

```python
import metosim

client = metosim.MetoSimClient(api_key="mts_your_key")

sim = metosim.Simulation(
    solver="fdtd",
    wavelength=1.55e-6,
    geometry=[
        metosim.Box(center=(0,0,0), size=(2e-6, 2e-6, 0.22e-6), material="Si"),
    ],
    domain_size=(4e-6, 4e-6, 4e-6),
    resolution=20e-9,
)

job = client.run(sim)
job.wait()
results = job.results()
metosim.plot_field(results, component="Ez")
```

## Roadmap

| Version | Target | Features |
|---------|--------|----------|
| **V1** (Now) | MVP | Single-job FDTD, Python SDK, HDF5 results |
| **V2** (Q2 2026) | Batch | Parameter sweeps, RCWA solver, concurrent jobs |
| **V3** (Q3 2026) | ML | Large-scale dataset generation, batch export |
| **V4** (Q4 2026) | Inverse | Adjoint solver, AI-guided structure discovery |

## Next steps

- **[Quick Start →](/quickstart)** — Install the SDK and run your first simulation in 5 minutes
- **[Architecture →](/platform/architecture)** — Understand the system design
- **[API Reference →](/api/overview)** — Full endpoint documentation
