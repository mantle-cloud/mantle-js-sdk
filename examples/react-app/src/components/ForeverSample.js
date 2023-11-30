import { useCallback, useEffect, useState } from "react";
import { Message } from "./Message";
import { Duration } from "@mantle-cloud/channels-react";
import Button from "@mui/material/Button";

import foreverDropImage from "../images/forever-drop.png";
import { Card, CardContent, TextField, Typography } from "@mui/material";

export function ForeverSample({ channels, scope }) {
  const [messageDrops, setMessageDrops] = useState();
  const [message, setMessage] = useState("");

  useEffect(() => {
    return channels.catch(setMessageDrops, `${scope}/messages`);
  }, [channels, scope]);

  const deleteDrop = useCallback(
    (drop) => {
      channels.deleteDrop(drop);
    },
    [channels]
  );

  const messages =
    messageDrops &&
    messageDrops.map((drop) => (
      <Message
        drop={drop}
        onDelete={() => {
          deleteDrop(drop);
        }}
      />
    ));

  return (
    <>
      <Typography variant="p" component="div">
        <img
          src={foreverDropImage}
          alt={""}
          style={{ float: "left", width: 100, height: 100, filter: "invert(100%)" }}
        />
        Drops that exist forever (or until deleted)
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
          channels.drop(`${scope}/messages`, Duration.Forever, { message });
        }}>
        Submit
      </Button>
      <div>{messages}</div>
    </>
  );
}
