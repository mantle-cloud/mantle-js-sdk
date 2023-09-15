import sqlite3 from "sqlite3";

let _db;

class NodeStorage {
  async _getDB() {
    return new Promise((resolve, reject) => {
      if (!_db) {
        const db = new sqlite3.Database("./channels.db");

        // create table if not exists
        const query = `CREATE TABLE IF NOT EXISTS drops (
        id TEXT PRIMARY KEY,
        channel TEXT NOT NULL,
        type TEXT NOT NULL,
        duration INT NOT NULL,
        data TEXT NOT NULL
    );`;

        db.run(query, (err) => {
          if (err) {
            reject(err);
          } else {
            _db = db;
            resolve(_db);
          }
        });
      } else {
        resolve(_db);
      }
    });
  }

  async getDrops(channel, type, duration) {
    const db = await this._getDB();

    let query = `SELECT * FROM drops where channel=$channel`;
    let params = { $channel: channel };

    if (type) {
      query += ` and type=$type`;
      params.$type = type;
    }

    if (duration) {
      query += ` and duration=$duration`;
      params.$duration = duration;
    }

    return new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }

        const drops = rows.map((row) => {
          row.data = JSON.parse(row.data);
          return row;
        });

        resolve(drops);
      });
    });
  }

  async deleteDrops(channel, type, duration) {
    const db = await this._getDB();
    return new Promise((resolve, reject) => {
      let query = "DELETE FROM drops where channel=$channel";
      const params = { $channel: channel };

      if (type) {
        query += " and type=$type";
        params.$type = type;
      }

      if (duration) {
        query += " and duration=$duration";
        params.$duration = duration;
      }

      db.run(query, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async addDrop(channel, type, duration, data, id) {
    const db = await this._getDB();

    return new Promise((resolve, reject) => {
      db.run(
        "INSERT or REPLACE into drops (channel,id,type,duration,data) values ( ?, ?, ?, ?, ?)",
        [channel, id, type, duration.code, JSON.stringify(data)],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  async deleteDrop(channel, id) {
    const db = this._getDB();

    let query = `SELECT * FROM drops where channel=$channel and id=$id`;
    const params = { $id: id, $channel: channel };

    return new Promise((resolve, reject) => {
      db.get(query, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          db.run("DELETE FROM drops where channel=$channel and id=$id", { $channel: channel, $id: id }, (err) => {
            if (err) {
              reject(err);
            } else {
              row.data = JSON.parse(row.data);
              resolve(row);
            }
          });
        }
      });
    });
  }
}

export { NodeStorage };
