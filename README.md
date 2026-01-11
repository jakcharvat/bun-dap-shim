# bun-dap-shim

A Debug Adapter Protocol (DAP) shim for Bun that bridges communication between Bun's WebSocket debug
adapter and DAP clients communicating over standard IO (like Zed or Neovim). It connects to Bun's
debug adapter and forwards messages from a stdio connection with the client the Bun debug adapter,
which talks with the Bun inspector over a WebSocket.

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
