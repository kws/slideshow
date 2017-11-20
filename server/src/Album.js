/*

*/
const imageFileRE = /\.(gif|jpe?g|png)$/i;
const DEFAULTS = {
  duration: 60,
};
const CONFIG = {
  path: '.',
};

function shuffle(arr) {
  // Linting rules don't like modifying function arg
  const a = arr;
  // While there are elements in the array
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function nameComparator(a, b) {
  const nameA = a.name.toLowerCase();
  const nameB = b.name.toLowerCase();
  if (nameA < nameB) {
    return -1;
  } else if (nameA > nameB) {
    return 1;
  }
  return 0;
}

export default class Album {
  constructor(fileProvider, defaults, config) {
    this.fileProvider = fileProvider;
    this.defaults = Object.assign({}, DEFAULTS, defaults);
    this.config = Object.assign({}, CONFIG, config);
    this.finished = false;

    console.log('DEFAULTS', this.defaults);
    console.log('CONFIG', this.config);
  }

  isFinished() {
    return this.finished;
  }

  async init() {
    console.log('Loading images');
    const allFiles = await this.fileProvider.fileList(this.config.path);

    let list = [];
    allFiles.forEach((entry) => {
      if (imageFileRE.test(entry.name)) {
        list.push(entry);
      }
    });

    // Order
    switch (this.config.order) {
      case 'random':
        list = shuffle(list);
        break;
      case 'asc':
      default:
        list.sort(nameComparator);
        break;
    }

    // Max entries
    if (this.config.maxSlides && this.config.maxSlides < list.length) {
      list = list.slice(0, this.config.maxSlides);
    }

    this.imageList = list;
    this.finished = false;
    delete this.currentImageName;
    delete this.currentExpires;
  }

  async getImageList() {
    if (!this.imageList || this.imageList.length === 0) {
      await this.init();
    }
    return this.imageList;
  }

  async getImage() {
    const images = await this.getImageList();

    // Try to find the current image in the list
    let imageIx = 0;
    if (this.currentImageName) {
      imageIx = images.findIndex(el => el.name === this.currentImageName);
    }
    if (imageIx < 0) {
      imageIx = 0;
    }

    // Fetch the image - should we have a fallback?
    let image = images[imageIx];

    // Check if image has expired
    let { currentExpires } = this;
    console.log(`Refreshing ${image.name} with index ${imageIx} in ${currentExpires - Date.now()}ms`);
    if (currentExpires && currentExpires <= Date.now()) {
      currentExpires = Date.now() + (this.defaults.duration * 1000);
      imageIx = images.indexOf(image) + 1;

      // We're done!
      if (imageIx >= images.length) {
        this.finished = true;
        return undefined;
      }

      image = images[imageIx];
    }

    // Set expiry on new images
    if (!currentExpires) {
      currentExpires = Date.now() + (this.defaults.duration * 1000);
    }
    image.expires = currentExpires;

    // We can use urlExpires as a proxy to see if a temporary link exists
    if (!image.urlExpires || image.urlExpires < Date.now()) {
      const link = await this.fileProvider.getFileLink(image);
      image.url = link;
      image.urlExpires = Date.now() + (180 * 60 * 1000); // expire after 3 hours
    }

    console.log(`Image index is now ${imageIx} and the current image is ${image.name}`);
    this.currentImageName = image.name;
    this.currentExpires = currentExpires;
    return image;
  }
}
