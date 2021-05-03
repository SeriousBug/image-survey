import React from "react";
import Container from "@material-ui/core/Container";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import { Link } from "react-router-dom";
import { Typography } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(1),
    textAlign: "left",
    color: theme.palette.text.primary,
  },
  action: {
    margin: "0 0 0 70%",
    width: "30%",
  },
  title: {
    textAlign: "center",
  },
  adminLink: {
    width: "100%",
    textAlign: "right",
    paddingBottom: "1em",
    paddingTop: "1em",
  },
}));

function Home() {
  const classes = useStyles();
  return (
    <Container maxWidth={"sm"}>
      <Container className={classes.adminLink}>
        <Link to="/admin/">
          <Typography>Admin login</Typography>
        </Link>
      </Container>
      <Paper className={classes.paper}>
        <h1 className={classes.title}>{process.env.REACT_APP_TITLE}</h1>
        <p>{process.env.REACT_APP_HOMEPAGE_PAR1}</p>
        <p>{process.env.REACT_APP_HOMEPAGE_PAR2}</p>
        <p>{process.env.REACT_APP_HOMEPAGE_PAR3}</p>
        <Link to="/start-survey/">
          <Button
            className={classes.action}
            variant="contained"
            color="primary"
          >
            Start Survey
          </Button>
        </Link>
      </Paper>
    </Container>
  );
}

export default Home;
