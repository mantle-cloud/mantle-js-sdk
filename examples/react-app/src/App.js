import { useChannels } from "@mantle-cloud/channels-react";
import { useEffect, useState } from "react";

import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

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
  const [roomData, setRoomData] = useState();

  const { error, endpoint, status, channels, Duration, ConnectionStatus } = useChannels({ config });

  useEffect(() => {
    if (!roomData) return;
    return channels.catch(setUserDrops, `${roomData.scope}/users`);
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

  return (
    <Container>
      <h1>Status {status}</h1>
      <p>Error {error}</p>
      <p>Endpoint: {endpoint}</p>

      <Row style={{ marginTop: 20 }}>
        <Col>
          <Button
            onClick={() => {
              channels.drop("@rooms/create", Duration.UntilCaught);
            }}>
            Create Room
          </Button>

          <Button
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
              <Card style={{ width: "18rem" }}>
                <Card.Body>
                  <Card.Title>Users (Connection)</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    Drops that only exist while client is connected
                  </Card.Subtitle>

                  <Card.Text>
                    <Card.Text>{users}</Card.Text>
                  </Card.Text>
                  <Card.Text>
                    <Button
                      onClick={() => {
                        channels.drop(`${roomData?.scope}/users`, Duration.Connection, { user: makeId(5) });
                      }}>
                      Drop user
                    </Button>
                  </Card.Text>
                </Card.Body>
              </Card>
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default App;
