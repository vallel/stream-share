import React, { Component } from 'react';
import Config from './Config';
import './App.css';

const { ipcRenderer } = window.require('electron');

const totalTweetsToShow = 25;

class App extends Component {
  constructor() {
    super();
    this.state = {
      tweets: [],
      showConfig: false
    };

    this.showConfig = this.showConfig.bind(this);
  }

  componentDidMount() {
    ipcRenderer.on('test', msg => {
      alert('test')
    })

    ipcRenderer.on('tweet', (event, tweet) => {
      var tweets = this.state.tweets.slice();
      tweets.unshift(tweet);
      tweets = tweets.slice(0, totalTweetsToShow);
      this.setState({
        tweets: tweets,
        showConfig: this.state.showConfig
      });
    });
  }

  showConfig() {
    this.setState({showConfig: !this.state.showConfig});

    if (!this.state.showConfig) {
      ipcRenderer.send('restartStream');
    }
  }

  render() {
    var activeBtnClass = this.state.showConfig ? ' open ' : '';

    return (
      <div>
        { this.state.showConfig ? <Config /> : null }
        <button type="button" 
          className={'btn btn-primary config-btn' + activeBtnClass } 
          onClick={this.showConfig}>
          <span className="glyphicon glyphicon-cog"></span>
        </button>
        <div className="container-fluid">
          <h1 className="last-tweets-title text-primary">Últimos tweets compartidos:</h1>
          <div className="tweets">
            {this.state.tweets.map(tweet =>
              <Tweet tweet={tweet} key={tweet.id} />
            )}
          </div>
        </div>
      </div>
    );
  }
}

function Tweet(props) {
  var tweet = props.tweet;

  return (
    <div key={tweet.id} className="media tweet" data-id={tweet.id}>
      <div className="media-left">
        <img className="media-object img-circle tweet-user-img" src={tweet.user.profile_image_url} alt={tweet.user.name} />
      </div>
      <div className="media-body">
        <a href={'http://twitter.com/' + tweet.user.name} target="_blank" className="tweet-user">
          <strong className="tweet-user-screen-name">{tweet.user.screen_name}</strong> <span className="tweet-user-name text-muted">@{tweet.user.name}</span>
        </a>
        <div className="tweet-content">{tweet.text}</div>
      </div>
    </div>
  );
}

export default App;
