
/*
Example that can recieve V1 HEP packets from a capture source such as Kamailio and Freeswitch.
https://code.google.com/p/homer/wiki/HEP


*/

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
