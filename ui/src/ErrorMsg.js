import React, {Component} from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import Typography from "@material-ui/core/Typography";
import DialogContentText from "@material-ui/core/DialogContentText";


export default class ErrorMsg extends Component {
    static _instance;

    constructor() {
        super();
        this.state = {
            message: null
        };
        ErrorMsg._instance = this;
    }

    static showError(msg) {
        ErrorMsg._instance.setState(
            {message: JSON.stringify(msg, null, 2)}
        );
    }

    close() {
        this.setState({message: null});
    }

    render() {
        return (
            <Dialog open={this.state.message} onClose={this.close}>
                <DialogTitle>Error</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Something went wrong! Please create an issue on
                        <a href="https://github.com/SeriousBug/image-survey/issues"> our Github page </a>
                        and copy and paste the following information, then refresh the page.
                    </DialogContentText>
                    <DialogContentText>
                        <code>
                            {this.state.message}
                        </code>
                    </DialogContentText>
                </DialogContent>
            </Dialog>
        );
    }
}
