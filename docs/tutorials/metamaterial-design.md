---
id: metamaterial-design
title: Metamaterial Design
sidebar_position: 2
---

# Metamaterial Design Tutorial

Design a dielectric metasurface unit cell using TiO₂ nano-pillars on a SiO₂ substrate. This tutorial demonstrates how pillar radius controls the transmitted phase — the foundation of metalens design.

## Concept

A metasurface is a 2D array of sub-wavelength nanostructures that manipulate light's phase, amplitude, or polarization. By varying the pillar geometry across the surface, you can engineer arbitrary wavefronts — flat lenses, holograms, and beam shapers.

## Step 1: Define a single unit cell

```python
import metosim

# Unit cell period: 600nm × 600nm
period = 0.6e-6

# TiO2 pillar on SiO2 substrate
substrate = metosim.Box(
    center=(0, 0, -0.25e-6),
    size=(period, period, 0.5e-6),
    material="SiO2",
)

pillar = metosim.Cylinder(
    center=(0, 0, 0.3e-6),
    radius=0.12e-6,       # 120nm radius — vary this!
    height=0.6e-6,         # 600nm tall
    axis="z",
    material="TiO2",
)
```

## Step 2: Configure with periodic boundaries

For a unit cell simulation, use periodic boundaries in x and y:

```python
from metosim.simulation import (
    SimulationConfig, SimulationDomain, Source, FDTDSettings,
    Monitor, SolverType, BoundaryCondition,
)

config = SimulationConfig(
    solver=SolverType.FDTD,
    domain=SimulationDomain(
        size=(period, period, 3e-6),
        resolution=10e-9,
        boundary_conditions=(
            BoundaryCondition.PERIODIC,
            BoundaryCondition.PERIODIC,
            BoundaryCondition.PML,
        ),
        pml_layers=16,
    ),
    source=Source(wavelength=1.55e-6),
    structures=[substrate, pillar],
    monitors=[
        Monitor(name="transmitted", center=(0, 0, 1e-6), size=(period, period, 0)),
        Monitor(name="reflected", center=(0, 0, -0.8e-6), size=(period, period, 0)),
    ],
    fdtd_settings=FDTDSettings(time_steps=30000, convergence_threshold=1e-7),
)

sim = metosim.Simulation.__new__(metosim.Simulation)
sim.config = config
```

## Step 3: Run the simulation

```python
client = metosim.MetoSimClient()
job = client.run(sim)
job.wait()
results = job.results(path="metasurface_r120nm.hdf5")
```

## Step 4: Extract phase and transmission

```python
import h5py
import numpy as np

with h5py.File("metasurface_r120nm.hdf5", "r") as f:
    Ez_t = f["fields/Ez"][:]  # transmitted field

# Compute complex amplitude at monitor plane
mid_z = Ez_t.shape[2] // 2
field_at_monitor = Ez_t[:, :, mid_z]

# Phase (relative to incident)
phase = np.angle(np.mean(field_at_monitor))

# Transmission
transmission = np.abs(np.mean(field_at_monitor))**2

print(f"Radius: 120 nm")
print(f"Phase: {np.degrees(phase):.1f}°")
print(f"Transmission: {transmission:.4f}")
```

## Step 5: Sweep pillar radius (V2)

:::note
Parameter sweeps are a V2 feature. For V1, submit simulations one at a time in a loop.
:::

```python
radii = [60e-9, 80e-9, 100e-9, 120e-9, 140e-9, 160e-9, 180e-9]
results = {}

for r in radii:
    pillar = metosim.Cylinder(
        center=(0, 0, 0.3e-6), radius=r, height=0.6e-6, material="TiO2"
    )
    sim = metosim.Simulation(
        geometry=[substrate, pillar],
        wavelength=1.55e-6,
        domain_size=(period, period, 3e-6),
        resolution=10e-9,
        time_steps=30000,
    )
    job = client.run(sim)
    job.wait()
    results[r] = job.results(path=f"sweep_r{int(r*1e9)}nm.hdf5")
    print(f"  r={r*1e9:.0f}nm done")
```

## Step 6: Plot phase vs radius

```python
import matplotlib.pyplot as plt

phases = []
for r in radii:
    with h5py.File(f"sweep_r{int(r*1e9)}nm.hdf5", "r") as f:
        Ez = f["fields/Ez"][:]
        phase = np.angle(np.mean(Ez[:, :, Ez.shape[2]//2]))
        phases.append(np.degrees(phase))

plt.figure(figsize=(8, 5))
plt.plot([r*1e9 for r in radii], phases, 'o-', linewidth=2)
plt.xlabel("Pillar Radius (nm)")
plt.ylabel("Transmitted Phase (°)")
plt.title("TiO₂ Metasurface: Phase vs Pillar Radius")
plt.grid(True, alpha=0.3)
plt.savefig("phase_vs_radius.png", dpi=150)
plt.show()
```

## Design insight

If the phase spans a full 0–360° range as the radius varies from 60–180 nm, you can build a **metalens** by spatially varying the pillar radius to impose a hyperbolic phase profile.

## Next steps

- Extend to 2D phase maps (vary radius and height)
- Design a focusing metalens using the phase library
- Try **[Fabrication Workflow →](/tutorials/fabrication-workflow)** to export the design to GDS
