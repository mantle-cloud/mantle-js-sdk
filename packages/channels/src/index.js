console.log("test 4");

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
    const { NodeStorage } = await import("./storage/NodeStorage.js");
    const { NodeWebSocket } = await import("./websocket/NodeWebSocket.js");
    _channelsInstance = new Channels(NodeStorage, NodeWebSocket);
  }

  return _channelsInstance;
}

export { getChannels, Size, Duration, ConnectionStatus };
