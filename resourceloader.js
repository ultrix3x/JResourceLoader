(function(win, doc, rl, undef) {
  // Enable strict mode
  'use strict';
  // Define the version for this file
  var version = {
    text: "1.1.0",
    major: 1,
    minor: 1,
    sub: 0
  }
  // The reloadSystem implements the ResourceManager
  var reloadSystem = function(win, doc, rl, undef) {
    // If the Date.now isn't available then create a quich wrapper
    Date.now = Date.now || function() {
      return new Date().getTime();
    }
    // Use the current version (defined above) as the version for ResourceLoader
    rl.version = version;
    // Setup a storage object
    rl.storage = {};
    if(win.localStorage) {
      // If localStorage is available the use it
      // Create a wrapper for getting data
      rl.storage.get = function(key, timeout) {
        // If timeout is undefined the set it to 36000 seconds
        if(timeout == undef) {
          timeout = 3600;
        }
        // Recalculate the timeout to milliseconds used by the system
        timeout *= 1000;
        // Get data from localStorage
        var data = win.localStorage.getItem(key);
        // If the data was available then proceed
        if(data != null) {
          // Use a try/catch if JSON fails
          try {
            // Parse the JSON data
            var cached = JSON.parse(data);
            // If the parser returns a valid object and the timestamp is set
            // and the timestamp is valid then
            if(cached && cached.timestamp && ((cached.timestamp + timeout) >= Date.now())) {
              // return the cached data
              return cached.data;
            }
          } catch(e) {
            // If JSON failed the return null
            return null;
          }
        }
        // If no data was found or if the data wasn't fresh then return null
        return null;
      }
      rl.storage.set = function(key, value) {
        // Wrap the data to save in an object and add the current time as a timestamp.
        // Stringify it with JSON and send it to localStorage
        var data = JSON.stringify({"timestamp": Date.now(), "data": value});
        win.localStorage.setItem(key, data);
      }
    } else if(win.sessionStorage) {
      // If localStorage wasn't available but sessionStorage is the use it
      // Create a wrapper for getting data
      rl.storage.get = function(key, timeout) {
        // If timeout is undefined the set it to 36000 seconds
        if(timeout == undef) {
          timeout = 3600;
        }
        // Recalculate the timeout to milliseconds used by the system
        timeout *= 1000;
        // Get data from sessionStorage
        var data = win.sessionStorage.getItem(key);
        // If the data was available then proceed
        if(data != null) {
          // Use a try/catch if JSON fails
          try {
            // Parse the JSON data
            var cached = JSON.parse(data);
            // If the parser returns a valid object and the timestamp is set
            // and the timestamp is valid then
            if(cached && cached.timestamp && ((cached.timestamp + timeout) >= Date.now())) {
              // return the cached data
              return cached.data;
            }
          } catch(e) {
            // If JSON failed the return null
            return null;
          }
        }
        // If no data was found or if the data wasn't fresh then return null
        return null;
      }
      rl.storage.set = function(key, value) {
        // Wrap the data to save in an object and add the current time as a timestamp.
        // Stringify it with JSON and send it to sessionStorage
        var data = JSON.stringify({"timestamp": Date.now(), "data": value});
        win.sessionStorage.setItem(key, data);
      }
    }
    // A flag for compatibility.
    // If true then images may be loaded with this function
    // If false then images are loaded by replacing the src with data-*-src
    rl.isImageCompatible = null;
    // Load the given image given either as an element or an string
    rl.loadImage = function(elm, options) {
      // Make sure the options are an object
      options = options || {};
      // Create a local copy of options
      var _options = {};
      // Copy all properties in the old options to the new local
      for(var i in options) {
        _options[i] = options[i];
      }
      // If compatibility check hasn't been done the do that
      if(rl.isImageCompatible === null) {
        // If the browser doesn't support btoa then don't use loading this
        // way
        rl.isImageCompatible = (typeof(btoa) == 'function');
      }
      // Check if this is an image object
      if((typeof(elm) == 'object') && (elm.getAttribute)) {
        // Calculate which attribute name that should be used
        var attrName = _options.attributeName || 'resource';
        // Check if this attribute has been handled before
        if(elm.getAttribute('data-'+attrName+'-src-action') !== 'done') {
          // Should this image be loaded
          if(elm.getAttribute('data-'+attrName+'-src') !== null) {
            if(rl.isImageCompatible) {
              // Make sure that the assign function knowns where to use the
              // data later on
              _options.imageElement = elm;
              // Call the load function
              rl.load(elm.getAttribute('data-'+attrName+'-src'), _options);
            } else {
              elm.setAttribute('src', elm.getAttribute('data-'+attrName+'-src'));
              // Check if there is a complete-callback available
              if(_options.complete && _options.complete.call) {
                // Populate the options with info that is not set yet
                _options.loadedFrom = 'web/direct';
                _options.rawsrc = elm.getAttribute('data-'+attrName+'-src');
                _options.src = options.rawsrc;
                _options.imageElement = elm;
                // Call the complete-callback
                _options.complete.call(options.self, options);
              }
            }
            // Mark this image as handled
            elm.setAttribute('data-'+attrName+'-src-action', 'done');
          }
        }
      } else if(typeof(elm) == 'string') {
        // If the alements given was a string then assume it is an id
        // Retry loading this element by its id
        rl.loadImage(doc.getElementById(elm), _options);
      }
    }
    // The interval handler for loading images
    rl.loadImagesInterval = null;
    // Check all images on the page if they should be loaded this way
    rl.loadImages = function(options) {
      // Make sure the options are an object
      options = options || {};
      // Check if the interval has been started
      if(rl.loadImagesInterval === null) {
        // If not then start an interval
        rl.loadImagesInterval = setInterval(function() {
          // That loads all images on the page every 50 ms
          rl.loadImages(options);
        }, 50);
      }
      // Find all images on the page
      var imgList = doc.getElementsByTagName('img');
      // If there are any images to check if they can be handled
      if(imgList.length > 0) {
        // Loop through all images
        for(var i = 0; i < imgList.length; i++) {
          // Assign an imate to a variable
          var imgObj = imgList[i];
          // Check if there is an attribute name that should be used
          var attrName = options.attributeName || 'resource';
          // Does this images have the "-action" flag set?
          if(imgObj.getAttribute('data-'+attrName+'-src-action') == null) {
            // If not then check if there is a source to load
            if(imgObj.getAttribute && (imgObj.getAttribute('data-'+attrName+'-src') !== null)) {
              // Load the image
              rl.loadImage(imgObj, options);
            }
          }
        }
      }
    }
    // Load the given src as a script
    rl.stopImageLoading = function() {
      // If there is an interval started
      if(rl.loadImagesInterval !== null) {
        // Then stop it
        clearInterval(rl.loadImagesInterval);
        // And reset the variable
        rl.loadImagesInterval = null;
      }
    }
    // load is the main function which makes it possible to load a resource
    rl.load = function(src, options) {
      var mediaType;
      if(typeof(src) == "string") {
        // If src was a string then handle it directly
        // Make sure options is an object
        options = options || {};
        // Set loadCount to 0 if not already set
        options.loadCount = options.loadCount || 0;
        // Clear options.loadedFrom
        options.loadedFrom = null;
        // Fallback to allow both options.waitfor and options.waitFor
        options.waitfor = options.waitfor || options.waitFor;
        // Is there a waitfor defined
        if(options.waitfor) {
          // If this waitfor is callable
          if(options.waitfor.call) {
            // Call this waitfor callback
            if(options.waitfor.call(this, options) === false) {
              // If the callback returned false then the resource shouldn't
              // be loaded.
              // So wait for 10 ms and try again.
              setTimeout(function() {
                rl.load(src, options);
              }, 10);
              // Return the object itself to allow chaining
              return this;
            }
          }
        }
        // Is there a test defined
        if(options.test) {
          // If this test is callable
          if(options.test.call) {
            // Call this test callback
            if(options.test.call(this, options)) {
              // If the callback returned true then the test indicated that
              // the resource shouldn't be loaded.
              // Set the options.loadedFrom to indicate that the resource
              // wasn't loaded.
              options.loadedFrom = 'notLoaded/test';
              // Return the object itself to allow chaining
              return this;
            }
          } else if(options.test) {
            // If the options.test wasn't callable then check it it
            // evaluates to true
            // If it evaluates to true then set the options.loadedFrom
            // to indicate that the resource wasn't loaded.
            options.loadedFrom = 'notLoaded/test';
            // Return the object itself to allow chaining
            return this;
          }
        }
        // Save the original src to options as options.rawsrc
        options.rawsrc = src;
        // Check which media type to use
        if(src.match(/^js\!/g)) {
          // The src was prefixed with js!
          src = src.substring(3, src.length);
          mediaType = 'js';
        } else if(src.match(/^css\!/g)) {
          // The src was prefixed with css!
          src = src.substring(4, src.length);
          mediaType = 'css';
        } else if(src.match(/^(jpe|jpeg|jpg|gif|png)\!/g)) {
          // Save the image type for later usage
          options.imageType = src.substring(0, src.indexOf('!') - 1);
          // The src was prefixed with an image prefix
          src = src.substring(src.indexOf('!'), src.length);
          mediaType = 'image';
        } else if(src.match(/\.css$/g)) {
          // The src has a css file extension
          mediaType = 'css';
        } else if(options.mediaType = src.match(/\.(jpe|jpeg|jpg|gif|png)$/g)) {
          // Save the image type for later usage
          options.mediaType = options.mediaType[0].substring(1, options.mediaType[0].length);
          // The src has an image file extension
          mediaType = 'image';
        } else {
          // Assume that the src should be handled as a javascript file
          mediaType = 'js';
        }
        if(options.cache === true) {
          // If the cache should be used then create a simple unique key
          options.cacheName = src.replace(/[^a-zA-Z0-9]/g, '_');
        } else {
          // If no cache should be used then set the key to false
          options.cacheName = false;
        }
        // Set the options.src to the url to be used
        options.src = src;
        if(mediaType == 'js') {
          // If the media type is javascript (js) then call the scriptloader
          this._loadScript(src, options);
        } else if(mediaType == 'css') {
          // If the media type is javascript (js) then call the styleloader
          this._loadStyle(src, options);
        } else if(mediaType == 'image') {
          // If the media type is an image then call the imageloader
          this._loadImage(src, options);
        }
      } else if(typeof(src) == "object") {
        // If the given src was an object or array then loop through it
        // and call load again for every item in the object/array.
        // This however doesn't allow the usage of options.
        for(var i in src) {
          this.load(src[i]);
        }
      }
      // Return the object itself to allow chaining
      return this;
    }
    // Load the given src as a script
    rl._loadScript = function(src, options) {
      // Clear the data
      var data = null;
      // Make sure options is an object
      options = options || {};
      // If the cache should be used
      if(options.cacheName !== false) {
        // Get data from the cache
        var data = this.storage.get(options.cacheName, options.cacheTimeout);
        // If data isn't null
        if(data != null) {
          // Set the options.loadedFrom to cache to indicate that the
          // resource was loaded from the cache
          options.loadedFrom = 'cache';
          // Append the script
          return rl._appendScript(data, options);
        }
      }
      // Call the fetchData to send a request for the url
      rl._fetchData(src, options, rl._appendScript);
    }
    // Appends the data as a script node
    rl._appendScript = function(data, options) {
      // Find the head object
      var head = doc.getElementsByTagName('head')[0];
      // Create a script tag
      var scriptTag = doc.createElement('script');
      // Append the script to the script tag
      scriptTag.appendChild(doc.createTextNode(data));
      // Append the script tag to the head object
      head.appendChild(scriptTag);
      options.loadCount--;
      // If there is a options.complete callback defined...
      if(options && options.complete && options.complete.call) {
        // ...then call this
        options.complete.call(options.self, options);
      }
    }
    // Load the given src as a style
    rl._loadStyle = function(src, options) {
      // Clear the data
      var data = null;
      // Make sure options is an object
      options = options || {};
      // If the cache should be used
      if(options.cacheName !== false) {
        // Get data from the cache
        var data = this.storage.get(options.cacheName, options.cacheTimeout);
        // If data isn't null
        if(data != null) {
          // Set the options.loadedFrom to cache to indicate that the
          // resource was loaded from the cache
          options.loadedFrom = 'cache';
          // Append the style
          return rl._appendStyle(data, options);
        }
      }
      // Call the fetchData to send a request for the url
      rl._fetchData(src, options, rl._appendStyle);
    }
    // Appends the data as a style node
    rl._appendStyle = function(data, options) {
      // Find the head object
      var head = doc.getElementsByTagName('head')[0];
      // Create a style tag
      var styleTag = doc.createElement('style');
      // Append the style to the style tag
      styleTag.appendChild(doc.createTextNode(data));
      // Append the style tag to the head object
      head.appendChild(styleTag);
      options.loadCount--;
      // If there is a options.complete callback defined...
      if(options && options.complete && options.complete.call) {
        // ...then call this
        options.complete.call(options.self, options);
      }
    }
    // Load the given src as an image
    rl._loadImage = function(src, options) {
      var data = null;
      // Make sure options is an object
      options = options || {};
      // If the cache should be used
      if(options.cacheName !== false) {
        // Get data from the cache
        var data = this.storage.get(options.cacheName, options.cacheTimeout);
        // If data isn't null
        if(data != null) {
          // Set the options.loadedFrom to cache to indicate that the
          // resource was loaded from the cache
          options.loadedFrom = 'cache';
          // Assign the image to its proper place
          return rl._assignImage(data, options);
        }
      }
      // Call the fetchData to send a request for the url
      rl._fetchData(src, options, rl._assignImage);
    }
    // Appends the data as a style node
    rl._assignImage = function(data, options) {
      // Assign the data loaded to the proper image element
      options.loadCount--;
      
      // Create an url prefix
      var urlprefix = 'data:';
      // Based on the images media type
      if(options.mediaType == 'png') {
        urlprefix += 'image/png';
      } else if(options.mediaType == 'gif') {
        urlprefix += 'image/gif';
      } else {
        urlprefix += 'image/jpeg';
      }
      // and as base64
      urlprefix += ';base64,';
      // Assign this data as the src attribute on the image object
      options.imageElement.setAttribute('src', urlprefix+data);
      // If there is a options.complete callback defined...
      if(options && options.complete && options.complete.call) {
        // ...then call this
        options.complete.call(options.self, options);
      }
    }
    // FetchData gets the data from the given src
    rl._fetchData = function(src, options, callback) {
      // Make sure we know where this is
      options.self = this;
      // If options.mediaType is set then don't use jQuery
      if(win.jQuery && !(options.mediaType)) {
        // Define which dataType to use
        var dataType = 'text';
        // If jQuery is loaded then use it
        win.jQuery.ajax({
          // Tell jQuery where to find the data
          "url": src,
          // Handle the data as assigned to the dataType
          "dataType": dataType,
          // Define where the code should come
          "success": function(response) {
            // If cache is used
            if(options && (options.cacheName !== false)) {
              // then update the cache
              options.self.storage.set(options.cacheName, response);
            }
            // Set options.loadedFrom to web/jquery to indicate that the
            // resource was loaded from the web with jQuery
            options.loadedFrom = 'web/jquery';
            if(callback && callback.call) {
              // If a callback was defined then call it
              callback.call(options.self, response, options);
            } else if (options && options.complete && options.complete.call) {
              // If a callback was defined in options.complete then call it
              options.complete.call(options.self, options);
            }
          }
        });
      } else if(win.XMLHttpRequest) {
        // If jQuery wasn't loaded then try to use XMLHttpRequest instead
        // Create a new request
        var req = new win.XMLHttpRequest();
        // Initialize the request to use GET and where to go
        req.open("GET", src, true);
        options.loadCount++;
        if(options.mediaType) {
          req.responseType = 'arraybuffer';
        }
        // Define a callback for the XMLHttprequest call
        req.onreadystatechange = function() {
          // If the call was successful
          if(req.readyState == 4) {
            // Set options.loadedFrom to web/xhr to indicate that the
            // resource was loaded from the web with XMLHttpRequest
            options.loadedFrom = 'web/xhr';
            // Get the response data from the request object
            if(options.mediaType) {
              var arr = new Uint8Array(this.response);
              var raw = String.fromCharCode.apply(null,arr);
              var data = btoa(raw);
            } else {
              var data = req.responseText;
            }
            // If cache is used
            if(options && (options.cacheName !== false)) {
              // then update the cache
              options.self.storage.set(options.cacheName, data);
            }
            if(callback && callback.call) {
              // If a callback was defined then call it
              callback.call(options.self, data, options);
            } else if (options && options.complete && options.complete.call) {
              // If a callback was defined in options.complete then call it
              options.complete.call(options.self, options);
            }
          }
        }
        // Send the request
        req.send(null);
      }
    }
    // Return the current version as a text string
    rl.getVersion = function() {
      return this.version.text;
    }
    // Assign the ResourceLoader to the window object as resourceLoader
    win.resourceLoader = rl;
  }
  // Check if there is a version of the ResourceLoader already installed
  if(rl.version == undef) {
    // This is the first time this is loaded
    return reloadSystem(win, doc, rl);
  } else if(rl && rl.version) {
    // This library has been loaded before
    if(rl.version.major < version.major) {
      // This version is newer
      return reloadSystem(win, doc, rl);
    } else if(rl.version.major == version.major) {
      if(rl.version.minor < version.minor) {
        // This version is newer
        return reloadSystem(win, doc, rl);
      } else if(rl.version.minor == version.minor) {
        if(rl.version.sub < version.sub) {
          // This version is newer
          return reloadSystem(win, doc, rl);
        }
      }
    }
  }
}(window, document, (window.resourceLoader || {})))