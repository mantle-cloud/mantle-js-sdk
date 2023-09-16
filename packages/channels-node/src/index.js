import { Channels, Duration, Size } from "@mantle-cloud/channels-core";

import { NodeStorage } from "./NodeStorage";
import { NodeWebSocket } from "./NodeWebsocket";

const storage = new NodeStorage();

const _channelsInstance = new Channels(storage, NodeWebSocket);

console.log("channels-node - 3");

let channelsFunc = () => {
  return _channelsInstance;
};

export { channelsFunc as channels, Size, Duration };
