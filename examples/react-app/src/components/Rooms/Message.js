import { CircularProgress, Grid, IconButton, Paper, TextField } from "@mui/material";
import { useEffect, useState } from "react";

import CheckIcon from "@mui/icons-material/Check";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";

export function Message({ drop, onDelete, onSetMessage }) {
  const [message, setMessage] = useState("");

  useEffect(() => {
    setMessage(drop?.data?.message);
  }, [drop]);
  return (
    <Paper elevation={12} sx={{ m: 1 }}>
      <Grid container alignItems="center">
        <Grid item xs={2}>
          <IconButton aria-label="delete" onClick={onDelete}>
            <DeleteIcon />
          </IconButton>

          <IconButton
            aria-label="save"
            onClick={() => {
              onSetMessage(message);
            }}>
            <SaveIcon />
          </IconButton>
        </Grid>

        <Grid item sx={{ flex: 1 }}>
          <TextField
            fullWidth
            label="Message"
            variant="standard"
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
            }}
          />
        </Grid>

        <Grid item sx={{ width: 50 }}>
          {!drop?.data?.status && <div>-</div>}
          {drop?.data?.status === "processing" && <CircularProgress></CircularProgress>}
          {drop?.data?.status === "done" && <CheckIcon></CheckIcon>}
        </Grid>
      </Grid>
    </Paper>
  );
}
