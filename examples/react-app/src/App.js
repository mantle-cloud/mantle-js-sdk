import { useChannels } from "@mantle-cloud/channels-react";
import { useEffect, useState } from "react";

import Button from "@mui/material/Button";
import Container from "@mui/material/Container";

import { ConnectionSample } from "./components/ConnectionSample";
import { ForeverSample } from "./components/ForeverSample";
import { InstantSample } from "./components/InstantSample";
import { Accordion, AccordionDetails, AccordionSummary, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { UntilCaughtSample } from "./components/UntilCaught";
const config = {
  projectId: "my-react-app",
  domain: "webcomms.biz",
};

function App() {
  const [roomData, setRoomData] = useState();

  const { error, endpoint, status, channels, Duration, ConnectionStatus } = useChannels({ config });

  useEffect(() => {
    if (status !== ConnectionStatus.Connected) return;
    return channels.catch((drops) => {
      if (drops?.length > 0) {
        const data = drops[0].data;
        setRoomData(data);
      }
    }, "@rooms/response");
  }, [ConnectionStatus.Connected, channels, status]);

  return (
    <Container>
      <h1>Status {status}</h1>
      <p>Error {error}</p>
      <p>Endpoint: {endpoint}</p>
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
              <ConnectionSample channels={channels} scope={roomData.scope} />
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
              <Typography variant="h5">Forever</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <ForeverSample channels={channels} scope={roomData.scope} />
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
              <Typography variant="h5">Instant</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <InstantSample channels={channels} scope={roomData.scope} />
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
              <Typography variant="h5">Until Caught</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <UntilCaughtSample channels={channels} scope={roomData.scope} />
            </AccordionDetails>
          </Accordion>
        </div>
      )}
    </Container>
  );
}

export default App;
