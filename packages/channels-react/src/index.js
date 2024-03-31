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
      setEndpoint(endpoint);
      setStatus(status);
      setError(error?.message);
    });
  }
  useEffect(() => {
    if (config) {
      console.log("CHANNELS: initialising...");
      initialiseChannels();
    } else {
      console.log("CHANNELS: config is not defined");
    }
  }, [config]);

  return { endpoint, status, error, Duration, channels, ConnectionStatus };
}
