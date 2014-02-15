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


if (typeof define !== 'function') { var define = require('amdefine')(module) };

define(function (require, exports) {

var nextTick = this.process && process.nextTick || function (cb) { setTimeout(cb); };
var EventEmitter = require('events').EventEmitter;


// Interal Heap object
var Heap = new EventEmitter;
var HeapOn = Heap.on;
var HeapEmit = Heap.emit;


Heap.on = function (ev, cb) {

  /*
  if (EventEmitter.listenerCount(Heap, ev)) {
    throw new Error('Address ' + ev + ' already in use');
  }
  */

  HeapOn.call(Heap, ev, cb);
};


Heap.emit = function (ev, data, remoteAddr, remotePort) {

  HeapEmit.call(Heap, ev, data, {

    'address': remoteAddr,
    'port': remotePort,
    'size': data.length
  });
};


/**
 * @constructor
 * @implements {Protocol}
 */
function Heap_Protocol (init) {

  init.call(this);

  this.name = 'heap';
  this.reliable = false;
  this._socket;
}


/**
 * @param {string} addr
 * @param {number} port
 * @param {function()} cb
 */
Heap_Protocol.prototype.bind = function (port, addr, cb) {

  var that = this;
  var heapId = this.name + ':' + addr + ':' + port;

  this.listenState = -1;
  this._socket = function (data, rinfo) {

    nextTick(function () {
      that.emit('message', data, rinfo);
    });

  };

  Heap.on(heapId, this._socket);


  nextTick(function () {

    that.port = port;
    that.addr = addr;

    that.listenState = 1;

    if (cb) cb(1);

    that.emit('listening', that.name);
  });
};


/**
 * @param {string} data Raw message data.
 * @param {string} addr Remote IP address.
 * @param {number} port Remote port number.
 */
Heap_Protocol.prototype.__push = function (data, addr, port) {

  var that = this;

  nextTick(function () {
    Heap.emit('heap:'+ that.addr +':'+ that.port, data, addr || '0.0.0.0', port || 5060);
  });
};


/**
 * @param {string} data Raw message data.
 * @param {string=} addr Target IP address.
 * @param {number=} port Target port number.
 * @param {function(err)=} cb Callback called after connection established.
 */
Heap_Protocol.prototype.send = function (data, addr, port, cb) {

  var that = this;
  var heapId = 'heap:' + addr + ':' + port;

  nextTick(function () {
    
    Heap.emit(heapId, data, that.addr, that.port);

    nextTick(function () {
      if (cb) cb(null);
    });

  });
};


/**
 * @param {function()} cb
 */
Heap_Protocol.prototype.close = function (cb) {

  var that = this;
  var heapId = this.name + ':' + this.addr + ':' + this.port;

  this.listenState = -1;

  Heap.removeListener(heapId, this._socket);


  nextTick(function () {
    
    that.listenState = 0;

    if (cb) cb(0);

    that.emit('close', that.name);
  });
};


exports.Protocol = Heap_Protocol;

});
