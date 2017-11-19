/*
  A Fileprovider that reads files from the local filesystem.

  For use in the slideshow, this needs to be configured with an appropriate public filelocation that
  actually serves the content.
*/
import fs from 'fs';
import path from 'path';
import EventEmitter from 'events';

export default class FilesystemFileprovider extends EventEmitter {
  constructor(file, uriPrefix) {
    super();
    this.path = file;
    this.uriPrefix = uriPrefix;
  }

  fileList(file) {
    const fullPath = file ? path.join(this.path, file) : this.path;
    return new Promise((fulfill, reject) => {
      fs.readdir(fullPath, (err, items) => {
        if (err) {
          reject(err);
        } else {
          const files = items.map((item) => {
            const result = { name: item, path: path.relative(this.path, fullPath) };
            return result;
          });
          fulfill(files);
        }
      });
    });
  }

  getFileContent(file) {
    const fullPath = path.join(this.path, file.path, file.name);
    return new Promise((fulfill, reject) => {
      fs.readFile(fullPath, (err, content) => {
        if (err) {
          reject(err);
        } else {
          fulfill(content);
        }
      });
    });
  }

  async getFileLink(file) {
    return `${this.uriPrefix}${file.name}`;
  }
}
