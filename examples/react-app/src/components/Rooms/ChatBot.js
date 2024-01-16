import { Box, FormControlLabel, FormGroup, Paper, Switch } from "@mui/material";
import { useCallback, useEffect, useState } from "react";

import { Duration } from "@mantle-cloud/channels-react";

export function ChatBot({ channels, scope }) {
  const [enabled, setEnabled] = useState(false);
  const [processingDrops, setProcessingDrops] = useState({});

  const respondTo = useCallback(
    (drop) => {
      if (processingDrops[drop.id]) {
        console.log("ALREADY PROCESSING ", drop.data.message);
        return;
      }
      console.log("RESPOND TO:", drop.data.message);
      processingDrops[drop.id] = true;

      channels.updateDrop(drop, { status: "processing" });

      setTimeout(() => {
        channels.updateDrop(drop, { status: "done" });
        channels.drop(`${scope}/messages`, Duration.Forever, {
          message: `I don't know about "${drop?.data?.message}"`,
        });
      }, 1000);
    },
    [channels, processingDrops, scope]
  );

  useEffect(() => {
    if (enabled) {
      return channels.catch((drops) => {
        drops?.forEach((d) => {
          if (!d?.data?.status && d.fromClientId !== channels.getClientId()) {
            // not a message from me!!
            respondTo(d);
          }
        });
      }, `${scope}/messages`);
    }
  }, [channels, enabled, respondTo, scope]);

  const handleChange = (event) => {
    setEnabled(event.target.checked);
  };

  return (
    <Paper elevation={5}>
      <h2>Bot</h2>

      <FormGroup>
        <FormControlLabel
          control={<Switch checked={enabled} onChange={handleChange} inputProps={{ "aria-label": "controlled" }} />}
          label="Enable Chat bot responder"
        />
      </FormGroup>

      {enabled && <Box> Chat responder...</Box>}
    </Paper>
  );
}
