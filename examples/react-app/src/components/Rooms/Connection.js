import { Button, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import { Duration } from "@mantle-cloud/channels-react";
import connectionDropImage from "../../images/connection-drop.png";

const makeId = function (length) {
  var result = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export function Connection({ channels, scope }) {
  const [userDrops, setUserDrops] = useState();

  useEffect(() => {
    channels.drop(`${scope}/users`, Duration.Connection, { user: makeId(5) });
  }, [channels, scope]);

  useEffect(() => {
    return channels.catch(setUserDrops, `${scope}/users`);
  }, [channels, scope]);

  const users = userDrops && userDrops.map((drop) => <div>{JSON.stringify(drop.data)}</div>);

  return (
    <>
      <Typography variant="p" component="div">
        <img
          src={connectionDropImage}
          alt={""}
          style={{ float: "left", width: 100, height: 100, filter: "invert(100%)" }}
        />
        Drops that only exist while client is connected
      </Typography>

      <Button
        variant="contained"
        onClick={() => {
          channels.drop(`${scope}/users`, Duration.Connection, { user: makeId(5) });
        }}>
        Drop user
      </Button>
      <div>{users}</div>
    </>
  );
}
