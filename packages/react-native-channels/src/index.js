import { Channels, Size, Duration } from "@orbis/channels";
import { ReactNativeStorage } from "./ReactNativeStorage";

const storage = new ReactNativeStorage();
const _channelsInstance = new Channels(storage);

let channelsFunc = () => {
  return _channelsInstance;
};

export { channelsFunc as channels, Size, Duration };
