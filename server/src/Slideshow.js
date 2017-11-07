

/**
    A slideshow is a collection of Albums that are shown in order. The slideshow is responsible for remembering the current position and 
    deciding which slide to play next. A slide show can be primed with a location and will do its best to start from that location,
    but will not guarantee that the slide exists in the current mode, in which case it will pick the most appopriate starting point

**/
export default class Slideshow {
  constructor(fileList, cursor) {
    this.fileList = fileList;
    this.cursor = cursor;

    // Check for presence of slideshow.yml
    const slideshowDefinition = fileList.find(element => element.name.toLowerCase() === 'slideshow.yml');

    // Decide whether we're running in advanced or basic mode
    this.albums = slideshowDefinition ? 
      this.parseDefinition(slideshowDefinition) : [this.createDefaultAlbum(fileList)];

  }


  parseDefinition(slideshowDefinition) {

  }

  createDefaultAlbum(fileList) {

  }

}

export async function createDropboxSlideshow(dbx, path) {
  // Read folder contents
  const response = await dbx.filesListFolder({ path });
  const fileList = response.entries.map((entry) => {return { name: entry.name, path: entry.path_lower }});

  return new Slideshow(fileList, response.cursor);
}
