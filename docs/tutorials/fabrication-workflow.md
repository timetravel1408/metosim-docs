---
id: fabrication-workflow
title: Fabrication Workflow
sidebar_position: 3
---

# Simulation-to-Fabrication Workflow

:::info Preview
This tutorial outlines the planned MetoSim → MetoFab pipeline. GDS export is available now; automated fabrication integration is coming with MetoFab.
:::

## Overview

The sim-to-fab workflow takes an optimized photonic design from MetoSim and prepares it for physical nanofabrication. The steps are:

1. **Simulate** — Verify optical performance in MetoSim
2. **Export** — Convert simulation geometry to GDS II
3. **Check** — Run design rule checks against fab constraints
4. **Prepare** — Generate process recipes and dose maps
5. **Fabricate** — Send to foundry or in-house fab (MetoFab)
6. **Validate** — Compare measured vs simulated response (MetoLab)

## Step 1: Run the simulation

```python
import metosim

client = metosim.MetoSimClient()

sim = metosim.Simulation(
    solver="fdtd",
    wavelength=1.55e-6,
    geometry=[
        metosim.Box(center=(0, 0, -0.5e-6), size=(10e-6, 4e-6, 1e-6), material="SiO2"),
        metosim.Box(center=(0, 0, 0.11e-6), size=(10e-6, 0.5e-6, 0.22e-6), material="Si"),
    ],
    domain_size=(12e-6, 4e-6, 4e-6),
    resolution=20e-9,
    time_steps=20000,
)

job = client.run(sim)
job.wait()
results = job.results(path="waveguide.hdf5")
```

## Step 2: Verify simulation results

```python
metosim.plot_field(results, component="Ez", slice_axis="z")
metosim.plot_structure(results, slice_axis="z")

# Check transmission
import h5py
import numpy as np

with h5py.File("waveguide.hdf5", "r") as f:
    converged = f["metadata"].attrs["converged"]

print(f"Converged: {converged}")
```

:::warning
Never send an unconverged simulation to fabrication. Increase `time_steps` or check your PML configuration if the simulation didn't converge.
:::

## Step 3: Export to GDS (Available now)

Using `gdstk` to convert simulation geometry to GDS:

```python
import gdstk

lib = gdstk.Library()
cell = gdstk.Cell("WAVEGUIDE")

# Si waveguide layer (Layer 1)
# Convert from simulation coordinates to GDS coordinates (μm)
waveguide = gdstk.rectangle(
    (-5, -0.25),     # corner 1 (x, y) in μm
    (5, 0.25),       # corner 2
    layer=1,
    datatype=0,
)
cell.add(waveguide)

lib.add(cell)
lib.write_gds("waveguide.gds")
print("GDS exported: waveguide.gds")
```

## Step 4: Design rule check (manual, MetoFab will automate)

Before fabrication, verify:

```python
# Check minimum feature sizes
waveguide_width_nm = 500     # nm
min_fab_feature_nm = 100     # EBL resolution

assert waveguide_width_nm >= min_fab_feature_nm, "Feature too small for EBL"

# Check minimum spacing (if multiple waveguides)
spacing_nm = 200
min_spacing_nm = 80

assert spacing_nm >= min_spacing_nm, "Gap too narrow"

print("✓ Design rules passed")
```

## Step 5: Fabrication preparation

Typical SOI waveguide fabrication process:

```
Substrate: SOI wafer (220nm Si on 2μm SiO₂ on Si handle)
    │
    ▼
Spin coat: ZEP-520A e-beam resist (~300nm)
    │
    ▼
E-beam lithography: Write waveguide pattern
    │  Dose: ~300 μC/cm² (adjust for proximity effects)
    │  Beam: 100 kV, 1 nA
    ▼
Develop: o-xylene, 60s at 23°C
    │
    ▼
Etch: ICP-RIE (SF₆/C₄F₈ Bosch-type or Cl₂/HBr)
    │  Target: 220nm Si etch depth
    │  Selectivity: >10:1 Si:SiO₂
    ▼
Strip resist: O₂ plasma ash
    │
    ▼
Characterize: SEM + optical transmission measurement
```

## Step 6: Compare sim vs measurement (MetoLab)

After fabrication and optical characterization:

```python
import numpy as np
import matplotlib.pyplot as plt

# Simulated data (from MetoSim)
sim_wavelengths = np.linspace(1.5e-6, 1.6e-6, 100)
sim_transmission = np.ones_like(sim_wavelengths) * 0.92  # example

# Measured data (from MetoLab)
meas_wavelengths = np.linspace(1.5e-6, 1.6e-6, 50)
meas_transmission = np.ones_like(meas_wavelengths) * 0.87 + np.random.normal(0, 0.02, 50)

plt.figure(figsize=(10, 5))
plt.plot(sim_wavelengths * 1e9, sim_transmission, 'b-', label='Simulated (MetoSim)')
plt.plot(meas_wavelengths * 1e9, meas_transmission, 'ro', markersize=3, label='Measured (MetoLab)')
plt.xlabel("Wavelength (nm)")
plt.ylabel("Transmission")
plt.title("Simulation vs Measurement")
plt.legend()
plt.grid(True, alpha=0.3)
plt.savefig("sim_vs_measurement.png", dpi=150)
plt.show()
```

## Next steps

- **[Inverse Design →](/platform/inverse-design)** — Optimize structures automatically
- **[MetoFab →](/platform/metofab)** — Automated fabrication pipeline (planned)
