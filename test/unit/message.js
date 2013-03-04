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
  var messageData = require('../data/message');
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


test('Message.toResponse - checking object attributes', 6, function () {

  var request = SIP.createMessage('INVITE', 'alice@example.org',
                                  {from: 'bob@example.org'},
                                  'm=audio 49170 RTP/AVP 0 8 97');
  var response = request.toResponse(200, 'OK', { subject: 'Urgent call' });

  equal(response.status, 200, 'Status code attribute');
  equal(response.reason, 'OK', 'Status reason attribute');
  equal(response.version, '2.0', 'Version attribute');
  equal(request.headers.from, 'bob@example.org', 'From header attribute');
  equal(request.headers.subject, 'Urgent call', 'Subject header appended to message');
  equal(request.body, 'm=audio 49170 RTP/AVP 0 8 97', 'Body attribute');
});


test('Message cloning', 4, function () {

  var request = SIP.createMessage('INVITE', 'alice@example.org',
                                  {from: 'bob@example.org'},
                                  'm=audio 49170 RTP/AVP 0 8 97');
  var requestCopy = SIP.createMessage(request);
  var response = request.toResponse(200);
  
  deepEqual(request, requestCopy, 'Same internal data');
  ok(request !== requestCopy, 'Different references to request objects');

  requestCopy.body = 'm=audio 37606 RTP/AVP 0 8 97';
  requestCopy.headers.from = 'bob@u1.example.org';

  response.body = 'm=audio 52801 RTP/AVP 0 8 97';
  response.headers.from = 'bob@bob.example.org';

  equal(request.body, 'm=audio 49170 RTP/AVP 0 8 97', 'Request body not changed');
  equal(request.headers.from, 'bob@example.org', 'Request header not changed');
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


test('Message.setHeader - delete header value', 6, function() {

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


test('SIP.parse - invalid values', 14, function () {

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
    SIP.parse('INVITE sip:bob.biloxi.com SIP/2.0\r\nCSeq:   \r\nMax-Forward: 70\r\n\r\n');
  }, 'Missing header value');

  throws(function() {
    SIP.parse('INVITE sip:bob.biloxi.com SIP/2.0\r\nCSeq 1 INVITE\r\nMax-Forward 70\r\n\r\n');
  }, 'Missing header separator');

  throws(function() {
    SIP.parse('INVITE sip:bob.biloxi.com');
  }, 'Missing version value');

  throws(function() {
    SIP.parse('INVITE sip:bob.biloxi.com SIP');
  }, 'Missing SIP value');

  throws(function() {
    SIP.parse('SIP 200 OK');
  }, 'Missing version value');

  throws(function() {
    SIP.parse('2.0 200 OK');
  }, 'Missing SIP value');

  throws(function() {
    SIP.parse('SI/2.0 200 OK');
  }, 'Invalid SIP value');

  throws(function() {
    SIP.parse('S/2.0 200 OK');
  }, 'Invalid SIP value');

  throws(function() {
    SIP.parse('S/2.0 200 OK');
  }, 'Invalid SIP message');
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


test('SIP.parseUri - emptry uri', 1, function () {

  var uriObject = SIP.parseUri('');

  deepEqual(uriObject, {}, 'Empty URI parsed to empty object.');
});


test('SIP.parseUri - case sensitivity and encoding', 1, function () {

  deepEqual(SIP.parseUri(messageData.uri_3, true), messageData.uriObject_3, 'URL encoded SIP URI parsed.');
});
