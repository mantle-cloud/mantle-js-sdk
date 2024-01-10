import { Button, FormControlLabel, FormGroup, Grid, Switch, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import { Duration } from "@mantle-cloud/channels-react";
import { Task } from "../Task";
import untilCaughtDropImage from "../../images/until-caught-drop.png";

export function UntilCaught({ channels, scope }) {
  const [taskDrops, setTaskDrops] = useState();
  const [message, setMessage] = useState("");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (enabled) {
      return channels.catch(setTaskDrops, `${scope}/tasks`);
    }
  }, [channels, enabled, scope]);

  const handleChange = (event) => {
    setEnabled(event.target.checked);
  };

  const tasks = taskDrops?.map((drop) => <Task drop={drop} />);

  return (
    <>
      <Grid container>
        <Grid item style={{ width: "100px" }} alignItems="center">
          <img
            src={untilCaughtDropImage}
            alt={""}
            style={{ float: "left", width: 100, height: 100, filter: "invert(100%)" }}
          />
        </Grid>

        <Grid item xs={8}>
          <Typography variant="p" component="div">
            Drops that stay until caught
          </Typography>

          <Grid container xs={12} spacing={1} sx={{ mt: 1 }} alignItems="center">
            <Grid item>
              <TextField
                id="outlined-basic"
                label="Message"
                variant="outlined"
                value={message}
                onChange={(event) => {
                  setMessage(event.target.value);
                }}
              />
            </Grid>

            <Grid item>
              <Button
                variant="contained"
                onClick={() => {
                  channels.drop(`${scope}/tasks`, Duration.UntilCaught, { message });
                }}>
                Add
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <FormGroup>
        <FormControlLabel
          control={<Switch checked={enabled} onChange={handleChange} inputProps={{ "aria-label": "controlled" }} />}
          label="Enable catch"
        />
      </FormGroup>
      <div>{tasks}</div>
    </>
  );
}
