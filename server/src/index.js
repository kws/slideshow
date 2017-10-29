import express from 'express';
import Dropbox from 'dropbox';

const port = process.env.PORT || 8000;
const slideshowFolder = process.env.SLIDESHOW_FOLDER || '/slideshow/current';
const imageTimeout = process.env.SLIDESHOW_TIMEOUT || 60;

const dbx = new Dropbox({ accessToken: process.env.DROPBOX_API_KEY });

let imageList = [];
let imageIx = 0;

async function awaitChanges(cursor) {
  console.log('Waiting for changes', cursor);
  const response = await dbx.filesListFolderLongpoll({ cursor });
  if (response.changes) {
    console.log('change detected', response);
    imageList = [];
  } else {
    awaitChanges(cursor);
  }
}

async function loadImages() {
  console.log('Loading images');
  const response = await dbx.filesListFolder({ path: slideshowFolder });
  awaitChanges(response.cursor);
  const list = [];
  response.entries.forEach((entry) => {
    list.push({ name: entry.name, path: entry.path_lower });
  });
  imageList = list;
}

async function getImageList() {
  if (imageList.length === 0) {
    await loadImages();
  }
  return imageList;
}

async function getImage() {
  const images = await getImageList();

  // Safety check
  if (imageIx >= images.length) {
    imageIx = 0;
  }

  // Fetch the image - should we have a fallback?
  let image = images[imageIx];

  // Check if image has expired
  console.log(`Refreshing ${image.name} with index ${imageIx} in ${image.expires - Date.now()}ms`);
  if (image.expires && image.expires <= Date.now()) {
    image.expires = undefined;
    imageIx = images.indexOf(image) + 1;
    if (imageIx >= images.length) {
      imageIx = 0;
    }
    image = images[imageIx];
  }

  // Set expiry on new images
  if (!image.expires) {
    image.expires = Date.now() + (imageTimeout * 1000);
  }

  //
  if (!image.url) {
    const response = await dbx.filesGetTemporaryLink({ path: image.path });
    image.url = response.link;
  }

  console.log(`Image index is now ${imageIx} and the current image is ${image.name}`);
  return image;
}

const app = express();

app.use(express.static('public'));

app.get('/api/image', async (req, res) => {
  try {
    const image = await getImage();
    res.send({ name: image.name, expires: image.expires, url: image.url });
  } catch (err) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  }
});

app.get('/api/images', async (req, res) => {
  try {
    await getImageList();
    res.send(imageList);
  } catch (err) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  }
});

app.get('/api/refresh', async (req, res) => {
  try {
    imageList = [];
    await getImageList();
    res.send(imageList);
  } catch (err) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  }
});

app.listen(port, () => {
  console.log(`Slideshow server listening on port ${port}!`);
});

