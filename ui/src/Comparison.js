import React, {useEffect} from "react";
import Paper from "@material-ui/core/Paper";
import {Container} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import PropTypes from "prop-types";
import LinearProgress from "@material-ui/core/LinearProgress";
import {useHistory, useLocation, useParams} from "react-router-dom";
import BackButton from "./BackButton"
import {images, vote_image} from "./api";

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
        imageRendering: 'pixelated',
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
    return (
        <Box margin="4em 10px" display="flex" alignItems="center">
            <Box width="100%" mr={1}>
                <LinearProgress variant="determinate" {...props} />
            </Box>
            <Box minWidth={35}>
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


const IMAGE_ROOT = 'http://localhost:8000/'


export default function Comparison() {
    const classes = useStyles();
    const {number} = useParams();
    const hist = useHistory();
    const loc = useLocation();

    useEffect(() => {
        console.log(loc.pathname);
        console.log(images);
        if (loc.pathname.startsWith('/survey') && (images === undefined || images.length == 0)) {
            console.log('Trying to redirect');
            hist.push('/start-survey/');
        }
    });

    console.log('Rendering images ' + JSON.stringify(images));
    if (images !== undefined && images.length > 0) {
        const current = parseInt(number);
        console.log('Rendering number ' + current);
        console.log('Rendering images[0] ' + JSON.stringify(images[current]));

        let left, right;
        if (Math.round(Math.random()) === 1) {
            left = 'variant_A';
            right = 'variant_B';
        } else {
            left = 'variant_B';
            right = 'variant_A';
        }

        const data = {
            original: images[current]['original'],
            variant_A: images[current]['variant_A'],
            variant_B: images[current]['variant_B'],
        }

        function choices(choice) {
            return () => {
                let current = parseInt(number);
                let vote = {...data};
                vote['voted_for'] = vote[choice];
                vote_image(vote);
                if (current + 1 >= images.length) {
                    hist.push('/complete/')
                } else {
                    hist.push('/survey/' + (current + 1));
                }
            };
        }

        return (
            <Container>
                <BackButton/>
                <Grid container className={classes.root} spacing={2}>
                    <Grid item xs>
                        <Paper className={classes.paper}>
                            <img className={classes.image} src={IMAGE_ROOT + images[current][left]}/>
                        </Paper>
                        <Button onClick={choices(left)} className={classes.leftButton}
                                variant="contained" color="primary">
                            Left is better
                        </Button>
                    </Grid>
                    <Grid item xs>
                        <Paper className={classes.paper}>
                            <img className={classes.image} src={IMAGE_ROOT + images[current]['original']}/>
                        </Paper>
                        <Button onClick={choices('original')} className={classes.centerButton}
                                variant="contained" color="primary">About same</Button>
                    </Grid>
                    <Grid item xs>
                        <Paper className={classes.paper}>
                            <img className={classes.image} src={IMAGE_ROOT + images[current][right]}/>
                        </Paper>
                        <Button onClick={choices(right)} className={classes.rightButton}
                                variant="contained" color="primary">Right is better</Button>
                    </Grid>
                </Grid>
                <LinearProgressWithLabel value={number * (100 / images.length)}/>
            </Container>
        );
    } else {
        return (<Container><Paper className={classes.paper}>...</Paper></Container>);
    }
}
