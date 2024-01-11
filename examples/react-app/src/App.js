import { useEffect, useState } from "react";

import Container from "@mui/material/Container";
import { DocumentStore } from "./components/DocumentStore/DocumentStore";
import Paper from "@mui/material/Paper";
import { Rooms } from "./components/Rooms/Rooms";
import { useChannels } from "@mantle-cloud/channels-react";

const config = {
  projectId: "my-react-app",
  // domain: "webcomms.biz",
  domain: "localhost",
  user: {
    token: "-- token --",
    firebaseUid: "-- uid --",
  },
};

function App() {
  const { error, endpoint, status, channels } = useChannels({ config });

  return (
    <Container>
      <h1>Status {status}</h1>
      <p>Error {error}</p>
      <p>Endpoint: {endpoint}</p>
      {/* <Paper elevation={3} sx={{ px: 4, pb: 4, pt: 2 }}>
        <Rooms channels={channels} status={status}></Rooms>
      </Paper> */}

      {/* <Paper elevation={3} sx={{ px: 4, pb: 4, pt: 2, mt: 1 }}>
        <DocumentStore channels={channels} status={status} projectId={config.projectId}></DocumentStore>
      </Paper> */}
    </Container>
  );
}

export default App;
