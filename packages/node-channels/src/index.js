import { Channels, Size, Duration } from "@orbis/channels";
import { NodeStorage } from "./NodeStorage";
import { NodeWebSocket } from "./NodeWebsocket";

const storage = new NodeStorage();

const _channelsInstance = new Channels(storage, NodeWebSocket);

let channelsFunc = () => {
  return _channelsInstance;
};

export { channelsFunc as channels, Size, Duration };
