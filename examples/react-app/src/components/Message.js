import { Grid, IconButton, Paper } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export function Message({ drop, onDelete }) {
  console.log(drop, drop?.data, drop?.data?.message);
  return (
    <Paper elevation={12} sx={{ m: 1 }}>
      <Grid container alignItems="center">
        <Grid item xs={1}>
          <IconButton aria-label="delete" onClick={onDelete}>
            <DeleteIcon />
          </IconButton>
        </Grid>

        <Grid item>
          <div>{drop?.data?.message}</div>
        </Grid>
      </Grid>
    </Paper>
  );
}
