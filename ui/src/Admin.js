import {
  Paper,
  TextField,
  Container,
  Button,
  makeStyles,
  Typography,
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    textAlign: "left",
    color: theme.palette.text.primary,
  },
  inputs: {
    width: "100%",
    margin: "1em auto",
  },
  action: {
    margin: "1em 0 0 70%",
    width: "30%",
  },
}));

function AdminLogin() {
  const classes = useStyles();
  return (
    <Container maxWidth={"sm"}>
      <Paper elevation={5} className={classes.paper}>
        <Typography variant="h5">Admin Login</Typography>
        <TextField
          className={classes.inputs}
          label="Username"
          type="password"
        />
        <TextField className={classes.inputs} label="Password" type="text" />
        <Button className={classes.action} variant="contained">
          Login
        </Button>
      </Paper>
    </Container>
  );
}

export function Admin() {
  return <AdminLogin />;
}
