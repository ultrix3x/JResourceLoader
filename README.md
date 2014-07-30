# JResourceLoader

A simple resource loader in javascript with the ability to store the script in localStorage or sessionStorage.

ResourceLoader has a built in feature to avoid reloading itself. If a newer version if ResourceLoader is loaded then it will replace the older version.

## ResourceLoader.load(src, options)

### Arguments

#### src
Tha argument src identifies which source file should be loaded. The url can be prefixed with either js! or css! to force the loading as a script or a style. The prefix i useful when files are loaded from repositories where the files extension isn't always .js or .css.

#### options
In the options argument there are several arguments collected in a common object that is passed to the load function.

##### options.cache
If options.cache is set to true then ResourceLoader will attempt to load the resource from localStorage or sessionStorage.

##### options.cacheTimeout
If the options.cache is set to true then options.cacheTimeout will define how old the data in the cache may be. This is given in seconds and will default to 3600 (1 hour).

##### options.complete
When the script is loaded the callback defined in options.complete will be called. (If this is omitted then it won't be called.)
The callback has one argument and that is the options object used by the load function.
In the options object passed to the callback there is a property called options.loadedFrom that is set to how the resource was loaded. This is explained in more details further down in this file under the heading Response

##### options.test
If the property options.test is set then this is evaluated before the script is loaded.
It can be an anonymous function or a simple property. If the function returns true or the property is set to true then the resource will not be loaded.

### Response

#### options

##### options.loadedFrom
The options.loadedFrom can have the following values
* web/jquery
  This means that the resource has been loaded with the help of jQuery.ajax
* web/xhr
  The resource has been loaded by using XMLHttpRequest
* cache
  The resource was taken from the cache (i.e. localStorage or sessionStorage)
* notloaded/test
  The resource has not been loaded since the test returned true

## ResourceLoader.getVersion()
Returns a string with the current version of ResourceLoader

## Usage

### examples/demo2.html
```html
<!DOCTYPE html>
<html lang="en">
 <head>
  <title>Simple demo</title>
  <script src="../resourceloader.js"></script>
  <script>
    var options = {
      cache: true,
      cacheTimeout: 7200,
      complete: function(options) {
        alert("Loaded "+options.src+" from "+options.loadedFrom);
      },
      test: function(options) {
        if(typeof(dummyObject) != "undefined") {
          return true;
        }
        return false;
      }
    }
    window.resourceLoader.load("dummies/script1.js", options);
    window.resourceLoader.load("dummies/script1.js", options);
  </script>
 </head>
 <body>
 </body>
</html>
```