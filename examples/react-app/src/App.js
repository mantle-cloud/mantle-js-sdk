import { useChannels } from "@mantle-cloud/channels-react";
import { useEffect, useState } from "react";

import Button from "@mui/material/Button";
import Container from "@mui/material/Container";

import connectionDropImage from "./images/connection-drop.png";
import foreverDropImage from "./images/forever-drop.png";
import { Card, CardContent, TextField, Typography } from "@mui/material";

const config = {
  projectId: "my-react-app",
  domain: "webcomms.biz",
};

const makeId = function (length) {
  var result = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

function App() {
  const [userDrops, setUserDrops] = useState();
  const [messageDrops, setMessageDrops] = useState();
  const [roomData, setRoomData] = useState();
  const [message, setMessage] = useState("");

  const { error, endpoint, status, channels, Duration, ConnectionStatus } = useChannels({ config });

  useEffect(() => {
    if (!roomData || !channels) return;
    channels.drop(`${roomData?.scope}/users`, Duration.Connection, { user: makeId(5) });
  }, [Duration.Connection, channels, roomData]);

  useEffect(() => {
    if (!roomData) return;
    return channels.catch(setUserDrops, `${roomData.scope}/users`);
  }, [channels, roomData]);

  useEffect(() => {
    if (!roomData) return;
    return channels.catch(setMessageDrops, `${roomData.scope}/messages`);
  }, [channels, roomData]);

  useEffect(() => {
    if (status !== ConnectionStatus.Connected) return;
    return channels.catch((drops) => {
      if (drops?.length > 0) {
        const data = drops[0].data;
        setRoomData(data);
      }
    }, "@rooms/response");
  }, [ConnectionStatus.Connected, channels, status]);

  const users = userDrops && userDrops.map((drop) => <div>{JSON.stringify(drop.data)}</div>);
  const messages = messageDrops && messageDrops.map((drop) => <div>{JSON.stringify(drop.data)}</div>);

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
        <>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                Connection
              </Typography>

              <Typography variant="p" component="div">
                <img src={connectionDropImage} alt={""} style={{ float: "left", width: 100, height: 100 }} />
                Drops that only exist while client is connected
              </Typography>

              <Button
                variant="contained"
                onClick={() => {
                  channels.drop(`${roomData?.scope}/users`, Duration.Connection, { user: makeId(5) });
                }}>
                Drop user
              </Button>
              <div>{users}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                Forever
              </Typography>

              <Typography variant="p" component="div">
                <img src={foreverDropImage} alt={""} style={{ float: "left", width: 100, height: 100 }} />
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
                  channels.drop(`${roomData?.scope}/messages`, Duration.Forever, { message });
                }}>
                Submit
              </Button>
              <div>{messages}</div>
            </CardContent>
          </Card>
        </>
      )}
    </Container>
  );
}

export default App;
