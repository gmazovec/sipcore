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


// constants
var CR = '\r';
var LF = '\n';
var HTAB = '\t';
var SPACE = ' ';
var DOT = '.';
var COMMA = ',';
var SEMI = ';';
var COLON = ':';
var EQUAL = '=';
var DQUOT = '"';
var QUOT = '\'';
var EMPTY = '';


// SIP protocol version
var SIP_VERSION = '2.0';


// SIP message types
var SIP_REQUEST = 1;
var SIP_RESPONSE = 2;


// SIP request methods
var SIP_INVITE = 'INVITE';
var SIP_ACK = 'ACK';
var SIP_CANCEL = 'CANCEL';
var SIP_BYE = 'BYE';
var SIP_REGISTER = 'REGISTER';
var SIP_OPTIONS = 'OPTIONS';
var SIP_PRACK = 'PRACK';
var SIP_SUBSCRIBE = 'SUBSCRIBE';
var SIP_NOTIFY = 'NOTIFY';
var SIP_REFER = 'REFER';
var SIP_MESSAGE = 'MESSAGE';
var SIP_PUBLISH = 'PUBLISH';


// SIP statuses
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

/**
 * Checks if object is instance of some class.
 * @param {*} obj Object to check.
 * @param {Function|Object} name Class object.
 * @return {boolean}
 */
function is (obj, name) {

  return (obj instanceof name);
}


/**
 * Checks if object is instance of JavaScript Object.
 * @param {*} obj Object to check.
 * @return {boolean}
 */
function isObject (obj) {

  return is(obj, Object);
}


/**
 * Checks if object is instance of JavaScript Array.
 * @param {*} obj Object to check.
 * @return {boolean}
 */
function isArray (obj) {
  
  return is(obj, Array);
}


/**
 * Deep clone of an object.
 * @param {Object} from Source object.
 * @param {Object} to Target object.
 */
function clone (from, to) {

  var attr, type;

  for (var _attr in from) {

    attr = from[_attr];
    type = typeof attr;

    if (type == 'function') continue;

    if (attr !== null && type == 'object') {

      to[_attr] = (isArray(attr)) ? [] : {};
      clone(attr, to[_attr]);
    }
    else {
      to[_attr] = attr;
    }

  }
}


// parser helpers

/**
 * Split header values from string to array.
 * @param {string} value Header value.
 * @return {Array.<string>} Array of header values.
 */
function splitHeaderValues (value) {

  if (value.indexOf(COMMA) == -1) {
    return [value];
  }

  var values = [];
  var i = 0;
  var start = 0;
  var len = value.length;
  var inQuote = false;
  var c;


  while (i < len) {

    c = value.charAt(i++);

    if (c == DQUOT) {
      inQuote = !inQuote;
    }
  
    if (!inQuote && c == COMMA) {
      
      values.push(value.substr(start, i-1));
      start = i;
    }
  }

  values.push(value.substr(start, len));

  return values;
}


/**
 * Initialize SIP message parser.
 * @return {Function} Function for parsing messages.
 */
function initParser () {

  var i;
  var len;
  var data;

  // parser states
  var state_req_or_res    = 0;
  var state_start_req     = 1;
  var state_start_res     = 2;
  var state_res_s         = 3;
  var state_res_si        = 4;
  var state_res_sip       = 5;
  var state_req_method    = 6;
  var state_req_uri       = 7;
  var state_res_status    = 8;
  var state_res_reason    = 9;
  var state_msg_version   = 10;
  var state_header_start  = 11;
  var state_header_value  = 12;
  var state_start_body    = 13;

  var multipleHeader = {
    'contact': true,
    'record-route' : true,
    'route': true,
    'via': true
  };


  // helpers
  function push () {
    i--;
  }

  function pull () {
    return data.charAt(++i);
  }

  function reset () {
    i = -1;
  }

  function error (text) {

    // stop main loop
    i = len;
    throw new Error(text);
  }

  function read_until (delimit) {

    if (!delimit) {
      return data.substr(i);
    }

    var start = i;
    var end = data.length;
    var c;

    while ( i++ < len) {

      c = data.charAt(i);
      end = i;

      if (c == delimit) {
        break;
      }
    }

    return data.substr(start, end - start);
  }


  // main parser function
  function _parse (raw) {

    var message = { headers: {}, body: '' };
    var state = state_req_or_res;
    var method, uri, version;
    var status, reason;
    var header_name, header_value;
    var type;
    var header_multiline;
    var c;

    data = raw;
    len = data.length;
    i = -1;


    //  Byte per byte parser
    while ( i++ < len) {
      
      c = data.charAt(i);

      switch (state) {

        // figure out if parsing request or response
        case state_req_or_res:

          if (c == CR || c == LF) break;

          state = c == 'S' ? state_start_res : state_start_req;
          // push character back
          push();

          break;


        case state_start_req:

          type = SIP_REQUEST;

          switch (c) {
          
            // RFC 3261
            case 'I': method = SIP_INVITE; break;
            case 'A': method = SIP_ACK; break;
            case 'C': method = SIP_CANCEL; break;
            case 'B': method = SIP_BYE; break;
            case 'R': method = SIP_REGISTER; break;
            case 'O': method = SIP_OPTIONS; break;

            // RFC 3262
            case 'P': method = SIP_PRACK; break;

            // RFC 3265
            case 'S': method = SIP_SUBSCRIBE; break;
            case 'N': method = SIP_NOTIFY; break;

            // RFC 3428
            case 'M': method = SIP_MESSAGE; break;

            default:

              error('Invalid request method');
            
          }

          state = state_req_method;

          break;


        case state_start_res:

          if (c == 'S') {
            state = state_res_s;
          }

          break;


        case state_res_s:
          
          if (c == 'I') {
            if (!type) {
              type = SIP_RESPONSE;
            }
            state = state_res_si;
          }
          // SUBSCRIBE method
          else if (c == 'U') {
            state = state_start_req;
            reset();
          }
          else error('Invalid method or status');

          break;


        case state_res_si:

          if (c == 'P') {
            state = state_res_sip;
          }
          else error('Invalid message');

          break


        case state_res_sip:
          
          if (c == '/') {
            state = state_msg_version;
          }
          else error('Missing version');

          break;


        case state_res_status:

          status = parseInt(read_until(SPACE), 10);

          if (!SIP_STATUS[status]) error('Invalid message status code');

          state = state_res_reason;
          message.status = status + EMPTY;

          break;


        case state_res_reason:

          reason = read_until(CR);

          state = state_header_start;
          message.reason = reason;

          break;


        case state_req_method:

          // @notice - extra parsing if multiple options for method,
          if (method == SIP_PRACK && c == 'U') {
            // RFC 3903
            method = SIP_PUBLISH;
          }
          else if (method == SIP_REGISTER) {
            if (c == 'E') {
              if(pull() == 'F') {
                method = SIP_REFER;
              }
              push();
            }
          }

          push();
          _method = read_until(SPACE);

          if (!method || !_method || method != _method) {
            error('Invalid message header');
          }

          state = state_req_uri;
          message.method = method;

          break;


        case state_req_uri:

          if (c == SPACE) break;
          else if (c == 's') {

            uri = read_until(SPACE);

            state = state_start_res;
            message.uri = uri;
          }
          else error('Invalid request URI');

          break;


        case state_msg_version:

          var isReq = (type == SIP_REQUEST);

          version = read_until(isReq ? CR : SPACE);

          state = isReq ? state_header_start : state_res_status;
          message.version = version;

          break;


        case state_header_start:

          if (c == LF) {
            break;
          }
          else if (c == SPACE || c == HTAB) {
            header_multiline = true;
          }
          else if (c == CR) {

            var next = pull();

            if (next == LF) {
              state = state_start_body;
            }

            break;
          }

          if (!header_multiline) {
            header_name = read_until(COLON).toLowerCase();
          }

          state = state_header_value;

          break;


        case state_header_value:

          if (c == SPACE || c == HTAB) break;

          header_value = read_until(CR);

          // value already exists
          if (message.headers[header_name]) {

            if (!isArray(message.headers[header_name])) {

              if (!header_multiline) {

                var _ = message.headers[header_name];

                message.headers[header_name] = [_];
              }
            }

          }

          if (header_multiline) {

            if (isArray(message.headers[header_name])) {

              var _ = message.headers[header_name].pop();

              _ += header_value;
              message.headers[header_name].push(_);
            }
            else {
              message.headers[header_name] += header_value;
            }

            header_multiline = false;
          }
          else {

            // value already exists
            if (message.headers[header_name]) {

              message.headers[header_name].push(header_value);
            }
            // new value
            else {
              message.headers[header_name] = header_value;
            }
          }


          // search for multiple values in header
          if (multipleHeader[header_name]) {

            if (isArray(message.headers[header_name])) {

              var _ = message.headers[header_name].pop();
              var _values = splitHeaderValues(_);
                
              for (var _i in _values) {
                message.headers[header_name].push(_values[_i].trim());
              }

            }
            else {

              var _ = message.headers[header_name];
              var _values = splitHeaderValues(_);
                
              if (_values.length > 1) {

                message.headers[header_name] = [];

                for (var _i in _values) {
                  message.headers[header_name].push(_values[_i].trim());
                }
              }
            }

          }


          state = state_header_start;
          pull();
          
          break;


        case state_start_body:
          body = read_until(null);

          state = 99;
          message.body = body || EMPTY;

          break;

        default:
      }

    }

    return message;
  }


  return function(raw) {
    return _parse(raw);
  };
}


/**
 * SIP Message.
 * @constructor
 * @param {string|number|Object|Message} arg1 SIP request method or response status or object.
 * @param {string} arg2 Valid SIP URI or message status text.
 * @param {Object.<string, string>=} headers SIP message headers.
 * @param {string=} body SIP message body content.
 */
function Message (arg1, arg2, headers, body) {

  if (isMessage(arg1)) {
    clone(arg1, this);

    return;
  }


  var exportArgs = isObject(arg1);
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
 * Set header value.
 * @param {string} name Header name.
 * @param {number=} pos Get header value from position.
 * @return {string}
 */
Message.prototype.getHeader = function (name, pos) {

  var header = this.headers[name];

  if (pos === undefined) {
    return header || null;
  }

  if (pos < 0 && header) {
    pos += header.length;
  }
  else {
    pos = pos > 0 ? pos : 0;
  }

  return isArray(header) ? header[pos] || null : header || null;
};


/**
 * Set header value.
 * @param {string} name Header name.
 * @param {string|Object} value Header value.
 * @param {number=} pos Push values to array or remove from position.
 */
Message.prototype.setHeader = function (name, value, pos) {

  if (this.headers[name] && (pos || pos == 0)) {

    if (!isArray(this.headers[name])) {
      this.headers[name] = [this.headers[name]];
    }

    if (value === null) {

      if (pos < 0) {
        pos += this.headers[name].length;
      }

      this.headers[name][pos] = value;

      if (this.headers[name].length < 2) {

        delete this.headers[name];

        return;
      }
      else {

        var newValues = [];

        // create new array
        for (var i in this.headers[name]) {
          if (this.headers[name][i] === null) continue;

          newValues.push(this.headers[name][i]);
        }

        this.headers[name] = newValues;
      }

    }

    else if (isArray(value)) {

      for (var i = 0; i < value.length; i++) {
        this.headers[name].push(value[i]);
      }
    }
    else {
      this.headers[name].push(value);
    }

  }
  else {
    this.headers[name] = value;
  }
};


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
    
    
  clone(headers || {}, this.headers);

  return createMessage(status, reason, headers, body);
};


/**
 * Checks if object is instance of Message class.
 * @param {*} obj Object to test against.
 * @return {boolean}
 */
function isMessage (obj) {

  return is(obj, Message);
};


/**
 * Create request message.
 * @param {string|number|Object|Message} arg1 SIP request method or response status or object.
 * @param {string} arg2 Valid SIP URI or message status text.
 * @param {Object.<string, string>=} headers SIP message headers.
 * @param {string=} body SIP message body content.
 * @return {Message}
 */
var createMessage = function (arg1, arg2, headers, body) {

  return new Message(arg1, arg2, headers, body);
};


// Public API

var __parser;

exports.parse = function (raw) {

  var parser = __parser || (__parser = initParser());

  return parser(raw);
};

exports.isMessage = isMessage;
exports.createMessage = createMessage;
