const React = require('react');
const ReactDOM =  require('react-dom');

const config = {
  // Initialize Firebase
  apiKey: "AIzaSyAsVat3Vg3ovNdcY73fm5i8qf6T9jgIsbg",
  authDomain: "kare-ok.firebaseapp.com",
  databaseURL: "https://kare-ok.firebaseio.com",
  storageBucket: "",
  messagingSenderId: "76640844510"
};

firebase.initializeApp(config);

class App extends React.Component {
  constructor() {
    super();

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.onSearchResponse = this.onSearchResponse.bind(this);
    this.removeSong = this.removeSong.bind(this);
    this.state = {
      userChoice: '',
      songs: [],
      currentTrack: {
        id: ""
      }
    };
  }

  getSong(song) {
    const request = gapi.client.youtube.search.list({
      part: 'snippet',
      q: `${song} kareoke`,
      relevanceLanguage: 'en',
      type: 'video',
      videoEmbeddable: 'true'
    });
    request.execute(this.onSearchResponse);
  }

  componentDidMount() {
    firebase.database().ref('playlist')

    const dbRef = firebase.database().ref('playlist').on('value', (res) => {
        const data = res.val();
        const songs = [];
        for (let key in data) {
          data[key].key = key;
          songs.push(data[key]);
        }
        this.setState({
          songs
        });

    });

    const dbRefTwo = firebase.database().ref('currentTrack').on('value', (res) => {
        const dbTrack = res.val();
        console.log(dbTrack);
        const currentTrack = {};

        currentTrack.id = dbTrack.id
        this.setState({
          currentTrack
        });
    });

  }

  onSearchResponse(response) {
    const track = response.items[0];
    const songs = this.state.songs;

    const song = {
      id: track.id.videoId,
      title: track.snippet.title,
      thumbnail: track.snippet.thumbnails.high
    };

    const dbRef = firebase.database().ref('playlist');
    dbRef.push(song);
    this.trackName.value = "";

  }

  handleSubmit(e) {
    e.preventDefault();
    this.getSong(this.state.userChoice);
  }

  handleChange(e) {
    this.setState({userChoice: e.target.value })
  }

  removeSong(song) {
    firebase.database().ref(`playlist/${song.key}`).remove();
  }

  playSong(song) {
    firebase.database().ref('currentTrack');

    const dbRef = firebase.database().ref('currentTrack');
    const currentTrack = {
      id: song.id
    };
    dbRef.update(currentTrack);
  }

  render() {
    return (
      <div>
          <form onSubmit={(e) => this.handleSubmit.call(this, e)}>
            <div className="form-group">
              <div className="input-group">
                <input type="text" placeholder="Enter a song" value={this.state.userChoice} onChange={this.handleChange} ref={ref => this.trackName = ref} className="form-control" />
                <span className="input-group-btn">
                  <button type="submit" value="submit" className="btn btn-primary">Add to Playlist</button>
                </span>
              </div>
            </div>
          </form>
          <div className="row">
            <div className="col-md-7">
              <iframe id='ytplayer' type='text/html' width='640px' height='390px' src={`https://www.youtube.com/embed/${this.state.currentTrack.id}?autoplay=1`} frameBorder='0' />
            </div>
            <div className="col-md-5">

                {this.state.songs.map((song, i) =>
                  <div className="row" key={i}>
                    <div className="col-md-6">
                      <div><h5>{song.title}></h5></div>
                    </div>
                    <div className="col-md-6 btn-group">
                      <a href="#" className="btn btn-success" onClick={(e) => this.playSong.call(this, song)}>Play</a>
                      <a href="#" className="btn btn-danger" onClick={(e) => this.removeSong.call(this, song)}>Remove</a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
    )
  }
};


ReactDOM.render(<App />, document.getElementById('app'));
