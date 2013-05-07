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
// **SIPCore.js** is general purpose SIP library as defined in 
// [RFC 3261](http://www.ietf.org/rfc/rfc3261.txt). Source
// code is released under *GNU Lesser General Public License*.


var nextTick = process.nextTick;
var EventEmitter = require('events').EventEmitter;
var assert = require('assert').ok;
var inherits = require('util').inherits;


// ## Token Constants
var CR        = '\r';
var LF        = '\n';
var CRLF      = CR + LF;
var HTAB      = '\t';
var SPACE     = ' ';
var DOT       = '.';
var COMMA     = ',';
var SEMI      = ';';
var COLON     = ':';
var EQUAL     = '=';
var DQUOT     = '"';
var QUOT      = '\'';
var DASH      = '-';
var AMPERSAND = '&';
var QMARK     = '?';
var EMPTY     = '';


// ## SIP Constants

// Currently supported protocol version.
var SIP_VERSION = '2.0';

// SIP messages types.
var SIP_REQUEST   = 1;
var SIP_RESPONSE  = 2;

// SIP transaction states.
var SIP_STATE_CALLING    = 1;
var SIP_STATE_TRYING     = 2;
var SIP_STATE_PROCEEDING = 3;
var SIP_STATE_COMPLETED  = 4;
var SIP_STATE_CONFIRMED  = 5;
var SIP_STATE_TERMINATED = 6;

// SIP Timers in miliseconds.
var SIP_T1 = 500;
var SIP_T2 = 4 * 1000;
var SIP_T4 = 5 * 1000;
var SIP_TIMER_A = SIP_T1;
var SIP_TIMER_B = 64 * SIP_T1;
var SIP_TIMER_C = 60 * 3 * 1000;
var SIP_TIMER_D = 32 * 1000;
var SIP_TIMER_E = SIP_T1;
var SIP_TIMER_F = 64 * SIP_T1;
var SIP_TIMER_G = SIP_T1;
var SIP_TIMER_H = 64 * SIP_T1;
var SIP_TIMER_I = SIP_T4;
var SIP_TIMER_J = 64 * SIP_T1;
var SIP_TIMER_K = SIP_T4;

// SIP methods defined in *RFC 3261*, *RFC 3262*, *RFC 3265*,
// *RFC 3428*, *RFC 3515* and *RFC 3856*.
var SIP_ACK       = 'ACK';
var SIP_BYE       = 'BYE';
var SIP_CANCEL    = 'CANCEL';
var SIP_INVITE    = 'INVITE';
var SIP_MESSAGE   = 'MESSAGE';
var SIP_NOTIFY    = 'NOTIFY';
var SIP_OPTIONS   = 'OPTIONS';
var SIP_PRACK     = 'PRACK';
var SIP_PUBLISH   = 'PUBLISH';
var SIP_REFER     = 'REFER';
var SIP_REGISTER  = 'REGISTER';
var SIP_SUBSCRIBE = 'SUBSCRIBE';

// ### Defined response status codes
var SIP_STATUS = {

  // 1xx - Provisional status codes
  100: 'Trying',
  180: 'Ringing',
  181: 'Call Is Being Forwarded',
  182: 'Queued',
  183: 'Session Progress',
  // 2xx - Success status codes
  200: 'OK',
  // 3xx - Redirection status codes
  300: 'Multiple Choises',
  301: 'Moved Permanently',
  302: 'Moved Temporarily',
  305: 'Use Proxy',
  380: 'Alternative Service',
  // 4xx - Client error status codes
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
  // 5xx - Server Error status codes
  500: 'Server Internal Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Server Time-out',
  505: 'Version Not Supported',
  513: 'Message Too Large',
  // 6xx - Global failure status codes
  600: 'Busy Everywhere',
  603: 'Decline',
  604: 'Does Not Exist Anywhere',
  606: 'Not Acceptable'
};

// ### Compact Form

// Header names can be replace with shorter values.
var SIP_COMPACT_VALUES = {
  'content-type'      : 'c',
  'content-encoding'  : 'e',
  'from'              : 'f',
  'call-id'           : 'i',
  'supported'         : 'k',
  'content-length'    : 'l',
  'contact'           : 'm',
  'subject'           : 's',
  'to'                : 't',
  'via'               : 'v'
};

var SIP_COMPACT_HEADERS = {
  'c': 'content-type',
  'e': 'content-encoding',
  'f': 'from',
  'i': 'call-id',
  'k': 'supported',
  'l': 'content-length',
  'm': 'contact',
  's': 'subject',
  't': 'to',
  'v': 'via'
};

// Predefined formated header names. This list only defines header
// names that cannot be transformed to original form from lower case
// string. Other header names are added during runtime.
var sip_headers = {
  'call-id': 'Call-ID',
  'cseq': 'CSeq',
  'mime-version': 'MIME-Version',
  'rack': 'RAck',
  'www-authenticate': 'WWW-Authenticate'
};


// ## Custom methods

// This method returns byte length for UTF8 strings.
String.prototype.lengthUTF8 = function () {

  var m = encodeURIComponent(this).match(/%[89ABab]/g);

  return this.length + (m ? m.length : 0);
}


// ## Helpers

// Checks if object is instance of some class.
//
// Example:
//
//     is(someObj, Message);
/**
 * @param {*} obj Object to check.
 * @param {(function()|Object)} name Class object.
 * @return {boolean}
 */
function is (obj, name) {
  return (obj instanceof name);
}


// Checks if object is instance of JavaScript Object.
//
// Example:
//
//     // same as is(someObj, Object);
//     isObject(someObj);
/**
 * @param {*} obj Object to check.
 * @return {boolean}
 */
function isObject (obj) {
  return is(obj, Object);
}


// Checks if object is instance of JavaScript Array.
//
// Example:
//
//     // same as is(someArr, Array);
//     isArray(someArr);
/**
 * @param {*} obj Object to check.
 * @return {boolean}
 */
function isArray (obj) {
  return is(obj, Array);
}


// Deep clone of an object.
//
// Example:
//
//     clone(msg, copy);
/**
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


// Split header values from string to array. SIP parser uses this
// function to get values from header. Values are seperated with
// comma character - quoted string are ignored.
//
// For example *Record-Route* header value
//
//     "<sip:proxy1@example.org>, <sip:proxy2@example.org>"
//
// is parsed to array
//
//     [ "<sip:proxy1@example.org>", "<sip:proxy2@example.org>" ]
/**
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

// ## SIP Parser
//
// SIP parser is state machine that traverse message in main loop - byte
// by byte.

// Initialize new parser for parsing SIP messages.
/**
 * @return {Function} Function for parsing messages.
 */
function initParser () {

  var i;
  var len;
  var data;

  // States of parser's state machine.
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
  var state_msg_end       = 14;

  // List of headers that can hold more that one value.
  var multipleValueHeader = {
    'contact': true,
    'record-route' : true,
    'route': true,
    'via': true
  };


  // Character is pushed back to main loop.
  function push () {
    i--;
  }

  // Character is pulled from main loop.
  function pull () {
    return data.charAt(++i);
  }

  // Main loop is reset.
  function reset () {
    i = -1;
  }

  // Throws parse error.
  function error (text) {

    i = len;
    throw new Error(text);
  }

  // Read characters until delimiter is found.
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


  // Main parser function.
  function _parse (raw) {

    var message = { headers: {}, body: EMPTY };
    var state = state_req_or_res;
    var method, uri, version;
    var status, reason;
    var headers = {};
    var header_name, header_value;
    var type;
    var header_multiline;
    var c;

    data = raw;
    len = data.length;
    i = -1;


    // Main loop read characters from message. Characters are pulled
    // and pushed back to loop.
    while ( i++ < len) {
      
      c = data.charAt(i);

      switch (state) {

        // This is initial state where figure out if parsing request or response.
        case state_req_or_res:

          if (c == CR || c == LF) break;

          state = c == 'S' ? state_start_res : state_start_req;
          push();

          break;


        // Message type and method is set. Method is set based on first
        // character. Method value is checked in *state_req_method* state.
        case state_start_req:

          type = SIP_REQUEST;

          switch (c) {
          
            case 'I': method = SIP_INVITE; break;
            case 'A': method = SIP_ACK; break;
            case 'C': method = SIP_CANCEL; break;
            case 'B': method = SIP_BYE; break;
            case 'R': method = SIP_REGISTER; break;
            case 'O': method = SIP_OPTIONS; break;

            case 'P': method = SIP_PRACK; break;

            case 'S': method = SIP_SUBSCRIBE; break;
            case 'N': method = SIP_NOTIFY; break;

            case 'M': method = SIP_MESSAGE; break;

            default: error('Invalid request method');
            
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
          else error('Missing protocol version');

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

          if (method == SIP_PRACK && c == 'U') {
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
          var _method = read_until(SPACE);

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

            if (SIP_COMPACT_HEADERS[header_name]) {
              header_name = SIP_COMPACT_HEADERS[header_name];
            }
          }

          state = state_header_value;

          break;


        case state_header_value:

          header_value = read_until(CR).trim();

          if (!header_value) {
            state = state_header_start;

            break;
          }


          if (headers[header_name]) {

            if (!isArray(headers[header_name])) {

              if (!header_multiline) {

                var _ = headers[header_name];

                headers[header_name] = [_];
              }
            }

          }

          if (header_multiline) {

            if (isArray(headers[header_name])) {

              var _ = headers[header_name].pop();

              _ += header_value;
              headers[header_name].push(_);
            }
            else {
              headers[header_name] += header_value;
            }

            header_multiline = false;
          }
          else {

            if (headers[header_name]) {
              headers[header_name].push(header_value);
            }
            else {
              headers[header_name] = header_value;
            }
          }


          if (multipleValueHeader[header_name]) {

            if (isArray(headers[header_name])) {

              var _ = headers[header_name].pop();
              var _values = splitHeaderValues(_);
                
              for (var _i in _values) {
                headers[header_name].push(_values[_i].trim());
              }

            }
            else {

              var _ = headers[header_name];
              var _values = splitHeaderValues(_);
                
              if (_values.length > 1) {

                headers[header_name] = [];

                for (var _i in _values) {
                  headers[header_name].push(_values[_i].trim());
                }
              }

            }
          }


          state = state_header_start;
          pull();
          
          break;


        case state_start_body:

          var body = read_until(null);
          
          message.headers = headers || {};
          message.body = body || EMPTY;

          state = state_msg_end;

          break;

        default:
      }

    }

    if (state != state_msg_end) {
      error('Invalid message: ' + state);
    }


    return message;
  }


  return function(raw) {
    return _parse(raw);
  };
}


// ## Value Parsers

var uriRe = /^(\w+):([\w\+\-]+):?(\w+)?@?([\w\.]+)?:?(\d+)?;?([\w=@;\.\-_]+)?\??([\S\s]+)?/;
var viaRe = /SIP\/(\d\.\d)\/(\w+)\s+([a-z0-9_\-\.]+):?(\d*)?;?(.*)?/;


// *parseParameters* function parses parameter values from string.
//
//     parseParameters('branch=rgfh374ny;received=192.168.1.102');
//
//     // result
//     {
//       branch: 'rgfh374ny',
//       received: '192.168.1.102'
//     }
/**
 * @param {string} value
 * @param {(string|null)=} sep Character that seperates parameters.
 * @param {boolean=} lower Covert parameter value to lower case.
 * @return {Object}
 */
function parseParameters (value, sep, lower) {

  var c;
  var i = 0;
  var start = 0;
  var end;
  var len = value.length;
  var params = {};
  var paramName;

  sep = sep || SEMI;

  function getValue () {
    return value.substr(start, end);
  }

  while (i <= len) {

    c = value.charAt(i++);

    if (i == len && paramName || c == sep) {

      end = i - start - ( i == len && c != sep ? 0 : 1 );

      if (!paramName) {
        paramName = getValue();
        params[paramName] = '';
      }
      else {
        params[paramName] = lower ? getValue().toLowerCase() : getValue();
      }

      paramName = '';
      start = i;
    }
    else if (c == EQUAL) {

      end = i - start - 1;
      paramName = getValue().toLowerCase();
      start = i;
    } 
    else if (i == len) {

      end = i - start;
      paramName = getValue().toLowerCase();

      params[paramName] = '';
    }

  }

  return params; 
}


// *formatParameters* function does the opposite operation as
// *parseParameters*.
//
//     formatParameters({branch:'rgfh374ny',received:'192.168.1.102'});
//
//     // result
//     'branch=rgfh374ny;received=192.168.1.102'
/**
 * @param {Object} params
 * @param {string} sep
 * @param {string} delimit
 * @return {string}
 */
function formatParameters (params, sep, delimit) {

  var _ = [];
  
  for (var p in params) {
    _.push(p + EQUAL + encodeURI(params[p]));
  }

  return _.length ? delimit + _.join(sep) : '';
}

// Parser for *Via* header value.
//
//     parseVia('SIP/2.0/TCP pc33.example.com:5060;branch=bb654vt3f');
//
//     // result
//     {
//       'version': '2.0',
//       'protocol': 'TCP',
//       'host': 'pc33.example.com',
//       'port': '5060',
//       'params': {
//         'branch': 'bb654vt3f'
//       }
//     }
/**
 * @param {string} value
 * @return {(Object.<string, *>|null)}
 */
function parseVia (value) {

  var match = viaRe.exec(value);

  if (!match) return null;

  var port = match[4];
  var params = match[5];

  return match ? {
    'version': match[1],
    'protocol': match[2],
    'host': match[3],
    'port': port > 0 ? port : '5060',
    'params': (port > 0 ? params && parseParameters(params) : port && parseParameters(port)) || {}
  } : null;
}


// Parser for *Contact* header value.
//
//     parseContact('Bob <sip:bob@biloxi.example.com>;rinstance=65bv4');
//
//     // result
//     {
//       'name': 'Bob',
//       'uri': 'sip:bob@biloxi.example.com',
//       'params': {
//         'rinstance': '65bv4'
//       }
//     }
/**
 * @param {string} value
 * @return {(Object.<string, *>)}
 */

function parseContact (value) {
  
  var _contact = value.split('>;');
  var contact = { params: {}};
  var name = '', uri = '', params = {};
  var _addr = _contact[0];
  var _params = [], _paramData;


  if (_contact[1]) {
    _params = _contact[1].split(SEMI);
  }

  if (_addr.indexOf('sip') < 2) {
    uri = _addr.substr(1, _addr.length).replace('>', '');
  }
  else {
    _addr = _addr.split(SPACE);
    name = _addr[0].trim();
    uri = _addr[1].substr(1, _addr[1].length).replace('>', '');
  }

  for (var i = 0; i < _params.length; i++) {
    _paramData = _params[i].split(EQUAL);
    params[_paramData[0]] = _paramData[1];
  }

  return { 'name': name, 'uri': uri, 'params': params };
}


// Parser for *CSeq* header value.
//
//     parseCSeq('242 INVITE');
//
//     // result
//     {
//       'seq': '242',
//       'method': 'INVITE'
//     }
/**
 * @param {string} value
 * @return {(Object.<string, *>|null)}
 */
function parseCSeq (value) {

  var _data = value.split(SPACE);

  return {
    'seq': _data[0],
    'method': _data[1]
  };
}


var parsers = {
  'contact': parseContact,
  'cseq': parseCSeq,
  'from': parseContact,
  'via': parseVia,
  'to': parseContact
};


// ## Value Stringifiers

/**
 * @param {Object} value
 */
function stringifyParameters (params) {

  var value = '';

  for (var key in params) {
    value += params[key] ? ';' + key +'='+ params[key] : ';' + key;
  }

  return value;
}


/**
 * @param {Object} value
 */
function stringifyContact (value) {
  return value.name +' <'+ value.uri +'>' + stringifyParameters(value.params);
}


/**
 * @param {Object} value
 */
function stringifyCSeq (value) {
  return value.seq + ' ' + value.method;
}


/**
 * @param {Object} value
 */
function stringifyVia (value) {

  var s = 'SIP/'+ value.version +'/'+ value.protocol +' '+ value.host;

  if (value.port) s += ':'+ value.port;
  
  s += stringifyParameters(value.params);

  return s;
}


var stringifiers = {
  'contact': stringifyContact,
  'cseq': stringifyCSeq,
  'from': stringifyContact,
  'via': stringifyVia,
  'to': stringifyContact
};


// ## Message
//
// Message class represents SIP message which is similar to HTTP message.
// Like in HTTP there are two types of messages - requests and responses.
// Request is defined with *method* and *URI* value, and response is defined
// with *status code* and *reason text*. Both types have *headers* and *body*
// attributes.
//
//     request = {
//       method: 'INVITE',
//       uri: 'sip:alice@example.org',
//       version: '2.0',
//
//       headers: { ... },
//       body: ''
//     }
//
//     response = {
//       status: '200',
//       reason: 'OK',
//       version: '2.0',
//
//       headers: { ... },
//       body: ''
//     }
//
// Examples of creating new messages are described under section
// [SIP.createMessage](#section-34). Supported methods and status codes
// are defined under section [SIP Constants](#section-3).
/**
 * @constructor
 * @param {(string|number|Object|Message|null)} arg1 SIP request method or response status or object.
 * @param {string=} arg2 Valid SIP URI or message status text.
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

    arg1 = args.method || args.status;

    isResponse = (arg1 > 0);

    if (isResponse) {
      arg2 = args.reason;
    }
    else {
      arg2 = args.uri;
    }

    headers = args.headers;
    body = args.body;
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


// ## Message.getHeader
//
// Fetch header value in string or object form.
//
// Notice - compact header names can be used, check 
// [compact headers](#section-15).
//
// Example:
//
//     messsage.getHeader('to');
//
//     // get first value from via header
//     message.getHeader('via', false, 0);
//
//     // get last value from via header
//     message.getHeader('via', false , -1);
//
//     // get all values
//     message.getHeader('via');
//
// Header value can be parsed to object.
//
// Example:
//
//     message.getHeader('from', true);
//
//     // result
//     {
//       'name': 'Alice',
//       'uri': 'sip:atlanta.example.com;transport=tcp',
//       'params': {
//         'tag': 'b7546u5e'
//       }
//     }
/**
 * @param {string} name Header name.
 * @param {boolean} parse Return parsed header value.
 * @param {number=} pos Get header value from position.
 * @return {string}
 */
Message.prototype.getHeader = function (name, parse, pos) {

  name = name.toLowerCase();

  if (SIP_COMPACT_HEADERS[name]) {
    name = SIP_COMPACT_HEADERS[name];
  }

  var returnAll = (pos === undefined);
  var header = this.headers[name];
  var multiHeader = isArray(header);


  if (pos < 0 && header) {
    pos += header.length;
  }
  else {
    pos = pos > 0 ? pos : 0;
  }


  var value = (!returnAll && multiHeader) ? header[pos] : header;

  if (value && parse && parsers[name]) {
  
    if (multiHeader && returnAll) {

      var _values = [];

      for (var i in value) {
        _values.push(parsers[name](value[i]));
      }

      value = _values;
    }
    else {
      value = parsers[name](value);
    }

  }

  return value || null;
};


// ## Message.setHeader
//
// This method can be convenient for manipulating header values. Values
// can be added, updated or removed.
//
// Notice - compact header names can be used, check 
// [compact headers](#section-15).
//
// Example:
//
//     // add Contact header value
//     message.setHeader('contact', 'Bob <sip:bob@example.org>');
//     message.setHeader('t', 'Alice <sip:alice@example.org>');
//
//     // add many Contact header values
//     message.setHeader('record-route',
//       ['<sip:proxy.example.org>', '<sip:proxy2.example.org']);
//
//     // append value to Via header
//     message.setHeader('via',
//       'SIP/2.0/TCP 10.0.0.1:5060;branch=z9hG4bKnashd92', true);
//
//     // prepend value to Via header
//     message.setHeader('via',
//       'SIP/2.0/TCP 10.0.0.4:5060;branch=z9hG4bKb7546v', false);
//
//     // update value
//     message.setHeader('date', 'Sat, 13 Nov 2010 23:29:00 GMT');
//     message.setHeader('via',
//       'SIP/2.0/UDP 10.0.0.1:5060;branch=z9hG4bKnashd92', 0);
/**
 * @param {string} name Header name.
 * @param {(string|Object)} value Header value.
 * @param {(boolean|number)=} pos Push values to array or remove from position.
 */
Message.prototype.setHeader = function (name, value, pos) {

  var headers = this.headers;

  name = name.toLowerCase();

  if (SIP_COMPACT_HEADERS[name]) {
    name = SIP_COMPACT_HEADERS[name];
  }

  if (!isArray(value) && isObject(value)) {

    assert(stringifiers[name], 'Undefined stringifer');

    value = stringifiers[name](value); 
  }


  if (headers[name] && pos != undefined) {

    if (!isArray(headers[name])) {
      headers[name] = [headers[name]];
    }

    if (value === null) {

      if (pos < 0) {
        pos += headers[name].length;
      }

      headers[name][pos] = value;

      if (headers[name].length < 2) {

        delete headers[name];

        return;
      }
      else {

        var newValues = [];

        for (var i in headers[name]) {
          if (headers[name][i] === null) continue;

          newValues.push(headers[name][i]);
        }

        headers[name] = newValues;
      }

    }

    else if (isArray(value)) {

      for (var i = 0; i < value.length; i++) {
        
        if (isObject(value[i])) {
          headers[name].push(stringifiers[name](values[i])); 
        }
        else {
          headers[name].push(value[i]);
        }
      }
    }
    else {

      if (pos < 0) {
        pos += headers[name].length;

        if (pos < 0) {
          pos = 0;
        }
      }

      if ((pos || pos == 0) && headers[name][pos]) {
        headers[name][pos] = value;
      }
      else if (pos === false) {
        headers[name].unshift(value);
      }
      else {
        headers[name].push(value);
      }

    }

  }
  else {

    if (value === null) {
      delete headers[name];
    }
    else {
      headers[name] = value;
    }
  }

  this.headers = headers;
};


// ## Message.copy
/**
 * @return {Message}
 */
Message.prototype.copy = function () {
  return createMessage(this);
};


// ## Message.format
/**
 * @param {boolean} compact
 * @return {string}
 */
Message.prototype.format = function (compact) {
  return formatMessage(this, compact);
};


// ## Message.toResponse
/**
 * @param {string|number} status
 * @param {string=} reason
 * @return {Message}
 */
Message.prototype.toResponse = function (status, reason) {

  assert(this.method, 'Check message type');
  assert(SIP_STATUS[status], 'Check status');


  var msg = createMessage(this);

  delete msg.method;
  delete msg.uri;

  msg.status = status;
  msg.reason = reason || SIP_STATUS[status];
  msg.body = '';

  msg.setHeader('content-length', '0');
  msg.setHeader('max-forwards', null);

  return msg;
};


// ## Message.toRequest
/**
 * @param {string} method
 * @param {string} uri
 * @return {Message}
 */
Message.prototype.toRequest = function (method, uri) {

  assert(this.status, 'Check message type');
  assert(uriRe.exec(uri), 'Check URI');


  var msg = createMessage(this);

  delete msg.status;
  delete msg.reason;

  msg.method = method;
  msg.uri = uri;
  msg.body = '';

  msg.setHeader('content-length', '0');
  msg.setHeader('max-forwards', 70);

  return msg;
};


// ## SIP.isMessage
//
// Checks if object is instance of Message class and returns boolean value.
/**
 * @param {*} obj Object to test against.
 * @return {boolean}
 */
function isMessage (obj) {
  return is(obj, Message);
};


// ## SIP.createMessage
//
// This function can be used to create SIP Message object from string
// or object. 
//
// Example:
//
//     SIP.createMessage('INVITE', 'alice@example.org');
//     SIP.createMessage(200, 'OK');
//
//     SIP.createMessage({
//       method: 'MESSAGE',
//       uri: 'sip:alice@example.org',
//       body: 'Hello Alice!'
//     });
//
//  Message can be cloned with:
//
//      SIP.createMessage(message);
/**
 * @param {(string|number|Object|Message)} arg1 SIP request method or response status or object.
 * @param {string} arg2 Valid SIP URI or message status text.
 * @param {Object.<string, string>=} headers SIP message headers.
 * @param {string=} body SIP message body content.
 * @return {Message}
 */
var createMessage = function (arg1, arg2, headers, body) {
  return new Message(arg1, arg2, headers, body);
};


// ## SIP.format
//
// This function transforms *Message* object to raw message
// which can be sent over the network.
//
// Example:
//
//     SIP.format({
//       method: 'MESSAGE',
//       uri: 'sip:alice@example.org',
//       body: 'Hello Alice!'
//     }); 
//
//     // result
//     'MESSAGE sip:alice@example.org SIP/2.0
//      ... (headers)
//      
//      Hello Alice!'
/**
 * @param {(Object|Message)} msg Message object.
 * @param {boolean=} compact Format message with compact header names.
 * @return {string}
 */
function formatMessage (msg, compact) {

  var s = '';

  if (msg.method) {
    s += msg.method + SPACE + msg.uri + ' SIP/' + msg.version + CRLF;
  }
  else {
    s += 'SIP/' + msg.version + SPACE + msg.status + SPACE + msg.reason + CRLF;
  }

  var header, value, _;

  for (var h in msg.headers) {

    value = msg.headers[h];

    if (compact && SIP_COMPACT_VALUES[h]) {
      header = SIP_COMPACT_VALUES[h];
    }
    else {
    
      if (!sip_headers[h]) {

        header = [];
        _ = h.split(DASH);

        for (var i in _) {
          header.push(_[i].substr(0, 1).toUpperCase() + _[i].substr(1));
        }

        sip_headers[h] = header.join(DASH);
      }

      header = sip_headers[h];
    }

    s += header + COLON + SPACE;
    s += isArray(value) ? value.join(CRLF + SPACE + COMMA + SPACE) : value;
    s += CRLF;

  }

  s += CRLF;


  if (msg.body) {
    s += msg.body;
  }

  return s;
}


// ## SIP.parseUri
//
// SIP URIs are not parsed during message parsing. Therefore, URIs
// have to be parsed with function *parseUri**.
//
// Example:
//
//     SIP.parseUri('sip:alice@atlanta.example.com;transport=udp');
//
//     // result
//     {
//       'scheme': 'sip',
//       'user': 'alice',
//       'password': '',
//       'hostname': 'atlanta.example.com',
//       'port': '',
//       'params': {
//         'transport': 'udp'
//       },
//       'headers': {}
//     }
/**
 * @param {string} value SIP uri value.
 * @param {boolean=} parse Parse parameters and headers into object.
 * @return {SIPCoreUri}
 */
function parseUri (value, parse) {

  var match = uriRe.exec(decodeURI(value));

  if (!match) return {};

  return {
    'scheme': match[1] && match[1].toLowerCase() || EMPTY,
    'user': match[2] || EMPTY,
    'password': match[3] || EMPTY,
    'hostname': match[4] && match[4].toLowerCase() || EMPTY,
    'port': match[5] || EMPTY,
    'params': ( parse ? match[6] && parseParameters(match[6], null, true) : match[6] ) || {}, 
    'headers': ( parse ? match[7] && parseParameters(match[7], AMPERSAND) : match[7] ) || {}
  };
}


// ## SIP.formatUri
//
// This function returns formatted URI object.
//
// Example:
//
//     SIP.formatUri({
//       'scheme': 'sip',
//       'user': 'alice',
//       'hostname': 'atlanta.example.com',
//       'params': {
//         'transport': 'udp'
//       }
//     })
//
//     // result
//     'sip:alice@atlanta.example.com;transport=udp'
/**
 * @param {SIPCoreUri} uri URI object.
 * @return {string}
 */
function formatUri (uri) {

  var s = EMPTY;

  if (uri.scheme) s += uri.scheme + COLON;
  if (uri.user) s += uri.user;
  if (uri.password) s += COLON + uri.password;
  if (uri.hostname) s += '@' + uri.hostname;
  if (uri.port) s += COLON + uri.port;

  if (uri.params) s += formatParameters(uri.params, SEMI, SEMI);
  if (uri.headers) s += formatParameters(uri.headers, AMPERSAND, QMARK);
  
  return s;
}


// ## SIP.parse
var __parser;

// This function parses SIP message into object.
//
// Example of parsing request:
//
//     SIP.parse('INVITE sip:alice@atlanta.example.com SIP/2.0...');
//
//     // result
//     {
//       'method': 'INVITE',
//       'uri': 'sip:alice@atlanta.example.com',
//       'version': '2.0',
//       'headers': { ... },
//       'body': ''
//     }
//
// Example of parsing response:
//
//     SIP.parse('SIP/2.0 200 OK...');
//
//     // result
//     {
//       'status': '200',
//       'reason': 'OK',
//       'version': '2.0',
//       'headers': { ... },
//       'body': ''
//     }
/**
 * @param {string} raw
 * @return {Object}
 */
function parseMessage (raw) {

  var parser = __parser || (__parser = initParser());

  return parser(raw);
};


/**
 * @interface
 * @extends {EventEmitter}
 */
function Socket (port, addr) {

  EventEmitter.call(this);

  this.remotePort = port;
  this.remoteAddr = addr;
  this._closed = false;
  this._closeWatcher = null;
}


inherits(Socket, EventEmitter);


/**
 * @param {number=} timeout Timeout in miliseconds.
 */
Socket.prototype.setTimeout = function (timeout) {

  clearTimeout(this._closeWatcher);

  var that = this;

  this._closeWatcher = setTimeout(function () {
    that.close();  
  }, timeout || 32 * 1000);

};


/**
 * @interface
 */
function Protocol () {

  EventEmitter.call(this);

  this.name = null;
  this.reliable = null;
  this.format = 'text';

  this.addr = null;
  this.port = null;
  this.listenState = 0;
}


inherits(Protocol, EventEmitter);

// ## Transport API
/**
 * @constructor
 * @extends {EventEmitter}
 */
function Transport () {

  EventEmitter.call(this);

  this._protocols = {};
  this._sockets = {};
}


inherits(Transport, EventEmitter);


// ## Transport.register

// Register new transport protocol. Protocol can listen only to one
// port.
/**
 * @param {string|Protocol} name Protocol name.
 * @param {(number|string)=} port Binding port number.
 * @param {string=} addr Binding address.
 */
Transport.prototype.register = function (name, port, addr) {

  var that = this;

  if (this._protocols[name]) {
    throw new Error('Protocol ' + name + ' already registered');
  }

  var path = './protocol/';

  if (name != 'heap') {
    path += (process.env && process.env.JS_ENV) ? process.env.JS_ENV : '';
  }

  var wrapper = require(path + '/' + name);
  var protocol = wrapper.createProtocol();

  this._protocols[protocol.name] = [protocol, port, addr];


  protocol.on('listening', function () {
    that.emit('listening', protocol.name);
  });


  // For reliable protocols, ex. TCP, listen for new connections. New
  // connections are indexed by address, port and protocol name.
  if (protocol.reliable) {

    protocol.on('connection', function (sock) {

      var sockId = sock.remoteAddr + ':' + sock.remotePort + ':' + protocol.name;

      if (!that._sockets[sockId]) {
        that._sockets[sockId] = sock;
      }

      // Connection is removed from index on disconnect.
      sock.once('close', function () {
        delete that._sockets[sockId];
      });
    });
  }


  // Listen for new messages from protocol layer.
  protocol.on('message', function (data, rinfo) {

    // Message are parsed as JSON or plain text.
    try {
      var mobj = (protocol.format == 'json') ?
        JSON.parse(data) : parseMessage(data.toString());
    }
    catch (e) {
      // @pass
      console.log('Parse error:', e);
      return
    }

    var msg = new Message(mobj);
    var via = msg.getHeader('via', true, 0);
    var hCseq = msg.getHeader('cseq', true);
    var match = '';


    // match transaction
    if (via && hCseq) {

      match = via.params.branch;

      if (msg.status) {
        match += '-'+ hCseq.method;
      }
      else {
        match += '-'+ via.host +':'+ via.port;
        match += '-'+ ( msg.method == SIP_ACK ? SIP_INVITE : msg.method ); 
      }
    }

    var emitEvent = 'message';

    if (that.listeners(match).length > 0) {
      emitEvent = match;
    }


    // Add received and rport parameter as defined in *18.2.1* and *RFC 3581*.
    // @todo - setHeader stringifiers
    if (msg.method) {

      var viaRaw = msg.getHeader('via', false, 0);


      if (via.params.rport == '' && rinfo.port && via.port != rinfo.port) {
        viaRaw += '=' + rinfo.port;
      }

      if (rinfo.address && rinfo.address != via.host) {
        viaRaw += ';received=' + rinfo.address;
      }

      msg.setHeader('via', viaRaw, 0);

    }
    // remove via top header
    else {
      var viaValues = msg.getHeader('via');

      if (isArray(viaValues)) {
        viaValues.shift();
      }

      msg.setHeader('via', viaValues);
    }

    nextTick(function () {
      that.emit(emitEvent, msg);
    });

  });
  
  protocol.on('close', function () { 
    that.emit('close', protocol.name);
  });

};


/**
 * @private
 * @param {Array} bindData Protocol bind information.
 * @param {function()} cb
 */
Transport.prototype._bind = function (bindData, cb) {

  var protocol = bindData[0];
  var port = bindData[1] || 5060;
  var addr = bindData[2] || '0.0.0.0';

  protocol.bind(port, addr, function (err) {
    if (cb) cb(err);
  });

};


// ## Transport.listen

// Start listening on all protocols that are registered.
/**
 * @param {function()=} cb Callback function called when all protocols
 * are listening.
 */
Transport.prototype.listen = function (cb) {

  var that = this;
  var name, bindData, protocol, port, addr;
  var protocolNum = 0;
  var listening = {};

  for (var name in this._protocols) {

    bindData = this._protocols[name];
    listening[name] = bindData[0].listenState;

    if (bindData[0].listenState != 0) {
      continue;
    }

    protocolNum++;

    this._bind(bindData, function (listen) {

      protocolNum--;
      listening[name] = listen;

      if (protocolNum == 0) {
        if (cb) cb(listening);
      }

    });
  }

  if (protocolNum == 0) {
    if (cb) cb(listening);
  }

};


// ## Transport.isListening

// Get listening state of specific protocol. If no name argument
// is passed to function, result contains listening states for all
// protocols.
/**
 * @param {string=} name Protocol name.
 * @return {boolean|object}
 */
Transport.prototype.isListening = function (name) {

  var bindData;

  if (name) {

    bindData = this._protocols[name];

    return bindData ? bindData[0].listenState : 0;
  }
  else {

    var listenStates = {};

    for (var name in this._protocols) {

      bindData = this._protocols[name];
      listenStates[name] = bindData[0].listenState;
    }

    return listenStates;

  }
};


// ## Transport.close

// Close and stop all running protocols.
/**
 * @param {function(Object)=} cb Callback called when call protocols are closed.
 */
Transport.prototype.close = function (cb) {

  var that = this;
  var protocolNum = 0;
  var protocol;
  var listening = {};


  for (var name in this._protocols) {

    protocol = this._protocols[name][0];
    listening[name]  = protocol.listenState;

    if (protocol.listenState == 1) {
      protocolNum++;
    }
  }

  for (var name in this._protocols) {

    var _cb = function (listen) {

      protocolNum--;
      listening[name] = listen;

      if (protocolNum == 0) {
        if (cb) cb(listening);
      }
    };

    protocol = this._protocols[name][0];

    if (protocol.listenState == 1) {
      protocol.close(_cb);
    }
  }

  if (protocolNum == 0) {
    if (cb) cb(listening);
  }

};


// ## Transport.send

// This function can be used to send SIP message within client or server
// transport. Usually requests are sent to specific address within client
// transport. Responses are routed upstream to address that is stored in
// *Via* header.
/**
 * @param {(Object|Message)} msg Message object.
 * @param {string=} addr Binding address.
 * @param {(number|string)=} port Binding port number.
 * @param {string=} name Protocol name.
 * @param {function()} cb Send callback function.
 */
Transport.prototype.send = function (msg, addr, port, name, cb) {

  if (!isMessage(msg)) {
    if (cb) cb('Invalid message argument');
    return;
  }

  var readVia = (!addr);

  if (addr && typeof addr == 'function') {

    cb = addr;
    readVia = true;
  }


  var via = msg.getHeader('via', true, 0);

  if (!via) {

    if (cb) cb('Missing Via header');
    return;
  }


  if (readVia) {

    addr = via.params.received || via.host;
    port = via.params.rport || via.port;
    name = via.protocol;
  }

  name = name.toLowerCase();

  var bindData = this._protocols[name];

  if (!bindData) {
    if (cb) cb('Unknown protocol ' + name);
    return;
  }


  var protocol = bindData[0];

  if (!readVia) {

    via.host = protocol.addr;
    via.port = protocol.port;
    via.params.rport = '';

    msg.setHeader('via', via, 0);
  }


  try {

    // @temp - move to UA core
    msg.setHeader('Content-Length', msg.body ? msg.body.lengthUTF8() : 0);

    var data = formatMessage(msg);
  }
  catch (e) {
    if (cb) cb(e.message);

    return;
  }


  var sockId = addr + ':' + port + ':' + protocol.name;
  var sock = this._sockets[sockId];

  if (sock) {

    sock.send(data, function (err) {

      if (!err) that.emit('send', msg);
      if (cb) cb(err);
    });
  }
  else {

    var that = this;

    sock = protocol.send(data, addr, port, function (err) {

      if (!err) that.emit('send', msg);
      if (cb) cb(err);
    });


    if (sock) {

      sockId = sock.remoteAddr + ':' + sock.remotePort + ':' + protocol.name;


      if (!this._sockets[sockId]) {
        this._sockets[sockId] = sock;
      }

      sock.once('close', function () {
        delete that._sockets[sockId];
      });
    }

  }

};


/**
 * @return {Transport}
 */
function createTransport () {
  return new Transport;
}


/**
 * @param {Transport} transport
 * @param {Message=} msg
 */
function Transaction (transport, msg) {

  EventEmitter.call(this);

  this._transport = transport;
  this._initMsg = msg;
  this._type = msg ? 0 : 1;
  this._isInvite = ( msg && msg.method == SIP_INVITE );
  this._isReliable = true;
  this.state = 0;
  this.error = false;
  this.timeout = false;

  if (!this._type) {
    this._listen();
  }
}


inherits(Transaction, EventEmitter);


Transaction.prototype._listener = function (msg) {

  var stateCb;


  if (this._type) {
    stateCb = this._isInvite ?
      this.__clientInvite : this.__clientNonInvite;
  }
  else {
    stateCb = this._isInvite ?
      this.__serverInvite : this.__serverNonInvite;
  }


  var state = stateCb.call(this, msg.status, msg.method);

  if (state) {
    this._setState(state);
    this.emit('message', msg, state);
  }
};


Transaction.prototype._listen = function () {

  var that = this;
  var mInit = this._initMsg;
  var hVia = mInit.getHeader('via', true, 0);
  var match = hVia.params.branch;


  // check if transport is reliable
  var name = hVia.protocol.toLowerCase();
  var protocol = this._transport._protocols[name][0];

  this._isReliable = protocol.reliable;


  // server transaction
  if (!this._type) {
    match += '-'+ hVia.host +':'+ hVia.port;
  }

  match += '-'+ mInit.method;


  this.listener = function (msg) {
    that._listener(msg);
  };

  this._transport.on(match, this.listener);


  // Send 100 Trying after 200ms if TU won't
  if (!this._type) {
    
    this._timerTry = setTimeout(function () {
      that._send(mInit.toResponse(100));
    }, 200);
  }


  if (this._isInvite) {
    this._setState(this._type ? SIP_STATE_CALLING : SIP_STATE_PROCEEDING);
  }
  else {
    this._setState(SIP_STATE_TRYING);
  }
};


/**
 * @param {number} status Response status code.
 * @return {number} New state of transaction.
 */
Transaction.prototype.__clientInvite = function (status) {

  var state = this.state;


  if (state == SIP_STATE_CALLING) {

    if (status >= 300) {
      state = SIP_STATE_COMPLETED;
    }
    else if (status >= 200) {
      state = SIP_STATE_TERMINATED;
    }
    else if (status >= 100) {
      state = SIP_STATE_PROCEEDING;
    }
  }
  else if (state == SIP_STATE_PROCEEDING) {

    if (status >= 300) {
      state = SIP_STATE_COMPLETED;


      // ACK for non-200 final responses must be not be send within
      // transaction but sent directly to transport layer.
      var msgACK = this._initMsg.copy();
      var hCseq = msgACK.getHeader('cseq', true);
      
      // @todo - add Route header

      msgACK.method = SIP_ACK;
      msgACK.body = '';
      msgACK.setHeader('cseq', hCseq.seq +' '+ SIP_ACK);

      this._sendACK(msgACK);

    }
    else if (status >= 200) {
      state = SIP_STATE_TERMINATED;
    }
  }

  return state;
};


/**
 * @param {number} status Response status code.
 * @return {number} New state of transaction.
 */
Transaction.prototype.__clientNonInvite = function (status) {

  var state = this.state;

  if (state == SIP_STATE_TRYING) {

    if (status >= 200) {
      state = SIP_STATE_COMPLETED;
    }
    else if (status >= 100) {
      state = SIP_STATE_PROCEEDING;
    }

  }
  else if (state == SIP_STATE_PROCEEDING) {

    if (status >= 200) {
      state = SIP_STATE_COMPLETED;
    }
  }

  return state;
};


/**
 * @param {number} status Response status code.
 * @param {string} method Request method name.
 * @return {number} New state of transaction.
 */
Transaction.prototype.__serverInvite = function (status, method) {

  var state = this.state;

  // retransmit last response
  if (state < SIP_STATE_CONFIRMED && method == SIP_INVITE) {
    this._resend();

    return;
  }


  if (state == SIP_STATE_PROCEEDING) {

    if (status >= 300) {
      state = SIP_STATE_COMPLETED;
    }
    else if (status >= 200) {
      state = SIP_STATE_TERMINATED;
    }
  }
  else if (state == SIP_STATE_COMPLETED) {
    
    if (method == SIP_ACK) {
      state = SIP_STATE_CONFIRMED;
    }
  }

  return state;
};


/**
 * @param {number} status Response status code.
 * @param {string} method Request method name.
 * @return {number} New state of transaction.
 */
Transaction.prototype.__serverNonInvite = function (status, method) {

  var state = this.state;

  // retransmit last response
  if (method && method != SIP_INVITE &&
      (state == SIP_STATE_COMPLETED || state == SIP_STATE_PROCEEDING )) {
    this._resend();

    return;
  }

  if (state == SIP_STATE_TRYING) {

    if (status >= 200) {
      state = SIP_STATE_COMPLETED;
    }
    else if (status >= 100) {
      state = SIP_STATE_PROCEEDING;
    }

  }
  else if (state == SIP_STATE_PROCEEDING) {

    if (status >= 200) {
      state = SIP_STATE_COMPLETED;
    }
  }

  return state;
};


Transaction.prototype._setState = function (state, isError, isTimeout) {

  // Emit new state value only if it has changed.
  if (state <= this.state) return;

  var that = this;

  this.state = state;
  this.error = isError ? true : false;
  this.timeout = isTimeout ? true : false;
  this.emit('state', state);


  // Timer D
  if (this._isInvite && this._type && this.state == SIP_STATE_COMPLETED) {

    this._timerD = setTimeout(function () {

      if (that.state == SIP_STATE_COMPLETED) {
        that._setState(SIP_STATE_TERMINATED);
      }
    }, this._isReliable ? 0 : SIP_TIMER_D);
  }

  // Timer K
  else if (!this._isInvite && this._type && this.state == SIP_STATE_COMPLETED) {

    this._timerK = setTimeout(function () {

      if (that.state == SIP_STATE_COMPLETED) {
        that._setState(SIP_STATE_TERMINATED);
      }
    }, this._isReliable ? 0 : SIP_TIMER_K);
  }

  // Timer G
  else if (this._isInvite && this._type == 0 && !this._isReliable && this.state == SIP_STATE_COMPLETED) {

    var startTimerG = function (timeout) {

      that._timerE = setTimeout(function () {
        
        var state = that.state;

        if (state == SIP_STATE_COMPLETED) {

          timeout = ( timeout >= SIP_T2 ) ? SIP_T2 : timeout * 2;

          that._resend();
          startTimerG(timeout);
        }
      }, timeout);
    };

    startTimerG(SIP_TIMER_G);
  }

  // Timer I
  else if (this._isInvite && this._type == 0 && this.state == SIP_STATE_CONFIRMED) {

    this._timerI = setTimeout(function () {

      if (that.state == SIP_STATE_CONFIRMED) {
        that._setState(SIP_STATE_TERMINATED);
      }
    }, this._isReliable ? 0 : SIP_TIMER_I);
  }
  
  // Timer J
  else if (!this._isInvite && this._type == 0 && this.state == SIP_STATE_COMPLETED) {

    this._timerJ = setTimeout(function () {

      if (that.state == SIP_STATE_COMPLETED) {
        that._setState(SIP_STATE_TERMINATED);
      }
    }, this._isReliable ? 0 : SIP_TIMER_J);
  }

  // Timer H
  if (this._isInvite && this._type == 0 && this.state == SIP_STATE_COMPLETED) {

    this._timerH = setTimeout(function () {

      if (that.state == SIP_STATE_COMPLETED) {
        that._setState(SIP_STATE_TERMINATED, true, true);
        that.emit('timeout');
      }
    }, SIP_TIMER_H);
  }
  

};


/**
 * @param {(Object|Message)} msg
 * @param {string=} addr
 * @param {(number|string)=} port
 * @param {string=} name
 * @param {function()} cb
 */
Transaction.prototype._send = function (msg, addr, port, name, cb) {

  var that = this;

  if (!this._type) {

    this._resend = function () {
      that._send(msg);
    };
  }


  if (this._timerTry) {

    clearTimeout(this._timerTry);
    this._timerTry = null;
  }

  this._transport.send(msg, addr, port, name, function (err) {

    if (err) that._setState(SIP_STATE_TERMINATED, true, false);
    if (cb) cb(err);
    if (err) that.emit('error', err);
  });
};


/**
 * @param {(Object|Message)} msg
 * @param {string=} addr
 * @param {(number|string)=} port
 * @param {string=} name
 * @param {function()} cb
 */
Transaction.prototype.send = function (msg, addr, port, name, cb) {

  var that = this;

  // client transaction
  if (this._type) {
    this._isInvite = ( msg.method == SIP_INVITE );
  }

  this._send(msg, addr, port, name, cb);

  if (!this.state) {
    this._initMsg = msg;
    this._listen();

    this._sendACK = function (msg) {
      this._transport.send(msg, addr, port, name);
    };
  }


  // Client transaction timers
  if (this._type) {

    if (this._isInvite) {

      // Timer A
      if (!this._isReliable) {

        var startTimerA = function (timeout) {

          that._timerA = setTimeout(function () {
            
            if (that.state == SIP_STATE_CALLING) {

              that._send(msg, addr, port, name);
              startTimerA(timeout * 2);
            }
          }, timeout);
        };

        startTimerA(SIP_TIMER_A);
      }

      // Timer B
      this._timerB = setTimeout(function () {

        if (that.state == SIP_STATE_CALLING) {
          that._setState(SIP_STATE_TERMINATED, true, true);
          that.emit('timeout');
        }
      }, SIP_TIMER_B);
    }
    else {

      // Timer A
      if (!this._isReliable) {

        var startTimerE = function (timeout) {

          that._timerE = setTimeout(function () {
            
            var state = that.state;

            if (state == SIP_STATE_TRYING ||
                state == SIP_STATE_PROCEEDING) {

              timeout = ( timeout >= SIP_T2 || state == SIP_STATE_PROCEEDING ) ?
                SIP_T2 : timeout * 2;

              that._send(msg, addr, port, name);
              startTimerE(timeout);
            }
          }, timeout);
        };

        startTimerE(SIP_TIMER_E);
      }

      // Timer F
      this._timerF = setTimeout(function () {

        if (that.state <= SIP_STATE_PROCEEDING) {
          that._setState(SIP_STATE_TERMINATED, true, true);
          that.emit('timeout');
        }
      }, SIP_TIMER_F);
    }
  }


  // server transaction
  if (!this._type) {

    var stateCb = this._isInvite ?
      this.__serverInvite : this.__serverNonInvite;

    var state = stateCb.call(this, msg.status);

    this._setState(state);
  }

};


/**
 * @param {Transport} transport
 * @param {Message=} msg
 * @return {Transaction}
 */
function createTransaction (transport, msg) {
  return new Transaction(transport, msg);
}


// ## Exports
//
// Exported functions - *parse*, *format*, *isMessage*,
// *createMessage*, *parseUri* and *formatUri*.
exports.parse = parseMessage;
exports.isMessage = isMessage;
exports.createMessage = createMessage;
exports.format = formatMessage;
exports.parseUri = parseUri;
exports.formatUri = formatUri;

// Transport layer exports - *createTransport*, *createTransaction*, *Socket* and *Protocol* class.
exports.Socket = Socket;
exports.Protocol = Protocol;
exports.createTransport = createTransport;
exports.createTransaction = createTransaction;
