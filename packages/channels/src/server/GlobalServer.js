import { ChannelServer } from "./ChannelServer.js";
import { ConnectionStatus } from "../ConnectionStatus.js";
import { EventEmitter } from "eventemitter3";

const Status = {
  InProgress: 0,
  Complete: 1,
  Failed: 2,
};

const makeId = function (length) {
  var result = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

class GlobalServer extends ChannelServer {
  constructor(WebSocket, storage, serverEndpoint, credentials) {
    super();
    this._instanceId = makeId(5);
    this._WebSocket = WebSocket;
    this._channels = {};
    this._catches = {};
    this._connectionStatus = ConnectionStatus.Init;

    this._connectionError = null;
    this._eventEmmiter = new EventEmitter();
    this._sendTime = null;
    this._serverEndpoint = serverEndpoint;
    this._operations = {};
    this._storage = storage;

    this._credentials = credentials;

    this.connectToServer();
  }

  getClientId() {
    return this._clientId;
  }

  addStatusListener(fn) {
    fn(this._connectionStatus, this._serverEndpoint, this._connectionError);

    this._eventEmmiter.on(ConnectionStatus.Connected, () => {
      console.log("ConnectionStatus.Connected", this._serverEndpoint);
      fn(ConnectionStatus.Connected, this._serverEndpoint);
    });
    this._eventEmmiter.on(ConnectionStatus.Error, (error) => {
      fn(ConnectionStatus.Error, this._serverEndpoint, error);
    });
    this._eventEmmiter.on(ConnectionStatus.Connecting, (error) => {
      fn(ConnectionStatus.Connecting, this._serverEndpoint, error);
    });
    this._eventEmmiter.on(ConnectionStatus.Connected, (error) => {
      fn(ConnectionStatus.Connected, this._serverEndpoint, error);
    });
    this._eventEmmiter.on(ConnectionStatus.Authenticating, (error) => {
      fn(ConnectionStatus.Authenticating, this._serverEndpoint, error);
    });
  }

  addOperation(resolve, reject) {
    const operation = {
      id: makeId(32),
      status: Status.InProgress,
      resolve,
      reject,
    };
    this._operations[operation.id] = operation;
    return operation;
  }

  catch(channelId, listener, params, jwt = this._accessToken) {
    const sendAddCatch = async (id) => {
      await this.verifyConnection();

      function reject(error, params) {
        listener(null, error, params);
      }

      function resolve() {
        listener();
      }

      const operation = this.addOperation(resolve, reject);

      this._catches[id] = { listener };
      let msg = {
        cmd: "catch",
        id,
        channelId,
        params,
        operationId: operation.id,
        jwt: jwt,
      };

      this._ws.send(JSON.stringify(msg));
    };

    const id = makeId(32);
    sendAddCatch(id);
    return () => {
      this.deleteCatch(channelId, id);
    };
  }

  async deleteCatch(channelId, catchId) {
    await this.verifyConnection();

    this._sendTime = Date.now();

    let msg = {
      cmd: "deleteCatch",
      id: catchId,
      channelId,
      jwt: this._accessToken,
    };
    this._ws.send(JSON.stringify(msg));
  }

  async getDrops(channelId) {
    await this.verifyConnection();

    return new Promise((resolve, reject) => {
      this._sendTime = Date.now();

      const operation = this.addOperation(resolve, reject);

      let msg = {
        cmd: "getDrops",
        channelId,
        operationId: operation.id,
      };
      this._ws.send(JSON.stringify(msg));
    });
  }

  async deleteDrop(channelId, dropId) {
    await this.verifyConnection();

    return new Promise((resolve, reject) => {
      this._sendTime = Date.now();

      const operation = this.addOperation(resolve, reject);

      let msg = {
        cmd: "deleteDrop",
        id: dropId,
        channelId,
        operationId: operation.id,
        jwt: this._accessToken,
      };
      this._ws.send(JSON.stringify(msg));
    });
  }

  async updateDrop(channelId, dropId, data) {
    console.log("SDK: updateDrop", { channelId, dropId, data });
    await this.verifyConnection();

    return new Promise((resolve, reject) => {
      this._sendTime = Date.now();

      const operation = this.addOperation(resolve, reject);

      let msg = {
        cmd: "updateDrop",
        id: dropId,
        channelId,
        data,
        operationId: operation.id,
        jwt: this._accessToken,
      };

      console.log("SDK: updateDrop >> sending", msg);

      this._ws.send(JSON.stringify(msg));
    });
  }

  async drop(channelId, duration, data) {
    await this.verifyConnection();

    return new Promise((resolve, reject) => {
      this._sendTime = Date.now();

      const operation = this.addOperation(resolve, reject);
      const id = makeId(32);
      let msg = {
        cmd: "drop",
        id,
        channelId,
        duration: duration.code,
        data,
        operationId: operation.id,
        jwt: this._accessToken,
      };
      this._ws.send(JSON.stringify(msg));
    });
  }

  async verifyConnection() {
    switch (this._connectionStatus) {
      case ConnectionStatus.Init:
        await this.connectToServer();
        break;
      case ConnectionStatus.Connecting:
        // wait for connected status
        return new Promise((resolve, reject) => {
          this._eventEmmiter.on("connected", function () {
            resolve();
          });
          this._eventEmmiter.on("error", function (error) {
            reject(error);
          });
        });
        break;
      case ConnectionStatus.Connected:
      case ConnectionStatus.Authenticating:
        // OK
        break;
      case ConnectionStatus.Error:
        throw new Error("Unable to connect");
    }
  }

  async createAnonymousUser() {
    return new Promise((resolve, reject) => {
      const operation = this.addOperation(resolve, reject);
      let msg = {
        cmd: "registerAnonymousUser",
        operationId: operation.id,
      };
      this._ws.send(JSON.stringify(msg));
    });
  }

  async signInAnonymously(credentials) {
    return new Promise((resolve, reject) => {
      const operation = this.addOperation(resolve, reject);
      let msg = {
        cmd: "signInAnonymously",
        operationId: operation.id,
        ...credentials,
      };
      this._ws.send(JSON.stringify(msg));
    });
  }

  async clientAuth(credentials) {
    return new Promise((resolve, reject) => {
      const operation = this.addOperation(resolve, reject);
      let msg = {
        cmd: "clientAuth",
        operationId: operation.id,
        projectId: credentials.projectId,
        token: credentials.token,
      };
      this._ws.send(JSON.stringify(msg));
    });
  }

  async authenticate(resolve, reject) {
    this._connectionStatus = ConnectionStatus.Authenticating;
    this._eventEmmiter.emit(this._connectionStatus);

    try {
      const response = await this.clientAuth(this._credentials);

      console.log("AUTH response:", response);

      if (response.success) {
        this._clientId = response.clientId;
        this._connectionStatus = ConnectionStatus.Connected;
        this._eventEmmiter.emit(this._connectionStatus);

        resolve();
      } else {
        this._connectionStatus = ConnectionStatus.Error;
        this._eventEmmiter.emit(this._connectionStatus);

        reject(e);
      }
    } catch (e) {
      this._connectionStatus = ConnectionStatus.Error;
      this._eventEmmiter.emit(this._connectionStatus);

      reject(e);
    }
  }

  async connectToServer() {
    this._connectionStatus = ConnectionStatus.Connecting;
    this._connectionError = null;
    return new Promise((resolve, reject) => {
      this._ws = new this._WebSocket(this._serverEndpoint);

      this._ws.on("message", (str) => {
        const data = JSON.parse(str);
        if (data.cmd == "getDropsResponse" || data.cmd == "authResponse") {
          const operation = this._operations[data.operationId];
          operation.resolve(data);
        } else if (data.cmd == "drops") {
          const c = this._catches[data.catchId];

          if (c) {
            const updateTime = Date.now() - this._sendTime;
            c.listener(data.drops, null, { updateTime, catchId: data.catchId });
          }
        } else if (data.cmd == "error") {
          const operation = this._operations[data.operationId];
          operation.reject(new Error(`${data.name} [${data.code}] ${data.details}`));
        }
      });

      this._ws.on("open", () => {
        this._connectionStatus = ConnectionStatus.Connected;
        this._connectionError = null;
        this._eventEmmiter.emit("connected");

        this.authenticate(resolve, reject);

        // resolve();
      });

      this._ws.on("error", (err) => {
        this._connectionStatus = ConnectionStatus.Error;
        this._connectionError = new Error("Unable to connect ", err);
        this._eventEmmiter.emit("error", this._connectionError);
        console.error(err);
      });
    });
  }
}

export { GlobalServer };
