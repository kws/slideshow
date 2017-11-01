import React from 'react';
import 'whatwg-fetch';

class ImageList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { image: {} };
    this.loadHandler = this.loadHandler.bind(this);
  }

  componentWillMount() {
    this.updateDimensions();
  }

  componentDidMount() {
    this.timerID = setInterval(
      () => this.tick(),
      1000,
    );
    window.addEventListener('resize', this.updateDimensions.bind(this));
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
    window.removeEventListener('resize', this.updateDimensions.bind(this));
  }

  tick() {
    if (!this.state.image.expires || this.state.image.expires <= Date.now()) {
      fetch('/api/image').then(res => res.json()).then((image) => {
        this.setState({ preload: image });
      });
    }
  }

  updateDimensions() {
    const w = window;
    const body = document.getElementsByTagName('body')[0];
    const width = w.innerWidth || document.documentElement.clientWidth || body.clientWidth;
    const height = w.innerHeight || document.documentElement.clientHeight || body.clientHeight;

    this.setState({ width, height });
  }

  loadHandler() {
    this.setState({ image: this.state.preload, preload: undefined });
  }


  render() {
    const divStyle = {
      width: `${this.state.width}px`,
      height: `${this.state.height}px`,
      position: 'absolute',
      top: '0px',
      left: '0px',
      zIndex: 7,
      backgroundSize: 'cover',
      backgroundPosition: 'center center',
      backgroundRepeat: 'no-repeat',
      overflow: 'hidden',
    };

    if (this.state.image.url) {
      divStyle.backgroundImage = `url(${this.state.image.url})`;
    }

    const imgStyle = {
      display: 'none',
    };

    return (
      <div>
        <div className="image" style={divStyle} />
        {this.state.preload ? (<img src={this.state.preload.url} alt="" onLoad={this.loadHandler} style={imgStyle} />) : (<div />)}
      </div>
    );
  }
}

export default ImageList;
