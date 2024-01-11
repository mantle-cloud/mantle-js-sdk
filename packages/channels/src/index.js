import { Channels } from "./Channels.js";
import { ConnectionStatus } from "./ConnectionStatus.js";
import { Duration } from "./Duration.js";
import { Size } from "./Size.js";

let _channelsInstance;

async function getChannels() {
  if (_channelsInstance) {
    return _channelsInstance;
  }

  if (window) {
    const { BrowserStorage } = await import("./storage/BrowserStorage.js");
    const { BrowserWebSocket } = await import("./websocket/BrowserWebSocket.js");
    _channelsInstance = new Channels(BrowserStorage, BrowserWebSocket);
  } else {
    throw new Error("Unsupported environment. Only browser is supported.");
  }

  return _channelsInstance;
}

export { getChannels, Size, Duration, ConnectionStatus };
