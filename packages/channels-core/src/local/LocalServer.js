import { Channel } from "../Channel.js";
import { ChannelServer } from "../ChannelServer.js";
import { Duration } from "../Duration.js";

class LocalServer extends ChannelServer {
  channels = {};
  hasInitialisedStorage = false;

  constructor(storage) {
    super();
    this._storage = storage;
  }

  async connect(channelId) {
    // console.log("LocalServer connect!", mantle, channelId, storage);
    let channel = new LocalChannel(this, channelId, this._storage);
    await channel.connect();
    return channel;
  }

  close() {}
}

class LocalChannel extends Channel {
  drops = [];
  catches = [];

  generateUUID() {
    // Public Domain/MIT
    var d = new Date().getTime(); //Timestamp
    var d2 = (typeof performance !== "undefined" && performance.now && performance.now() * 1000) || 0; //Time in microseconds since page-load or 0 if unsupported
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = Math.random() * 16; //random number between 0 and 16
      if (d > 0) {
        //Use timestamp until depleted
        r = (d + r) % 16 | 0;
        d = Math.floor(d / 16);
      } else {
        //Use microseconds since page-load if supported
        r = (d2 + r) % 16 | 0;
        d2 = Math.floor(d2 / 16);
      }
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  async connect() {}

  async deleteDrop(id) {
    let deletedDrop = await this.storage.deleteDrop(id);
    this.checkCatchesForType(deletedDrop.type);
  }

  async drop(type, duration, data, id = this.generateUUID()) {
    await this.storage.addDrop(`channel_${this.id}`, type, duration, data, id);

    await this.checkCatchesForType(type);

    if (duration == Duration.Instant) {
      await this.storage.deleteDrop(id);
    }
  }

  removeCatch(id) {
    this.catches = this.catches.filter((e) => id != e.id);
  }

  catch(type, listener) {
    // console.log("LOCAL CATCH", type);
    // console.log("  before", this.catches);
    const id = this.generateUUID();
    this.catches.push({ type, listener, id });

    // console.log("  after", this.catches);
    this.checkCatchesForType(type);

    return id;
  }

  async disconnect() {}

  async checkCatchesForType(type) {
    let matchingDrops = await this.storage.getDrops(`channel_${this.id}`, type);

    console.log("matching drops", matchingDrops);
    const promises = [];
    const listeners = {};

    // const dropsLeft = matchingDrops.length - 1;
    let dropIndex = 0;
    let finished = false;
    let moreListeners = true;
    console.log("+++");
    while (dropIndex < matchingDrops.length && !finished && moreListeners) {
      console.log("---");
      moreListeners = false;
      for (let c of this.catches) {
        console.log("c = ", c);
        if (c.type == type) {
          const drop = matchingDrops[dropIndex++];
          console.log(">>> ", drop);
          c.listener([drop]);

          if (drop.duration == Duration.UntilCaught.code) {
            console.log(">>> deleteDrop", drop.id);
            promises.push(this.storage.deleteDrop(drop.id));
          }

          if (dropIndex >= matchingDrops.length) {
            finished = true;
            break;
          }
          moreListeners = true;
        }
      }
    }
    // matchingDrops.forEach((drop) => {});

    // this.catches.forEach((c) => {
    //   if (c.type == type) {
    //     c.listener(matchingDrops);

    //     for (drop in matchingDrops) {
    //       promises.push(this.storage.deleteDrop(drop.id));
    //     }
    //   }
    // });

    const result = await Promise.all(promises);

    console.log(result);
  }
}

export { LocalServer };
