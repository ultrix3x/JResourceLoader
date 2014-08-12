# jQuery plugin for ResourceLoader

## jQuery(selector).resourceLoader(options)
This is only valid for images.

For a specification of the available options please see below.

## jQuery.resourceLoader
This is generic and not bounded to any selectors.


### jQuery.resourceLoader.load(src, options)

For a specification of the available options please see below.

### jQuery.resourceLoader.loadImage(src, options)

For a specification of the available options please see below.

### jQuery.resourceLoader.loadImages(options)
Start the automatic process of loading images. This function scans the document each 10 millisecond to see if there are new images to load.

### jQuery.resourceLoader.stopImageloading()
Stop the automatic image loading.

### jQuery.resourceLoader.getVersion()
Get the current version of the resourceLoader

## options
These are the options available for the resource loader.

### options.attributeName
Which attribute to look for. The default value is "resource" which means that it scans for images with the attribute "data-resource-src" set.

### options.cache
Boolean value to indicate if the local cache should be used or not.

### options.cacheName
This is the internal name used as the key in the cache.

This is only available in the complete callback.

To be honest. This is one value that isn't meaningful to use outside the cache management.

### options.cacheTimeout
The number of seconds that should be used as a timeout for the cache.

### options.complete
A callback that is called when the resource is loaded.

This function should take one argment, the options object.

```javascript
options.complete = function(options) {
  // Do thatever you need to do here
};
```

### options.imageElement
Which physical image element is this image connected to.

This is only available in the complete callback.

### options.imageType
Specifies which type of image this was. Currently it supports jpeg/png/gif.

This is only available in the complete callback.

### options.loadCount
The number of active loads.

This property will probably be removed since it isn't fully implemented and has also lost its meaning.

This is only available in the complete callback.

### options.loadedFrom
Specifies from where the resource has been loaded or if a test prevented it from loading.

This is only available in the complete callback.

### options.mediaType
Specifies which type of data this was.

How was this code treated? This property tells you if it was js, css och image.

This is only available in the complete callback.

### options.rawsrc
This is the src defined by the data attribute.

This is only available in the complete callback.

### options.self
This is the internally used pointer to the resourceLoader. (Since this isn't possible to use everywhere the property self is assigned the value of this so it can be reused properly.)

This is only available in the complete callback.

### options.src
The src for the resource loaded.

This is only available in the complete callback.

### options.test
This is either a callback or a boolean value.

If it evaluates to true then the loading precedure is aborted.

The callback function comes with the options object as an argument.

This is useful to load resources that require other features.

```javascript
options.test = function(options) {
  return (window.magicNumber == 13);
}
```

### options.waitFor
This is a callback that will loop every 10 millisecond until it returns true.

The callback function comes with the options object as an argument.

This is useful when you have to make sure that other features has been loaded properly befor including this resource.

```javascript
// Wait for jQuery to load
options.waitFor = function(options) {
  if(window.jQuery) {
    return true;
  }
  return false;
}
```