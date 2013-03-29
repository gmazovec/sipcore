/*
  SIPCore.js - General purpose SIP library for JavaScript.
  Copyright (C) 2013 Gregor Mazovec

  SIPCore.js is free software: you can redistribute it and/or modify
  it under the terms of the GNU Lesser General Public License as
  published by the Free Software Foundation, either version 3 of the
  License, or any later version.

  SIPCore.js is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU Lesser General Public License for more details.

  You should have received a copy of the GNU Lesser General Public License
  along with SIPCore.js. If not, see <http://www.gnu.org/licenses/>.
*/


(function (exports) {

  if (exports.require) return;


  /**
   * @param {function()} fn
   */
  exports.process = {};
  
  process.nextTick = function (fn) {
    setTimeout(fn, 0);
  };

  
  var builtin = {
    'events': 'events',
    'assert': 'assert'
  };


  var cache = {};
  exports.cache = cache;


  var mainRequire = function (pkg, _base) {

    if (builtin[pkg]) {

      pkg = builtin[pkg];
      _base = basepath;
    }

    if (typeof exports[pkg] == 'object') {
      return exports[pkg];
    }

    var src = resolve(pkg, _base);

    if (!cache[src]) {
    
      var xhr = new XMLHttpRequest;
      
      xhr.open('GET', src, false);
      xhr.send();
      
      var isValid = xhr.getResponseHeader('Content-Type').indexOf('javascript') > 0;
      
      if (xhr.status == 200 && isValid) {
        code = xhr.responseText;
      }
      else {
        throw new ReferenceError('Cannot find module \'' + pkg +  '\'');
      }
      
      
      var pkgExports = {}; 
      var wrapCode = 'var __require = (function (exports) { ' + code +'; });';
      var subBaseDir = dirname(src);
      var _req = mainRequire;
      
      function require (pkg) {
        return _req(pkg, subBaseDir);
      }

      try {
        eval(wrapCode);
      }
      catch (e) {
        throw new SyntaxError('Error parsing script '+ src + '; ' + e);
      }

      if (typeof pkgExports == 'function') {
      //  pkgExports = pkgExports();
      }

      __require(pkgExports);
      cache[src] = pkgExports;
    }

    return cache[src];
  }


  var _basedir;

  function dirname (p) {

    var path = p.split('/');

    path.pop();

    return path.join('/');
  }
  

  function getBaseDir () {

    if (!_basedir) {
      _basedir = dirname(location.pathname);
    }

    return _basedir;
  }

  
  var resolve = function (path, base) {

    var basename = base || getBaseDir();
    var _path = ( basename + '/' + path ).split('/').splice(1);
    var len = _path.length;
    var resolved = [];
    var skipNext = 0;

    for (var i = len-1; i > -1; i--) {

      if (_path[i] == '..') {

        skipNext++;
        continue;
      }
      else if (!_path[i] || _path[i] == '.') {
        continue;
      }
      else if (skipNext) {

        skipNext--;
        continue;
      }

      resolved.unshift(_path[i]);
    }


    resolved.unshift('');

    return resolved.join('/') + '.js';
  };


  var basepath;
  var scripts = document.getElementsByTagName('script');
  var src, length = scripts.length;

  for (var i = 0; i < length; i++) {
    
    var src = scripts[i].getAttribute('src');

    if (src.indexOf('deps/require.js')) {
      basepath = resolve(src, location.pathname).replace('/require.js.js', '');
    }
  }


  exports.resolve = resolve;
  exports.require = mainRequire;

})(this);
