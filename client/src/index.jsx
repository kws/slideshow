import React from 'react';
import { render } from 'react-dom';
import ImageList from './components/ImageList';

Raven.config('https://bb7f23ab0372481090a6ba26043d6a2b@sentry.io/239525').install();
Raven.context(() => {
  render(<ImageList />, document.getElementById('root'));
});
