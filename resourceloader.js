(function(win, doc, rl, undef) {
  // Enable strict mode
  'use strict';
  // Define the version for this file
  var version = {
    text: "1.0.0",
    major: 1,
    minor: 0,
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
        // If there is a test defined
        if(options.test) {
          // If this test ic callable
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
        } else if(src.match(/\.css$/g)) {
          // The src has a css file extension
          mediaType = 'css';
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
    // FetchData gets the data from the given src
    rl._fetchData = function(src, options, callback) {
      // Make sure we know where this is
      options.self = this;
      if(win.jQuery) {
        // If jQuery is loaded then use it
        win.jQuery.ajax({
          // Tell jQuery where to fins the data
          "url": src,
          // Handle the data as text
          "dataType": "text",
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
              options.complete.call(options.self, src, options);
            }
          }
        });
      } else if(win.XMLHttpRequest) {
        // If jQuery wasn't loaded then try to use XMLHttpRequest instead
        // Create a new request
        var req = new win.XMLHttpRequest();
        options.loadCount++;
        // Define a callback for the XMLHttprequest call
        req.onreadystatechange = function() {
          // If the call was successful
          if(req.readyState == 4) {
            // Set options.loadedFrom to web/xhr to indicate that the
            // resource was loaded from the web with XMLHttpRequest
            options.loadedFrom = 'web/xhr';
            // Get the response data from the request object
            var data = req.responseText;
            // If cache is used
            if(options && (options.cacheName !== false)) {
              // then update the cache
              options.self.storage.set(options.cacheName, data);
            }
            if(callback && callback.call) {
              // If a callback was defined then call it
              callback.call(options.self, response, options);
            } else if (options && options.complete && options.complete.call) {
              // If a callback was defined in options.complete then call it
              options.complete.call(options.self, src, options);
            }
          }
        }
        // Initialize the request to use GET and where to go
        req.open("GET", src, true);
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