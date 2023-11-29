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
    const domain = config.domain || "webcomms.biz";
    const port = config.port || 9080;

    console.log(`INTIALISE ${domain} ${port}`);

    const serverEndpoint = `ws://${domain}:${port}`;
    this._globalServer = new GlobalServer(this._websocket, this._storage, serverEndpoint, config);
  }

  // async getUserCredentials() {
  //   return await this._storage.getUserCredentials();
  // }

  // async getUserCredentials() {
  //   return await this._storage.getUserCredentials();
  // }

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

  async deleteDrop(channelId, dropId, size = Size.Global) {
    if (size == Size.Global) {
      await this._globalServer.deleteDrop(channelId, dropId);
    } else if (size == Size.Local && !this._localServer) {
    }
  }

  async drop(channelId, duration, data, size = Size.Global) {
    if (size == Size.Global) {
      await this._globalServer.drop(channelId, duration, data);
    } else if (size == Size.Local && !this._localServer) {
      await this._localServer.connect(this, channelId);
    }
  }

  // async connectLocal(channelId) {
  //   if (!this._localServer) {
  //     this._localServer = new LocalServer(this._storage);
  //   }
  //   return await this._localServer.connect(this, channelId);
  // }

  // async connectGlobal(channelId) {
  //   if (!this._globalServer) {
  //     this._globalServer = new GlobalServer(this._websocket);
  //   }
  //   return await this._globalServer.connect(this, channelId);
  // }

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
