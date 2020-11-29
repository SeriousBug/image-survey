import React, {Component, useEffect} from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
} from "react-router-dom";
import Paper from "@material-ui/core/Paper";
import {Container} from "@material-ui/core";
import Home from './Home';
import Comparison from "./Comparison";
import BackButton from "./BackButton";
import ErrorMsg from "./ErrorMsg";
import {get_images, init} from "./api";
import Typography from "@material-ui/core/Typography";
import makeStyles from "@material-ui/core/styles";
import {useHistory} from "react-router-dom";


const useStyles = makeStyles((theme) => ({
    paper: {
        padding: theme.spacing(1),
        textAlign: 'left',
        color: theme.palette.text.primary,
    },
}));


function App() {
    useEffect(() => {
        init();
    })

    const classes = useStyles();
    const hist = useHistory();

    const StartSurvey = () => {
        useEffect(() => {
            (async function () {
                await get_images();
                if ()
            })();
        });

        return (
            <Container>
                <Paper>
                    <Typography>Loading...</Typography>
                </Paper>
            </Container>
        );
    };

    return (
        <Router>
            <ErrorMsg/>
            <Switch>
                <Route exact path="/">
                    <Home/>
                </Route>
                <Route path="/survey/:number">
                    <Comparison/>
                </Route>
                <Route path="/complete/">
                    <Container>
                        <BackButton/>
                        <Paper>
                            <Typography>Thanks for completing our survey!</Typography>
                        </Paper>
                    </Container>
                </Route>
                <Route path="/start-survey/">

                </Route>
                <Route path="*">
                    <Container>
                        <BackButton/>
                        <Paper>
                            <Typography>Uh-oh, something went wrong! Try refreshing the page.</Typography>
                        </Paper>
                    </Container>
                </Route>
            </Switch>
        </Router>
    );
}
}