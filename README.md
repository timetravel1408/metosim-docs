# MetoSim Documentation

Developer documentation for the MetoSim meta-optics simulation platform.

**Live site:** [docs.metosim.com](https://docs.metosim.com)

## Development

```bash
npm install
npm start       # http://localhost:3000
```

## Build

```bash
npm run build   # output in build/
npm run serve   # preview production build
```

## Deploy

Push to `main` → GitHub Actions builds and deploys to GitHub Pages automatically.

## Structure

```
docs/
├── introduction.md
├── quickstart.md
├── platform/
│   ├── architecture.md
│   ├── simulation-engine.md
│   ├── inverse-design.md
│   └── metofab.md
├── api/
│   ├── overview.md
│   ├── authentication.md
│   ├── simulation-api.md
│   ├── inverse-design-api.md
│   └── fabrication-api.md
├── tutorials/
│   ├── first-simulation.md
│   ├── metamaterial-design.md
│   └── fabrication-workflow.md
├── sdk/
│   ├── python.md
│   └── javascript.md
└── research/
    ├── metamaterials.md
    └── benchmarks.md
```

Built with [Docusaurus](https://docusaurus.io/).
