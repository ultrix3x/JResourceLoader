(function(jQuery) {
  // Make sure ResourceLoader is loaded
  if(!window.resourceLoader) {
    // Get the url used by the current script
    // First fins all scripts
    var scripts = document.getElementsByTagName('script');
    // Get the index of the last script loaded
    var index = scripts.length - 1;
    // Get the element for the last script
    var myScript = scripts[index];
    // Build the new src by using the last scripts src
    var rlSrc = myScript.src.replace(/\/[^\/]+$/gi, '/resourceloader.min.js');
    jQuery.ajax({
      // Tell jQuery where to find the data
      "url": rlSrc,
      // Handle the data as assigned to the dataType
      "dataType": "html",
      // Define where the code should come
      "success": function(response) {
        var head = document.getElementsByTagName('head')[0];
        // Create a script tag
        var scriptTag = document.createElement('script');
        // Append the script to the script tag
        scriptTag.appendChild(document.createTextNode(response));
        // Append the script tag to the head object
        head.appendChild(scriptTag);
      }
    });
  }
  // Extend jQuery
  jQuery.extend({
    // Define the resourceLoader extionsion object
    resourceLoader: {
      // Wrapper for the loadImage
      loadImage: function(src, options) {
        // Define a function that allows calling the function before the
        // resourceLoader is loaded
        var f = function() {
          // Check if the resourceLoader is loaded
          if(window.resourceLoader) {
            // If it is loaded then call the loadImage function
            window.resourceLoader.loadImage(src, options);
          } else {
            // If it isn't loaded yet then wait for 10 ms and try again
            setTimeout(f, 10);
          }
        };
        // Call the execute/wait function
        f();
      },
      // Wrapper for the loadImages
      loadImages: function(options) {
        // Define a function that allows calling the function before the
        // resourceLoader is loaded
        var f = function() {
          // Check if the resourceLoader is loaded
          if(window.resourceLoader) {
            // If it is loaded then call the loadImages function
            window.resourceLoader.loadImages(options);
          } else {
            // If it isn't loaded yet then wait for 10 ms and try again
            setTimeout(f, 10);
          }
        };
        // Call the execute/wait function
        f();
      },
      stopImageLoading: function() {
        // Define a function that allows calling the function before the
        // resourceLoader is loaded
        var f = function() {
          // Check if the resourceLoader is loaded
          if(window.resourceLoader) {
            // If it is loaded then call the stopImageLoading function
            window.resourceLoader.stopImageLoading();
          } else {
            // If it isn't loaded yet then wait for 10 ms and try again
            setTimeout(f, 10);
          }
        };
        // Call the execute/wait function
        f();
      },
      load: function(src, options) {
        // Define a function that allows calling the function before the
        // resourceLoader is loaded
        var f = function() {
          // Check if the resourceLoader is loaded
          if(window.resourceLoader) {
            // If it is loaded then call the load function
            return window.resourceLoader.load(src, options);
          } else {
            // If it isn't loaded yet then wait for 10 ms and try again
            setTimeout(f, 10);
          }
        };
        // Call the execute/wait function
        f();
      },
      getVersion: function() {
        // Check if the resourceLoader is loaded
        if(window.resourceLoader) {
          // If it is loaded then call the getVersion
          return window.resourceLoader.getVersion();
        } else {
          // If it isn't loaded yet then just return null
          return null;
        }
      }
    }
  });
  // Extend jQuery(selector)
  jQuery.fn.extend({
    // Define resourceLoader as an function
    resourceLoader: function(options) {
      // Loop through all all matches from the given selector
      return this.each(function() {
        // Assign this to the variable elm
        var elm = this;
        // Define a function that can be used until the resourceLoader
        // is loaded
        var f = function() {
          // Check if the resourceLoader exists
          if(window.resourceLoader) {
            // If it exists then call loadImage
            window.resourceLoader.loadImage(elm, options);
          } else {
            // If it doesn't exist then wait 10 ms and try again
            setTimeout(f, 10);
          }
        };
        // Call the function to start the execute/wait
        f();
      });
    }
  });
}(jQuery));