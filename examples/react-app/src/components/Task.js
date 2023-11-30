import { Grid, Paper } from "@mui/material";

export function Task({ drop }) {
  return (
    <Paper elevation={12} sx={{ m: 1 }}>
      <Grid container alignItems="center">
        <Grid item>
          <div>{drop?.data?.message}</div>
        </Grid>
      </Grid>
    </Paper>
  );
}
