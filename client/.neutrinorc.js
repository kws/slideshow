const path = require('path')

module.exports = {
  use: [
          ['neutrino-preset-react', {
            html: {
              title: 'Slideshow',
              scripts: [
                {src: 'https://cdn.ravenjs.com/3.19.1/raven.min.js', crossorigin: 'anonymous'},
              ]
            },
            devServer: {
              "host": "localhost",
              "port": 5000,
              "proxy": [
                {
                  "context": [
                    "/api/",
                  ],
                  "target": "http://localhost:8000/",
                  "secure": false
                }
              ]
            },
          }],
          ['neutrino-preset-airbnb', {
            eslint: {
              globals: ['document','window','fetch','Raven'],
            }
          }],
        ]
};