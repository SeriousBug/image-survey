import {
  Paper,
  TextField,
  Container,
  Button,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { useState } from "react";
import { login } from "./api";
import React from "react";

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

const AdminLogin: React.FC<{ setLoggedIn: (state: boolean) => void }> = ({
  setLoggedIn,
}) => {
  const classes = useStyles();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Container maxWidth={"sm"}>
      <Paper elevation={5} className={classes.paper}>
        <Typography variant="h5">Admin Login</Typography>
        <TextField
          className={classes.inputs}
          label="Username"
          type="text"
          onChange={(event) => setUsername(event.target.value)}
        />
        <TextField
          className={classes.inputs}
          label="Password"
          type="password"
          onChange={(event) => setPassword(event.target.value)}
        />
        <Button
          className={classes.action}
          variant="contained"
          onClick={async () => {
            const didWork = await login(username, password);
            if (didWork) setLoggedIn(true);
          }}
        >
          Login
        </Button>
      </Paper>
    </Container>
  );
};

export function Admin() {
  const [isLoggedIn, setLoggedIn] = useState(false);

  if (isLoggedIn) return <AdminLogin setLoggedIn={setLoggedIn} />;
  else return <Typography>Logged in!</Typography>;
}
