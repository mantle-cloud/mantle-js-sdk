import { GlobalServer } from "./server/GlobalServer.js";
import { Size } from "./Size.js";

const DefaultChannel = "_default_";

class Channels {
  _localServer = null;
  _globalServer = null;
  _channels = [];
  _catches = {};

  constructor(storage, awebsocket) {
    console.log("CHANNELS constructor storage: ", storage);
    console.log("CHANNELS constructor websocket: ", awebsocket);

    this._storage = storage;
    this._websocket = awebsocket;
  }

  async initialise(config) {
    const domain = config.domain || "channels.mantlecloud.com";
    const port = config.port || 443;
    const protocol = config.protocol || "wss";

    console.log(`INTIALISE ${protocol}://${domain}:${port},  User:${config.user}`);

    const serverEndpoint = `${protocol}://${domain}:${port}/ws`;
    this._globalServer = new GlobalServer(this._websocket, this._storage, serverEndpoint, config);
  }

  addStatusListener(fn, size = Size.Global) {
    if (size == Size.Global) {
      this._globalServer.addStatusListener(fn);
    } else if (size == Size.Local && !this._localServer) {
    }
  }

  catch(listener, channelId, params, jwt, size = Size.Global) {
    if (size == Size.Global) {
      return this._globalServer.catch(listener, channelId, params, jwt);
    } else if (size == Size.Local && !this._localServer) {
      return this._localServer.connect(this, channelId);
    }
  }

  async deleteDrop(drop, size = Size.Global) {
    if (size == Size.Global) {
      await this._globalServer.deleteDrop(drop.channelId, drop.id);
    } else if (size == Size.Local && !this._localServer) {
    }
  }

  async updateDrop(drop, data) {
    await this._globalServer.updateDrop(drop.channelId, drop.id, data);
  }

  async drop(channelId, duration, data, size = Size.Global) {
    if (size == Size.Global) {
      await this._globalServer.drop(channelId, duration, data);
    } else if (size == Size.Local && !this._localServer) {
      await this._localServer.connect(this, channelId);
    }
  }

  getClientId() {
    return this._globalServer.getClientId();
  }

  disconnectChannel(channel) {
    const index = this._channels.indexOf(channel);
    if (index > -1) {
      this._channels.splice(index, 1);
    }
  }

  getChannel(channelId) {
    return this._channels.find((c) => {
      return c.id === channelId;
    });
  }

  close() {
    this._localServer && this._localServer.close();
    this._globalServer && this._globalServer.close();
  }
}

export { Channels };
