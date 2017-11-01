import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import uuidv1 from 'uuid/v1';
import 'whatwg-fetch';

import '../css/imagelist.css';


class ImageList extends React.Component {
  constructor(props) {
    super(props);
    this.loadHandler = this.loadHandler.bind(this);
    this.imgTagId = uuidv1();
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

  componentDidUpdate() {
    const imageTag = document.getElementById(this.imgTagId);
    const imageLoaded = imageTag ? imageTag.complete : false;
    if (imageLoaded) {
      this.updateLoadedImage();
    }
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
    window.removeEventListener('resize', this.updateDimensions.bind(this));
  }

  updateLoadedImage() {
    if (this.state.preload) {
      this.setState({ images: [this.state.preload], preload: undefined });
    }
  }


  tick() {
    if (!this.state.expires || this.state.expires <= Date.now()) {
      fetch('/api/image').then(res => res.json()).then((image) => {
        this.setState({ preload: image, expires: image.expires });
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
    this.updateLoadedImage();
  }

  render() {
    const imgStyle = {
      display: 'none',
    };

    const images = this.state.images ? this.state.images : [];
    const imageItems = images.map((image) => {
      const divStyle = {
        width: `${this.state.width}px`,
        height: `${this.state.height}px`,
        position: 'absolute',
        top: '0px',
        left: '0px',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        overflow: 'hidden',
      };
      if (image.url) {
        divStyle.backgroundImage = `url(${image.url})`;
      }
      return (<div className="image" style={divStyle} key={image.url} title={image.name} />);
    });

    return (
      <div>
        <ReactCSSTransitionGroup
          transitionName="fade"
          transitionEnterTimeout={500}
          transitionLeaveTimeout={500}
        >
          {imageItems}
        </ReactCSSTransitionGroup>

        {this.state.preload ? (<img id={this.imgTagId} src={this.state.preload.url} alt="" onLoad={this.loadHandler} style={imgStyle} />) : (<div />)}
      </div>
    );
  }
}

export default ImageList;
