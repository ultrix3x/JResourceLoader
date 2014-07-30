(function(win, doc, rl, undef) {
  'use strict';
  var version = {
    text: "1.0.0",
    major: 1,
    minor: 0,
    sub: 0
  }
  var reloadSystem = function(win, doc, rl, undef) {
    Date.now = Date.now || function() {
      return new Date().getTime();
    }
    rl.version = version;
    rl.storage = {};
    if(win.localStorage) {
      rl.storage.get = function(key, timeout) {
        if(timeout == undef) {
          timeout = 3600;
        }
        timeout *= 1000;
        var data = win.localStorage.getItem(key);
        if(data != null) {
          try {
            var cached = JSON.parse(data);
            if(cached && cached.timestamp && ((cached.timestamp + timeout) >= Date.now())) {
              return cached.data;
            }
          } catch(e) {
            return null;
          }
        }
        return null;
      }
      rl.storage.set = function(key, value) {
        var data = JSON.stringify({"timestamp": Date.now(), "data": value});
        win.localStorage.setItem(key, data);
      }
    }
    rl.load = function(src, options) {
      var mediaType;
      if(typeof(src) == "string") {
        options = options || {};
        options.loadCount = options.loadCount || 0;
        if(options.test) {
          if(options.test.call) {
            if(options.test.call()) {
              return this;
            }
          } else if(options.test) {
            return this;
          }
        }
        if(src.match(/^js\!/g)) {
          src = src.substring(3, src.length);
          mediaType = 'js';
        } else if(src.match(/^css\!/g)) {
          src = src.substring(4, src.length);
          mediaType = 'css';
        } else if(src.match(/\.css$/g)) {
          mediaType = 'css';
        } else {
          mediaType = 'js';
        }
        if(options.cache === true) {
          options.cache = src.replace(/[^a-zA-Z0-9]/g, '_');
        } else {
          options.cache = false;
        }
        if(mediaType == 'js') {
          this._loadScript(src, options);
        } else if(mediaType == 'css') {
          this._loadStyle(src, options);
        }
      } else if(typeof(src) == "object") {
        for(var i in src) {
          this.load(src[i]);
        }
      }
      return this;
    }
    rl._loadScript = function(src, options) {
      var data = null;
      options = options || {};
      if(options.cache !== false) {
        var data = this.storage.get(options.cache, options.cacheTimeout);
        if(data != null) {
          return rl._appendScript(data, options);
        }
      }
      rl._fetchData(src, options, rl._appendScript);
    }
    rl._appendScript = function(data, options) {
      var head = doc.getElementsByTagName('head')[0];
      var scriptTag = doc.createElement('script');
      scriptTag.appendChild(doc.createTextNode(data));
      head.appendChild(scriptTag);
      options.loadCount--;
    }
    rl._loadStyle = function(src, options) {
      var data = null;
      options = options || {};
      if(options.cache !== false) {
        var data = this.storage.get(options.cache, options.cacheTimeout);
        if(data != null) {
          return rl._appendStyle(data, options);
        }
      }
      rl._fetchData(src, options, rl._appendStyle);
    }
    rl._appendStyle = function(data, options) {
      var head = doc.getElementsByTagName('head')[0];
      var styleTag = doc.createElement('style');
      styleTag.appendChild(doc.createTextNode(data));
      head.appendChild(styleTag);
      options.loadCount--;
    }
    rl._fetchData = function(src, options, callback) {
      options.self = this;
      if(win.jQuery) {
        win.jQuery.ajax({
          "url": src,
          "dataType": "text",
          "success": function(response) {
            if(options && (options.cache !== false)) {
              options.self.storage.set(options.cache, response);
            }
            if(callback && callback.call) {
              callback.call(options.self, response, options);
            }
          }
        });
      } else if(win.XMLHttpRequest) {
        var req = new win.XMLHttpRequest();
        options.loadCount++;
        req.onreadystatechange = function() {
          if(req.readyState == 4) {
            var data = req.responseText;
            if(options && (options.cache !== false)) {
              options.self.storage.set(options.cache, data);
            }
            if(callback && callback.call) {
              callback.call(options.self, data, options);
            }
          }
        }
        req.open("GET", src, true);
        req.send(null);
      }
    }
    rl.getVersion = function() {
      return this.version.text;
    }
    win.resourceLoader = rl;
  }
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