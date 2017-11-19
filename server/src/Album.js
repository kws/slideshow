/*

*/
const imageFileRE = /\.(gif|jpe?g|png)$/i;
const DEFAULTS = {
  imageTimeout: 60,
};

export default class Album {
  constructor(fileProvider, defaults) {
    this.fileProvider = fileProvider;
    this.defaults = Object.assign({}, DEFAULTS, defaults);
    this.finished = false;
  }

  isFinished() {
    return this.finished;
  }

  async init() {
    console.log('Loading images');
    const allFiles = await this.fileProvider.fileList();
    const list = [];
    allFiles.forEach((entry) => {
      if (imageFileRE.test(entry.name)) {
        list.push(entry);
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
    this.imageList = list;
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
      currentExpires = Date.now() + (this.defaults.imageTimeout * 1000);
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
      currentExpires = Date.now() + (this.defaults.imageTimeout * 1000);
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
