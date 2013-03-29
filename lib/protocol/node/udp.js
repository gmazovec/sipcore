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


var EventEmitter = require('events').EventEmitter;
var dgram = require('dgram');
var SIP = require('../../..');


/**
 * @constructor
 * @implements {Socket}
 */
function UDP_Socket (port, addr) {

  SIP.Socket.call(this, port, addr);

  this.socket = dgram.createSocket('udp4');

  var that = this;
  
  this.socket.on('message', function (data, rinfo) {
    that.emit('message', data, rinfo);
  });


  this.socket.on('close', function () {
    
    that._closed = true;
    that.emit('close');
  });
}


UDP_Socket.prototype = new SIP.Socket;


/**
 * @param {string} data
 * @param {function()} cb
 */
UDP_Socket.prototype.send = function (data, cb) {

  if (this._closed) {
    if (cb) cb('Socket closed');

    return;
  }

  var that = this;
  var buf = new Buffer(data);

  this.socket.send(buf, 0, buf.length, this.remotePort, this.remoteAddr, function (err, bytes) {

    that.setTimeout();

    if (cb) cb(err);
  });

};


UDP_Socket.prototype.close = function () {

  this._closed = true;
  this.socket.close();
};


/**
 * @constructor
 * @implements {Protocol}
 */
function UDP_Protocol () {

  SIP.Protocol.call(this);

  this.name = 'udp';
  this.reliable = false;

  this.socket = dgram.createSocket('udp4');

  var that = this;

  this.socket.on('close', function () {
    that.listenState = 0;
    that.emit('close');
  });
}


UDP_Protocol.prototype = new SIP.Protocol;


/**
 * @param {string} addr
 * @param {number} port
 * @param {function(Socket)} cb
 */
UDP_Protocol.prototype.bind = function (port, addr, cb) {

  var that = this;
  var socket = this.socket;

  socket.bind(port, addr, function () {
    
    var sockAddress = socket.address();

    that.addr = sockAddress.address;
    that.port = sockAddress.port;

    that.listenState = 1;

    if (cb) cb(1);
    that.emit('listening');
  });

  socket.on('message', function (data, rinfo) {
    that.emit('message', data, rinfo);
  });

};


/**
 * @param {string} data Raw message data.
 * @param {string=} addr Target IP address.
 * @param {number=} port Target port number.
 * @param {function(Socket)=} cb Callback called after connection established.
 */
UDP_Protocol.prototype.send = function (data, addr, port, cb) {

  var that = this;
  var sock = new UDP_Socket(port, addr);

  sock.on('message', function (data, rinfo) {
    that.emit('message', data, rinfo);
  });

  sock.send(data, cb);

  return sock;
};


UDP_Protocol.prototype.close = function (cb) {

  this.listenState = -1;

  if (cb) this.socket.once('close', function () {
    cb(0);
  });

  var that = this;

  // close event is called is same tick - mimic async behaviour
  process.nextTick(function () {
    that.socket.close();
  });
};


exports.createProtocol = function () {
  return new UDP_Protocol;
};
