import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import Home from './Home';
import Comparison from "./Comparison";
import reportWebVitals from './reportWebVitals';

import {
    BrowserRouter as Router,
    Switch,
    Route,
} from "react-router-dom";
import Paper from "@material-ui/core/Paper";
import {Container} from "@material-ui/core";
import BackButton from "./BackButton";

ReactDOM.render(
    <React.StrictMode>
        <Router>
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
                            <p>Thanks for completing our survey!</p>
                        </Paper>
                    </Container>
                </Route>
                <Route path="*">
                    <Container>
                        <BackButton/>
                        <Paper>
                            <p>Uh-oh, something went wrong! Try refreshing the page.</p>
                        </Paper>
                    </Container>
                </Route>
            </Switch>
        </Router>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
