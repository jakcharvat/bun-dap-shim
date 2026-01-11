import process from "node:process";
import { WebSocketDebugAdapter } from "bun-debug-adapter-protocol";

const adapter = new WebSocketDebugAdapter();
const HEADER_TERMINATOR = "\r\n\r\n";

class DAPProtocolHandler {
  #buffer = Buffer.alloc(0);
  #expectedLength: number | null = null;

  public processData(data: Buffer) {
    this.#buffer = Buffer.concat([this.#buffer, data]);

    while (this.#buffer.length > 0) {
      if (this.#expectedLength === null) {
        const headerEnd = this.#buffer.indexOf(HEADER_TERMINATOR);
        if (headerEnd === -1) break;

        const headers = this.#parseHeaders(this.#buffer.subarray(0, headerEnd));
        const contentLength = headers["Content-Length"];
        if (!contentLength) {
          throw new Error("Missing Content-Length header");
        }

        this.#expectedLength = parseInt(contentLength);
        this.#buffer = this.#buffer.subarray(headerEnd + HEADER_TERMINATOR.length);
      }

      if (this.#buffer.length >= this.#expectedLength) {
        const messageStr = this.#buffer.subarray(0, this.#expectedLength).toString("utf-8");

        try {
          const message = JSON.parse(messageStr);
          this.#handleMessage(message);
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }

        this.#buffer = this.#buffer.subarray(this.#expectedLength);
        this.#expectedLength = null;
      } else {
        break;
      }
    }
  }

  public sendMessage(message: any) {
    const jsonStr = JSON.stringify(message);
    const contentLength = Buffer.byteLength(jsonStr, "utf-8");
    const header = `Content-Length: ${contentLength}${HEADER_TERMINATOR}`;

    process.stdout.write(header, "ascii");
    process.stdout.write(jsonStr, "utf-8");
  }

  #parseHeaders(buff: Buffer): Record<string, string> {
    const rawHeaders = buff.toString("ascii");
    return Object.fromEntries(
      rawHeaders.split("\r\n").map((line) => {
        const split = line.split(":");
        if (split.length != 2) throw new Error(`Invalid header: ${line}`);
        return split;
      }),
    );
  }

  #handleMessage(message: any) {
    adapter.emit("Adapter.request", message);
  }
}

const protocolHandler = new DAPProtocolHandler();

process.stdin.on("data", (data) => {
  if (typeof data == "string") {
    data = Buffer.from(data, "utf-8");
  }

  protocolHandler.processData(data);
});

adapter.on("Adapter.response", (response) => {
  protocolHandler.sendMessage(response);
});

adapter.on("Adapter.event", (event) => {
  protocolHandler.sendMessage(event);
});

process.on("SIGINT", () => {
  adapter.close();
  process.exit(0);
});
