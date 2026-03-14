---
id: metamaterials
title: Metamaterials & Meta-Optics
sidebar_position: 1
---

# Metamaterials & Meta-Optics

An overview of the physics and applications behind MetoSim's target domain.

## What are metamaterials?

Metamaterials are engineered structures with properties not found in nature. They derive their behaviour from sub-wavelength geometry rather than chemical composition. In optics, **meta-optics** (or **metasurfaces**) are ultrathin 2D arrays of nanostructures that manipulate light at the sub-wavelength scale.

Unlike conventional optics (lenses, mirrors, prisms) that rely on gradual phase accumulation through bulk material, metasurfaces impart abrupt phase shifts at an interface — enabling flat, lightweight, and mass-producible optical components.

## Key concepts

### Metasurfaces

A metasurface is a 2D array of **meta-atoms** — nano-pillars, nano-fins, or nano-holes — patterned on a substrate. Each meta-atom introduces a local phase shift to transmitted or reflected light. By spatially varying the meta-atom geometry, you engineer the output wavefront.

**Phase control mechanisms:**
- **Propagation phase** — varies with pillar height and refractive index
- **Geometric (Pancharatnam-Berry) phase** — varies with orientation angle of anisotropic elements
- **Resonant phase** — varies near Mie resonances of the nanostructure

### Photonic crystals

Periodic dielectric structures with photonic bandgaps — frequency ranges where light propagation is forbidden. Used for waveguiding, filtering, and cavity enhancement. MetoSim's FDTD solver with periodic boundary conditions is well-suited for photonic crystal simulation.

### Plasmonic nanostructures

Metal nanoparticles and nano-antennas that support surface plasmon resonances — collective oscillations of conduction electrons. Used for sensing (SERS, LSPR), enhanced absorption, and sub-diffraction field confinement. MetoSim includes Drude-model metals (Au, Al) for plasmonic simulations.

## Applications

### Metalenses

Flat lenses using metasurface phase profiles. Replace curved glass with a single patterned surface under 1 μm thick. Applications in smartphone cameras, AR/VR optics, microscopy, and LIDAR.

### Optical computing

Metasurfaces that perform mathematical operations (differentiation, convolution) on optical signals at the speed of light. Potential for ultra-low-power analog computing.

### Quantum photonics

Metasurfaces for single-photon source enhancement, entangled photon generation, and quantum state manipulation. Meta-optics can create compact quantum optical circuits on-chip.

### Sensing and imaging

- **Biosensing** — plasmonic metasurfaces detect molecular binding via resonance shifts
- **Hyperspectral imaging** — metasurface spectral filters replace bulky spectrometers
- **Thermal imaging** — metamaterial absorbers for IR detection
- **Holography** — metasurface holograms encode amplitude and phase

### AR/VR and displays

- Waveguide couplers for augmented reality glasses
- Compact near-eye displays with metasurface optics
- Varifocal metalenses for dynamic depth-of-field

## Why simulation matters

Meta-optics design requires accurate electromagnetic simulation because:

1. **Sub-wavelength features** — geometry is smaller than the operating wavelength; ray optics fails
2. **Wave interference** — performance depends on precise phase relationships between meta-atoms
3. **Fabrication sensitivity** — nm-scale geometry variations change optical response dramatically
4. **Large design spaces** — millions of possible configurations require computational exploration

MetoSim addresses this by providing cloud-GPU-accelerated FDTD with a Python-first workflow, enabling rapid iteration on metasurface designs without local HPC resources.

## Further reading

- Kildishev, A.V., Boltasseva, A. & Shalaev, V.M. "Planar Photonics with Metasurfaces" *Science* 339, 1232009 (2013)
- Yu, N. & Capasso, F. "Flat optics with designer metasurfaces" *Nature Materials* 13, 139–150 (2014)
- Chen, W.T., Zhu, A.Y. & Capasso, F. "Flat optics with dispersion-engineered metasurfaces" *Nature Reviews Materials* 5, 604–620 (2020)
