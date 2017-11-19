/*
  A slideshow is a collection of Albums that are shown in order. The slideshow is responsible for
  remembering the current position and deciding which slide to play next. A slide show can be
  primed with a location and will do its best to start from that location, but will not guarantee
  that the slide exists in the current mode, in which case it will pick the most appopriate
  starting point
*/
import DropboxFileprovider from './DropboxFileprovider';
import FilesystemFileprovider from './FilesystemFileprovider';
import Album from './Album';

export default class Slideshow {
  constructor(fileProvider, defaults) {
    this.ready = false;
    this.fileProvider = fileProvider;
    this.defaults = defaults;
    fileProvider.on('update', this.init);
  }

  async init() {
    const fileList = await this.fileProvider.fileList();

    // Check for presence of slideshow.yml
    const slideshowDefinition
      = fileList.find(element => element.name.toLowerCase() === 'slideshow.yml');

    // Decide whether we're running in advanced or basic mode
    this.albums = slideshowDefinition ?
      this.parseDefinition(slideshowDefinition) : [this.createDefaultAlbum(fileList)];

    this.currentAlbum = 0;
    this.ready = true;
  }

  parseDefinition(slideshowDefinition) {
    console.log(this, slideshowDefinition);
  }

  createDefaultAlbum() {
    return [new Album(this.fileProvider, this.defaults)];
  }

  getImage() {
    console.log(this, 'GET IMAGE');
  }

  /*
    Returns the current album
  */
  getAlbum() {
    let album = this.albums[this.currentAlbum];

    // If the current album is finished, then pick next
    if (album.isFinished()) {
      if (this.currentAlbum < this.albums.length - 1) {
        this.currentAlbum = this.currentAlbum + 1;
      } else {
        this.currentAlbum = 0;
      }

      // Initialise the next album
      album = this.albums[this.currentAlbum];
      album.init();
    }

    return album;
  }
}

export function createDropboxSlideshow(dbx, path, defaults) {
  // Read folder contents
  // const response = await dbx.filesListFolder({ path });
  // const fileList = response.entries.map((entry) =>
  // {return { name: entry.name, path: entry.path_lower }});
  const fileProvider = new DropboxFileprovider(dbx, path);
  return new Slideshow(fileProvider, defaults);
}

export function createFilesystemSlideshow(path, uriPrefix, defaults) {
  const fileProvider = new FilesystemFileprovider(path, uriPrefix);
  return new Slideshow(fileProvider, defaults);
}
