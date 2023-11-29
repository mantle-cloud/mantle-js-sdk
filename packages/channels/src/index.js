console.log("test 4");
import { Duration } from "./Duration.js";
import { Channels } from "./Channels.js";
import { Size } from "./Size.js";
import { ConnectionStatus } from "./ConnectionStatus.js";

let _channelsInstance;

async function getChannels() {
  console.log("channels...");
  if (_channelsInstance) {
    return _channelsInstance;
  }

  let Storage, Websocket;

  if (window) {
    console.log("Browser");
    const { BrowserStorage } = await import("./storage/BrowserStorage.js");
    const { BrowserWebSocket } = await import("./websocket/BrowserWebSocket.js");
    _channelsInstance = new Channels(BrowserStorage, BrowserWebSocket);
  } else {
    console.log("Not browser");
    // const { NodeStorage } = await import("./storage/NodeStorage.js");
    // const { NodeWebSocket } = await import("./websocket/NodeWebSocket.js");
    _channelsInstance = new Channels(NodeStorage, NodeWebSocket);
  }

  return _channelsInstance;
}

export { getChannels, Size, Duration, ConnectionStatus };
