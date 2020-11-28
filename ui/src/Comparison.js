import React, {useEffect, useState} from "react";
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
import {get_images} from "./api";

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
    const classes = useStyles();
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
    const [images, set_images] = useState();

    function choices(choice) {
        return () => {
            let current = parseInt(number);
            if (current + 1 >= images.length) {
                hist.push('/complete/')
            } else {
                hist.push('/survey/' + (current + 1));
            }
        };
    }

    useEffect(() => {
        if (images === undefined) {
            (async function () {
                const {votesets, current} = await get_images();
                console.log('image_sets ' + JSON.stringify(votesets));
                console.log('current ' + current);
                set_images(votesets);
                if (current !== 0) {
                    for (let i = 0; i <= current; i++) {
                        //hist.push('/survey/' + i);
                    }
                }
            })();
        }
    });

    if (images !== undefined) {
        let current = parseInt(number);
        console.log('Rendering images ' + JSON.stringify(images));
        console.log('Rendering number ' + current);
        console.log('Rendering images[0] ' + JSON.stringify(images[current]));

        return (
            <Container>
                <BackButton/>
                <Grid container className={classes.root} spacing={2}>
                    <Grid item xs>
                        <Paper className={classes.paper}>
                            <img className={classes.image} src={IMAGE_ROOT + images[current]['variant_A']}/>
                        </Paper>
                        <Button onClick={choices("left")} className={classes.leftButton}
                                variant="contained" color="primary">
                            Left is better
                        </Button>
                    </Grid>
                    <Grid item xs>
                        <Paper className={classes.paper}>
                            <img className={classes.image} src={IMAGE_ROOT + images[current]['original']}/>
                        </Paper>
                        <Button onClick={choices("center")} className={classes.centerButton}
                                variant="contained" color="primary">About same</Button>
                    </Grid>
                    <Grid item xs>
                        <Paper className={classes.paper}>
                            <img className={classes.image} src={IMAGE_ROOT + images[current]['variant_B']}/>
                        </Paper>
                        <Button onClick={choices("right")} className={classes.rightButton}
                                variant="contained" color="primary">Right is better</Button>
                    </Grid>
                </Grid>
                <LinearProgressWithLabel value={number * (100 / images.length)}/>
            </Container>
        );
    } else {
        return (<Container><Paper>"Loading..."</Paper></Container>);
    }
}
