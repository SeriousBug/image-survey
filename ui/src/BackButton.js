import makeStyles from "@material-ui/core/styles/makeStyles";
import {useHistory} from "react-router-dom";
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import Button from "@material-ui/core/Button";

const useStyles = makeStyles((theme) => ({
    backButton: {
        marginBottom: theme.spacing(2),
    },
}));

function BackButton() {
    const classes = useStyles();
    var hist = useHistory();
    return (
        <Button onClick={() => {
            hist.goBack();
        }} className={classes.backButton} variant="outlined">
            <ArrowBackIosIcon/> Go Back
        </Button>
    );
}

export default BackButton;