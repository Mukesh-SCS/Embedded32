# @embedded32/dashboard

Private web dashboard for real-time CAN/J1939 monitoring during local development.

## Overview

Browser-based dashboard components for monitoring Embedded32 simulations:

- **Bus metrics** — frames/sec and estimated bus load
- **PGN table** — browse decoded messages
- **DM1 viewer** — active fault codes
- **Filter and search panels** — narrow live traffic

This package is **private** and not published to npm. Use it from the monorepo:

```bash
cd Embedded32
npm ci
npm run build
cd embedded32-dashboard
npm run dev
```

## Development

```bash
npm run dev
npm run test
npm run typecheck
```

## Scope notes

- Requires a running simulation or gateway feeding dashboard state — not a hosted SaaS product
- SocketCAN and MQTT integration are local-lab workflows only
- Not part of the public GitHub Pages site

## License

MIT
