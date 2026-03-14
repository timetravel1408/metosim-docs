---
id: metofab
title: MetoFab
sidebar_position: 4
---

# MetoFab — Nanofabrication Platform

:::info Status
MetoFab is in planning. This page outlines the vision and integration with MetoSim.
:::

## Overview

MetoFab bridges the gap between simulation and physical fabrication. It takes optimized designs from MetoSim and prepares them for nanofabrication processes — electron-beam lithography (EBL), photolithography, focused ion beam (FIB), and atomic layer deposition (ALD).

## The Meto Pipeline

```
MetoSim (Simulation)
    │
    │  Optimized geometry + material spec
    ↓
MetoFab (Fabrication)
    │
    │  GDS files + process recipes + DRC
    ↓
MetoLab (Validation)
    │
    │  Measured optical response
    ↓
Compare with simulation → iterate
```

## Planned Capabilities

### Design Export
- **GDS II export** from MetoSim simulation geometries
- Automatic layer assignment based on material stack
- Design rule checking (DRC) for minimum feature size, spacing, and overlap

### Process Integration
- Fab recipe generation from material + geometry specifications
- Dose correction maps for proximity effect compensation (EBL)
- Etch profile prediction from simulation geometry
- Multi-layer alignment mark generation

### Foundry Compatibility
- Process design kits (PDKs) for common photonic foundries
- Compliance checking against foundry-specific design rules
- Automated tapeout preparation

## Integration with MetoSim

MetoSim V4's inverse design will include fabrication-aware constraints:

```python
design_region = metosim.DesignRegion(
    materials=("Air", "Si"),
    min_feature_size=100e-9,      # EBL resolution limit
    min_spacing=80e-9,            # minimum gap between features
    connectivity="connected",      # no floating islands
    symmetry="4-fold",            # exploit crystal symmetry
)
```

These constraints ensure that optimized designs are physically manufacturable — closing the sim-to-fab gap.

## Data Format

MetoFab will use a structured JSON specification that includes:

```json
{
  "design_id": "metosim-job-abc123",
  "materials": [
    {"layer": 1, "material": "Si", "thickness_nm": 220},
    {"layer": 2, "material": "SiO2", "thickness_nm": 2000}
  ],
  "process": {
    "lithography": "ebl",
    "etch": "reactive_ion",
    "min_feature_nm": 100
  },
  "gds_file": "design.gds",
  "drc_passed": true
}
```

This structured handoff eliminates the manual translation between simulation parameters and fab process specs that plagues current workflows.
