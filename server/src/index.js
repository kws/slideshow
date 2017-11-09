import express from 'express';
import Dropbox from 'dropbox';

const port = process.env.PORT || 8000;
const slideshowFolder = process.env.SLIDESHOW_FOLDER || '/slideshow/current';
const imageTimeout = process.env.SLIDESHOW_TIMEOUT || 60;

const dbx = new Dropbox({ accessToken: process.env.DROPBOX_API_KEY });

const imageFileRE = /\.(gif|jpe?g|png)$/i;

let imageList = [];
let currentImageName;
let currentExpires = Date.now();

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
    if (imageFileRE.test(entry.name)) {
      list.push({ name: entry.name, path: entry.path_lower });
    }
  });
  list.sort((a, b) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    if (nameA < nameB) {
      return -1;
    } else if (nameA > nameB) {
      return 1;
    }
    return 0;
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

  // Try to find the current image in the list
  let imageIx = 0;
  if (currentImageName) {
    imageIx = images.findIndex(el => el.name === currentImageName);
  }
  if (imageIx < 0) {
    imageIx = 0;
  }

  // Fetch the image - should we have a fallback?
  let image = images[imageIx];

  // Check if image has expired
  console.log(`Refreshing ${image.name} with index ${imageIx} in ${currentExpires - Date.now()}ms`);
  if (currentExpires && currentExpires <= Date.now()) {
    currentExpires = Date.now() + (imageTimeout * 1000);
    imageIx = images.indexOf(image) + 1;
    if (imageIx >= images.length) {
      imageIx = 0;
    }
    image = images[imageIx];
  }

  // Set expiry on new images
  if (!currentExpires) {
    currentExpires = Date.now() + (imageTimeout * 1000);
  }

  // We can use urlExpires as a proxy to see if a temporary link exists
  if (!image.urlExpires || image.urlExpires < Date.now()) {
    const response = await dbx.filesGetTemporaryLink({ path: image.path });
    image.url = response.link;
    image.urlExpires = Date.now() + (180 * 60 * 1000); // expire after 3 hours
  }

  console.log(`Image index is now ${imageIx} and the current image is ${image.name}`);
  currentImageName = image.name;
  return image;
}

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
    const image = await getImage();
    res.send({ name: image.name, expires: currentExpires, url: image.url });
  } catch (err) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  }
});

app.get('/api/images', nocache, async (req, res) => {
  try {
    await getImageList();
    res.send(imageList);
  } catch (err) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  }
});

app.get('/api/refresh', nocache, async (req, res) => {
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

