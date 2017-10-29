const path = require('path')

module.exports = {
  use: [
          ['neutrino-preset-react', {
              html: {
                   title: 'Slideshow2'    
              }
          }],
          ['neutrino-preset-airbnb', {
            eslint: {
              globals: ['document','window'],
            }
          }],
        ]
};