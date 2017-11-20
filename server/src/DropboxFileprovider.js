/*

*/
import { EventEmitter } from 'events';
import pathtool from 'path';
import fetch from 'node-fetch';

export default class DropboxFileprovider extends EventEmitter {
  constructor(dbx, path) {
    super();
    this.dbx = dbx;
    this.path = path;
  }

  async fileList(path) {
    const fullPath = path ? pathtool.join(this.path, path) : this.path;
    const response = await this.dbx.filesListFolder({ path: fullPath });

    // awaitChanges(response.cursor);
    return response.entries.map((entry) => {
      const file = { name: entry.name, path: pathtool.relative(this.path, fullPath) };
      return file;
    });
  }

  async getFileContent(file) {
    const fileLink = await this.getFileLink(file);
    const response = await fetch(fileLink);
    const content = await response.text();
    console.log(content);
    return content;
  }

  async getFileLink(file) {
    const fullPath = pathtool.join(this.path, file.path, file.name);
    const response = await this.dbx.filesGetTemporaryLink({ path: fullPath });
    return response.link;
  }
}
