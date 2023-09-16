import { Channels, Duration, Size } from "@mantle-cloud/channels-core";

import { NodeStorage } from "./NodeStorage";
import { NodeWebSocket } from "./NodeWebsocket";

const storage = new NodeStorage();

const _channelsInstance = new Channels(storage, NodeWebSocket);

let channelsFunc = () => {
  return _channelsInstance;
};

export { channelsFunc as channels, Size, Duration };
