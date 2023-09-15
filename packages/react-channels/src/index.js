import { useState } from "react";

const useChannels = function () {
  const [channels, setChannels] = useState();

  return { channels };
};

export { useChannels };

// import { Channels, Size, Duration } from "@orbis/channels";
// import { NodeStorage } from "./NodeStorage";
// import { NodeWebSocket } from "./NodeWebsocket";

// const storage = new NodeStorage();

// const ReactWebSocket = {};
// const storage = {};

// const _channelsInstance = new Channels(storage, ReactWebSocket);

// let channelsFunc = () => {
//   return _channelsInstance;
// };

// export { channelsFunc as channels, Size, Duration };
