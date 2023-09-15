import { enablePromise, openDatabase } from "react-native-sqlite-storage";

enablePromise(true);

class ReactNativeStorage {
  _db = null;

  async _getDB() {
    if (!this._db) {
      this._db = await openDatabase({ name: "channels.db", location: "default" });
      // create table if not exists
      const query = `CREATE TABLE IF NOT EXISTS drops (
        id TEXT PRIMARY KEY,
        channel TEXT NOT NULL,
        type TEXT NOT NULL,
        duration INT NOT NULL,
        data TEXT NOT NULL
    );`;

      await this._db.executeSql(query);
    }

    return this._db;
  }

  async deleteDrop(channel, id) {
    const db = this._getDB();

    let query = `SELECT * FROM drops where channel="${channel}" and id="${id}"`;
    let results = await db.executeSql(query);
    let drop = results[0]?.rows?.item(0);

    query = `DELETE FROM drops where channel="${channel}" and id="${id}"`;
    await db.executeSql(query);
    return drop;
  }

  async addDrop(channel, type, duration, data, id) {
    const db = await this._getDB();
    try {
      await db.executeSql("INSERT or REPLACE into drops (channel,id,type,duration,data) values ( ?, ?, ?, ?, ?)", [
        channel,
        id,
        type,
        duration.code,
        JSON.stringify(data),
      ]);
    } catch (error) {
      console.error(error);
      throw Error("Failed to add drop");
    }
  }

  async deleteDrops(channel, type, duration) {
    const db = await this._getDB();
    let query = `DELETE FROM drops where channel="${channel}"`;

    if (type) {
      query += ` and type="${type}"`;
    }

    if (duration) {
      query += ` and duration="${duration}"`;
    }

    await db.executeSql(query);
  }

  async getDrops(channel, type, duration) {
    const db = await this._getDB();

    try {
      const drops = [];

      let query = `SELECT * FROM drops where channel="${channel}"`;

      if (type) {
        query += ` and type="${type}"`;
      }

      if (duration) {
        query += ` and duration="${duration}"`;
      }

      const results = await db.executeSql(query);
      results.forEach((result) => {
        for (let index = 0; index < result.rows.length; index++) {
          let drop = result.rows.item(index);
          drop.data = JSON.parse(drop.data);
          drops.push(drop);
        }
      });
      return drops;
    } catch (error) {
      console.error(error);
      throw Error("Failed to get drops !!!");
    }
  }
}

export { ReactNativeStorage };
