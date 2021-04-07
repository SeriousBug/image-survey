import React, { useEffect } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Paper from "@material-ui/core/Paper";
import { Container } from "@material-ui/core";
import Home from "./Home";
import Comparison from "./Comparison";
import BackButton from "./BackButton";
import ErrorMsg from "./ErrorMsg";
import { get_images, images, init, last_current } from "./api";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(1),
    textAlign: "left",
    color: theme.palette.text.primary,
  },
}));

function StartSurvey(setImages, classes) {
  const hist = useHistory();

  useEffect(() => {
    (async function () {
      await init();
      await get_images();
      for (let i = 0; i <= last_current; i++) {
        let target;
        if (i >= images.length) target = "/complete/";
        else target = "/survey/" + i;

        if (i === 0) hist.replace(target);
        else hist.push(target);
      }
    })();
  });

  return (
    <Container>
      <Paper className={classes.paper}>
        <Typography>Loading...</Typography>
      </Paper>
    </Container>
  );
}

export default function App() {
  const classes = useStyles();

  return (
    <Router>
      <ErrorMsg />
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <Route path="/survey/:number">
          <Comparison />
        </Route>
        <Route path="/complete/">
          <Container>
            <BackButton />
            <Paper className={classes.paper}>
              <Typography>Thanks for completing our survey!</Typography>
            </Paper>
          </Container>
        </Route>
        <Route path="/start-survey/">
          <StartSurvey />
        </Route>
        <Route path="*">
          <Container>
            <BackButton />
            <Paper className={classes.paper}>
              <Typography>
                Uh-oh, something went wrong! Try refreshing the page.
              </Typography>
            </Paper>
          </Container>
        </Route>
      </Switch>
    </Router>
  );
}
