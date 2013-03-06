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


/** @typedef {Object.<string, string>} */
var SIPCoreUri = {
  'scheme': '',
  'user': '',
  'password': '',
  'hostname': '',
  'port': '',
  'params': {}, 
  'headers': {}
};


/** @param {Object} */
var externs = {};

/** @param {function(string)} */
externs.parse = function (data) {};

/** @param {function((Object|Message))} */
externs.format = function (message) {};

/** @param {function(*)} */
externs.isMessage = function (object) {};

/** @param {function()} */
externs.createMessage = function () {};

/** @param {function(string)} */
externs.parseUri = function (uri) {};

/** @param {function(SIPCoreUri, boolean=)} */
externs.formatUri = function (uri, compact) {};
