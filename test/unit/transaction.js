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


var SIP = require('../../lib/sip');

var protocolName = 'heap';
var host = '127.0.0.1';
var portNumber = 5160;


// patch SIP.Transport
(function () {

  var transport = SIP.createTransport();

  transport.register(protocolName, portNumber);

  transport.__proto__.pushHeapMessage = function (msg) {
  
    var heap = this._protocols.heap[0];

    if (heap) {
      heap.__push(msg.format());
    }
  };

})();


// Message module
QUnit.module('Transaction');


test('API functions', 2, function () {

  var transport = SIP.createTransport();
  var transaction = SIP.createTransaction(transport);

  ok(SIP.createTransaction, 'Function createTransaction is defined');
  ok(transaction.send, 'Function Transaction.send is defined');
});


asyncTest('Client transaction - non-invite', 3, function () {

  var port = portNumber++;
  var transport = SIP.createTransport();

  transport.register(protocolName, port);

  transport.listen(function (listenState) {

    var msg = SIP.createMessage('REGISTER', 'sip:'+ host, {
      'max-forwards': '70',
      'from': '<sip:bob@example.org>;tag=654b7-'+ new Date().getTime(),
      'to': '<sip:bob@example.org>',
      'call-id': new Date().getTime() + '',
      'contact': '<sip:bob@'+ host + ':' + port + '>;transport=udp',
      'cseq': '1 REGISTER'
    });

    var trC = SIP.createTransaction(transport);

    trC.send(msg, host, 5060, 'heap', function (err) {

      ok(!err, 'Message sent.')
      transport.pushHeapMessage(msg.toResponse(200));
    });

    trC.once('message', function (msg) {

      ok(msg, 'Response received.');
      equal(msg.status, 200, '200/REGISTER response received.');
      start();
    });

  });

  transport.on('message', function (msg) {
    ok(false, 'Message caught by transport layer.');
    start();
  });

});


asyncTest('Server transaction - non-invite', 1, function () {

  var port = portNumber++;
  var transport = SIP.createTransport();

  transport.register(protocolName, port);

  transport.listen(function (listenState) {

    var msg = SIP.createMessage('REGISTER', 'sip:'+ host, {
      'via': 'SIP/2.0/UDP 0.0.0.0:'+ port +';branch=8nb56v44rtb54tg',
      'max-forwards': '70',
      'from': '<sip:bob@example.org>;tag=654b7-'+ new Date().getTime(),
      'to': '<sip:bob@example.org>',
      'call-id': new Date().getTime() + '',
      'contact': '<sip:bob@'+ host + ':' + port + '>;transport=udp',
      'cseq': '1 REGISTER'
    });

    transport.once('message', function (msg) {

      var trS = SIP.createTransaction(transport, msg);

      trS.on('message', function (msg) {
        ok(msg, 'Request retransmission received.');
        start();
      });
      
      transport.on('message', function (msg) {
        ok(false, 'Message caught by transport layer.');
        start();
      });

      transport.pushHeapMessage(msg);

    });

    transport.pushHeapMessage(msg);

  });

});
