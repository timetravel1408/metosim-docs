---
id: authentication
title: Authentication
sidebar_position: 2
---

# Authentication

All MetoSim API endpoints (except `/health` and `/metrics`) require authentication via API key.

## Getting an API Key

1. Sign up at [metosim.com](https://metosim.com)
2. Navigate to **Dashboard → API Keys**
3. Click **Generate New Key**
4. Copy the key — it's only shown once

Keys are prefixed with `mts_` for easy identification.

## Using Your Key

### HTTP Header (all requests)

```
Authorization: Bearer mts_your_api_key_here
```

### curl example

```bash
curl -X POST https://api.metosim.io/v1/simulations \
  -H "Authorization: Bearer mts_abc123def456" \
  -H "Content-Type: application/json" \
  -d '{"solver": "fdtd", ...}'
```

### Python SDK

```python
# Option 1: Direct
client = metosim.MetoSimClient(api_key="mts_abc123def456")

# Option 2: Environment variable
export METOSIM_API_KEY=mts_abc123def456

client = metosim.MetoSimClient()  # auto-reads env var
```

## Security

- Keys are stored as **SHA-256 hashes** — we never see your plaintext key after generation
- All API traffic is encrypted with **TLS 1.3**
- Keys can be **revoked** instantly from the dashboard
- Failed auth returns `401` with no information leakage

## Error Responses

**Missing key:**

```json
// 401 Unauthorized
{
  "detail": "API key required. Include 'Authorization: Bearer <key>' header."
}
```

**Invalid key:**

```json
// 401 Unauthorized
{
  "detail": "Invalid API key format."
}
```

## Best Practices

- Store keys in environment variables, never in source code
- Use separate keys for development and production
- Rotate keys periodically
- Revoke compromised keys immediately
