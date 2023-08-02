import React, { Component } from "react";
import {
    Grid,
    Typography,
    Card,
    IconButton,
    LinearProgress,
} from "@material-ui/core";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
import SkipNextIcon from "@material-ui/icons/SkipNext";

export default class MusicPlayer extends Component {
    constructor(props) {
        super(props);
    }

    pause_music() {
        const requestOptions = {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'}
        }
        fetch("/spotify/pause", requestOptions)
    }

    play_music() {
        const requestOptions = {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'}
        }
        fetch("/spotify/play", requestOptions)
    }

    skip_music() {
        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'}
        }
        fetch("/spotify/skip", requestOptions)
    }

    render() {
        const songProgress = (this.props.time / this.props.duration) * 100;

        return (
            <Card>
                <Grid container alignItems="center">
                    <Grid item align="center" xs={4}>
                        <img src={this.props.image_url} height="100%" width="100%" />
                    </Grid>
                    <Grid item align="center" xs={8}>
                        <Typography component="h5" variant="h5">
                            {this.props.title}
                        </Typography>
                        <Typography color="textSecondary" variant="subtitle1">
                            {this.props.artist}
                        </Typography>
                        <div>
                            <IconButton onClick={() => {this.props.is_playing ? this.pause_music() : this.play_music()}}>
                                {this.props.is_playing ? <PauseIcon /> : <PlayArrowIcon />}
                            </IconButton>
                            <IconButton onClick={() => {this.skip_music()}}>
                                <SkipNextIcon />
                            </IconButton>
                        </div>
                    </Grid>
                </Grid>
                <LinearProgress variant="determinate" value={songProgress} />
            </Card>
        );
    }
}