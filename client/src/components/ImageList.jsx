import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import uuidv1 from 'uuid/v1';
import 'whatwg-fetch';

import '../css/imagelist.css';


class ImageList extends React.Component {
  constructor(props) {
    super(props);
    this.imgTagId = uuidv1();
    this.loadHandler = this.loadHandler.bind(this);
    this.errorHandler = this.errorHandler.bind(this);
  }

  componentWillMount() {
    this.updateDimensions();
  }

  componentDidMount() {
    this.periodicTimerID = setInterval(
      () => this.checkForUpdates(),
      10000,
    );
    window.addEventListener('resize', this.updateDimensions.bind(this));
    this.checkForUpdates();
  }

  componentDidUpdate() {
    const imageTag = document.getElementById(this.imgTagId);
    const imageLoaded = imageTag ? imageTag.complete : false;
    if (imageLoaded) {
      this.updateLoadedImage();
    }
  }

  componentWillUnmount() {
    clearInterval(this.periodicTimerID);
    if (this.scheduledTimerId) clearTimeout(this.scheduledTimerId);
    window.removeEventListener('resize', this.updateDimensions.bind(this));
  }

  updateLoadedImage() {
    if (this.state.preload && this.state.preload !== this.state.image) {
      this.setState({ image: this.state.preload });
    }
  }

  checkForUpdates() {
    if (!this.state.expires || this.state.expires <= Date.now()) {
      fetch('/api/image').then(res => res.json()).then((image) => {
        this.setState({ preload: image, expires: image.expires });
        // Clear any outstanding timers
        if (this.scheduledTimerId) clearTimeout(this.scheduledTimerId);

        // Set a minimum time here as we don't want to overload the server
        let timeToExpire = image.expires - Date.now();
        if (timeToExpire < 5000) {
          timeToExpire = 5000;
        }
        this.scheduledTimerId = setTimeout(() => this.checkForUpdates(), timeToExpire);
      }).catch((err) => {
        Raven.captureException(err);
      });
    }
  }

  componentDidCatch(error, info) {
    Raven.captureException(error, { extra: info, state: this.state });
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

  errorHandler(error) {
    Raven.captureException(error, { message: 'Image load failed', state: this.state });
  }

  render() {
    const divStyle = {
      width: `${this.state.width}px`,
      height: `${this.state.height}px`,
    };

    const bgStyle = {
      width: `${document.documentElement.clientWidth + 40}px`,
      height: `${document.documentElement.clientHeight + 40}px`,
    };

    // We create an image so that we always have one
    const image = {
      url: '#',
      name: '',
    };

    // Copy properties from state (if set) and update background
    if (this.state.image && this.state.image.url) {
      Object.assign(image, this.state.image);
      divStyle.backgroundImage = `url(${image.url})`;
      bgStyle.backgroundImage = `url(${image.url})`;
    }

    return (
      <div>
        <ReactCSSTransitionGroup
          transitionName="fade"
	  transitionEnterTimeout={500}
	  transitionLeaveTimeout={500}
	>
	  <div className="image" style={divStyle} title={image.name} key={image.url} />
	</ReactCSSTransitionGroup>

	{this.state.preload ?
          (<img id={this.imgTagId} className="preloadImage" src={this.state.preload.url} alt="" onLoad={this.loadHandler} onError={this.errorHandler} />)
          :
          (<div />)}
      </div>
    );
  }
}

export default ImageList;
