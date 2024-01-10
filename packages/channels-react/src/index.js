import { ConnectionStatus, Duration, getChannels } from "@mantle-cloud/channels";
import { useEffect, useState } from "react";

export { Duration, ConnectionStatus };

export function useChannels({ config }) {
  const [endpoint, setEndpoint] = useState();
  const [status, setStatus] = useState();
  const [error, setError] = useState();
  const [channels, setChannels] = useState();

  async function initialiseChannels() {
    const _channels = await getChannels();

    setChannels(_channels);

    _channels.initialise(config);

    _channels.addStatusListener(function (status, endpoint, error) {
      console.log("STATUS", status, endpoint, error);
      setEndpoint(endpoint);
      setStatus(status);
      setError(error?.message);
    });
  }
  useEffect(() => {
    initialiseChannels();
  }, []);

  return { endpoint, status, error, Duration, channels, ConnectionStatus };
}
