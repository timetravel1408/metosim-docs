---
id: inverse-design
title: Inverse Design
sidebar_position: 3
---

# Inverse Design

:::info Version
Inverse design capabilities are planned for **MetoSim V4** (Q4 2026). This page describes the architecture and approach.
:::

## Overview

Traditional photonics design is **forward**: an engineer proposes a geometry, simulates it, and evaluates performance. **Inverse design** flips this — you specify the desired optical response, and an optimization algorithm discovers the geometry that produces it.

MetoSim V4 will provide:

- **Adjoint gradient computation** — efficient sensitivity analysis of the optical response with respect to every design pixel, in just 2 simulations (forward + adjoint)
- **Topology optimization** — free-form structure discovery without pre-defined geometry parameterisation
- **AI-guided search** — surrogate models (trained on V3 datasets) accelerate the design space exploration
- **Fabrication-aware constraints** — minimum feature sizes, connectivity, and material compatibility enforced during optimization

## How Adjoint Optimization Works

```
1. Define target response       (e.g. 90% transmission at λ=1550nm)
2. Forward simulation           (standard FDTD)
3. Compute loss function        (how far from target?)
4. Adjoint simulation           (backward propagation of loss gradient)
5. Compute gradient             (∂loss/∂ε for every pixel)
6. Update geometry              (gradient descent step)
7. Repeat 2-6                   (until converged)
```

The key insight: step 4-5 costs only **one additional simulation** regardless of how many design variables exist — enabling optimization of millions of pixels simultaneously.

## Architecture

Inverse design runs as **iterative Celery task chains** on the existing MetoSim infrastructure:

```
SDK (optimization loop)
  ↓
API (submit chain)
  ↓
Redis (task chain: forward → adjoint → gradient → update → forward → ...)
  ↓
GPU Engine (FDTD forward + adjoint)
  ↓
S3 (intermediate results)
```

The V1→V4 architecture was designed for this from day one — iterative task chains require no re-architecture.

## Planned SDK Interface

```python
import metosim

# Define target optical response
target = metosim.OptimizationTarget(
    monitor="transmission",
    wavelength=1.55e-6,
    target_value=0.95,        # 95% transmission
    objective="maximize",
)

# Define design region
design_region = metosim.DesignRegion(
    center=(0, 0, 0),
    size=(4e-6, 4e-6, 0.22e-6),
    materials=("Air", "Si"),   # binary optimization
    min_feature_size=100e-9,   # fab constraint
)

# Run inverse design
result = metosim.inverse_design(
    target=target,
    design_region=design_region,
    domain_size=(8e-6, 8e-6, 4e-6),
    max_iterations=100,
    learning_rate=0.01,
)

# Export optimized structure
result.export_gds("optimized_device.gds")
result.export_metofab()  # Direct to fabrication
```

## Relationship to V3 (ML Datasets)

V3's dataset generation capability feeds directly into V4:

1. **V3** generates thousands of forward simulations across parameter space
2. Surrogate neural networks are trained on this data
3. **V4** uses surrogates for fast initial exploration, then refines with exact adjoint FDTD
4. This hybrid approach reduces GPU cost by 10-100× compared to pure adjoint optimization

## Research Applications

- Wavelength-selective metasurfaces
- Broadband anti-reflection coatings
- Mode converters and multiplexers
- Metalens phase profiles
- Photonic crystal cavity design
- Optical computing elements
