import assert from 'assert';
import delay from 'timeout-as-promise';
import { createFilesystemSlideshow } from '../src/SlideShow';


describe('Slideshow Operations', function() {
  it('should initialise', async function() {
    const slideshow = createFilesystemSlideshow('./samples/basic', '', {});
    assert.equal(slideshow.ready, false);
    await slideshow.init();
    assert.equal(slideshow.ready, true);
  });

  it('should load files', async function() {
    const slideshow = createFilesystemSlideshow('./samples/basic', '/images/', {});
    await slideshow.init();
    let image = await slideshow.getImage();
    assert.equal(image.name, 'image1.jpg');
    assert.equal(image.url, '/images/image1.jpg');

    // Calling it again should yield the same result
    image = await slideshow.getImage();
    assert.equal(image.name, 'image1.jpg');
  });

  it('should load new image if I wait', async function() {
    const slideshow = createFilesystemSlideshow('./samples/basic', '', {imageTimeout: 0.1});
    await slideshow.init();

    // We start with first image
    let image = await slideshow.getImage();
    assert.equal(image.name, 'image1.jpg');

    // If I wait more than timeout, and then call it again should, I should get next image
    await delay(150);
    image = await slideshow.getImage();
    assert.equal(image.name, 'image2.png');
  });

  it('after list is finished, Album should be finished', async function() {
  	// Set images for immediate timeout
    const slideshow = createFilesystemSlideshow('./samples/basic', '', {imageTimeout: 0});
    await slideshow.init();

    // We start with first image
    let image = await slideshow.getImage();
    assert.equal(image.name, 'image1.jpg');
    image = await slideshow.getImage();
    assert.equal(image.name, 'image2.png');
    image = await slideshow.getImage();
    assert.equal(image.name, 'IMAGE3.PNG');

    // If album loops, then it's working
    image = await slideshow.getImage();
    assert.equal(image.name, 'image1.jpg');
 
  });

});