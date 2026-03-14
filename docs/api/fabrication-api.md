---
id: fabrication-api
title: Fabrication API
sidebar_position: 5
---

# Fabrication API

:::info Coming with MetoFab
The fabrication API will launch alongside the MetoFab platform. This page outlines the planned interface.
:::

## Overview

The fabrication API connects MetoSim simulation results to nanofabrication workflows. It handles GDS export, design rule checking, and process recipe generation.

## Planned Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/v1/fabrication/export-gds` | Export simulation geometry to GDS II |
| `POST` | `/v1/fabrication/drc` | Run design rule check |
| `POST` | `/v1/fabrication/recipe` | Generate fabrication process recipe |
| `GET` | `/v1/fabrication/pdks` | List available process design kits |

## GDS Export (Planned)

Convert a MetoSim simulation geometry directly to GDS II format:

```json
// POST /v1/fabrication/export-gds
{
  "job_id": "a1b2c3d4-...",
  "layer_mapping": {
    "Si": {"layer": 1, "datatype": 0},
    "SiO2": {"layer": 2, "datatype": 0}
  },
  "grid_resolution_nm": 1
}
```

**Response:**

```json
{
  "gds_url": "https://storage.metosim.io/gds/design.gds",
  "layers": [1, 2],
  "bounding_box_um": [4.0, 4.0],
  "polygon_count": 1247
}
```

## Design Rule Check (Planned)

Validate a design against foundry-specific rules before submission:

```json
// POST /v1/fabrication/drc
{
  "gds_url": "https://storage.metosim.io/gds/design.gds",
  "pdk": "generic_soi_220nm",
  "rules": {
    "min_feature_nm": 100,
    "min_spacing_nm": 80,
    "min_radius_nm": 50
  }
}
```

**Response:**

```json
{
  "passed": false,
  "violations": [
    {
      "rule": "min_spacing",
      "severity": "error",
      "location": [1.23, 0.45],
      "actual_nm": 62,
      "required_nm": 80
    }
  ],
  "summary": "1 error, 0 warnings"
}
```

## Integration Flow

```python
# 1. Run simulation in MetoSim
job = client.run(sim)
job.wait()

# 2. Export to GDS via MetoFab
gds = client.export_gds(job_id=job.job_id, pdk="generic_soi_220nm")

# 3. Run DRC
drc_result = client.run_drc(gds_url=gds.url, pdk="generic_soi_220nm")

if drc_result.passed:
    # 4. Generate fab recipe
    recipe = client.generate_recipe(gds_url=gds.url, process="ebl_si_220")
    print(f"Recipe ready: {recipe.url}")
```
