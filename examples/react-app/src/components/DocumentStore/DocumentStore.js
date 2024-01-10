import { ConnectionStatus, Duration } from "@mantle-cloud/channels-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@mui/material";

export function DocumentStore({ channels, status, projectId }) {
  const storeId = "__default";

  const [storeDrops, setStoreDrops] = useState();

  const connect = useCallback(async () => {
    console.log("drop", "@document-store/connect");

    channels.catch((drops) => {
      if (!drops || drops.length < 1) return;

      const data = drops[0].data;

      if (data.success === true) {
        console.log("connected to document store", data.projectId);

        channels?.catch(setStoreDrops, `@document-store/project/${data.projectId}/stores`);
      }
    }, "@document-store/connect-response");
    await channels.drop("@document-store/connect", Duration.UntilCaught, {});
  }, [channels]);

  useEffect(() => {
    if (status !== ConnectionStatus.Connected || !channels) return;
    connect();
  }, [channels, connect, status]);

  // useEffect(() => {
  //   return channels?.catch(setStoreDrops, `@document-store/project/${projectId}/stores`);
  // }, [channels, projectId]);

  const stores = storeDrops && storeDrops.map((drop) => <div>{JSON.stringify(drop.data)}</div>);

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>@document-store</h1>

      <Button
        variant="contained"
        onClick={() => {
          channels.drop("@document-store/create-store", Duration.UntilCaught, { name: storeId });
        }}>
        Create store {storeId}
      </Button>

      {stores}
    </div>
  );
}
