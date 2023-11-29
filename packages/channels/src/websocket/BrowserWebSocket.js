class BrowserWebSocket {
  constructor(url) {
    this._ws = new WebSocket(url);
  }

  on(event, fn) {
    this._ws.addEventListener(event, (event) => {
      fn(event.data);
    });
  }

  send(data) {
    this._ws.send(data);
  }

  close() {
    this._ws.close();
  }
}

export { BrowserWebSocket };
