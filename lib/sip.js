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
  along with sipcore.js. If not, see <http://www.gnu.org/licenses/>.
*/


// SIP protocol version
var SIP_VERSION = '2.0';

var SIP_STATUS = {
  100: 'Trying',
  180: 'Ringing',
  181: 'Call Is Being Forwarded',
  182: 'Queued',
  183: 'Session Progress',
  200: 'OK',
  300: 'Multiple Choises',
  301: 'Moved Permanently',
  302: 'Moved Temporarily',
  305: 'Use Proxy',
  380: 'Alternative Service',
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Authentication Required',
  408: 'Request Timeout',
  410: 'Gone',
  413: 'Request Entity Too Large',
  414: 'Request-URI to Long',
  415: 'Unsupported Media Type',
  416: 'Unsupported URI Scheme',
  420: 'Bad Extension',
  421: 'Extension Required',
  423: 'Interval Too Brief',
  480: 'Temporarily Unavailable',
  481: 'Call/Transaction Does Not Exist',
  482: 'Loop Detected',
  483: 'Too Many Hops',
  484: 'Address Incomplete',
  485: 'Ambiguous',
  486: 'Busy Here',
  487: 'Request Terminated',
  488: 'Not Acceptable Here',
  491: 'Request Pending',
  493: 'Undecipherable',
  500: 'Server Internal Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Server Time-out',
  505: 'Version Not Supported',
  513: 'Message Too Large',
  600: 'Busy Everywhere',
  603: 'Decline',
  604: 'Does Not Exist Anywhere',
  606: 'Not Acceptable'
};


// helper functions
function clone(from, to) {

  var attr, type;

  for (var _attr in from) {

    attr = from[_attr];
    type = typeof attr;

    if (type == 'function') continue;

    if (attr !== null && type == 'object') {

      to[_attr] = (attr instanceof Array) ? [] : {};
      clone(attr, to[_attr]);
    }
    else {
      to[_attr] = attr;
    }

  }
}


/**
 * SIP Message.
 * @constructor
 * @param {string|Object|Message} arg1 SIP request method or response status or object.
 * @param {string} arg2 Valid SIP URI or message status text.
 * @param {Object.<string, string>=} headers SIP message headers.
 * @param {string=} body SIP message body content.
 */
function Message (arg1, arg2, headers, body) {

  if (isMessage(arg1)) {
    clone(arg1, this);

    return;
  }


  var exportArgs = (arg1 instanceof Object);
  var isResponse = (arg1 > 0);

  if (exportArgs) {

    var args = arg1;

    arg1 = args.method;
    arg2 = args.uri;
    headers = arg1.headers;
    body = arg1.body;
  }


  if (isResponse) {
    if (!SIP_STATUS[arg1]) throw new TypeError('Invalid status code ' + arg1);

    this.status = arg1;
    this.reason = arg2 || SIP_STATUS[arg1];
  }
  else {
    if (!arg1) throw new TypeError('Invalid message method');
    if (!arg2) throw new TypeError('Invalid message URI');

    this.method = arg1;
    this.uri = arg2;
  }


  this.version = SIP_VERSION;
  this.headers = headers || {};
  this.body = body || '';
}


/**
 * Create new response from message object.
 * @param {number} status Response status code.
 * @param {string} reason Response status text.
 * @param {Object.<string, string>=} headers SIP message headers.
 * @param {string=} body SIP message body content.
 */
Message.prototype.toResponse = function (status, reason, headers, body) {

  // combine headers
  if (headers) {

    for (var name in this.headers) {
      // header not yet defined
      if (!headers[name]) {
        headers[name] = this.headers[name];
      }
    }
  }
  else {
    clone(headers, this.headers);
  }


  return createMessage(status, reason, headers, body);
};


/**
 * Checks if object is instance of Message class.
 * @param {Object} obj Object to test against.
 * @return {boolen}
 */
function isMessage (obj) {

  return (obj instanceof Message);
};


/**
 * Create request message.
 * @param {string|Object|Message} arg1 SIP request method or response status or object.
 * @param {string} arg2 Valid SIP URI or message status text.
 * @param {Object.<string, string>=} headers SIP message headers.
 * @param {string=} body SIP message body content.
 * @return {Message}
 */
var createMessage = function (arg1, arg2, headers, body) {

  return new Message(arg1, arg2, headers, body);
};


// Message API
exports.isMessage = isMessage;
exports.createMessage = createMessage;
