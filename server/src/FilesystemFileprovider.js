/*
  A Fileprovider that reads files from the local filesystem.

  For use in the slideshow, this needs to be configured with an appropriate public filelocation that
  actually serves the content.
*/
import fs from 'fs';
import EventEmitter from 'events';

export default class FilesystemFileprovider extends EventEmitter {
  constructor(path, uriPrefix) {
    super();
    this.path = path;
    this.uriPrefix = uriPrefix;
  }

  fileList() {
    return new Promise((fulfill, reject) => {
      fs.readdir(this.path, (err, items) => {
        if (err) {
          reject(err);
        } else {
          const files = items.map((item) => { const file = { name: item }; return file; });
          console.log(files);
          fulfill(files);
        }
      });
    });
  }
}
