
/*
Example that can recieve V1 HEP packets from a capture source such as Kamailio and Freeswitch.
https://code.google.com/p/homer/wiki/HEP


*/

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