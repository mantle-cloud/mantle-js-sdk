import { Accordion, AccordionDetails, AccordionSummary, Button, Typography } from "@mui/material";
import { ConnectionStatus, Duration } from "@mantle-cloud/channels-react";
import { useEffect, useState } from "react";

import { Connection } from "./Connection";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Forever } from "./Forever";
import { Instant } from "./Instant";
import { UntilCaught } from "./UntilCaught";

export function Rooms({ channels, status }) {
  const [roomData, setRoomData] = useState();

  useEffect(() => {
    if (status !== ConnectionStatus.Connected) return;

    return channels.catch((drops) => {
      if (drops?.length > 0) {
        const data = drops[0].data;
        setRoomData(data);
      }
    }, "@rooms/response");
  }, [channels, status]);

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>@rooms</h1>
      <p>
        Test room:
        <Button
          variant="contained"
          onClick={() => {
            channels.drop("@rooms/join", Duration.UntilCaught, { roomCode: "587303563" });
          }}>
          Join 587303563
        </Button>
      </p>

      <Button
        variant="contained"
        onClick={() => {
          channels.drop("@rooms/create", Duration.UntilCaught);
        }}>
        Create Room
      </Button>

      <Button
        variant="contained"
        onClick={() => {
          channels.drop("@rooms/join", Duration.UntilCaught, { roomCode: roomData?.roomCode });
        }}>
        Join Room
      </Button>

      <input
        value={roomData?.roomCode}
        onChange={(event) => {
          setRoomData({ ...roomData, roomCode: event.target.value });
        }}
      />

      {roomData?.roomCode && (
        <div>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
              <Typography variant="h5">Connection</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Connection channels={channels} scope={roomData.scope} />
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
              <Typography variant="h5">Forever</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Forever channels={channels} scope={roomData.scope} />
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
              <Typography variant="h5">Instant</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Instant channels={channels} scope={roomData.scope} />
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
              <Typography variant="h5">Until Caught</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <UntilCaught channels={channels} scope={roomData.scope} />
            </AccordionDetails>
          </Accordion>
        </div>
      )}
    </div>
  );
}
