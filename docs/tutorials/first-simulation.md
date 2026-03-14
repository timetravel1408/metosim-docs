---
id: first-simulation
title: Your First Simulation
sidebar_position: 1
---

# Your First Simulation

This tutorial walks through a complete simulation of a silicon slab at telecom wavelength — from defining the structure to visualizing the electromagnetic fields.

## What we'll build

A 220 nm silicon slab (typical SOI waveguide thickness) illuminated by a 1550 nm plane wave. We'll observe how light interacts with the high-index dielectric and examine the electric field pattern.

## Prerequisites

```bash
pip install metosim
export METOSIM_API_KEY=mts_your_key
```

## Step 1: Import and configure

```python
import metosim
import numpy as np

client = metosim.MetoSimClient()

# Verify connection
print(client.health())
```

## Step 2: Check material properties

```python
si = metosim.get_material("Si")
sio2 = metosim.get_material("SiO2")

print(f"Silicon: n = {si.n_at_1550nm.real:.3f}")
print(f"Silica:  n = {sio2.n_at_1550nm.real:.3f}")
print(f"Index contrast: {si.n_at_1550nm.real / sio2.n_at_1550nm.real:.2f}x")
```

Output:
```
Silicon: n = 3.476
Silica:  n = 1.444
Index contrast: 2.41x
```

## Step 3: Define the structure

```python
# SiO2 substrate (bottom half of domain)
substrate = metosim.Box(
    center=(0, 0, -0.5e-6),
    size=(4e-6, 4e-6, 1e-6),
    material="SiO2",
)

# Silicon device layer (220 nm thick)
device = metosim.Box(
    center=(0, 0, 0.11e-6),           # centered at 110nm above origin
    size=(4e-6, 4e-6, 0.22e-6),       # 220nm thick
    material="Si",
)
```

## Step 4: Create the simulation

```python
sim = metosim.Simulation(
    solver="fdtd",
    wavelength=1.55e-6,
    geometry=[substrate, device],
    domain_size=(4e-6, 4e-6, 4e-6),
    resolution=20e-9,                   # 20nm grid → ~17 points/λ in Si
    time_steps=15000,
    monitors=[
        metosim.Monitor(
            name="field_xz",
            center=(0, 0, 0),
            size=(4e-6, 0, 4e-6),       # xz cross-section through center
            components=["Ex", "Ez"],
        ),
    ],
    metadata={"tutorial": "first-simulation", "structure": "soi-slab"},
)

print(sim)
```

## Step 5: Submit and wait

```python
job = client.run(sim)
print(f"Job ID: {job.job_id}")

# Wait with progress display
job.wait(verbose=True)
```

Expected output:
```
Job ID: a1b2c3d4-e5f6-7890-abcd-ef1234567890
  [  1.5s] Job a1b2c3d4... → QUEUED
  [ 12.0s] Job a1b2c3d4... → RUNNING
  [ 98.3s] Job a1b2c3d4... → COMPLETED
```

## Step 6: Download results

```python
result_path = job.results(path="tutorial_results.hdf5")
print(f"Saved to: {result_path}")
```

## Step 7: Visualize the fields

```python
# Ez field - cross section through the slab
metosim.plot_field(
    result_path,
    component="Ez",
    slice_axis="y",             # xz plane
    cmap="RdBu_r",
    title="Ez field — Si slab at λ=1550nm",
    save_path="ez_slab.png",
)
```

## Step 8: Analyse the results

```python
import h5py

with h5py.File("tutorial_results.hdf5", "r") as f:
    Ez = f["fields/Ez"][:]
    eps = f["structure/permittivity"][:]
    wall_time = f["metadata"].attrs["wall_time"]
    converged = f["metadata"].attrs["converged"]

print(f"Grid shape: {Ez.shape}")
print(f"Wall time: {wall_time:.1f}s")
print(f"Converged: {converged}")
print(f"Max |Ez|: {np.max(np.abs(Ez)):.4f}")
```

## Step 9: Custom visualization

```python
import matplotlib.pyplot as plt

mid_y = Ez.shape[1] // 2
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

# Field
vmax = np.max(np.abs(Ez[:, mid_y, :])) * 0.8
ax1.imshow(Ez[:, mid_y, :].T, origin="lower", cmap="RdBu_r", vmin=-vmax, vmax=vmax)
ax1.set_title("Ez field")
ax1.set_xlabel("x (grid)")
ax1.set_ylabel("z (grid)")

# Structure
ax2.imshow(np.real(eps[:, mid_y, :]).T, origin="lower", cmap="coolwarm")
ax2.set_title("Permittivity εr")
ax2.set_xlabel("x (grid)")
ax2.set_ylabel("z (grid)")

plt.tight_layout()
plt.savefig("tutorial_combined.png", dpi=150)
plt.show()
```

## What to try next

- Change the silicon thickness to see thin-film interference effects
- Add a second material layer (TiO₂ on Si)
- Switch from a slab to a waveguide (narrow the y-dimension)
- Try the **[Metamaterial Design tutorial →](/tutorials/metamaterial-design)**

:::tip Cost
This tutorial uses a ~200³ grid with 15,000 steps — roughly 1-2 minutes of GPU time (~$0.50).
:::
