(function(win, doc, undef) {
  'use strict';
  win.scriptLoader = win.scriptLoader || {
    initDone: false,
    loadScriptCount: 0,
    loadStyleCount: 0,
    storageEngine: null,
    init: function() {
      if(this.initDone === false) {
        this.initDone = true;
        this.storageEngine = {
          keyName: function(key) {
            key = key.replace(/[^a-z0-9A-Z]/g, '_');
            return key;
          },
          keyStorage: {},
          getItem: function(key) {
            key = this.keyName(key);
            if(this.keyStorage[key]) {
              return this.keyStorage[key];
            }
            return null;
          },
          setItem: function(key, value) {
            key = this.keyName(key);
            this.keyStorage[key] = value;
          },
          removeItem: function(key) {
            key = this.keyName(key);
            this.keyStorage[key] = null;
          }
        }
        if(win.localStorage !== undef) {
          this.storageEngine.getItem = function(key) {
            key = this.keyName(key);
            var value = win.localStorage.getItem(key);
            if(value === null) {
              return null;
            } else if(value == undef) {
              return null;
            }
            try {
              return JSON.parse(value);
            } catch(e) {
              return null;
            }
          }
          this.storageEngine.setItem = function(key, value) {
            key = this.keyName(key);
            value = JSON.stringify(value);
            win.localStorage.setItem(key, value);
          }
          this.storageEngine.removeItem = function(key) {
            key = this.keyName(key);
            return win.localStorage.removeItem(key);
          }
        } else if(win.sessionStorage !== undef) {
          this.storageEngine.getItem = function(key) {
            key = this.keyName(key);
            var value = win.sessionStorage.getItem(key);
            if(value === null) {
              return null;
            } else if(value == undef) {
              return null;
            }
            try {
              return JSON.parse(value);
            } catch(e) {
              return null;
            }
          }
          this.storageEngine.setItem = function(key, value) {
            key = this.keyName(key);
            value = JSON.stringify(value);
            win.sessionStorage.setItem(key, value);
          }
          this.storageEngine.removeItem = function(key) {
            key = this.keyName(key);
            return win.sessionStorage.removeItem(key);
          }
        }
      }
    },
    fetchScript: function(src, callback, attemptsLeft) {
      if(win.jQuery) {
        win.jQuery.ajax({
          "url": src,
          "dataType": "text",
          "success": function(response) {
            win.scriptLoader.storageEngine.setItem(src, response);
            win.scriptLoader.loadScript(src, callback, attemptsLeft);
            this.loadScriptCount--;
          }
        });
      } else if(win.XMLHttpRequest) {
        var req = new win.XMLHttpRequest();
        req.onreadystatechange = function() {
          if(req.readyState == 4) {
            win.scriptLoader.storageEngine.setItem(src, req.responseText);
            win.scriptLoader.loadScript(src, callback, attemptsLeft);
            this.loadScriptCount--;
          }
        }
        req.open("GET", src, true);
        req.send(null);
      }
    },
    fetchStyle: function(src, callback, attemptsLeft) {
      if(win.jQuery) {
        win.jQuery.ajax({
          "url": src,
          "dataType": "text",
          "success": function(response) {
            win.scriptLoader.storageEngine.setItem(src, response);
            win.scriptLoader.loadStyle(src, callback, attemptsLeft);
            this.loadStyleCount--;
          }
        });
      } else if(win.XMLHttpRequest) {
        var req = new win.XMLHttpRequest();
        req.onreadystatechange = function() {
          if(req.readyState == 4) {
            win.scriptLoader.storageEngine.setItem(src, req.responseText);
            win.scriptLoader.loadStyle(src, callback, attemptsLeft);
            this.loadStyleCount--;
          }
        }
        req.open("GET", src, true);
        req.send(null);
      }
    },
    executeScriptCallback: function(callback) {
      if((callback) && (this.loadScriptCount == 0)) {
        callback();
      } else if(callback) {
        setTimeout(function() {
          win.scriptLoader.executeScriptCallback(callback);
        }, 10);
      }
    },
    executeStyleCallback: function(callback) {
      if((callback) && (this.loadScriptCount == 0)) {
        callback();
      } else if(callback) {
        setTimeout(function() {
          win.scriptLoader.executeStyleCallback(callback);
        }, 10);
      }
    },
    loadScript: function(src, callback, attemptsLeft) {
      if(typeof(src) == "object") {
        for(var i in src) {
          this.loadScriptCount++;
          this.loadScript(src[i], null, attemptsLeft);
        }
        if(callback) {
          setTimeout(function() {
            win.scriptLoader.executeScriptCallback(callback);
          }, 10);
        }
      } else {
        var code = win.scriptLoader.storageEngine.getItem(src);
        if(code == null) {
          if(attemptsLeft === undef) {
            attemptsLeft = 9;
          }
          if(attemptsLeft <= 0) {
            alert('Failed to get '+src);
          } else {
            this.fetchScript(src, callback, (attemptsLeft - 1));
          }
        } else {
          var head = doc.getElementsByTagName('head')[0];
          var scriptTag = doc.createElement('script');
          scriptTag.appendChild(doc.createTextNode(code));
          head.appendChild(scriptTag);
          this.loadCount--;
        }
      }
      return this;
    },
    loadStyle: function(src, callback, attemptsLeft) {
      if(typeof(src) == "object") {
        for(var i in src) {
          this.loadStyleCount++;
          this.loadStyle(src[i], null, attemptsLeft);
        }
        if(callback) {
          setTimeout(function() {
            win.scriptLoader.executeStyleCallback(callback);
          }, 10);
        }
      } else {
        var code = win.scriptLoader.storageEngine.getItem(src);
        if(code == null) {
          if(attemptsLeft === undef) {
            attemptsLeft = 9;
          }
          if(attemptsLeft <= 0) {
            alert('Failed to get '+src);
          } else {
            this.fetchStyle(src, callback, (attemptsLeft - 1));
          }
        } else {
          var head = doc.getElementsByTagName('head')[0];
          var styleTag = doc.createElement('style');
          styleTag.appendChild(doc.createTextNode(code));
          head.appendChild(styleTag);
          this.loadStyleCount--;
        }
      }
      return this;
    }
  };
  win.scriptLoader.init();
})(window, document);