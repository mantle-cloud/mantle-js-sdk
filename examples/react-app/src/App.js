import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ToggleButton from "react-bootstrap/ToggleButton";
import ToggleButtonGroup from "react-bootstrap/ToggleButtonGroup";
import { channels, Duration, ConnectionStatus } from "@orbis/browser-channels";

import { useState, useEffect, useMemo } from "react";

const channelsConfig = {
  apiKey: "198asdfsdf2309821alsdij0iowje28",
  appId: "my-react-app",
  domain: "127.0.0.1",
  // port: 9080,
};

// function useChannelStatus() {
//   const [error, setError] = useState();
//   const [endpoint, setEndpoint] = useState();

//   const [status, setStatus] = useState(ConnectionStatus.Connecting);

//   useEffect(() => {
//     channels().addStatusListener(function (status, endpoint, error) {
//       setEndpoint(endpoint);
//       setStatus(status);
//       setError(error?.message);
//     });
//   }, []);

//   return { status, error, endpoint };
// }

const makeId = function (length) {
  var result = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

function Cards({ drops, onDeleteDrop }) {
  if (!drops) {
    return <div>No Cards</div>;
  }
  console.log("drops", drops);

  const rows = drops.map((drop) => (
    <div className="row">
      <div className="col">{drop.data.type}</div>
      <div className="col">{drop.data.title}</div>
      <div className="col">
        <Button
          className="btn btn-danger"
          onClick={() => {
            onDeleteDrop(drop);
          }}>
          Delete
        </Button>
      </div>
    </div>
  ));

  return <div className="container">{rows}</div>;
}
function App() {
  const [cardType, setCardType] = useState("habit");
  const [cardsDropError, setCardsDropError] = useState();
  const [cardsCatchError, setCardsCatchError] = useState();
  const [cardsDeleteError, setCardsDeleteError] = useState();
  const [updateTime, setUpdateTime] = useState();
  const [cardDrops, setCardDrops] = useState();
  const [messageDrops, setMessageDrops] = useState();
  const [untilCaughtDrops, setUntilCaughtDrops] = useState();
  const [coffeeShopDrops, setCoffeeShopDrops] = useState();
  const [userDrops, setUserDrops] = useState();
  const [untilCaughtEnabled, setUntilCaughtEnabled] = useState(false);
  const [roomCodeData, setRoomData] = useState();
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState();
  const [endpoint, setEndpoint] = useState();
  const [status, setStatus] = useState(ConnectionStatus.Connecting);

  const cardCatchParams = useMemo(() => ({ filter: { "data.type": cardType } }), [cardType]);
  // const [roomJWT, setRoomJWT] = useState(true);

  useEffect(() => {
    (async function init() {
      try {
        await channels().initialise(channelsConfig);

        channels().addStatusListener(function (status, endpoint, error) {
          setEndpoint(endpoint);
          setStatus(status);
          setError(error?.message);
        });
      } catch (e) {
        console.error("erorr thrown while initialiseing ", e);
      }
    })();
  }, []);

  // useEffect(() => {
  //   if (status !== ConnectionStatus.Connected) return;

  //   function handleDrops(drops, error, params) {
  //     if (error) {
  //       console.error("Error with catch", error);
  //       setCardsCatchError(error.message);
  //       return;
  //     }
  //     setCardDrops(drops);
  //     if (params?.updateTime) {
  //       setUpdateTime(params?.updateTime);
  //     }
  //   }
  //   const fn = channels().catch(handleDrops, "cards", cardCatchParams);
  //   console.log("EFFECT!", fn);
  //   return fn;
  // }, [cardCatchParams, status]);

  useEffect(() => {
    if (!roomCodeData) return;

    console.log("roomCodeData", roomCodeData);
    return channels().catch(setUserDrops, `${roomCodeData.scope}/users`, null, roomCodeData.jwt);
  }, [roomCodeData]);

  // useEffect(() => {
  //   if (status !== ConnectionStatus.Connected) return;
  //   return channels().catch(setMessageDrops, "messages");
  // }, [status]);

  useEffect(() => {
    if (status !== ConnectionStatus.Connected) return;
    return channels().catch((drops) => {
      console.log("ROOM:", drops);
      if (drops?.length > 0) {
        const data = drops[0].data;
        setRoomData(data);
        setRoomCode(data.roomCode);
      }
    }, "@rooms/response");
  }, [status]);

  // // useEffect(() => {
  // //   return channels().catch((drops, error) => {
  // //     if (error) {
  // //       console.error(error);
  // //       return;
  // //     }
  // //     drops.forEach((drop) => {
  // //       setRoomJWT(drop.data.jwt);
  // //     });
  // //   }, "roomCode.tokens");
  // // }, []);

  // useEffect(() => {
  //   if (status !== ConnectionStatus.Connected) return;
  //   if (untilCaughtEnabled) {
  //     return channels().catch(setUntilCaughtDrops, "untilCaught");
  //   }
  // }, [untilCaughtEnabled, status]);

  const users = userDrops && userDrops.map((drop) => <div>{JSON.stringify(drop.data)}</div>);
  const messages = messageDrops && messageDrops.map((drop) => <div>{JSON.stringify(drop.data)}</div>);
  // const untilCaught = untilCaughtDrops && untilCaughtDrops.map((drop) => <div>{JSON.stringify(drop.data)}</div>);

  // useEffect(() => {
  //   if (status !== ConnectionStatus.Connected) return;
  //   return channels().catch(setCoffeeShopDrops, "coffee-shops");
  // }, [status]);

  // const coffeeShops = coffeeShopDrops && coffeeShopDrops.map((drop) => <div>{JSON.stringify(drop.data)}</div>);

  // useEffect(() => {
  //   if (!roomCodeData) return;

  //   async function drop() {
  //     const id = makeId(10);
  //     try {
  //       const dropId = await channels().drop(`${roomCodeData.scope}.users`, Duration.Connection, { id });
  //       console.log("Added drop:", dropId);
  //     } catch (e) {
  //       console.log("Unable to drop user");
  //     }
  //   }

  //   drop();
  // }, [roomCodeData]);

  async function onAddCardPressed() {
    try {
      await channels().drop("cards", Duration.Forever, { title: "hello", type: "habit" });
    } catch (error) {
      setCardsDropError(error.message);
    }
  }

  return (
    <Container>
      <h1>{status}</h1>
      {/* <p>{error}</p>
      <p>{endpoint}</p> */}

      {/* <Card>
        <Card.Body>
          <Card.Title>Coffee shops</Card.Title>
          <Card.Subtitle className="mb-2 text-muted">
            <li>
              <b>Access:</b> : Public DROP, CATCH, DELETE_OWNER
            </li>
            <li>
              <b>Persistance</b> : Forever
            </li>
          </Card.Subtitle>
          <Card.Text>
            <Card.Text>{messages}</Card.Text>
          </Card.Text>

          <Card.Text>
            <Button
              onClick={() => {
                channels().drop("messages", Duration.Instant, { word: makeId(5) });
              }}>
              Drop instant chat message
            </Button>

            {coffeeShops}
          </Card.Text>
        </Card.Body>
      </Card> */}

      <Row style={{ marginTop: 20 }}>
        <Col>
          <Button
            onClick={() => {
              channels().drop("@rooms/create", Duration.UntilCaught);
            }}>
            Create Room
          </Button>

          <Button
            onClick={() => {
              channels().drop("@rooms/join", Duration.UntilCaught, { roomCode });
            }}>
            Join Room
          </Button>

          <input
            value={roomCode}
            onChange={(event) => {
              setRoomCode(event.target.value);
            }}
          />

          {roomCodeData && (
            <>
              {/* <Card style={{ width: "18rem" }}>
                <Card.Body>
                  <Card.Title>Instant</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    Add drops that immediately go even if not caught
                  </Card.Subtitle>
                  <Card.Text>
                    <Card.Text>{messages}</Card.Text>
                  </Card.Text>

                  <Card.Text>
                    <Button
                      onClick={() => {
                        channels().drop("messages", Duration.Instant, { word: makeId(5) });
                      }}>
                      Drop instant chat message
                    </Button>
                  </Card.Text>
                </Card.Body>
              </Card> */}

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
                        channels().drop(`${roomCodeData.scope}/users`, Duration.Connection, { user: makeId(5) });
                      }}>
                      Drop user
                    </Button>
                  </Card.Text>
                </Card.Body>
              </Card>
            </>
          )}
        </Col>

        {/* <Col>
          <Card style={{ width: "18rem" }}>
            <Card.Body>
              <Card.Title>Until caught</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">Add drops that stay until caught</Card.Subtitle>
              <Card.Text>
                <Button
                  onClick={() => {
                    channels().drop("untilCaught", Duration.UntilCaught, { greeting: "Hello" });
                  }}>
                  Hello
                </Button>

                <Button
                  onClick={() => {
                    channels().drop("untilCaught", Duration.UntilCaught, { greeting: "Goodbye" });
                  }}>
                  Goodbye
                </Button>

                <ToggleButtonGroup type="radio" name="options" defaultValue={1} value={untilCaughtEnabled}>
                  <ToggleButton
                    id="tbg-radio-1"
                    value={true}
                    variant={"outline-success"}
                    onClick={() => {
                      setUntilCaughtEnabled(true);
                    }}>
                    Enable catch
                  </ToggleButton>
                  <ToggleButton
                    id="tbg-radio-2"
                    value={false}
                    variant={"outline-success"}
                    onClick={() => {
                      setUntilCaughtEnabled(false);
                    }}>
                    Disable catch
                  </ToggleButton>
                </ToggleButtonGroup>

                {untilCaught}
              </Card.Text>
            </Card.Body>
          </Card>

          <Card style={{ width: "18rem" }}>
            <Card.Body>
              <Card.Title>Cards (Forever)</Card.Title>

              {cardsCatchError && (
                <Card.Text>
                  <Card.Text style={{ color: "red" }}>Catch Error: {cardsCatchError}</Card.Text>
                </Card.Text>
              )}

              {cardsDropError && (
                <Card.Text>
                  <Card.Text style={{ color: "red" }}>Drop Error: {cardsDropError}</Card.Text>
                </Card.Text>
              )}

              {cardsDeleteError && (
                <Card.Text>
                  <Card.Text style={{ color: "red" }}>Delete Error: {cardsDeleteError}</Card.Text>
                </Card.Text>
              )}

              <Card.Subtitle className="mb-2 text-muted">Matching cards</Card.Subtitle>

              <Card.Text>
                <ToggleButtonGroup type="radio" name="cardType" defaultValue={1} value={cardType}>
                  <ToggleButton
                    id="tbg-radio-1"
                    value={"task"}
                    variant={"outline-success"}
                    onClick={() => {
                      setCardType("task");
                    }}>
                    Task
                  </ToggleButton>
                  <ToggleButton
                    id="tbg-radio-2"
                    value={"habit"}
                    variant={"outline-success"}
                    onClick={() => {
                      setCardType("habit");
                    }}>
                    Habit
                  </ToggleButton>
                </ToggleButtonGroup>
              </Card.Text>

              <Card.Text>
                <Button onClick={onAddCardPressed}>Add Card</Button>

                <Cards
                  drops={cardDrops}
                  onDeleteDrop={(drop) => {
                    const fn = async () => {
                      try {
                        console.log("onDeleteDrop...", drop);
                        await channels().deleteDrop("cards", drop.id);
                        console.log("onDeleteDrop done", drop);
                      } catch (error) {
                        console.log("Unable to delete!!!", error);
                        setCardsDeleteError(error.message);
                      }
                    };
                    fn();
                  }}
                />
              </Card.Text>
            </Card.Body>
          </Card>
        </Col> */}
      </Row>
    </Container>
  );
}

export default App;
