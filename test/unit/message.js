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


// load library in non-browser environments
if (typeof window === 'undefined') {
  var SIP = require('../..');
}


// Message module
QUnit.module('Message');


test('API functions', 2, function () {

  ok(SIP.isMessage, 'Function isMessage is defined');
  ok(SIP.createMessage, 'Function createMessage is defined');
});


test('SIP.isMessage - success calls', 3, function () {

  var request = SIP.createMessage('INVITE', 'alice@example.org');
  var requestCopy = SIP.createMessage(request);
  var response = request.toResponse(200);

  ok(SIP.isMessage(request), 'Request is instance of Message');
  ok(SIP.isMessage(requestCopy), 'Copy of request is instance of Message');
  ok(SIP.isMessage(response), 'Response is instance of Message');
});


test('SIP.isMessage - false calls', 2, function () {

  ok(!SIP.isMessage({}), 'Object is not instance of Message');
  ok(!SIP.isMessage('INVITE alice@example.org'), 'String is not instance of Message');
});


test('SIP.createMessage - success calls', 3, function () {
  
  throws(!function() {
    SIP.createMessage('BYE', 'alice@example.org');
  }, 'Calling with 2 arguments');

  throws(!function() {
    SIP.createMessage('CANCEL', 'alice@example.org', {from: 'bob@example.org'});
  }, 'Calling with 3 arguments');

  throws(!function() {
    SIP.createMessage('INVITE', 'alice@example.org', {from: 'bob@example.org'},
      'm=audio 49170 RTP/AVP 0 8 97');
  }, 'Calling with 4 arguments');
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


test('Message.toResponse - checking object attributes', 5, function () {

  var request = SIP.createMessage('INVITE', 'alice@example.org',
                                  {from: 'bob@example.org'},
                                  'm=audio 49170 RTP/AVP 0 8 97');
  var response = request.toResponse(200);

  equal(response.status, 200, 'Status code attribute');
  equal(response.reason, 'OK', 'Status reason attribute');
  equal(response.version, '2.0', 'Version attribute');
  equal(request.headers.from, 'bob@example.org', 'From header attribute');
  equal(request.body, 'm=audio 49170 RTP/AVP 0 8 97', 'Body attribute');
});


test('Message cloning', 2, function () {

  var request = SIP.createMessage('INVITE', 'alice@example.org',
                                  {from: 'bob@example.org'},
                                  'm=audio 49170 RTP/AVP 0 8 97');
  var requestCopy = SIP.createMessage(request);
  var response = request.toResponse(200);

  requestCopy.body = 'm=audio 37606 RTP/AVP 0 8 97';
  requestCopy.headers.from = 'bob@u1.example.org';

  response.body = 'm=audio 52801 RTP/AVP 0 8 97';
  response.headers.from = 'bob@bob.example.org';

  equal(request.body, 'm=audio 49170 RTP/AVP 0 8 97', 'Request body not changed');
  equal(request.headers.from, 'bob@example.org', 'Request header not changed');
});


test('Message.get/setHeader - set/get header', 1, function() {

  var request = SIP.createMessage('INVITE', 'alice@example.org');

  request.setHeader('from', 'bob@example.org');

  equal(request.getHeader('from'), 'bob@example.org', 'Set header value');
});


test('Message.header - set/get header with multiple values', 3, function() {

  var request = SIP.createMessage('INVITE', 'alice@example.org');

  request.setHeader('contact', 'bob@example.org');
  request.setHeader('contact', ['bob@u1.example.org', 'bob@bob.example.org'], true);

  equal(request.getHeader('contact'), 'bob@example.org', 'First header value');
  equal(request.getHeader('contact', 1), 'bob@u1.example.org', 'Second header value');
  equal(request.getHeader('contact', 2), 'bob@bob.example.org', 'Last header value');
});
