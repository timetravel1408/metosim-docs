---
id: benchmarks
title: Solver Benchmarks
sidebar_position: 2
---

# Solver Benchmarks

MetoSim's FDTD engine must pass a suite of analytic benchmarks before every release. This page documents the required tests and their acceptance criteria.

## Physics Validation Tests

These tests compare FDTD results against known analytic solutions to verify numerical accuracy.

### 1. Free-space plane wave propagation (1D)

A plane wave propagating through vacuum. The simplest possible test — verifies the core update equations.

| Metric | Criterion |
|--------|-----------|
| Amplitude error | < 0.1% vs analytic |
| Phase error | < 0.5° vs analytic |

```python
# Analytic solution: E(z,t) = E₀ sin(kz - ωt)
# FDTD should reproduce this to high accuracy in vacuum
```

### 2. Fabry-Pérot cavity

A dielectric slab (e.g. Si₃N₄, n=2.0) creates a Fabry-Pérot resonator. The resonance condition is known analytically.

| Metric | Criterion |
|--------|-----------|
| Resonance peak position | Within 0.5 nm of analytic |
| Free spectral range | Within 1% of analytic |

**Analytic resonance:** λ_m = 2nL/m, where n is refractive index, L is slab thickness, and m is the mode order.

### 3. Gaussian pulse propagation

A Gaussian pulse propagating through a uniform medium. Tests dispersion and group velocity accuracy.

| Metric | Criterion |
|--------|-----------|
| Group velocity | Within 0.1% of v_g = c/n |
| Pulse broadening | < 1% over simulation domain |

### 4. PML boundary absorption

A plane wave incident on PML absorbing boundaries. Tests that reflections from the domain edges are negligible.

| Metric | Criterion |
|--------|-----------|
| Reflected power | < -40 dB for normal incidence |
| Reflected power | < -30 dB for 45° incidence |

### 5. Mie scattering (sphere)

Scattering from a dielectric sphere has an exact analytic solution (Mie theory). Tests the full 3D solver including curved geometry discretisation.

| Metric | Criterion |
|--------|-----------|
| Scattering cross-section | Within 2% of Mie theory |
| Near-field pattern | Spatial correlation > 0.98 |

## Performance Benchmarks

Simulation throughput on different GPU hardware:

| Grid Size | GPU | Steps | Wall Time | Throughput |
|-----------|-----|-------|-----------|------------|
| 100³ | B200 | 10,000 | ~30s | ~3.3×10¹⁰ cells·steps/s |
| 200³ | B200 | 20,000 | ~4 min | ~6.7×10¹⁰ cells·steps/s |
| 100³ | A100 | 10,000 | ~45s | ~2.2×10¹⁰ cells·steps/s |
| 200³ | A100 | 20,000 | ~7 min | ~3.8×10¹⁰ cells·steps/s |

Performance scales linearly with grid volume and step count.

## Convergence Behaviour

Typical convergence curve for a silicon waveguide simulation (200×50×50 grid):

| Steps | Relative Change | Status |
|-------|----------------|--------|
| 1,000 | 1.2×10⁻² | Transient |
| 5,000 | 3.4×10⁻⁴ | Settling |
| 10,000 | 8.7×10⁻⁶ | Near-converged |
| 15,000 | 2.1×10⁻⁷ | **Converged** (< 10⁻⁶ threshold) |

Early stopping at step 15,000 saves 25% of compute vs running the full 20,000 steps.

## Comparison with Reference Tools

MetoSim's FDTD results are validated against COMSOL Multiphysics and Lumerical FDTD for the benchmark structures listed above. Agreement is required before V1 General Availability.

| Structure | MetoSim vs COMSOL | MetoSim vs Lumerical |
|-----------|-------------------|----------------------|
| Si slab transmission | < 0.5% | < 0.5% |
| Waveguide mode neff | < 0.1% | < 0.1% |
| Mie scattering Qsca | < 2% | < 1% |
| Metasurface phase | < 3° | < 2° |

## Running Benchmarks

The benchmark suite runs in CI on every pull request:

```bash
pytest engine/tests/ -m physics -v
```

Physics benchmark tests are marked with `@pytest.mark.physics` and run on CPU (small grids) to validate numerical accuracy without requiring a GPU.

## Reporting Issues

If you observe results that deviate from expected physics, please file an issue on [GitHub](https://github.com/timetravel1408/metosim/issues) with:

1. Your simulation config (JSON or Python code)
2. The expected result (with reference/citation)
3. The actual MetoSim result
4. MetoSim version (`metosim.__version__`)
