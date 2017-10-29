import express from 'express';
import Dropbox from 'dropbox';

const app = express();
const port = process.env.PORT || 8000;

const dbx = new Dropbox({ accessToken: process.env.DROPBOX_API_KEY });

let imageList = [];
let imageIx = 0;

async function loadImages() {
  const response = await dbx.filesListFolder({ path: '/slideshow' });
  const list = [];
  response.entries.forEach((entry) => {
    list.push({ name: entry.name, path: entry.path_lower });
  });
  return list;
}

async function getImageList() {
  if (imageList.length === 0) {
    imageList = await loadImages();
  }
  return imageList;
}

async function getImage() {
  const images = await getImageList();
  let image = images[imageIx];

  // Check if image has expired
  console.log(`Expecting image to expire ${image.expires} and comparing with ${Date.now()}`);
  if (image.expires && image.expires <= Date.now()) {
    image.expires = undefined;
    imageIx += 1;
    if (imageIx >= images.length) {
      imageIx = 0;
    }
    image = images[imageIx];
  }

  // Set expiry on new images
  if (!image.expires) {
    image.expires = Date.now() + (60 * 1000);
  }


  //
  if (!image.url) {
    const response = await dbx.filesGetTemporaryLink({ path: image.path });
    image.url = response.link;
  }
  return image;
}

app.get('/api/image', async (req, res) => {
  try {
    const image = await getImage();
    res.send({ name: image.name, expires: image.expires, url: image.url });
  } catch (err) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

