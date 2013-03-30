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


var nextTick = process.nextTick;
var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var sip = require('../../lib/sip');


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
 * @extends {Socket}
 */
function Heap_Socket (port, addr) {

  sip.Socket.call(this, port, addr);

  var that = this;

  this.once('close', function () {
    that._closed = true;
  });
}


inherits(Heap_Socket, sip.Socket);


/**
 * @param {string} data
 * @param {function()} cb
 */
Heap_Socket.prototype.send = function (data, cb) {

  if (this._closed) {
    if (cb) cb('Socket closed');

    return;
  }

  var that = this;
  var heapId = 'heap:' + this.remoteAddr + ':' + this.remotePort;
  

  nextTick(function () {
    
    that.addr = '0.0.0.0';
    that.port = (Math.ceil(Math.random() * 1e5) % 14000) + 50000;

    Heap.emit(heapId, data, that.addr, that.port);
    that.setTimeout();

    nextTick(function () {
      if (cb) cb(null);
    });

  });
};


Heap_Socket.prototype.close = function () {
  
  this._closed = true;
  this.emit('close');
};


/**
 * @constructor
 * @implements {Protocol}
 */
function Heap_Protocol () {

  sip.Protocol.call(this);

  this.name = 'heap';
  this.reliable = false;
  this._socket;
}


inherits(Heap_Protocol, sip.Protocol);


/**
 * @param {string} addr
 * @param {number} port
 * @param {function(Socket)} cb
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
 * @param {string=} addr Target IP address.
 * @param {number=} port Target port number.
 * @param {function(Socket)=} cb Callback called after connection established.
 */
Heap_Protocol.prototype.send = function (data, addr, port, cb) {

  var sock = new Heap_Socket(port, addr);

  nextTick(function () {
    sock.send(data, cb);
  });

  return sock;
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


exports.createProtocol = function () {
  return new Heap_Protocol;
};
