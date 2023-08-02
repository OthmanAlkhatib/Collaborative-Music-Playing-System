import React, {Component} from 'react';
import { Grid, Button, Typography } from "@material-ui/core";
import CreateRoomPage from './CreateRoomPage';
import MusicPlayer from './MusicPlayer';

export default class RoomJoinPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            votes_to_skip: 2,
            guest_can_pause: false,
            is_host: false,
            showSettings: false,
            spotifyAuthenticated: false,
            music: {},
        };
        this.getRoomDetails = this.getRoomDetails.bind(this)
        this.authenticateSpotify = this.authenticateSpotify.bind(this)
        this.getCurrentMusic = this.getCurrentMusic.bind(this)
        this.leaveButtonPressed = this.leaveButtonPressed.bind(this)
        this.updateShowSettings = this.updateShowSettings.bind(this)
        this.renderSettingsButton = this.renderSettingsButton.bind(this)
        this.renderSettings = this.renderSettings.bind(this)

        this.roomCode = this.props.match.params.roomCode;
        this.getRoomDetails()
        this.getCurrentMusic()
    }

    getRoomDetails() {
        fetch(`http://127.0.0.1:8000/api/get-room?code=${this.roomCode}`)
        .then((response) => {
            if(!response.ok) {
                this.props.leaveRoomCallback();
                this.props.history.push("/")
            }
            return response.json()
        })
        .then((roomData) => {
            this.setState({
                votes_to_skip: roomData.votes_to_skip,
                guest_can_pause: roomData.guest_can_pause,
                is_host: roomData.is_host,
            });
            if (this.state.is_host) {
                this.authenticateSpotify()
            }
        })
    }

    authenticateSpotify() {
        fetch('/spotify/is-auth')
        .then((response) => response.json())
        .then((data) => {
            this.setState({ spotifyAuthenticated: data.status });

            if (!data.status) {
                fetch('/spotify/get-auth-url')
                .then((response) => response.json())
                .then((data) => {
                    window.location.replace(data.url);
                });
            }
        });
    }

    getCurrentMusic() {
        fetch('/spotify/current-music')
        .then((response) => {
            if (!response.ok) {
                return {}
            }
            else {
                return response.json()
            }
        })
        .then((data) => {
            this.setState({music: data})
        } );
    }

    componentDidMount() {
        this.interval = setInterval(this.getCurrentMusic, 1000)
    }
    componentWillUnmount() {
        clearInterval(this.interval)
    }



    renderSettingsButton() {
        return (
        <Grid item xs={12} align="center">
            <Button
                variant="contained"
                color="primary"
                onClick={() => this.updateShowSettings(true)}
                >
                Settings
            </Button>
        </Grid>
        )
    }

    updateShowSettings(value) {
        this.setState({
            showSettings: value,
        })
    }

    renderSettings() {
        return(
            <Grid container spacing={1}>
                <Grid item xs={12} align='center'>
                    <CreateRoomPage
                    update={true}
                    votesToSkip={this.state.votes_to_skip}
                    guestCanPause={this.state.guest_can_pause}
                    roomCode={this.roomCode}
                    updateCallback={this.getRoomDetails}
                    />
                </Grid>
                <Grid item xs={12} align="center">
                    <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => this.updateShowSettings(false)}
                    >
                    Close
                    </Button>
                </Grid>
            </Grid>
        )
    }



    leaveButtonPressed() {
        const requestOptions = {
            method: "POST",
            headers: {"Content-Type": "application/json"},
        }
        fetch('/api/leave-room', requestOptions)
        .then((_response) => {
            this.props.leaveRoomCallback()
            this.props.history.push('/')
        })
    }


    render() {
        if (this.state.showSettings) {
            return this.renderSettings()
        }
        return (
            <Grid container spacing={1} justifyContent="center">
                <Grid item xs={12} align="center">
                    <Typography variant="h4" component="h4">
                        Code : {this.roomCode}
                    </Typography>
                </Grid>

                <MusicPlayer {...this.state.music} />
                
                {this.state.is_host ? this.renderSettingsButton() : null}
                <Grid item xs={12} align="center">
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={this.leaveButtonPressed}
                    >
                        Leave Room
                    </Button>
                </Grid>
            </Grid>
            );
        }
}