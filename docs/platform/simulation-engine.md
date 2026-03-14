---
id: simulation-engine
title: Simulation Engine
sidebar_position: 2
---

# Simulation Engine

The MetoSim engine solves Maxwell's equations on 3D Yee grids using GPU-accelerated FDTD. It handles mesh generation, material assignment, field propagation, convergence detection, and HDF5 serialisation.

## Supported Solvers

| Solver | Method | Version | Use Case |
|--------|--------|---------|----------|
| **FDTD** | Finite-Difference Time-Domain | V1 ✅ | General EM propagation, broadband |
| **RCWA** | Rigorous Coupled-Wave Analysis | V2 | Periodic structures, metasurfaces |
| **FEM** | Finite Element Method | V3+ | Complex geometries, eigenmode analysis |

## FDTD Solver

The core solver implements the standard Yee algorithm with:

- **3D Yee grid** — staggered electric and magnetic field components
- **PML boundaries** — absorbing layers to truncate the computational domain
- **Courant stability** — automatic time-step sizing from `dt ≤ dx / (c × √3)`
- **Convergence detection** — early stopping when relative field change drops below threshold
- **GPU acceleration** — JAX backend for NVIDIA B200/A100 execution

### Configuration

```python
from metosim.simulation import FDTDSettings

settings = FDTDSettings(
    time_steps=20000,               # max iterations
    courant_factor=0.99,            # stability factor (0 < cf ≤ 1)
    convergence_threshold=1e-6,     # relative change for early stop
    check_every_n=1000,             # convergence check interval
)
```

### Resolution Guidelines

| Structure | Recommended | Points per λ |
|-----------|-------------|-------------|
| Bulk dielectric | λ / (10n) | 10 |
| Waveguide mode | λ / (20n) | 20 |
| Metallic nanostructure | λ / (30n) | 30 |
| Plasmonic hotspot | λ / (40n) | 40+ |

**Example:** Silicon (n=3.48) at 1550 nm → minimum feature 220 nm → resolution ≤ 22 nm.

## Geometry Primitives

Structures are defined as geometric primitives painted onto the Yee grid:

```python
# Rectangular slab
metosim.Box(center=(0, 0, 0), size=(2e-6, 2e-6, 0.22e-6), material="Si")

# Nano-pillar
metosim.Cylinder(center=(0, 0, 0), radius=150e-9, height=600e-9, axis="z", material="TiO2")

# Nanoparticle
metosim.Sphere(center=(0, 0, 0), radius=50e-9, material="Au")
```

Structures are applied in list order — later entries overwrite earlier ones at overlapping grid cells.

## Materials Library

Built-in wavelength-dependent permittivity at telecom wavelengths:

| Formula | Name | n @ 1550 nm | Type |
|---------|------|-------------|------|
| `Si` | Silicon | 3.476 | Semiconductor |
| `SiO2` | Silica | 1.444 | Dielectric |
| `TiO2` | Titanium Dioxide | 2.270 | High-index dielectric |
| `Si3N4` | Silicon Nitride | 1.994 | Dielectric |
| `Au` | Gold | 0.56 + 11.2i | Plasmonic metal |
| `Al` | Aluminium | 1.44 + 16.0i | UV plasmonic |
| `Air` | Vacuum | 1.000 | Background |

Lookup is case-insensitive with aliases: `glass` → SiO₂, `silicon` → Si, `vacuum` → Air.

### Custom Materials

```python
custom = metosim.Material(
    name="PMMA",
    formula="PMMA",
    permittivity_fn=lambda wl: complex(1.49**2, 1e-4),
    wavelength_range=(0.4e-6, 2.0e-6),
)
lib = metosim.MaterialLibrary()
lib.register(custom)
```

## Boundary Conditions

| Type | Keyword | Use Case |
|------|---------|----------|
| PML | `pml` | Open boundaries (default) |
| Periodic | `periodic` | Unit cells, photonic crystals |
| Bloch | `bloch` | Oblique incidence on periodic structures |
| Symmetric | `symmetric` | Exploit mirror symmetry (2× speedup) |
| Anti-symmetric | `antisymmetric` | TE/TM symmetry exploitation |

```python
from metosim.simulation import SimulationDomain, BoundaryCondition

domain = SimulationDomain(
    size=(4e-6, 4e-6, 4e-6),
    resolution=20e-9,
    boundary_conditions=(
        BoundaryCondition.PML,
        BoundaryCondition.PERIODIC,
        BoundaryCondition.PML,
    ),
    pml_layers=16,
)
```

## Result Format (HDF5)

```
results.hdf5
├── fields/
│   ├── Ex, Ey, Ez          # Electric field (3D float64)
│   ├── Hx, Hy, Hz          # Magnetic field (3D float64)
├── structure/
│   └── permittivity         # 3D complex128
├── convergence/
│   ├── steps                # 1D int
│   └── residuals            # 1D float64
└── metadata/
    ├── @config              # Full input config (JSON)
    ├── @solver_version      # Engine version string
    ├── @sha256_checksum     # File integrity hash
    ├── @wall_time           # Seconds
    ├── @converged           # Boolean
    └── @performance         # Grid-points × steps / s
```

All field arrays use gzip compression (level 4) with HDF5 chunking.

## Performance

Typical simulation times on NVIDIA B200:

| Grid Size | Steps | Wall Time | Cost |
|-----------|-------|-----------|------|
| 100³ | 10,000 | ~30s | ~$0.20 |
| 200³ | 20,000 | ~4min | ~$1.50 |
| 400³ | 20,000 | ~25min | ~$10 |
| 500³ | 50,000 | ~2hrs | ~$50 |

GPU pricing: 1 credit = $25 = 1 hour B200 compute.
