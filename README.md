# bun-dap-shim

A Debug Adapter Protocol (DAP) shim for Bun that bridges communication between Bun's WebSocket debug
adapter and DAP clients like VS Code or Zed. It connects to Bun's debug adapter and forwards
messages from the client over standard IO to the Bun debug adapter, which talks with the Bun
inspector over WebSockets.

## Setup

Install dependencies and build the shim:

```bash
bun install
bun run build
```

The shim is built to `dist/bun-dap-shim.js` as a standalone `node` script.

## Disclaimer

This shim is in no way a fully-featured DAP server. I just wanted to get Bun debugging working in
Zed, and this was the least painful way I found to do it. If the Bun team wants to adopt this and
maintain it officially, that would be great! :)
