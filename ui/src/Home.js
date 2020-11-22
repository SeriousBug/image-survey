import Container from "@material-ui/core/Container";
import Paper from "@material-ui/core/Paper";
import {makeStyles} from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import {Link} from "react-router-dom";

const useStyles = makeStyles((theme) => ({
    paper: {
        padding: theme.spacing(1),
        textAlign: 'left',
        color: theme.palette.text.primary,
    },
    action: {
        margin: '0 0 0 70%',
        width: '30%',
    },
    title: {
        textAlign: 'center',
    },
}));

function Home() {
    const classes = useStyles();
    return (
        <Container maxWidth={"sm"}>
            <Paper className={classes.paper}>
                <h1 className={classes.title}>Image Survey</h1>
                <p>
                    This survey will ask you to compare images.
                    It will only take around 15 minutes of your time.
                    We collect no private information.
                </p>
                <p>
                    On each page, you will be shown an original image,
                    and 2 variants of the original image.
                    Please select the variant you think looks more similar to the
                    original image. You can also pick 'same' if both variants
                    look the same.
                </p>
                <p>
                    The survey results will only be used for the Ohio State University
                    CSE 5522 class. The results will be reported as aggregated statistics.
                    No personally identifiable information is collected, stored, or reported.
                </p>
                <Link to="/survey/0">
                    <Button className={classes.action} variant="contained" color="primary">
                        Start Survey
                    </Button>
                </Link>
            </Paper>
        </Container>
    );
}

export default Home;
