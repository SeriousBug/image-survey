import React, { Component } from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";

type State = {
  message: string | null;
};

export default class ErrorMsg extends Component<{}, State> {
  static _instance: ErrorMsg;

  constructor() {
    super({});
    this.state = {
      message: null,
    };
    ErrorMsg._instance = this;
  }

  static showError(msg: string) {
    ErrorMsg._instance.setState({ message: JSON.stringify(msg, null, 2) });
  }

  close() {
    this.setState({ message: null });
  }

  render() {
    return (
      <Dialog open={this.state.message != null} onClose={this.close}>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {process.env.REACT_APP_ERROR_MESSAGE}
          </DialogContentText>
          <DialogContentText>
            <code>{this.state.message}</code>
          </DialogContentText>
        </DialogContent>
      </Dialog>
    );
  }
}
