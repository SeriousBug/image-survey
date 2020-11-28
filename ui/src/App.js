import React, {Component} from 'react';
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
import {init, get_images} from "./api";



class App extends Component {
    async componentDidMount() {
        await init();
    }

    render() {
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
        );
    }
}

export default App;