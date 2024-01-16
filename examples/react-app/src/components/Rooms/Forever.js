import { Button, FormControlLabel, FormGroup, Paper, Switch, TextField, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";

import { ChatBot } from "./ChatBot";
import { Duration } from "@mantle-cloud/channels-react";
import { Message } from "./Message";
import foreverDropImage from "../../images/forever-drop.png";

export function Forever({ channels, scope }) {
  const [messageDrops, setMessageDrops] = useState();
  const [message, setMessage] = useState("");

  useEffect(() => {
    return channels.catch((drops) => {
      setMessageDrops(drops);
    }, `${scope}/messages`);
  }, [channels, scope]);

  const messages =
    messageDrops &&
    messageDrops.map((drop) => (
      <Message
        drop={drop}
        onDelete={() => {
          channels.deleteDrop(drop);
        }}
        onSetMessage={(message) => {
          channels.updateDrop(drop, { message });
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

      <Button
        variant="contained"
        onClick={() => {
          channels.drop(`${scope}/messages`, Duration.Forever, { message: "A" });
          channels.drop(`${scope}/messages`, Duration.Forever, { message: "B" });
        }}>
        Submit (A+B)
      </Button>

      <div>{messages}</div>
      <ChatBot channels={channels} scope={scope}></ChatBot>
    </>
  );
}
