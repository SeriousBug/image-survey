import React from "react";
import Paper from "@material-ui/core/Paper";
import {Container} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import PropTypes from "prop-types";
import LinearProgress from "@material-ui/core/LinearProgress";
import {useHistory, useParams} from "react-router-dom";
import BackButton from "./BackButton"

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        padding: theme.spacing(1),
        marginBottom: theme.spacing(2),
        textAlign: 'left',
        color: theme.palette.text.primary,
    },
    image: {
        maxWidth: '100%',
    },
    leftButton: {
        width: '40%',
    },
    centerButton: {
        width: '40%',
        margin: '0 0 0 30%',
    },
    rightButton: {
        width: '40%',
        margin: '0 0 0 60%',
    },
    backButton: {
        marginBottom: theme.spacing(2),
    }
}));

function LinearProgressWithLabel(props) {
    const classes = useStyles();
    return (
        <Box margin="4em 10px" display="flex" alignItems="center">
            <Box width="100%" mr={1}>
                <LinearProgress variant="determinate" {...props} />
            </Box>
            <Box className={classes.textContainer} minWidth={35}>
                <Typography variant="body2" color="textSecondary">{`${Math.round(
                    props.value,
                )}%`}</Typography>
            </Box>
        </Box>
    );
}
LinearProgressWithLabel.propTypes = {
    /**
     * The value of the progress indicator for the determinate and buffer variants.
     * Value between 0 and 100.
     */
    value: PropTypes.number.isRequired,
};

function choices(choice, current, hist) {
    return () => {
        if (current === 9) {
            hist.push('/complete/')
        } else {
            hist.push('/survey/' + (parseInt(current) + 1));
        }
    };
}

function Comparison() {
    const classes = useStyles();
    let { number } = useParams();
    number = parseInt(number);
    var hist = useHistory();
    return (
        <Container>
            <BackButton/>
            <Grid container className={classes.root} spacing={2}>
                <Grid item xs>
                    <Paper className={classes.paper}>
                        <img className={classes.image} src="/test_jpeg.jpg"/>
                    </Paper>
                    <Button onClick={choices("left", number, hist)} className={classes.leftButton} variant="contained" color="primary">
                        Left is better
                    </Button>
                </Grid>
                <Grid item xs>
                    <Paper className={classes.paper}>
                        <img className={classes.image} src="/test_original.jpg"/>
                    </Paper>
                    <Button onClick={choices("center", number, hist)} className={classes.centerButton} variant="contained" color="primary">About same</Button>
                </Grid>
                <Grid item xs>
                    <Paper className={classes.paper}>
                        <img className={classes.image} src="/test_jpeg2000.jpg"/>
                    </Paper>
                    <Button onClick={choices("right", number, hist)} className={classes.rightButton} variant="contained" color="primary">Right is better</Button>
                </Grid>
            </Grid>
            <LinearProgressWithLabel value={number * 10}/>
        </Container>
    );
}

export default Comparison;