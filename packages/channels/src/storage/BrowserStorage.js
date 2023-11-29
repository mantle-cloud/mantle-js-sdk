class BrowserStorage {
  _db = null;

  async _getDB() {
    if (!this._db) {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open("ChannelDatabase");
        request.onerror = (event) => {
          reject(event);
        };
        request.onsuccess = (event) => {
          this._db = event.target.result;
          resolve(this._db);
        };

        request.onupgradeneeded = (event) => {
          const db = event.target.result;

          const objectStore = db.createObjectStore("drops", { keyPath: "id" });

          objectStore.createIndex("cdt_idx", ["channel", "type", "duration"], { unique: false });
          objectStore.createIndex("cd_idx", ["channel", "type"], { unique: false });
          objectStore.createIndex("c_idx", ["channel"], { unique: false });
          objectStore.createIndex("t_idx", ["type"], { unique: false });

          db.createObjectStore("credentials", { keyPath: "uid" });
        };
      });
    }

    return this._db;
  }

  async getDrops(channel, type, duration) {
    const db = await this._getDB();
    return new Promise((resolve, reject) => {
      const dropObjectStore = db.transaction("drops", "readwrite").objectStore("drops");

      let index, key;

      if (channel && type && duration) {
        index = dropObjectStore.index("cdt_idx");
        key = [channel, type, duration.code];
      } else if (channel && type) {
        index = dropObjectStore.index("cd_idx");
        key = [channel, type];
      } else if (channel) {
        index = dropObjectStore.index("c_idx");
        key = [channel];
      } else if (type) {
        index = dropObjectStore.index("t_idx");
        key = [type];
      }

      let request = index.openCursor(key);

      let drops = [];
      request.onsuccess = function () {
        let cursor = request.result;
        if (cursor) {
          let drop = cursor.value;
          drop.data = JSON.parse(drop.data);
          drops.push(drop);
          cursor.continue();
        } else {
          resolve(drops);
        }
      };
    });
  }

  async deleteDrops(channel, type, duration) {
    const db = await this._getDB();
    return new Promise((resolve, reject) => {
      const dropObjectStore = db.transaction("drops", "readwrite").objectStore("drops");

      let typeIndex = dropObjectStore.index("cdt_idx");
      let request = typeIndex.openCursor([channel, type, duration.code]);

      request.onsuccess = function () {
        let cursor = request.result;
        if (cursor) {
          dropObjectStore.delete(cursor.value.id);
          cursor.continue();
        } else {
          resolve();
        }
      };
    });
  }

  async addDrop(channel, type, duration, data, id) {
    const db = await this._getDB();

    const dropObjectStore = db.transaction("drops", "readwrite").objectStore("drops");

    dropObjectStore.add({
      channel,
      id,
      type,
      duration: duration.code,
      data: JSON.stringify(data),
    });
  }

  async deleteDrop(id) {
    const db = await this._getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction("drops", "readwrite");
      const objectStore = transaction.objectStore("drops");
      const request = objectStore.delete(id);
      request.onerror = (event) => {
        reject(err);
      };
      request.onsuccess = (event) => {
        resolve();
      };
    });
  }

  async saveUserCredentials(credentials) {
    const db = await this._getDB();

    return new Promise((resolve, reject) => {
      const credentialsObjectStore = db.transaction("credentials", "readwrite").objectStore("credentials");

      const request = credentialsObjectStore.add(credentials);

      request.onerror = (event) => {
        reject(err);
      };
      request.onsuccess = (event) => {
        resolve();
      };
    });
  }

  async getUserCredentials() {
    const db = await this._getDB();

    return new Promise((resolve, reject) => {
      const credentialsObjectStore = db.transaction("credentials", "readwrite").objectStore("credentials");

      console.log("CRED A");
      let request = credentialsObjectStore.openCursor();

      console.log("CRED B");
      request.onsuccess = function () {
        console.log("CRED C");
        let cursor = request.result;
        if (cursor) {
          // let drop = cursor.value;
          // drop.data = JSON.parse(drop.data);
          // drops.push(drop);
          // cursor.continue();

          console.log("CRED D");
          resolve(cursor.value);
        } else {
          console.log("CRED E");
          resolve();
        }
      };
      request.onerror = (event) => {
        console.log("CRED D");
        reject(new Error("DB failed to open cursor"));
      };
    });
  }
}

export { BrowserStorage };
