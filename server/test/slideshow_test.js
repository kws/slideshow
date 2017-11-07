import assert from 'assert';
import Slideshow from '../src/SlideShow';

describe('simple', () => {
  it('should be sane', () => {

    const fileList = ['file1','file2','file3'].map((entry) => {return { name: entry, path: '/slideshow/' + entry }});

    const ss = new Slideshow(fileList, 'c1');

    assert.equal(ss.fileList, fileList);
    assert.equal(ss.cursor, 'c1');

  });
});
