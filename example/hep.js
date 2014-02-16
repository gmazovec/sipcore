
/*
Example that can recieve V1 HEP packets from a capture source such as Kamailio and Freeswitch.
https://code.google.com/p/homer/wiki/HEP


*/

<<<<<<< HEAD
var sip = require('sipcore');
var transport = sip.createTransport();

process.env.JS_ENV = 'node';

transport.register('udpHEP1', 9060, "0.0.0.0");
transport.listen(function (listenState) {
  console.log('* UDP listening...', listenState.udpHEP1 ? 'ok' : 'failed');
});


transport.on('message', function (msg) {
  console.log('-- new SIP message');
  console.log(msg);
});
=======
var sip = require('..');
var udp = require('../lib/protocol/node/udp');

var transport = sip.createTransport();
var protocol = sip.createProtocol(udp.Protocol);

protocol.format = 'hep1';
transport.register(protocol, 9060, '0.0.0.0');

transport.listen(function (listenState) {
  console.log('* UDP listening...', listenState.udp ? 'ok' : 'failed');
});

transport.on('message', function (msg) {
  console.log('-- new SIP message');
  console.log(msg);
});
>>>>>>> f4c0b4b2580a5d7a588a5e1dca0ed45805c10658
