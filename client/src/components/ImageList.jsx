import React from 'react';

const images = [
  'https://upload.wikimedia.org/wikipedia/commons/d/d6/STS120LaunchHiRes-edit1.jpg',
  'https://www.nasa.gov/sites/default/files/thumbnails/image/61a-s-0139.jpg',
];

class ImageList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { date: new Date(), imageIx: 0 };
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
    this.setState({
      date: new Date(),
      imageIx: this.state.imageIx >= images.length - 1 ? 0 : this.state.imageIx + 1,
    });
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
      backgroundImage: `url(${images[this.state.imageIx]})`,
      position: 'absolute',
      top: '0px',
      left: '0px',
      zIndex: 7,
      backgroundSize: 'cover',
      backgroundPosition: 'center center',
      backgroundRepeat: 'no-repeat',
      overflow: 'hidden',
      width: `${this.state.width}px`,
      height: `${this.state.height}px`,
    };
    return (
      <div className="image" style={divStyle}>
        <h1>{this.state.imageIx} - {this.state.date.toLocaleTimeString()}</h1>
      </div>
    );
  }
}

export default ImageList;
