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


var events = (function () {

/**
 * @constructor
 */
function EventEmitter () {

  this._events = {};
}


EventEmitter.prototype.emit = function (ev, arg1, arg2, arg3, arg4, arg5) {

  var listeners = this._events[ev] || [];

  for (var i in listeners) {
    listeners[i](arg1, arg2, arg3, arg4, arg5);
  }
};


EventEmitter.prototype.on = function (ev, cb) {

  if (!this._events[ev]) {
    this._events[ev] = [];
  }

  this._events[ev].push(cb);
};


EventEmitter.prototype.once = function (ev, cb) {

  if (!this._events[ev]) {
    this._events[ev] = [];
  }

  var that = this;
  var _cb = function () {
    
    that.removeListener(ev, _cb);
    cb.apply(NaN, arguments);
  };

  this._events[ev].push(_cb);
};


EventEmitter.prototype.listeners = function (ev) {
  return this._events[ev] || [];
};


EventEmitter.prototype.removeListener = function (ev, cb) {

  var fn;
  var listeners = this._events[ev] || [];
  var _new = [];

  for (var i in listeners) {
  
    fn = listeners[i];
    
    if (fn !== cb) {
      _new.push(fn);
    }
  }

  if (_new.length) {
    this._events[ev] = _new;
  }
  else {
    delete this._events[ev];
  }

};


EventEmitter.prototype.removeAllListeners = function (name) {

  if (name && this._events[name]) {
    delete this._events[name];
  }
  else {
    this._events = {};
  }
};


EventEmitter.listenerCount = function (emitter, type) {

  var listeners = emitter._events && emitter._events[type] || [];
  var length = 0;

  for (var i in listeners) {
    if (listeners[i]) length++;
  }

  return length;
};


return {
  EventEmitter: EventEmitter
};

}());

