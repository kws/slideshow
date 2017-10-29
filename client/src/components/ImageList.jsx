import React from 'react';
import 'whatwg-fetch';

class ImageList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { image: {} };
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
        this.setState({ image });
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

    return (
      <div className="image" style={divStyle} />
    );
  }
}

export default ImageList;
