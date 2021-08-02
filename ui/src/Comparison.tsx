import React, { useEffect, useRef, useState } from "react";
import Paper from "@material-ui/core/Paper";
import { Container } from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import LinearProgress, {
  LinearProgressProps,
} from "@material-ui/core/LinearProgress";
import { useHistory, useLocation, useParams } from "react-router-dom";
import BackButton from "./BackButton";
import { images, vote_image } from "./api";
import { ZoomIn, ZoomOut } from "@material-ui/icons";
import { bool, MersenneTwister19937 } from "random-js";
import { useGesture } from "react-use-gesture";
import { MobileView, BrowserView } from "react-device-detect";
import cookie from "js-cookie";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(1),
    marginBottom: theme.spacing(2),
    textAlign: "left",
    color: theme.palette.text.primary,
    overflow: "hidden",
  },
  image: {
    maxWidth: "100%",
    imageRendering: "pixelated",
    touchAction: "none",
  },
  leftButton: {
    width: "40%",
  },
  centerButton: {
    width: "40%",
    margin: "0 0 0 30%",
  },
  rightButton: {
    width: "40%",
    margin: "0 0 0 60%",
  },
  topButtons: {
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(1),
  },
  comparisonContainer: {
    maxWidth: "100%",
  },
  hint: {
    marginBottom: theme.spacing(1),
    color: theme.palette.text.secondary,
  },
}));

const LinearProgressWithLabel: React.FC<
  LinearProgressProps & { value: number }
> = (props) => {
  return (
    <Box margin="4em 10px" display="flex" alignItems="center">
      <Box width="100%" mr={1}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box minWidth={35}>
        <Typography variant="body2" color="textSecondary">{`${Math.round(
          props.value
        )}%`}</Typography>
      </Box>
    </Box>
  );
};

const IMAGE_A11Y_WARNING =
  "This survey is based entirely on images, and can not be administered with a text description." +
  " Please contact the organization that prepared this survey for assistance.";

const IMAGE_ROOT = process.env.REACT_APP_IMAGE_BASE_URL;
const MAX_ZOOM = parseInt(process.env.REACT_APP_IMAGE_MAX_ZOOM!);
/** negative numbers zoom in when the wheel is rolled forward, positive numbers are opposite */
const ZOOM_SPEED = parseFloat(process.env.REACT_APP_IMAGE_ZOOM_SPEED!);
const RND_SEED_COOKIE = "rndseed";

type VoteVariant = "variant_A" | "variant_B" | "original";

export default function Comparison() {
  const classes = useStyles();
  const { number } = useParams<{ number: string }>();
  const hist = useHistory();
  const loc = useLocation();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState([0, 0]);

  const zoomTransform = {
    transform:
      "scale(" +
      zoomLevel +
      ") translate(" +
      position[0] +
      "px, " +
      position[1] +
      "px)",
  };

  const firstImage = useRef<HTMLImageElement>(null);

  const zoomFn = (dz: number) => {
    let newZoomLevel = zoomLevel + dz * ZOOM_SPEED;
    if (MAX_ZOOM <= newZoomLevel) newZoomLevel = MAX_ZOOM;
    if (newZoomLevel <= 1) newZoomLevel = 1;

    setZoomLevel(newZoomLevel);
  };

  const bindGesture = useGesture({
    onDrag: ({ delta: [dx, dy] }) => {
      let newX = position[0] + dx / zoomLevel;
      let newY = position[1] + dy / zoomLevel;

      const imgHalfWidth = firstImage.current!.width / 2;
      const imgHalfHeight = firstImage.current!.height / 2;
      if (
        (dx < 0 && newX < -1 * imgHalfWidth) ||
        (dx > 0 && newX > imgHalfWidth)
      )
        newX = position[0];
      if (
        (dy < 0 && newY < -1 * imgHalfHeight) ||
        (dy > 0 && newY > imgHalfHeight)
      )
        newY = position[1];

      setPosition([newX, newY]);
    },
    onWheel: ({ delta: [dx, dy] }) => {
      zoomFn(dy);
    },
    onPinch: ({ delta: [distance, angle] }) => {
      zoomFn(-1 * distance);
    },
  });

  useEffect(() => {
    console.log(loc.pathname);
    console.log(images);
    if (
      loc.pathname.startsWith("/survey") &&
      (images === undefined || images.length === 0)
    ) {
      console.log("Trying to redirect");
      hist.push("/start-survey/");
    }
  });

  if (images !== undefined && images.length > 0) {
    const current = parseInt(number);

    // Randomly decide which variant should be displayed on the left, and which one on the right.
    // The outcome is consistent for the same user looking at the same image: it will be displayed
    // in the same places when going forward and backward in history, or when the page is refreshed.
    let rndSeedCookie = cookie.get(RND_SEED_COOKIE);
    if (!rndSeedCookie) {
      rndSeedCookie = Math.round(Math.random()).toString();
      cookie.set(RND_SEED_COOKIE, rndSeedCookie);
    }
    const rndSeed = parseInt(rndSeedCookie);

    let left: VoteVariant, right: VoteVariant;
    if (bool()(MersenneTwister19937.seed(current + rndSeed))) {
      left = "variant_A";
      right = "variant_B";
    } else {
      left = "variant_B";
      right = "variant_A";
    }

    const data = {
      original: images[current]["original"],
      variant_A: images[current]["variant_A"],
      variant_B: images[current]["variant_B"],
    };

    const choices = (choice: VoteVariant) => {
      return () => {
        let current = parseInt(number);
        let vote = { ...data, voted_for: data[choice] };
        vote_image(vote);
        if (current + 1 >= images.length) hist.push("/complete/");
        else hist.push("/survey/" + (current + 1));
      };
    };

    return (
      <Container className={classes.comparisonContainer}>
        <Container>
          <Typography className={classes.hint}>
            <MobileView>Pinch to zoom, tap and drag to move.</MobileView>
            <BrowserView>
              Scroll wheel to zoom, click and drag to move.
            </BrowserView>
          </Typography>
        </Container>
        <Container>
          <BackButton />
          <Button
            onClick={() => {
              zoomFn(-10);
            }}
            className={classes.topButtons}
            variant="outlined"
          >
            <ZoomIn /> Zoom In
          </Button>
          <Button
            onClick={() => {
              zoomFn(+10);
            }}
            className={classes.topButtons}
            variant="outlined"
          >
            <ZoomOut /> Zoom Out
          </Button>
        </Container>
        <Grid container className={classes.root} spacing={2}>
          <Grid item xs>
            <Typography style={{ paddingLeft: "30%" }}>Left</Typography>
            <Paper className={classes.paper}>
              <img
                {...bindGesture()}
                ref={firstImage}
                draggable="false"
                className={classes.image}
                src={IMAGE_ROOT + images[current][left]}
                alt={IMAGE_A11Y_WARNING}
                style={zoomTransform}
              />
            </Paper>
            <Button
              onClick={choices(left)}
              className={classes.leftButton}
              variant="contained"
              color="primary"
            >
              Left is better
            </Button>
          </Grid>
          {images[current]["original"] != null ? (
            <Grid item xs>
              <Typography style={{ textAlign: "center" }}>
                Original Baseline
              </Typography>
              <Paper className={classes.paper}>
                <img
                  {...bindGesture()}
                  draggable="false"
                  className={classes.image}
                  src={IMAGE_ROOT + images[current]["original"]}
                  alt={IMAGE_A11Y_WARNING}
                  style={zoomTransform}
                />
              </Paper>
            </Grid>
          ) : null}
          <Grid item xs>
            <Typography style={{ textAlign: "right", paddingRight: "30%" }}>
              Right
            </Typography>
            <Paper className={classes.paper}>
              <img
                {...bindGesture()}
                draggable="false"
                className={classes.image}
                src={IMAGE_ROOT + images[current][right]}
                alt={IMAGE_A11Y_WARNING}
                style={zoomTransform}
              />
            </Paper>
            <Button
              onClick={choices(right)}
              className={classes.rightButton}
              variant="contained"
              color="primary"
            >
              Right is better
            </Button>
          </Grid>
        </Grid>
        <LinearProgressWithLabel
          value={parseInt(number) * (100 / images.length)}
        />
      </Container>
    );
  } else {
    return (
      <Container>
        <Paper className={classes.paper}>...</Paper>
      </Container>
    );
  }
}
