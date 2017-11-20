import express from 'express';
import Dropbox from 'dropbox';
import { createDropboxSlideshow } from './Slideshow';

const dbx = new Dropbox({ accessToken: process.env.DROPBOX_API_KEY });
const slideshowFolder = process.env.SLIDESHOW_FOLDER || '/slideshow/current';
const defaults = {
  duration: process.env.SLIDESHOW_DURATION || 60,
};

const port = process.env.PORT || 8000;

function createSlideshow() {
  return createDropboxSlideshow(dbx, slideshowFolder, defaults);
}

let slideshow = createSlideshow();


const app = express();

function nocache(req, res, next) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
}

app.use(nocache, express.static('public'));

app.get('/api/image', nocache, async (req, res) => {
  try {
    const image = await slideshow.getImage();
    // res.send({ name: image.name, expires: currentExpires, url: image.url });
    res.send(image);
  } catch (err) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  }
});

app.get('/api/refresh', nocache, async (req, res) => {
  try {
    slideshow = createSlideshow();
    const image = await slideshow.getImage();
    res.send(image);
  } catch (err) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  }
});

app.listen(port, () => {
  console.log(`Slideshow server listening on port ${port}!`);
});

