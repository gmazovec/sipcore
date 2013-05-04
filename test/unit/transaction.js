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


// helpers
function createClientInviteMessage (port) {

  var msg = SIP.createMessage('INVITE', 'sip:alice@'+ host, {
    'max-forwards': '70',
    'from': '<sip:bob@example.org>;tag=654b7-'+ new Date().getTime(),
    'to': '<sip:alice@example.org>',
    'call-id': new Date().getTime() + '',
    'contact': '<sip:bob@'+ host + ':' + port + '>;transport=udp',
    'cseq': '1 INVITE'
  });

  return msg;
}


function createServerInviteMessage (port) {

  var msg = SIP.createMessage('INVITE', 'sip:alice@'+ host, {
    'via': 'SIP/2.0/UDP 0.0.0.0:'+ port +';branch=8nb56v44rtb54tg',
    'max-forwards': '70',
    'from': '<sip:bob@example.org>;tag=654b7-'+ new Date().getTime(),
    'to': '<sip:alice@example.org>',
    'call-id': new Date().getTime() + '',
    'contact': '<sip:bob@'+ host + ':' + port + '>;transport=udp',
    'cseq': '1 INVITE'
  });

  return msg;
}


function createClientRegisterMessage (port) {

  var msg = SIP.createMessage('REGISTER', 'sip:'+ host, {
    'max-forwards': '70',
    'from': '<sip:bob@example.org>;tag=654b7-'+ new Date().getTime(),
    'to': '<sip:bob@example.org>',
    'call-id': new Date().getTime() + '',
    'contact': '<sip:bob@'+ host + ':' + port + '>;transport=udp',
    'cseq': '1 REGISTER'
  });

  return msg;
}


function createServerRegisterMessage (port) {

  var msg = SIP.createMessage('REGISTER', 'sip:'+ host, {
    'via': 'SIP/2.0/UDP 0.0.0.0:'+ port +';branch=8nb56v44rtb54tg',
    'max-forwards': '70',
    'from': '<sip:bob@example.org>;tag=654b7-'+ new Date().getTime(),
    'to': '<sip:bob@example.org>',
    'call-id': new Date().getTime() + '',
    'contact': '<sip:bob@'+ host + ':' + port + '>;transport=udp',
    'cseq': '1 REGISTER'
  });

  return msg;
}


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


asyncTest('Client transaction - non-invite state machine, REGISTER/200', 3, function () {

  var port = portNumber++;
  var transport = SIP.createTransport();

  transport.register(protocolName, port);

  transport.listen(function (listenState) {

    var msg = createClientRegisterMessage();
    var trC = SIP.createTransaction(transport);

    trC.send(msg, host, 5060, 'heap', function (err) {

      equal(trC.state, 2, 'Transaction state set to trying.');

      transport.pushHeapMessage(msg.toResponse(200));
    });

    trC.once('message', function (msg) {

      equal(trC.state, 4, 'Transaction state set to completed.');

      trC.once('state', function (state) {
        
        equal(trC.state, 6, 'Transaction state set to terminated.');
        start();
      });
    });

  });

});


asyncTest('Client transaction - non-invite state machine, REGISTER/100/403', 4, function () {

  var port = portNumber++;
  var transport = SIP.createTransport();

  transport.register(protocolName, port);

  transport.listen(function (listenState) {

    var msg = createClientRegisterMessage();
    var trC = SIP.createTransaction(transport);

    trC.send(msg, host, 5060, 'heap', function (err) {

      equal(trC.state, 2, 'Transaction state set to trying.');

      transport.pushHeapMessage(msg.toResponse(100));
    });

    trC.once('message', function (msgR) {

      equal(trC.state, 3, 'Transaction state set to proceeding.');

      transport.pushHeapMessage(msg.toResponse(404));

      trC.once('message', function (msgR) {

        equal(trC.state, 4, 'Transaction state set to completed.');

        trC.once('state', function (state) {
          
          equal(trC.state, 6, 'Transaction state set to terminated.');
          start();
        });
      });

    });

  });

});


asyncTest('Server transaction - non-invite state machine, REGISTER/200', 3, function () {

  var port = portNumber++;
  var transport = SIP.createTransport();

  transport.register(protocolName, port);

  transport.listen(function (listenState) {

    var msg = createServerRegisterMessage(port);

    transport.once('message', function (msg) {

      var trS = SIP.createTransaction(transport, msg);

      equal(trS.state, 2, 'Transaction state set to trying.');

      trS.once('state', function (state) {

        equal(trS.state, 4, 'Transaction state set to completed.');

        trS.once('state', function (state) {

          equal(trS.state, 6, 'Transaction state set to terminated.');
          start();
        });
      });
      
      trS.send(msg.toResponse(200), '0.0.0.0', 5060, protocolName);

    });

    transport.pushHeapMessage(msg);

  });

});


asyncTest('Server transaction - non-invite state machine, REGISTER/100/403', 4, function () {

  var port = portNumber++;
  var transport = SIP.createTransport();

  transport.register(protocolName, port);

  transport.listen(function (listenState) {

    var msg = createServerRegisterMessage(port);

    transport.once('message', function (msg) {

      var trS = SIP.createTransaction(transport, msg);

      equal(trS.state, 2, 'Transaction state set to trying.');

      trS.once('state', function (state) {

        equal(trS.state, 3, 'Transaction state set to completed.');

        trS.once('state', function (state) {

          equal(trS.state, 4, 'Transaction state set to completed.');

          trS.once('state', function (state) {

            equal(trS.state, 6, 'Transaction state set to terminated.');
            start();
          });
        });

        trS.send(msg.toResponse(403), '0.0.0.0', 5060, protocolName);
      });
      
      trS.send(msg.toResponse(100), '0.0.0.0', 5060, protocolName);

    });

    transport.pushHeapMessage(msg);

  });

});


asyncTest('Client transaction - invite state machine, INVITE/200', 2, function () {

  var port = portNumber++;
  var transport = SIP.createTransport();

  transport.register(protocolName, port);

  transport.listen(function (listenState) {

    var msg = createClientInviteMessage(port);
    var trC = SIP.createTransaction(transport);

    trC.send(msg, host, 5060, 'heap', function (err) {

      equal(trC.state, 1, 'Transaction state set to calling.');

      transport.pushHeapMessage(msg.toResponse(200));
    });

    trC.once('message', function (msgR) {

      equal(trC.state, 6, 'Transaction state set to terminated.');
      start();
    });

  });

});


asyncTest('Client transaction - invite state machine, INVITE/404', 3, function () {

  var port = portNumber++;
  var transport = SIP.createTransport();

  transport.register(protocolName, port);

  transport.listen(function (listenState) {

    var msg = createClientInviteMessage(port);
    var trC = SIP.createTransaction(transport);

    trC.send(msg, host, 5060, 'heap', function (err) {

      equal(trC.state, 1, 'Transaction state set to calling.');

      transport.pushHeapMessage(msg.toResponse(404));
    });

    trC.once('message', function (msgR) {

      equal(trC.state, 4, 'Transaction state set to completed.');

      trC.once('state', function (state) {

        equal(trC.state, 6, 'Transaction state set to terminated.');
        start();
      });
    });

  });

});


asyncTest('Client transaction - invite state machine, INVITE/100/404', 4, function () {

  var port = portNumber++;
  var transport = SIP.createTransport();

  transport.register(protocolName, port);

  transport.listen(function (listenState) {

    var msg = createClientInviteMessage(port);
    var trC = SIP.createTransaction(transport);

    trC.send(msg, host, 5060, 'heap', function (err) {

      equal(trC.state, 1, 'Transaction state set to calling.');

      transport.pushHeapMessage(msg.toResponse(100));
    });

    trC.once('message', function (msgR) {

      equal(trC.state, 3, 'Transaction state set to proceeding.');

      trC.once('message', function (msgR) {

        equal(trC.state, 4, 'Transaction state set to completed.');

        trC.once('state', function (state) {

          equal(trC.state, 6, 'Transaction state set to terminated.');
          start();
        });
      });

      transport.pushHeapMessage(msg.toResponse(404));
    });

  });

});


asyncTest('Client transaction - invite state machine, INVITE/100/180/200', 4, function () {

  var port = portNumber++;
  var transport = SIP.createTransport();

  transport.register(protocolName, port);

  transport.listen(function (listenState) {

    var msg = createClientInviteMessage(port);
    var trC = SIP.createTransaction(transport);

    trC.send(msg, host, 5060, 'heap', function (err) {

      equal(trC.state, 1, 'Transaction state set to calling.');

      transport.pushHeapMessage(msg.toResponse(100));
    });

    trC.once('message', function (msgR) {

      equal(trC.state, 3, 'Transaction state set to proceeding.');

      trC.once('message', function (msgR) {

        equal(trC.state, 3, 'Transaction state set to proceeding.');
      });

      trC.once('state', function (state) {

        equal(trC.state, 6, 'Transaction state set to terminated.');
        start();
      });

      transport.pushHeapMessage(msg.toResponse(180));

      setTimeout(function () {
        transport.pushHeapMessage(msg.toResponse(200));
      }, 0);
    });

  });

});


asyncTest('Server transaction - invite state machine, INVITE/200', 2, function () {

  var port = portNumber++;
  var transport = SIP.createTransport();

  transport.register(protocolName, port);

  transport.listen(function (listenState) {

    var msg = createServerInviteMessage(port);

    transport.once('message', function (msg) {

      var trS = SIP.createTransaction(transport, msg);

      equal(trS.state, 3, 'Transaction state set to proceeding.');

      trS.once('state', function (state) {

        equal(trS.state, 6, 'Transaction state set to terminated.');
        start();
      });
      
      trS.send(msg.toResponse(200), '0.0.0.0', 5060, protocolName);

    });

    transport.pushHeapMessage(msg);

  });

});


asyncTest('Server transaction - invite state machine, INVITE/100/404', 4, function () {

  var port = portNumber++;
  var transport = SIP.createTransport();

  transport.register(protocolName, port);

  transport.listen(function (listenState) {

    var msg = createServerInviteMessage(port);

    transport.once('message', function (msg) {

      var trS = SIP.createTransaction(transport, msg);

      equal(trS.state, 3, 'Transaction state set to proceeding.');

      trS.once('state', function (state) {

        equal(trS.state, 4, 'Transaction state set to completed.');

        trS.once('state', function (state) {
          equal(trS.state, 5, 'Transaction state set to confirmed.');

          trS.once('state', function (state) {
            equal(trS.state, 6, 'Transaction state set to terminated.');
            start();
          });
        });

        transport.pushHeapMessage(msg.toResponse(404).toRequest('ACK', msg.uri));
      });

      
      trS.send(msg.toResponse(100), '0.0.0.0', 5060, protocolName);

      setTimeout(function () {
        trS.send(msg.toResponse(404), '0.0.0.0', 5060, protocolName);
      });

    });

    transport.pushHeapMessage(msg);

  });

});


asyncTest('Server transaction - invite state machine, INVITE/100/180/200', 2, function () {

  var port = portNumber++;
  var transport = SIP.createTransport();

  transport.register(protocolName, port);

  transport.listen(function (listenState) {

    var msg = createServerInviteMessage(port);

    transport.once('message', function (msg) {

      var trS = SIP.createTransaction(transport, msg);

      equal(trS.state, 3, 'Transaction state set to proceeding.');

      trS.once('state', function (state) {

        equal(trS.state, 6, 'Transaction state set to terminated.');
        start();
      });

      
      trS.send(msg.toResponse(100), '0.0.0.0', 5060, protocolName);

      setTimeout(function () {

        trS.send(msg.toResponse(180), '0.0.0.0', 5060, protocolName);

        setTimeout(function () {
          trS.send(msg.toResponse(200), '0.0.0.0', 5060, protocolName);
        });
      });

    });

    transport.pushHeapMessage(msg);

  });

});
