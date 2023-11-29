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

  catch(listener, channelId, params, jwt = this._accessToken) {
    const sendAddCatch = async (id) => {
      console.log("add Catch...", { channelId, params, jwt });

      await this.verifyConnection();

      console.log("> verified");

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

      console.log("> TX:", msg);
    };

    console.log("GLOBAL SERVER, CATCH", { channelId, params, jwt });
    const id = makeId(32);
    sendAddCatch(id);
    return () => {
      console.log("DELETE CATCH");
      this.deleteCatch(channelId, id);
    };
  }

  async deleteCatch(channelId, catchId) {
    await this.verifyConnection();

    this._sendTime = Date.now();

    console.log(this._instanceId, "delete catch", channelId, catchId);

    let msg = {
      cmd: "deleteCatch",
      id: catchId,
      channelId,
      jwt: this._accessToken,
    };
    this._ws.send(JSON.stringify(msg));
  }

  async deleteDrop(channelId, dropId) {
    await this.verifyConnection();

    return new Promise((resolve, reject) => {
      this._sendTime = Date.now();

      const operation = this.addOperation(resolve, reject);

      console.log(this._instanceId, "delete drop", channelId, dropId);

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

  async drop(channelId, duration, data) {
    await this.verifyConnection();

    return new Promise((resolve, reject) => {
      this._sendTime = Date.now();

      console.log(this._instanceId, "add drop", channelId, duration, data);

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
        console.log("verifyConnection A");
        await this.connectToServer();
        console.log("verifyConnection A connected");
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
    console.log("CREDENTIALS", "creating anonymous user...");

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
    console.log("CREDENTIALS", "signInAnonymously...");

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
    console.log("CREDENTIALS", "clientAuth...", credentials);

    return new Promise((resolve, reject) => {
      const operation = this.addOperation(resolve, reject);
      let msg = {
        cmd: "clientAuth",
        operationId: operation.id,
        apiKey: credentials.apiKey,
        projectId: credentials.projectId,
      };
      this._ws.send(JSON.stringify(msg));
    });
  }

  async authenticate(resolve, reject) {
    this._connectionStatus = ConnectionStatus.Authenticating;
    this._eventEmmiter.emit(this._connectionStatus);

    try {
      const response = await this.clientAuth(this._credentials);

      console.log("Authorized !!");

      this._connectionStatus = ConnectionStatus.Connected;
      this._eventEmmiter.emit(this._connectionStatus);

      resolve();
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
      console.log("ConnectionStatus: Connected to ", this._serverEndpoint);

      this._ws.on("message", (str) => {
        console.log("<<  message", str);
        const data = JSON.parse(str);
        if (data.cmd == "authResponse") {
          const operation = this._operations[data.operationId];
          operation.resolve(data);
        } else if (data.cmd == "drops") {
          const c = this._catches[data.catchId];

          if (c) {
            const updateTime = Date.now() - this._sendTime;
            console.log(this._instanceId, data.catchId, "update time:", updateTime);
            c.listener(data.drops, null, { updateTime, catchId: data.catchId });
          }
        } else if (data.cmd == "error") {
          const operation = this._operations[data.operationId];

          console.log("RECV [error] ", data, operation);
          operation.reject(new Error(`${data.name} [${data.code}] ${data.details}`));
        } else {
          console.log("RECV ", data);
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