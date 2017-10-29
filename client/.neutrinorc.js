const path = require('path')

module.exports = {
  use: [
          ['neutrino-preset-react', {
            html: {
                 title: 'Slideshow'
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
              globals: ['document','window','fetch'],
            }
          }],
        ]
};