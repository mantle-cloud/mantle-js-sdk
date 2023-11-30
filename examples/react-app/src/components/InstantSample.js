import { useCallback, useEffect, useState } from "react";
import { Message } from "./Message";
import { Duration } from "@mantle-cloud/channels-react";
import Button from "@mui/material/Button";

import instantDropImage from "../images/instant-drop.png";
import { Card, CardContent, TextField, Typography } from "@mui/material";
import { Ping } from "./Ping";

export function InstantSample({ channels, scope }) {
  const [pingDrops, setPingDrops] = useState();
  const [message, setMessage] = useState("");

  useEffect(() => {
    return channels.catch(setPingDrops, `${scope}/pings`);
  }, [channels, scope]);

  const pings = pingDrops?.map((drop) => <Ping drop={drop} />);

  return (
    <>
      <Typography variant="p" component="div">
        <img
          src={instantDropImage}
          alt={""}
          style={{ float: "left", width: 100, height: 100, filter: "invert(100%)" }}
        />
        Drops that are only received by connected clients
      </Typography>

      <TextField
        id="outlined-basic"
        label="Outlined"
        variant="outlined"
        value={message}
        onChange={(event) => {
          setMessage(event.target.value);
        }}
      />
      <Button
        variant="contained"
        onClick={() => {
          channels.drop(`${scope}/pings`, Duration.Instant, { message });
        }}>
        Ping
      </Button>
      <div>{pings}</div>
    </>
  );
}
