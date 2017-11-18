import React, { Component } from 'react';

class Config extends Component {
    constructor() {
        super();
        this.state = {
            streamers: [],
            twitter: '',
            twitch: ''
        };

        this.addStreamer = this.addStreamer.bind(this);
        this.twitterChanged = this.twitterChanged.bind(this);
        this.twitchChanged = this.twitchChanged.bind(this);
        this.deleteStreamer = this.deleteStreamer.bind(this);
    }

    componentDidMount() {
        fetch('/streamers')
            .then(res => res.json())
            .then(response => {
                var streamers = [];
                if (!response.error) {
                    streamers = response.data;
                }
                this.setState({streamers: streamers});
            });
    }

    addStreamer(evt) {
        evt.preventDefault();

        fetch('/streamers/add', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                twitter: this.state.twitter,
                twitch: this.state.twitch
            })
        })
        .then(response => response.json())
        .then(res => {
            if (res.success) {
                this.setState({
                    twitter: '',
                    twitch: '',
                    streamers: res.data
                });
            } else {
                alert(res.error);
            }
        });
    }

    deleteStreamer(evt) {
        var twitchUser = evt.target.value;
        if (!twitchUser) {
            twitchUser = evt.target.parentNode.value;
        }
        
        fetch('/streamers/delete', {
            method: 'delete',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ twitch: twitchUser })
        })
        .then(response => response.json())
        .then(res => {
            if (res.success) {
                this.setState({
                    streamers: res.data
                });
            }
        });
    }

    twitterChanged(evt) {
        this.setState({
            twitter: evt.target.value
        });
    } 
    
    twitchChanged(evt) {
        this.setState({
            twitch: evt.target.value
        });
    }

    render() {
        var streamersList = null;
        if (this.state.streamers) {
            streamersList = this.state.streamers.map(streamer =>
                <Streamer 
                    twitter={streamer.twitter} 
                    twitch={streamer.twitch} 
                    key={streamer.twitter+'/'+streamer.twitch} 
                    deleteStreamer={this.deleteStreamer} 
                    value={streamer.twitch}
                />
            );
        }

        return (
            <div className="config-panel">
                <h4 className="page-header">Agregar streamer:</h4>
                <form className="form">
                    <div className="form-group">
                        <label>Usuario Twitter:</label>
                        <input type="text" name="twitter" className="form-control" value={this.state.twitter} onChange={this.twitterChanged}/>
                    </div>

                    <div className="form-group">
                        <label>Usuario Twitch:</label>
                        <input type="text" name="twitch" className="form-control" value={this.state.twitch} onChange={this.twitchChanged}/>
                    </div>

                    <button className="btn btn-primary" onClick={this.addStreamer}>Agregar</button>
                </form>

                <h4 className="page-header">Lista de streamers:</h4>
                <table className="table streamers-list">
                    <tbody>
                        <tr>
                            <th>Twitter</th>
                            <th>Twitch</th>
                            <th></th>
                        </tr>
                        {streamersList}
                    </tbody>
                </table>
            </div>
        );
    }
}

function Streamer(props) {
    return (
        <tr>
            <td><a href={'http://twitter/' + props.twitter} target="_blank">@{props.twitter}</a></td>
            <td><a href={'http://twitch.tv/' + props.twitch} target="_blank">http://twitch.tv/{props.twitch}</a></td>
            <td>
                <button className="btn btn-xs btn-danger" onClick={props.deleteStreamer} value={props.twitch}>
                    <span className="glyphicon glyphicon-remove"></span>
                </button>
            </td>
        </tr>
    );
}

export default Config;