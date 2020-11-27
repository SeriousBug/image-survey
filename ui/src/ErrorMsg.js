import React from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";


let _msgState = () => {};
export default function showError(msg) {
    _msgState(msg);
}


export function ErrorMsg() {
    const [message, setMessage] = React.useState()

    const doOpen = (msg) => {
        setMessage(msg);
    };
    _msgState = doOpen;

    const doClose = () => {
        setMessage(undefined);
    }

    return (
        <Dialog open={message} onClose={doClose}>
            <DialogTitle>Error</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Something went wrong! Please create an issue on
                    <a href="https://github.com/SeriousBug/image-survey/issues">our Github page</a>
                    and copy and paste the following information, then refresh the page.
                </DialogContentText>
                <DialogContentText>

                </DialogContentText>
            </DialogContent>
        </Dialog>
    );
}
