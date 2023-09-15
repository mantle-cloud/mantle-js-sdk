import { Channels, Size, Duration, ConnectionStatus } from "@orbis/channels";
import { BrowserStorage } from "./BrowserStorage";
import { BrowserWebSocket } from "./BrowserWebSocket";

console.log("Browser storage...");
const storage = new BrowserStorage();
const _channelsInstance = new Channels(storage, BrowserWebSocket);

let channelsFunc = () => {
  return _channelsInstance;
};

export { channelsFunc as channels, Size, Duration, ConnectionStatus };
