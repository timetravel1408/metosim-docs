---
id: javascript
title: JavaScript SDK
sidebar_position: 2
---

# JavaScript SDK

:::info Coming Soon
The JavaScript/TypeScript SDK is planned for Q3 2026. For now, use the [Python SDK](/sdk/python) or call the [REST API](/api/overview) directly.
:::

## Planned Interface

```typescript
import { MetoSim } from '@metosim/sdk';

const client = new MetoSim({ apiKey: 'mts_your_key' });

const job = await client.simulate({
  solver: 'fdtd',
  wavelength: 1.55e-6,
  structures: [
    { type: 'box', center: [0, 0, 0], size: [1e-6, 1e-6, 0.22e-6], material: 'Si' },
  ],
  domain: { size: [4e-6, 4e-6, 4e-6], resolution: 20e-9 },
});

// Poll until complete
const result = await job.waitForCompletion();
console.log(`Status: ${result.status}`);
console.log(`Duration: ${result.durationSeconds}s`);

// Download HDF5 result
const buffer = await result.download();
```

## Planned Features

- Full TypeScript types for all API schemas
- Promise-based async/await interface
- Automatic retry with exponential backoff
- Streaming result download with progress callback
- Browser and Node.js support
- WebSocket support for real-time optimization updates (V4)

## Using the REST API Directly

Until the JS SDK ships, you can call the API with any HTTP client:

```javascript
const API_URL = 'https://api.metosim.io/v1';
const API_KEY = 'mts_your_key';

// Submit simulation
const response = await fetch(`${API_URL}/simulations`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    solver: 'fdtd',
    domain: { size: [4e-6, 4e-6, 4e-6], resolution: 20e-9 },
    source: { wavelength: 1.55e-6 },
    structures: [
      { type: 'box', center: [0, 0, 0], size: [1e-6, 1e-6, 0.22e-6], material: 'Si' },
    ],
  }),
});

const { job_id } = await response.json();
console.log(`Submitted: ${job_id}`);

// Poll status
const poll = async () => {
  const res = await fetch(`${API_URL}/simulations/${job_id}`, {
    headers: { 'Authorization': `Bearer ${API_KEY}` },
  });
  return res.json();
};

let status = await poll();
while (status.status !== 'COMPLETED' && status.status !== 'FAILED') {
  await new Promise(r => setTimeout(r, 2000));
  status = await poll();
  console.log(`Status: ${status.status}`);
}

// Download results
if (status.result_url) {
  const result = await fetch(status.result_url);
  const blob = await result.blob();
  // Save or process HDF5 blob
}
```

## Contributing

Interested in helping build the JS SDK? See the [GitHub repo](https://github.com/timetravel1408/metosim) for contribution guidelines.
