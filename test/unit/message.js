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

var SIP = require('sip');
var messageData = require('../data/message');


// Message module
QUnit.module('Message');


test('API functions', 2, function () {

  ok(SIP.isMessage, 'Function isMessage is defined');
  ok(SIP.createMessage, 'Function createMessage is defined');
});


test('SIP.isMessage - success calls', 2, function () {

  var request = SIP.createMessage('INVITE', 'alice@example.org');
  var requestCopy = SIP.createMessage(request);

  ok(SIP.isMessage(request), 'Request is instance of Message');
  ok(SIP.isMessage(requestCopy), 'Copy of request is instance of Message');
});


test('SIP.isMessage - false calls', 2, function () {

  ok(!SIP.isMessage({}), 'Object is not instance of Message');
  ok(!SIP.isMessage('INVITE alice@example.org'), 'String is not instance of Message');
});


test('SIP.createMessage - success calls', 13, function () {
  
  var message;

  message = SIP.createMessage('BYE', 'alice@example.org');

  equal(message.method, 'BYE', 'Request method is valid');
  equal(message.uri, 'alice@example.org', 'Request URI is valid');

  message = SIP.createMessage('CANCEL', 'alice@example.org', {from: 'bob@example.org'});

  equal(message.method, 'CANCEL', 'Request method is valid');
  equal(message.uri, 'alice@example.org', 'Request URI is valid');
  equal(message.headers.from, 'bob@example.org', 'From header value is valid');

  message = SIP.createMessage('200');

  equal(message.status, 200, 'Response status code is valid');
  equal(message.reason, 'OK', 'Response reason text is valid');

  message = SIP.createMessage('200', 'Okay');

  equal(message.status, 200, 'Response status code is valid');
  equal(message.reason, 'Okay', 'Response reason text is valid');

  message = SIP.createMessage('INVITE', 'alice@example.org', {from: 'bob@example.org'},
    'm=audio 49170 RTP/AVP 0 8 97');

  equal(message.method, 'INVITE', 'Request method is valid');
  equal(message.uri, 'alice@example.org', 'Request URI is valid');
  equal(message.headers.from, 'bob@example.org', 'From header value is valid');
  equal(message.body, 'm=audio 49170 RTP/AVP 0 8 97', 'Message body is valid');
});


test('SIP.createMessage - create message from object', 5, function () {

  var request = SIP.parse(messageData.raw01_5);
  var message = SIP.createMessage(request);

  deepEqual(message.method, request.method, 'Method is equal.');
  deepEqual(message.version, request.version, 'Version is equal.');
  deepEqual(message.uri, request.uri, 'URI is equal.');
  deepEqual(message.headers, request.headers, 'Headers are equal.');
  deepEqual(message.body, request.body, 'Body is equal.');
});


test('SIP.createMessage - error calls', 5, function () {
  
  // missing 2nd argument
  throws(function() {
    SIP.createMessage('INVITE');
  }, 'Error on missing 2nd parameter');

  // unknown status code
  throws(function() {
    SIP.createMessage(704, 'alice@example.org');
  }, 'Error on unknown status code');

  // empty object
  throws(function() {
    SIP.createMessage({}, 'alice@example.org');
  }, 'Error creating message from empty object');
  
  // missing method
  throws(function() {
    SIP.createMessage({uri: 'alice@example.org'});
  }, 'Error on missing method');

  // missing method
  throws(function() {
    SIP.createMessage({method: 'INVITE'});
  }, 'Error on missing uri');
});


test('SIP.createMessage - checking object attributes', 5, function () {

  var request = SIP.createMessage('MESSAGE', 'alice@example.org',
                                  {from: 'bob@example.org'}, 'Hello');

  equal(request.method, 'MESSAGE', 'Method attribute');
  equal(request.uri, 'alice@example.org', 'URI attribute');
  equal(request.version, '2.0', 'Version attribute');
  equal(request.headers.from, 'bob@example.org', 'From header attribute');
  equal(request.body, 'Hello', 'Body attribute');
});


test('Message cloning', 4, function () {

  var request = SIP.createMessage('INVITE', 'alice@example.org',
                                  {from: 'bob@example.org'},
                                  'm=audio 49170 RTP/AVP 0 8 97');
  var requestCopy = SIP.createMessage(request);
  
  deepEqual(request, requestCopy, 'Same internal data');
  ok(request !== requestCopy, 'Different references to request objects');

  requestCopy.body = 'm=audio 37606 RTP/AVP 0 8 97';
  requestCopy.headers.from = 'bob@u1.example.org';

  equal(request.body, 'm=audio 49170 RTP/AVP 0 8 97', 'Request body not changed');
  equal(request.headers.from, 'bob@example.org', 'Request header not changed');
});


test('Message.toResponse - check arguments', 2, function () {

  var message = SIP.createMessage(100, 'Trying');

  throws(function () {
    message.toResponse(200);
  }, 'Invalid message type passed to function.');

  throws(function () {
    message.toResponse(699);
  }, 'Invalid status code passed to function.');
});


test('Message.toRequest - check arguments', 2, function () {

  var message = SIP.createMessage('INVITE', 'sip:alice@example.org');

  throws(function () {
    message.toRequest('BYE', 'sip:bob@example.org');
  }, 'Invalid message type passed to function.');

  message = SIP.createMessage(200, 'OK');

  throws(function () {
    message.toRequest('ACK', 'alice@example.org');
  }, 'Invalid URI passed to function.');
});


test('Message.toResponse - check new message', 5, function () {

  var message = SIP.createMessage('INVITE', 'sip:alice@example.org', {
    'contact': '<sip:alice@example.org>'
  });

  var response = message.toResponse('200');

  ok(!response.method, 'Method not set in response message.');
  ok(!response.uri, 'URI not set in response message.');
  ok(response.status, 'Status code set in response message.');
  ok(response.reason, 'Reason set in response message.');
  ok(response.getHeader('contact', true, 0), 'Contact header set in response message.');
});


test('Message.toRequest - check new message', 5, function () {

  var message = SIP.createMessage(200, 'OK', {
    'contact': '<sip:bob@example.org>'
  });

  var request = message.toRequest('ACK', 'sip:alice@example.org');

  ok(request.method, 'Method set in request message.');
  ok(request.uri, 'URI set in request message.');
  ok(!request.status, 'Status code not set in request message.');
  ok(!request.reason, 'Reason not set in request message.');
  ok(request.getHeader('contact', true, 0), 'Contact header set in request message.');
});


test('Message.copy - check deep copy', 3, function () {

  var message = SIP.createMessage('BYE', 'sip:bob@example.org');
  var message1 = SIP.createMessage(message);
  var message2 = message.copy();

  ok(message !== message1, 'Copy message is not same object as original.');
  ok(message !== message2, 'Copy message #2 is not same object as original.');
  ok(message1 !== message2, 'Copy message #1 and #2 are not the same object.');
});


test('Message.format - check result of SIP.format', 1, function () {

  var message = SIP.createMessage('BYE', 'sip:bob@example.org');
  var data1 = SIP.format(message);
  var data2 = message.format();

  equal(data1, data2 , 'SIP.format and Message.format functions return equal result.');
});


test('Message.get/setHeader - set/get header', 2, function() {

  var request = SIP.createMessage('INVITE', 'alice@example.org');

  request.setHeader('from', 'bob@example.org');

  equal(request.getHeader('from'), 'bob@example.org', 'Set header value');

  request.setHeader('from', null, 0);

  strictEqual(request.getHeader('from'), null, 'Deleted header value');
});


test('Message.setHeader - set/get header with multiple values', 8, function() {

  var request = SIP.createMessage('INVITE', 'alice@example.org');

  request.setHeader('contact', '<sip:bob@example.org>');
  request.setHeader('contact', ['<sip:bob@u1.example.org>', '<sip:bob@bob.example.org>'], true);

  equal(request.getHeader('contact').length, 3, 'Get all values.');

  equal(request.getHeader('contact', false, 0), '<sip:bob@example.org>', 'First header value');
  equal(request.getHeader('contact', false, 1), '<sip:bob@u1.example.org>', 'Second header value');
  equal(request.getHeader('contact', false, 2), '<sip:bob@bob.example.org>', 'Last header value');

  equal(request.getHeader('contact', false, -3), '<sip:bob@example.org>', 'First header value from reverse order');
  equal(request.getHeader('contact', false, -2), '<sip:bob@u1.example.org>', 'Second header value from reverse order');
  equal(request.getHeader('contact', false, -1), '<sip:bob@bob.example.org>', 'Last header value from reverse order');

  strictEqual(request.getHeader('contact', false, -4), null, 'Undefined position is null');
});


test('Message.setHeader - replace values', 3, function() {

  var request = SIP.createMessage('INVITE', 'alice@example.org');

  request.setHeader('contact', '<sip:bob@example.org>');
  request.setHeader('contact', ['<sip:bob@u1.example.org>', '<sip:bob@bob.example.org>']);

  equal(request.getHeader('contact').length, 2, 'First value replaced with new ones.');

  equal(request.getHeader('contact', false, 0), '<sip:bob@u1.example.org>', 'First value is valid.');
  equal(request.getHeader('contact', false, 1), '<sip:bob@bob.example.org>', 'Second value is valid.');
});


test('Message.setHeader - replace first value', 1, function () {

  var message = SIP.createMessage('INVITE', 'sip:alice@example.com');

  message.setHeader('via', 'SIP/2.0/TCP alice.example.com:5060;branch=b64v5terct');
  message.setHeader('via', 'SIP/2.0/TCP alice.example.com:5060;branch=b64v5terct;received=192.168.1.102', 0);

  equal(message.getHeader('via', false, 0), 'SIP/2.0/TCP alice.example.com:5060;branch=b64v5terct;received=192.168.1.102',
    'New Via header value set.');
});


test('Message.setHeader - replace last value', 2, function () {

  var message = SIP.createMessage('INVITE', 'sip:alice@example.com');

  message.setHeader('via', 'SIP/2.0/TCP alice.example.com:5060;branch=b64v5terct');
  message.setHeader('via', 'SIP/2.0/TCP alice.example.com:5060;branch=b64v5terct;received=192.168.1.102', -1);

  equal(message.headers.via.length, 1, 'Only 1 Via header value set.');
  equal(message.getHeader('via', false, -1), 'SIP/2.0/TCP alice.example.com:5060;branch=b64v5terct;received=192.168.1.102',
    'Last Via header value replaced.');
});


test('Message.setHeader - replace value', 2, function () {

  var message = SIP.createMessage('INVITE', 'sip:alice@example.com');

  message.setHeader('via', 'SIP/2.0/TCP alice.example.com:5060;branch=b64v5terct');
  message.setHeader('via', 'SIP/2.0/TCP alice.example.com:5060;branch=b64v5terct;received=192.168.1.102', true);
  message.setHeader('via', 'SIP/2.0/TCP alice.example.com:5060;branch=b64v5terct;received=192.168.1.108', -5);

  equal(message.headers.via.length, 2, 'Two Via header values set.');
  equal(message.getHeader('via', false, 0), 'SIP/2.0/TCP alice.example.com:5060;branch=b64v5terct;received=192.168.1.108',
    'Forst Via header value replaced.');
});


test('Message.setHeader - prepend value', 2, function () {

  var message = SIP.createMessage('INVITE', 'sip:alice@example.com');

  message.setHeader('via', 'SIP/2.0/TCP alice.example.com:5060;branch=b64v5terct');
  message.setHeader('via', 'SIP/2.0/TCP p1.example.com:5060;branch=h5hb45ytr', false);

  equal(message.headers.via.length, 2, 'Two Via header values set.');
  equal(message.getHeader('via', false, 0), 'SIP/2.0/TCP p1.example.com:5060;branch=h5hb45ytr',
    'Via header value prepended.');
});


test('Message.setHeader - delete header', 2, function () {

  var request = SIP.createMessage('INVITE', 'alice@example.org');

  request.setHeader('max-forwards', 70);

  equal(request.getHeader('max-forwards'), 70, 'Max-Forwards header set.');

  request.setHeader('max-forwards', null);

  equal(request.getHeader('max-forwards'), null, 'Max-Forwards header value deleted.');
});


test('Message.setHeader - delete header with multiple value', 6, function() {

  var request = SIP.createMessage('INVITE', 'alice@example.org');

  request.setHeader('via', 'SIP/2.0/TCP sip.example.org:5060;branch=b546v4tcwrw');
  request.setHeader('via', 'SIP/2.0/TCP 192.168.1.102:5060;branch=n7bv34c5r', true);
  request.setHeader('via', 'SIP/2.0/TCP 192.168.1.108:5060;branch=7b6v45345c', true);
  request.setHeader('via', 'SIP/2.0/TCP 192.168.1.104:5060;branch=nbv45b766v', true);

  equal(request.headers.via.length, 4, 'Via header has 4 values.');

  // delete first value
  request.setHeader('via', null, 0);

  equal(request.headers.via.length, 3, 'Via header has 3 values.');
  equal(request.getHeader('via', false, 0), 'SIP/2.0/TCP 192.168.1.102:5060;branch=n7bv34c5r', 'Second value move to first position.');

  // delete last value
  request.setHeader('via', null, -1);

  equal(request.headers.via.length, 2, 'Via header has 2 values.');
  equal(request.getHeader('via', false, 0), 'SIP/2.0/TCP 192.168.1.102:5060;branch=n7bv34c5r', 'Second value move to first position.');

  // delete all values
  request.setHeader('via', null);

  equal(request.getHeader('via'), null, 'Via header has no values.');
});


test('Message.getHeader - get compact header names', 10, function () {

  var request = SIP.parse(messageData.raw09);
  var message = SIP.createMessage(request);

  equal(message.getHeader('via'), messageData.object09.headers.via, 'Compact header Via found.');
  equal(message.getHeader('from'), messageData.object09.headers.from, 'Compact header From found.');
  equal(message.getHeader('to'), messageData.object09.headers.to, 'Compact header To found.');
  equal(message.getHeader('call-id'), messageData.object09.headers['call-id'], 'Compact header Call-ID found.');
  equal(message.getHeader('contact'), messageData.object09.headers.contact, 'Compact header Contact found.');
  equal(message.getHeader('content-type'), messageData.object09.headers['content-type'], 'Compact header Content-Type found.');
  equal(message.getHeader('content-encoding'), messageData.object09.headers['content-encoding'], 'Compact header Content-Encoding found.');
  equal(message.getHeader('content-length'), messageData.object09.headers['content-length'], 'Compact header Content-Length found.');
  equal(message.getHeader('subject'), messageData.object09.headers.subject, 'Compact header Subject found.');
  equal(message.getHeader('supported'), messageData.object09.headers.supported, 'Compact header Supported found.');
});


test('Message.setHeader - set compact header names', 4, function () {

  var request = SIP.parse(messageData.raw09);
  var message = SIP.createMessage(request);

  message.setHeader('f', 'Bob <sip:bob@biloxi.example.com>;tag=bg6454gb4');
  message.setHeader('t', 'Alice <sip:alice@atlanta.example.com>');
  message.setHeader('i', '12345678');
  message.setHeader('m', 'Bob <sip:bob@u1.biloxi.example.com>');

  equal(message.getHeader('from'), 'Bob <sip:bob@biloxi.example.com>;tag=bg6454gb4', 'Compact header From set.');
  equal(message.getHeader('to'), 'Alice <sip:alice@atlanta.example.com>', 'Compact header To set.');
  equal(message.getHeader('call-id'), '12345678', 'Compact header Call-ID set.');
  equal(message.getHeader('contact', false, 0), 'Bob <sip:bob@u1.biloxi.example.com>', 'Compact header Contact set.');
});


test('Message.getHeader - get header value using compact name', 4, function () {

  var request = SIP.parse(messageData.raw01_1);
  var message = SIP.createMessage(request);

  equal(message.getHeader('f'), messageData.object01_1.headers.from, 'Valid From header value.');
  equal(message.getHeader('t'), messageData.object01_1.headers.to, 'Valid To header value.');
  equal(message.getHeader('m', false , 0), messageData.object01_1.headers.contact, 'Valid Contact header value.');
  equal(message.getHeader('i'), messageData.object01_1.headers['call-id'], 'Valid Call-ID header value.');
});


test('Message.get/setHeader - get changed multi value header', 1, function () {

  var request = SIP.parse(messageData.raw01_1);
  var message = SIP.createMessage(request);

  var via = message.getHeader('via', true, 0);
  var viaRaw = message.getHeader('via', false, 0);
  
  viaRaw += ';ttl=10';
  message.setHeader('via', viaRaw, 0);

  var viaChanged = message.getHeader('via', true, 0);

  equal(via.params.branch, viaChanged.params.branch, 'Via header changed without errors.');
});


test('Message.get/setHeader - case insensitivity of header names', 4, function () {

  var message = SIP.createMessage('INVITE', 'sip:alice@atlanta.example.com');

  message.setHeader('FROM', 'Bob <sip:bob@biloxi.example.com>;tag=bg6454gb4');
  message.setHeader('To', 'Alice <sip:alice@atlanta.example.com>');
  message.setHeader('Call-id', '12345678');
  message.setHeader('ConTact', 'Bob <sip:bob@u1.biloxi.example.com>');

  equal(message.getHeader('from'), 'Bob <sip:bob@biloxi.example.com>;tag=bg6454gb4', 'Compact header From set.');
  equal(message.getHeader('to'), 'Alice <sip:alice@atlanta.example.com>', 'Compact header To set.');
  equal(message.getHeader('call-id'), '12345678', 'Compact header Call-ID set.');
  equal(message.getHeader('contact', false, 0), 'Bob <sip:bob@u1.biloxi.example.com>', 'Compact header Contact set.');
});


test('Message.getHeader - parsing header values', 5, function () {

  var request = SIP.parse(messageData.raw01_1);
  var message = SIP.createMessage(request);

  deepEqual(message.getHeader('via', true, 0), messageData.header01_1_via, 'Via header value parsed.');
  deepEqual(message.getHeader('to', true), messageData.header01_1_to, 'To header value parsed.');
  deepEqual(message.getHeader('from', true), messageData.header01_1_from, 'From header value parsed.');
  deepEqual(message.getHeader('contact', true, 0), messageData.header01_1_contact, 'Contact header value parsed.');
  deepEqual(message.getHeader('cseq', true), messageData.header01_1_cseq, 'CSeq header value parsed.');
});


test('Message.getHeader - parsing multiple header values', 1, function () {

  var request = SIP.parse(messageData.raw03);
  var message = SIP.createMessage(request);

  deepEqual(message.getHeader('via', true), messageData.header03_via, 'Via header values parsed.');
});


test('Message.setHeader - set with object values', 3, function () {

  var contactString = 'Alice <sip:alice@pc33.example.org:5066>;transport=udp';
  var cseqString = '3632 INVITE';
  var viaString = 'SIP/2.0/UDP pc33.example.org:5060;branch=85h46g5463;received=192.168.1.84;rport';

  var msg = SIP.createMessage('INVITE', 'sip:alice@example.org', {
    'contact': contactString,
    'cseq': cseqString,
    'via': viaString
  });

  var contact = msg.getHeader('contact', true, 0);
  var cseq = msg.getHeader('cseq', true);
  var via = msg.getHeader('via', true, 0);

  msg.setHeader('contact', contact, 0);
  msg.setHeader('cseq', cseq);
  msg.setHeader('via', via, 0);

  equal(msg.getHeader('contact', false, 0), contactString, 'Contact header value converted to string.');
  equal(msg.getHeader('cseq', false), cseqString, 'CSeq header value converted to string.');
  equal(msg.getHeader('via', false, 0), viaString, 'Via header value converted to string.');

});


test('Message.setHeader - set with array of object values', 2, function () {

  var viaString1 = 'SIP/2.0/UDP pc33.example.org:5060;branch=85h46g5463';
  var viaString2 = 'SIP/2.0/UDP sip.example.org:5060;branch=6g45v646vx3;received=192.168.1.84';

  var msg = SIP.createMessage('INVITE', 'sip:alice@example.org', {
    'via': [ viaString1, viaString2 ]
  });

  var via1 = msg.getHeader('via', true, 0);
  var via2 = msg.getHeader('via', true, 1);

  msg.setHeader('via', via1, 0);
  msg.setHeader('via', via2, 1);

  equal(msg.getHeader('via', false, 0), viaString1, 'Via header value converted to string.');
  equal(msg.getHeader('via', false, 1), viaString2, 'Via header value converted to string.');

});


// Message module
QUnit.module('Message Parser');


test('SIP.parse - parsing messages with strict syntax', 12, function () {

  deepEqual(SIP.parse(messageData.raw01_1), messageData.object01_1, 'INVITE message is valid object.');
  deepEqual(SIP.parse(messageData.raw01_2), messageData.object01_2, 'ACK message is valid object.');
  deepEqual(SIP.parse(messageData.raw01_3), messageData.object01_3, 'BYE message is valid object.');
  deepEqual(SIP.parse(messageData.raw01_4), messageData.object01_4, 'CANCEL message is valid object.');
  deepEqual(SIP.parse(messageData.raw01_5), messageData.object01_5, 'REGISTER message is valid object.');
  deepEqual(SIP.parse(messageData.raw01_6), messageData.object01_6, 'OPTIONS message is valid object.');
  deepEqual(SIP.parse(messageData.raw01_7), messageData.object01_7, 'MESSAGE message is valid object.');
  deepEqual(SIP.parse(messageData.raw01_8), messageData.object01_8, 'REFER message is valid object.');
  deepEqual(SIP.parse(messageData.raw01_9), messageData.object01_9, 'NOTIFY message is valid object.');
  deepEqual(SIP.parse(messageData.raw01_10), messageData.object01_10, 'SUBSCRIBE message is valid object.');
  deepEqual(SIP.parse(messageData.raw01_11), messageData.object01_11, 'PRACK message is valid object.');
  deepEqual(SIP.parse(messageData.raw01_12), messageData.object01_12, 'PUBLISH message is valid object.');
});


test('SIP.parse - parsing headers', 5, function () {

  deepEqual(SIP.parse(messageData.raw02), messageData.object02, 'parse 200 OK message with multiline header value.');
  deepEqual(SIP.parse(messageData.raw03), messageData.object03, 'parse request message with multiple header values.');
  deepEqual(SIP.parse(messageData.raw04), messageData.object04, 'parse request message with multiple header values in oneline.');
  deepEqual(SIP.parse(messageData.raw05), messageData.object05, 'parse request message with quoted string in Contact header.');
  deepEqual(SIP.parse(messageData.raw06), messageData.object06, 'parse response message with tab separator in Via header.');
});


test('SIP.parse - parse empty header', 1, function () {

  var message = SIP.parse('INVITE sip:bob.biloxi.com SIP/2.0\r\nCSeq: \r\nMax-Forward: 70\r\n\r\n');

  strictEqual(message.headers.cseq, undefined, 'CSeq header not defined');
});


test('SIP.parse - parsign empty parameter', 3, function () {

  var message = SIP.parse('REGISTER sip:192.168.1.102 SIP/2.0\r\n' +
    'Via: SIP/2.0/UDP 192.168.1.102:5060;branch=z9hG4bK3403a0c0-8495-e211;rport;ttl=10\r\n' +
    '\r\n');

  var msg = SIP.createMessage(message);
  var via = msg.getHeader('via', true, 0);

  equal(via.params.branch, 'z9hG4bK3403a0c0-8495-e211', 'Valid branch parameter in Via header.');
  equal(via.params.rport, '', 'Valid empty rport parameter in Via header.');
  equal(via.params.ttl, '10', 'Valid ttl parameter in Via header.');

});


test('SIP.parse - parsign empty parameter at the end of header', 3, function () {

  var message = SIP.parse('REGISTER sip:192.168.1.102 SIP/2.0\r\n' +
    'Via: SIP/2.0/UDP 192.168.1.102:5060;branch=z9hG4bK3403a0c0-8495-e211;ttl=10;rport\r\n' +
    '\r\n');

  var msg = SIP.createMessage(message);
  var via = msg.getHeader('via', true, 0);

  equal(via.params.branch, 'z9hG4bK3403a0c0-8495-e211', 'Valid branch parameter in Via header.');
  equal(via.params.rport, '', 'Valid empty rport parameter in Via header.');
  equal(via.params.ttl, '10', 'Valid ttl parameter in Via header.');

});


test('Message.getHeader - missing protocol value in Via header', 1, function () {

  var msg = SIP.createMessage('INVITE', 'sip:alice@example.org', {
    via: 'SIP/2.0 alice.example.org:5060;received=192.168.1.2'
  });

  var via = msg.getHeader('via', true, 0);

  equal(via, null, 'Invalid Via header.');
});


test('SIP.parse - invalid values', 13, function () {

  throws(function() {
    SIP.parse('CALL', 'sip:alice@example.org');
  }, 'Invalid method name');

  throws(function() {
    SIP.parse('TRIGGER', 'sip:alice@example.org');
  }, 'Invalid method name');

  throws(function() {
    SIP.parse('SIP/2.0 678 Something happened');
  }, 'Invalid status code');

  throws(function() {
    SIP.parse('INVITE bob.biloxi.com SIP/2.0');
  }, 'Invalid SIP uri');

  throws(function() {
    SIP.parse('INVITE sip:bob.biloxi.com SIP/2.0\nCSeq: 1 INVITE\n\n');
  }, 'Invalid new line character');

  throws(function() {
    SIP.parse('INVITE sip:bob.biloxi.com SIP/2.0\r\nCSeq 1 INVITE\r\nMax-Forward 70\r\n\r\n');
  }, 'Missing header separator');

  throws(function() {
    SIP.parse('INVITE sip:bob.biloxi.com');
  }, 'Missing SIP version in request message');

  throws(function() {
    SIP.parse('INVITE sip:bob.biloxi.com SIP');
  }, 'Missing SIP version in request message');

  throws(function() {
    SIP.parse('INVITE sip:bob.biloxi.com SIP/');
  }, 'Missing SIP version in request message');

  throws(function() {
    SIP.parse('SIP 200 OK');
  }, 'Missing SIP version in response message');

  throws(function() {
    SIP.parse('Sip/2.0 200 OK');
  }, 'Invalid SIP value in response message');

  throws(function() {
    SIP.parse('2.0 200 OK');
  }, 'Invalid SIP value in response message');

  throws(function() {
    SIP.parse('SI/2.0 200 OK');
  }, 'Invalid SIP value in response message');
});


test('SIP.format - transform message object to text', 12, function () {

  var message1 = SIP.parse(messageData.raw01_1);
  var message2 = SIP.parse(messageData.raw01_2);
  var message3 = SIP.parse(messageData.raw01_3);
  var message4 = SIP.parse(messageData.raw01_4);
  var message5 = SIP.parse(messageData.raw01_5);
  var message6 = SIP.parse(messageData.raw01_6);
  var message7 = SIP.parse(messageData.raw01_7);
  var message8 = SIP.parse(messageData.raw01_8);
  var message9 = SIP.parse(messageData.raw01_9);
  var message10 = SIP.parse(messageData.raw01_10);
  var message11 = SIP.parse(messageData.raw01_11);
  var message12 = SIP.parse(messageData.raw01_12);

  deepEqual(SIP.format(message1), messageData.raw01_1, 'INVITE message converted to text.');
  deepEqual(SIP.format(message2), messageData.raw01_2, 'ACK message converted to text.');
  deepEqual(SIP.format(message3), messageData.raw01_3, 'BYE message converted to text.');
  deepEqual(SIP.format(message4), messageData.raw01_4, 'CANCEL message converted to text.');
  deepEqual(SIP.format(message5), messageData.raw01_5, 'REGISTER message converted to text.');
  deepEqual(SIP.format(message6), messageData.raw01_6, 'OPTIONS message converted to text.');
  deepEqual(SIP.format(message7), messageData.raw01_7, 'MESSAGE message converted to text.');
  deepEqual(SIP.format(message8), messageData.raw01_8, 'REFER message converted to text.');
  deepEqual(SIP.format(message9), messageData.raw01_9, 'NOTIFY message converted to text.');
  deepEqual(SIP.format(message10), messageData.raw01_10, 'SUBSCRIBE message converted to text.');
  deepEqual(SIP.format(message11), messageData.raw01_11, 'PRACK message converted to text.');
  deepEqual(SIP.format(message12), messageData.raw01_12, 'PUBLISH message converted to text.');
});


test('SIP.format - transform message object with multiple header values to text', 1, function () {

  var message = SIP.parse(messageData.raw07);

  deepEqual(SIP.format(message), messageData.raw07, 'Message converted to text.');
});


test('SIP.format - transform response message to text', 1, function () {

  var message = SIP.parse(messageData.raw08);

  deepEqual(SIP.format(message), messageData.raw08, 'Response message converted to text.');
});


test('SIP.format - compact header names', 1, function () {

  var message = SIP.parse(messageData.raw09);
  
  deepEqual(SIP.format(message, true), messageData.raw09, 'Message converted to text with compact header names.');
});


test('SIP.parseUri - parse basic URI address', 2, function () {

  var object = SIP.parse(messageData.raw01_1);
  var message = SIP.createMessage(object);
  var fromHeader = message.getHeader('from', true);
  var ContactHeader = message.getHeader('contact', true, 0);

  deepEqual(SIP.parseUri(fromHeader.uri), messageData.uri01_1_from, 'SIP URI parsed.');
  deepEqual(SIP.parseUri(ContactHeader.uri, true), messageData.uri01_1_contact, 'SIP URI with parameters parsed.');
});


test('SIP.parseUri - parse full URI address', 1, function () {

  deepEqual(SIP.parseUri(messageData.uri_1, true), messageData.uriObject_1, 'Full SIP URI parsed.');
});


test('SIP.parseUri - parse telphone URI address', 1, function () {

  deepEqual(SIP.parseUri(messageData.uri_2, true), messageData.uriObject_2, 'Telephone SIP URI parsed.');
});


test('SIP.parseUri - empty uri', 1, function () {

  var uriObject = SIP.parseUri('');

  deepEqual(uriObject, {}, 'Empty URI parsed to empty object.');
});


test('SIP.parseUri - case sensitivity and encoding', 1, function () {

  deepEqual(SIP.parseUri(messageData.uri_3, true), messageData.uriObject_3, 'URL encoded SIP URI parsed.');
});


test('SIP.parseUri - uri without user', 1, function () {

  deepEqual(SIP.parseUri(messageData.uri_4, true), messageData.uriObject_4, 'SIP URI without user parsed.');
});


test('SIP.formatUri - format full URI address', 1, function () {

  deepEqual(SIP.formatUri(messageData.uriObject_1).toLowerCase(), messageData.uri_1.toLowerCase(), 'Full SIP URI formatted.');
});


test('SIP.formatUri - format telphone URI address', 1, function () {

  deepEqual(SIP.formatUri(messageData.uriObject_2).toLowerCase(), messageData.uri_2.toLowerCase(), 'Telephone SIP URI formatted.');
});


test('SIP.formatUri - empty uri object', 1, function () {

  var uri = SIP.formatUri({});

  deepEqual(uri, '', 'Empty URI object formated to empty string.');
});

});
