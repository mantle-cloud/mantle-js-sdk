class Channel {
  constructor(channelServer, id, storage) {
    this.id = id;
    this.channelServer = channelServer;
    this.storage = storage;
  }

  async connect() {
    console.error("Channel.connect not implemented");
  }

  drop(type, duration, data) {
    console.error("Channel.drop not implemented");
  }

  removeCatch(id) {
    console.error("Channel.removeCatch not implemented");
  }

  catch(type, listener) {
    console.error("Channel.catch not implemented");
  }

  disconnect() {
    console.error("Channel.disconnect not implemented");
  }
}
export { Channel };
