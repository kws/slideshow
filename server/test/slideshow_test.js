import assert from 'assert';
import { createFilesystemSlideshow } from '../src/SlideShow';

describe('basic', function() {
  it('should initialise', async function() {

 
    const slideshow = createFilesystemSlideshow('./samples/basic', '', {});
    assert.equal(slideshow.ready, false);

    await slideshow.init();

    assert.equal(slideshow.ready, true);

  });
});
