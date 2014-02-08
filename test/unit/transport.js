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

define(['require', 'exports', 'process'],
    function (require, exports, process) {

var SIP = require('sip');
var heapProtocol = require('protocol/heap');
var protocolName = process.env.SIP_PROTOCOL || 'heap';
var portNumber = 5060;


// Message module
QUnit.module('Transport');


test('API functions', 6, function () {

  ok(SIP.createTransport, 'Function createTransport is defined.');

  var transport = SIP.createTransport();

  ok(transport.register, 'Function Transport.register is defined.');
  ok(transport.listen, 'Function Transport.listen is defined.');
  ok(transport.send, 'Function Transport.send is defined.');
  ok(transport.isListening, 'Function Transport.isListening is defined.');
  ok(transport.close, 'Function Transport.close is defined.');
});


asyncTest('Register custom protocol', 1, function () {

  var port = portNumber++;
  var protocol = heapProtocol.createProtocol();
  var transport = SIP.createTransport();

  transport.register(protocol, port);

  transport.listen(function (listenState) {

    ok(listenState[protocol.name], 'Custom protocol registered.');
    start();
  });
});


asyncTest('Transport.listen/close - call multiple times', 4, function () {

  var port = portNumber++;
  var transport = SIP.createTransport();

  transport.register(protocolName, port);

  transport.listen(function () {

    ok(true, 'No error on calling listen 1st time.');

    transport.listen(function () {

      ok(true, 'No error on calling listen 2nd time.');

      transport.close(function () {

        ok(true, 'No error on calling close 1st time.');

        transport.close(function () {

          ok(true, 'No error on calling close 2nd time.');

          start();
        });
      });

    });

  });

});


asyncTest('Transport.listen - check listening flags', 4, function () {

  var port = portNumber++;
  var transport = SIP.createTransport();

  transport.register(protocolName, port);

  transport.listen(function (listening) {

    ok(listening[protocolName], 'Listening flag set.');
    equal(listening[protocolName], 1, 'Protocol is listening.');

    transport.close(function (listening) {

      equal(listening[protocolName], 0, 'Protocol is closed.');
      start();
    });

    // accessing internal structures
    equal(transport.isListening(protocolName), -1, 'Protocol is closing.');
  });

});


asyncTest('Transport.isListening - calling with argument', 4, function () {

  var port = portNumber++;
  var transport = SIP.createTransport();

  transport.register(protocolName, port);

  equal(transport.isListening(protocolName), 0, 'Protocol is not listening.');

  transport.listen(function (listening) {

    equal(transport.isListening(protocolName), 1, 'Protocol is listening.');

    transport.close(function (listening) {

      equal(transport.isListening(protocolName), 0, 'Protocol is closed.');

      start();
    });

    equal(transport.isListening(protocolName), -1, 'Protocol is closing.');

  });

});


asyncTest('Transport.isListening - calling without argument', 4, function () {

  var port = portNumber++;
  var transport = SIP.createTransport();

  transport.register(protocolName, port);

  equal(transport.isListening()[protocolName], 0, 'Protocol is not listening.');

  transport.listen(function (listening) {

    equal(transport.isListening()[protocolName], 1, 'Protocol is listening.');

    transport.close(function (listening) {

      equal(transport.isListening()[protocolName], 0, 'Protocol is closed.');

      start();
    });

    equal(transport.isListening()[protocolName], -1, 'Protocol is closing.');

  });

});


test('Transport.register - bind address in use', 1, function () {

  var port = portNumber++;
  var transport = SIP.createTransport();

  transport.register(protocolName, port);

  throws(function () {
    transport.register(protocolName, port);
  }, 'Re-registering protocol.');
});


asyncTest('Transport.onclose - closing protocol', 1, function () {

  var port = portNumber++;
  var transport = SIP.createTransport();

  transport.register(protocolName, port);

  transport.listen(function () {

    transport.once('close', function (protocol) {

      equal(protocol, protocolName, 'Procotol name is valid.');
      start();
    });

    transport.close();
  });

});


asyncTest('Transport.send - invalid message', 1, function () {

  var port = portNumber++;
  var transport = SIP.createTransport();
  var message = {};


  transport.register(protocolName, port);

  transport.listen(function () {

    transport.send(message, '0.0.0.0', port, protocolName, function (err) {

      ok(err, 'Error sending message.');

      transport.close(function () {
        start();
      });
    });

  });

});


asyncTest('Transport.send - missing via header', 1, function () {

  var port = portNumber++;
  var transport = SIP.createTransport();
  var message = SIP.createMessage('200', 'OK');


  transport.register(protocolName, port);

  transport.listen(function () {

    transport.send(message, function (err) {

      ok(err, 'Error sending message.');

      transport.close(function () {
        start();
      });
    });

  });

});


asyncTest('Transport.send - unknown protocol', 1, function () {

  var port = portNumber++;
  var transport = SIP.createTransport();
  var message = SIP.createMessage('200', 'OK');


  transport.listen(function () {

    transport.send(message, '0.0.0.0', port, protocolName, function (err) {

      ok(err, 'Error sending message.');

      transport.close(function () {
        start();
      });
    });

  });

});


asyncTest('Transport.send - send/receive request', 4, function () {

  var port = portNumber++;
  var transport = SIP.createTransport();
  var message = SIP.createMessage('INVITE', 'sip:alice@example.org', {
    'via': 'SIP/2.0/'+ protocolName.toUpperCase() +' 0.0.0.0:'+ port +';branch=zg46ytg5y3'
  });


  transport.once('message', function (msg) {

    var via = msg.getHeader('via', true, 0);

    equal(msg.uri, message.uri, 'Message received.');
    ok(via.params.branch, 'Branch parameter inserted by transport.');
    equal(via.params.rport, '', 'RPort parameter inserted by transport.');

    transport.close(function () {
      start();
    });
  });

  transport.once('listening', function () {

    transport.send(message, '0.0.0.0', port, protocolName, function () {
      ok(true, 'Message sent.');
    });
  });

  transport.register(protocolName, port);
  transport.listen();

});


asyncTest('Transport.send - send/receive response', 2, function () {

  var port = portNumber++;
  var transport = SIP.createTransport();
  var message = SIP.createMessage('200', 'OK');

  message.setHeader('via', 'SIP/2.0/'+ protocolName.toUpperCase() +' 0.0.0.0:'+ port +';branch=zg46ytg5y3');

  transport.once('message', function (msg) {

    equal(SIP.format(msg), SIP.format(message), 'Received message is valid.');

    transport.close(function () {
      start();
    });
  });

  transport.once('listening', function () {

    transport.send(message, function (err) {
      ok(true, 'Message sent.');
    });
  });

  transport.register(protocolName, port);
  transport.listen();

});


asyncTest('Transport.send - client socket timeout', 2, function () {

  var port = portNumber++;
  var transport = SIP.createTransport();
  var message = SIP.createMessage('INVITE', 'sip:alice@example.org');


  transport.once('listening', function () {

    transport.send(message, '0.0.0.0', port, protocolName, function (sock) {
      ok(true, 'Socket created.');
    });

    var sock = transport._sockets['0.0.0.0:' + port + ':' + protocolName];

    if (!sock) {
      ok(true, 'Skipping test');
      start();
      return;
    }

    sock.once('close', function () {

      ok(true, 'Socket closed.');

      transport.close(function () {
        start();
      });
    });

  });

  transport.register(protocolName, port);
  transport.listen();

});


asyncTest('Transport.send - re-initialize socket', 1, function () {

  var port = portNumber++;
  var transport = SIP.createTransport();
  var message = SIP.createMessage('INVITE', 'sip:alice@example.org');


  transport.once('listening', function () {

    transport.send(message, '0.0.0.0', port, protocolName);

    var sock = transport._sockets['0.0.0.0:' + port + ':' + protocolName];

    if (!sock) {
      ok(true, 'Skipping test');
      start();
      return;
    }

    // imitate error
    sock._closed = true;

    transport.send(message, '0.0.0.0', port, protocolName, function (err) {

      ok(err !== null, 'Send error occured.');

      transport.close(function () {
        start();
      });
    });

  });

  transport.register(protocolName, port);
  transport.listen();

});

});
