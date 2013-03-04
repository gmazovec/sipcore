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


// INVITE message - strict syntax
exports.raw01_1 = 'INVITE sip:bob@biloxi.example.com SIP/2.0\r\n' +
  'Via: SIP/2.0/TCP client.atlanta.example.com:5060;branch=z9hG4bK74bf9\r\n' +
  'Max-Forwards: 70\r\n' +
  'From: Alice <sip:alice@atlanta.example.com>;tag=9fxced76sl\r\n' +
  'To: Bob <sip:bob@biloxi.example.com>\r\n' +
  'Call-ID: 3848276298220188511@atlanta.example.com\r\n' +
  'CSeq: 1 INVITE\r\n' +
  'Contact: <sip:alice@client.atlanta.example.com;transport=tcp>\r\n' +
  'Content-Type: application/sdp\r\n' +
  'Content-Length: 151\r\n' +
  '\r\n' +
  'v=0\r\n' +
  'o=alice 2890844526 2890844526 IN IP4 client.atlanta.example.com\r\n' +
  's=-\r\n' +
  'c=IN IP4 192.0.2.101\r\n' +
  't=0 0\r\n' +
  'm=audio 49172 RTP/AVP 0\r\n' +
  'a=rtpmap:0 PCMU/8000';

exports.object01_1 = {
  'method': 'INVITE',
  'uri': 'sip:bob@biloxi.example.com',
  'version': '2.0',
  'headers': {
    'via': 'SIP/2.0/TCP client.atlanta.example.com:5060;branch=z9hG4bK74bf9',
    'max-forwards': '70',
    'from': 'Alice <sip:alice@atlanta.example.com>;tag=9fxced76sl',
    'to': 'Bob <sip:bob@biloxi.example.com>',
    'call-id': '3848276298220188511@atlanta.example.com',
    'cseq': '1 INVITE',
    'contact': '<sip:alice@client.atlanta.example.com;transport=tcp>',
    'content-type': 'application/sdp',
    'content-length': '151'
  },
  body: 'v=0\r\n' +
    'o=alice 2890844526 2890844526 IN IP4 client.atlanta.example.com\r\n' +
    's=-\r\n' +
    'c=IN IP4 192.0.2.101\r\n' +
    't=0 0\r\n' +
    'm=audio 49172 RTP/AVP 0\r\n' +
    'a=rtpmap:0 PCMU/8000'
};

exports.header01_1_via = {
  'version': '2.0',
  'protocol': 'TCP',
  'host': 'client.atlanta.example.com',
  'port': '5060',
  'params': {
    'branch': 'z9hG4bK74bf9'
  }
};

exports.header01_1_contact = {
  'name': '',
  'uri': 'sip:alice@client.atlanta.example.com;transport=tcp',
  'params': {}
};

exports.header01_1_from = {
  'name': 'Alice',
  'uri': 'sip:alice@atlanta.example.com',
  'params': {
    'tag': '9fxced76sl'
  }
};

exports.header01_1_to = {
  'name': 'Bob',
  'uri': 'sip:bob@biloxi.example.com',
  'params': {}
};


// ACK message - strict syntax
exports.raw01_2 = 'ACK sip:bob@client.biloxi.example.com SIP/2.0\r\n' +
  'Via: SIP/2.0/TCP client.atlanta.example.com:5060;branch=z9hG4bK74b76\r\n' +
  'Max-Forwards: 70\r\n' +
  'Route: <sip:ss1.atlanta.example.com;lr>\r\n' +
  'From: Alice <sip:alice@atlanta.example.com>;tag=9fxced76sl\r\n' +
  'To: Bob <sip:bob@biloxi.example.com>;tag=314159\r\n' +
  'Call-ID: 3848276298220188511@atlanta.example.com\r\n' +
  'CSeq: 2 ACK\r\n' +
  'Content-Length: 0';

exports.object01_2 = {
  'method': 'ACK',
  'uri': 'sip:bob@client.biloxi.example.com',
  'version': '2.0',
  'headers': {
    'via': 'SIP/2.0/TCP client.atlanta.example.com:5060;branch=z9hG4bK74b76',
    'max-forwards': '70',
    'route': '<sip:ss1.atlanta.example.com;lr>',
    'from': 'Alice <sip:alice@atlanta.example.com>;tag=9fxced76sl',
    'to': 'Bob <sip:bob@biloxi.example.com>;tag=314159',
    'call-id': '3848276298220188511@atlanta.example.com',
    'cseq': '2 ACK',
    'content-length': '0'
  },
  'body': ''
};


// BYE message - strict syntax
exports.raw01_3 = 'BYE sip:alice@client.atlanta.example.com SIP/2.0\r\n' +
  'Via: SIP/2.0/TCP client.biloxi.example.com:5060;branch=z9hG4bKnashds7\r\n' +
  'Max-Forwards: 70\r\n' +
  'Route: <sip:ss2.biloxi.example.com;lr>\r\n' +
  'From: Bob <sip:bob@biloxi.example.com>;tag=314159\r\n' +
  'To: Alice <sip:alice@atlanta.example.com>;tag=9fxced76sl\r\n' +
  'Call-ID: 3848276298220188511@atlanta.example.com\r\n' +
  'CSeq: 1 BYE\r\n' +
  'Content-Length: 0';

exports.object01_3 = {
  'method': 'BYE',
  'uri': 'sip:alice@client.atlanta.example.com',
  'version': '2.0',
  'headers': {
    'via': 'SIP/2.0/TCP client.biloxi.example.com:5060;branch=z9hG4bKnashds7',
    'max-forwards': '70',
    'route': '<sip:ss2.biloxi.example.com;lr>',
    'from': 'Bob <sip:bob@biloxi.example.com>;tag=314159',
    'to': 'Alice <sip:alice@atlanta.example.com>;tag=9fxced76sl',
    'call-id': '3848276298220188511@atlanta.example.com',
    'cseq': '1 BYE',
    'content-length': '0'
  },
  'body': ''
};


// CANCEL message - strict syntax
exports.raw01_4 = 'CANCEL sip:bob@biloxi.example.com SIP/2.0\r\n' +
'Via: SIP/2.0/UDP client.atlanta.example.com:5060;branch=z9hG4bK74bf9\r\n' +
'Max-Forwards: 70\r\n' +
'From: Alice <sip:alice@atlanta.example.com>;tag=9fxced76sl\r\n' +
'To: Bob <sip:bob@biloxi.example.com>\r\n' +
'Route: <sip:ss1.atlanta.example.com;lr>\r\n' +
'Call-ID: 2xTb9vxSit55XU7p8@atlanta.example.com\r\n' +
'CSeq: 1 CANCEL\r\n' +
'Content-Length: 0';

exports.object01_4 = {
  'method': 'CANCEL',
  'uri': 'sip:bob@biloxi.example.com',
  'version': '2.0',
  'headers': {
    'via': 'SIP/2.0/UDP client.atlanta.example.com:5060;branch=z9hG4bK74bf9',
    'max-forwards': '70',
    'from': 'Alice <sip:alice@atlanta.example.com>;tag=9fxced76sl',
    'to': 'Bob <sip:bob@biloxi.example.com>',
    'route': '<sip:ss1.atlanta.example.com;lr>',
    'call-id': '2xTb9vxSit55XU7p8@atlanta.example.com',
    'cseq': '1 CANCEL',
    'content-length': '0'
  },
  'body': ''
};


// REGISTER message - strict syntax
exports.raw01_5 = 'REGISTER sips:ss2.biloxi.example.com SIP/2.0\r\n' +
'Via: SIP/2.0/TLS client.biloxi.example.com:5061;branch=z9hG4bKnashds7\r\n' +
'Max-Forwards: 70\r\n' +
'From: Bob <sips:bob@biloxi.example.com>;tag=a73kszlfl\r\n' +
'To: Bob <sips:bob@biloxi.example.com>\r\n' +
'Call-ID: 1j9FpLxk3uxtm8tn@biloxi.example.com\r\n' +
'CSeq: 1 REGISTER\r\n' +
'Contact: <sips:bob@client.biloxi.example.com>\r\n' +
'Content-Length: 0';

exports.object01_5 = {
  'method': 'REGISTER',
  'uri': 'sips:ss2.biloxi.example.com',
  'version': '2.0',
  'headers': {
    'via': 'SIP/2.0/TLS client.biloxi.example.com:5061;branch=z9hG4bKnashds7',
    'max-forwards': '70',
    'from': 'Bob <sips:bob@biloxi.example.com>;tag=a73kszlfl',
    'to': 'Bob <sips:bob@biloxi.example.com>',
    'call-id': '1j9FpLxk3uxtm8tn@biloxi.example.com',
    'cseq': '1 REGISTER',
    'contact': '<sips:bob@client.biloxi.example.com>',
    'content-length': '0'
  },
  'body': ''
};


// OPTIONS message - strict syntax
exports.raw01_6 = 'OPTIONS sip:carol@chicago.com SIP/2.0\r\n' +
'Via: SIP/2.0/UDP pc33.atlanta.com;branch=z9hG4bKhjhs8ass877\r\n' +
'Max-Forwards: 70\r\n' +
'To: <sip:carol@chicago.com>\r\n' +
'From: Alice <sip:alice@atlanta.com>;tag=1928301774\r\n' +
'Call-ID: a84b4c76e66710\r\n' +
'CSeq: 63104 OPTIONS\r\n' +
'Contact: <sip:alice@pc33.atlanta.com>\r\n' +
'Accept: application/sdp\r\n' +
'Content-Length: 0';

exports.object01_6 = {
  'method': 'OPTIONS',
  'uri': 'sip:carol@chicago.com',
  'version': '2.0',
  'headers': {
    'via': 'SIP/2.0/UDP pc33.atlanta.com;branch=z9hG4bKhjhs8ass877',
    'max-forwards': '70',
    'to': '<sip:carol@chicago.com>',
    'from': 'Alice <sip:alice@atlanta.com>;tag=1928301774',
    'call-id': 'a84b4c76e66710',
    'cseq': '63104 OPTIONS',
    'contact': '<sip:alice@pc33.atlanta.com>',
    'accept': 'application/sdp',
    'content-length': '0'
  },
  'body': ''
};


// MESSAGE message - strict syntax
exports.raw01_7 = 'MESSAGE sip:romeo@example.com SIP/2.0\r\n' +
  'Via: SIP/2.0/TCP notifier.example.com;branch=z9hG4bK776sgdkse\r\n' +
  'Max-Forwards: 70\r\n' +
  'From: sip:notifier@example.com;tag=32328\r\n' +
  'To: sip:romeo@example.com\r\n' +
  'Subject: SIEVE\r\n' +
  'Priority: urgent\r\n' +
  'Call-ID: asd88asd77a@1.2.3.4\r\n' +
  'CSeq: 1 MESSAGE\r\n' +
  'Date: Fri, 08 Apr 2011 06:54:00 GMT\r\n' +
  'Content-Type: text/plain\r\n' +
  'Content-Length: 19';

exports.object01_7 = {
  'method': 'MESSAGE',
  'uri': 'sip:romeo@example.com',
  'version': '2.0',
  'headers': {
    'via': 'SIP/2.0/TCP notifier.example.com;branch=z9hG4bK776sgdkse',
    'max-forwards': '70',
    'from': 'sip:notifier@example.com;tag=32328',
    'to': 'sip:romeo@example.com',
    'subject': 'SIEVE',
    'priority': 'urgent',
    'call-id': 'asd88asd77a@1.2.3.4',
    'cseq': '1 MESSAGE',
    'date': 'Fri, 08 Apr 2011 06:54:00 GMT',
    'content-type': 'text/plain',
    'content-length': '19'
  },
  'body': ''
};


// REFER message - strict syntax
exports.raw01_8 = 'REFER sip:b@atlanta.example.com SIP/2.0\r\n' +
  'Via: SIP/2.0/UDP agenta.atlanta.example.com;branch=z9hG4bK2293940223\r\n' +
  'To: <sip:b@atlanta.example.com>\r\n' +
  'From: <sip:a@atlanta.example.com>;tag=193402342\r\n' +
  'Call-ID: 898234234@agenta.atlanta.example.com\r\n' +
  'CSeq: 93809823 REFER\r\n' +
  'Max-Forwards: 70\r\n' +
  'Refer-To: sip b@example.org\r\n' +
  'Contact: sip:a@atlanta.example.com\r\n' +
  'Content-Length: 0';

exports.object01_8 = {
  'method': 'REFER',
  'uri': 'sip:b@atlanta.example.com',
  'version': '2.0',
  'headers': {
    'via': 'SIP/2.0/UDP agenta.atlanta.example.com;branch=z9hG4bK2293940223',
    'to': '<sip:b@atlanta.example.com>',
    'from': '<sip:a@atlanta.example.com>;tag=193402342',
    'call-id': '898234234@agenta.atlanta.example.com',
    'cseq': '93809823 REFER',
    'max-forwards': '70',
    'refer-to': 'sip b@example.org',
    'contact': 'sip:a@atlanta.example.com',
    'content-length': '0'
  },
  'body': ''
};

// NOTIFY message - strict syntax
exports.raw01_9 = 'NOTIFY sip:a@atlanta.example.com SIP/2.0\r\n' +
  'Via: SIP/2.0/UDP agentb.atlanta.example.com;branch=z9hG4bK9922ef992-25\r\n' +
  'To: <sip:a@atlanta.example.com>;tag=193402342\r\n' +
  'From: <sip:b@atlanta.example.com>;tag=4992881234\r\n' +
  'Call-ID: 898234234@agenta.atlanta.example.com\r\n' +
  'CSeq: 1993402 NOTIFY\r\n' +
  'Max-Forwards: 70\r\n' +
  'Event: refer\r\n' +
  'Subscription-State: active;expires=b@example.org\r\n' +
  'Contact: sip:b@atlanta.example.com\r\n' +
  'Content-Type: message/sipfrag;version=2.0\r\n' +
  'Content-Length: 20\r\n' +
  '\r\n' +
  'SIP/2.0 100 Trying';

exports.object01_9 = {
  'method': 'NOTIFY',
  'uri': 'sip:a@atlanta.example.com',
  'version': '2.0',
  'headers': {
    'via': 'SIP/2.0/UDP agentb.atlanta.example.com;branch=z9hG4bK9922ef992-25',
    'to': '<sip:a@atlanta.example.com>;tag=193402342',
    'from': '<sip:b@atlanta.example.com>;tag=4992881234',
    'call-id': '898234234@agenta.atlanta.example.com',
    'cseq': '1993402 NOTIFY',
    'max-forwards': '70',
    'event': 'refer',
    'subscription-state': 'active;expires=b@example.org',
    'contact': 'sip:b@atlanta.example.com',
    'content-type': 'message/sipfrag;version=2.0',
    'content-length': '20'
  },
  'body': 'SIP/2.0 100 Trying'
};


// SUBSCRIBE message - strict syntax
exports.raw01_10 = 'SUBSCRIBE sip:gw@subA.example.com SIP/2.0\r\n' +
  'Via: SIP/2.0/TCP client.subB.example.com;branch=q4i9ufr4ui3\r\n' +
  'From: <sip:ap@subB.example.com>;tag=567890\r\n' +
  'To: <sip:gw@subA.example.com>\r\n' +
  'Call-ID: 12345601@subA.example.com\r\n' +
  'CSeq: 1 SUBSCRIBE\r\n' +
  'Contact: <sip:ap@client.subB.example.com>\r\n' +
  'Max-Forwards: 70\r\n' +
  'Event: kpml ;remote-tag="sip:phn@example.com;tag=jfh21"' +
         ';local-tag="sip:gw@subA.example.com;tag=onjwe2"' +
         ';call-id="12345592@subA.example.com"\r\n' +
  'Expires: 7200\r\n' +
  'Accept: application/kpml-response+xml\r\n' +
  'Content-Type: application/kpml-request+xml\r\n' +
  'Content-Length: 292';

exports.object01_10 = {
  'method': 'SUBSCRIBE',
  'uri': 'sip:gw@subA.example.com',
  'version': '2.0',
  'headers': {
    'via': 'SIP/2.0/TCP client.subB.example.com;branch=q4i9ufr4ui3',
    'from': '<sip:ap@subB.example.com>;tag=567890',
    'to': '<sip:gw@subA.example.com>',
    'call-id': '12345601@subA.example.com',
    'cseq': '1 SUBSCRIBE',
    'contact': '<sip:ap@client.subB.example.com>',
    'max-forwards': '70',
    'event': 'kpml ;remote-tag="sip:phn@example.com;tag=jfh21"' +
      ';local-tag="sip:gw@subA.example.com;tag=onjwe2"' +
      ';call-id="12345592@subA.example.com"',
    'expires': '7200',
    'accept': 'application/kpml-response+xml',
    'content-type': 'application/kpml-request+xml',
    'content-length': '292'
  },
  'body': ''
};


// PRACK message - strict syntax
exports.raw01_11 = 'PRACK sip:222@10.129.45.104:5060 SIP/2.0\r\n' +
  'Via: SIP/2.0/UDP 10.129.47.146:8000;branch=z9hG4bK3b1bce0-22330\r\n' +
  'Max-Forwards: 70\r\n' +
  'From: sip:111@10.129.47.146:8000;tag=48346074\r\n' +
  'To: sip:222@10.129.45.104;tag=a94c095b773be1dd6e8d668a785a9c84904eaa2e\r\n' +
  'Call-ID: 11408@10.129.47.146\r\n' +
  'CSeq: 2 PRACK\r\n' +
  'RAck: 1 1 INVITE\r\n' +
  'Content-Type: application/sdp\r\n' +
  'Content-Length: 174\r\n' +
  '\r\n' +
  'v=0\r\n' +
  'o=_ 2890844527 2890844527 IN IP4 10.129.47.146\r\n' +
  's=-\r\n' +
  'c=IN IP4 10.129.47.146\r\n' +
  't=0 0\r\n' +
  'm=audio 9000 RTP/AVP 0 101\r\n' +
  'a=rtpmap:0 PCMU/8000\r\n' +
  'a=rtpmap:101 telephone-event/8000';

exports.object01_11 = {
  'method': 'PRACK',
  'uri': 'sip:222@10.129.45.104:5060',
  'version': '2.0',
  'headers': {
    'via': 'SIP/2.0/UDP 10.129.47.146:8000;branch=z9hG4bK3b1bce0-22330',
    'max-forwards': '70',
    'from': 'sip:111@10.129.47.146:8000;tag=48346074',
    'to': 'sip:222@10.129.45.104;tag=a94c095b773be1dd6e8d668a785a9c84904eaa2e',
    'call-id': '11408@10.129.47.146',
    'cseq': '2 PRACK',
    'rack': '1 1 INVITE',
    'content-type': 'application/sdp',
    'content-length': '174'
  },
  'body':
    'v=0\r\n' +
    'o=_ 2890844527 2890844527 IN IP4 10.129.47.146\r\n' +
    's=-\r\n' +
    'c=IN IP4 10.129.47.146\r\n' +
    't=0 0\r\n' +
    'm=audio 9000 RTP/AVP 0 101\r\n' +
    'a=rtpmap:0 PCMU/8000\r\n' +
    'a=rtpmap:101 telephone-event/8000'
};


// PUBLISH message - strict syntax
exports.raw01_12 = 'PUBLISH sip:presentity@example.com SIP/2.0\r\n' +
  'Via: SIP/2.0/UDP pua.example.com;branch=z9hG4bK652hsge\r\n' +
  'To: <sip:presentity@example.com>\r\n' +
  'From: <sip:presentity@example.com>;tag=1234wxyz\r\n' +
  'Call-ID: 81818181@pua.example.com\r\n' +
  'CSeq: 1 PUBLISH\r\n' +
  'Max-Forwards: 70\r\n' +
  'Expires: 3600\r\n' +
  'Event: presence\r\n' +
  'Content-Type: application/pidf+xml\r\n' +
  'Content-Length: 346';

exports.object01_12 = {
  'method': 'PUBLISH',
  'uri': 'sip:presentity@example.com',
  'version': '2.0',
  'headers': {
    'via': 'SIP/2.0/UDP pua.example.com;branch=z9hG4bK652hsge',
    'to': '<sip:presentity@example.com>',
    'from': '<sip:presentity@example.com>;tag=1234wxyz',
    'call-id': '81818181@pua.example.com',
    'cseq': '1 PUBLISH',
    'max-forwards': '70',
    'expires': '3600',
    'event': 'presence',
    'content-type': 'application/pidf+xml',
    'content-length': '346'
  },
  'body': ''
};


// Response message with multiline Via header value
exports.raw02 = 'SIP/2.0 180 Ringing\r\n' +
  'Via: SIP/2.0/TCP client.atlanta.example.com:5060;branch=z9hG4bK74bf9\r\n' +
  ' ;received=192.0.2.101\r\n' +
  'From: Alice <sip:alice@atlanta.example.com>;tag=9fxced76sl\r\n' +
  'To: Bob <sip:bob@biloxi.example.com>;tag=8321234356\r\n' +
  'Call-ID: 3848276298220188511@atlanta.example.com\r\n' +
  'CSeq: 1 INVITE\r\n' +
  'Contact: <sip:bob@client.biloxi.example.com;transport=tcp>\r\n' +
  'Content-Length: 0';

exports.object02 = {
  'status': '180',
  'reason': 'Ringing',
  'version': '2.0',
  'headers': {
    'via': 'SIP/2.0/TCP client.atlanta.example.com:5060;branch=z9hG4bK74bf9;received=192.0.2.101',
    'from': 'Alice <sip:alice@atlanta.example.com>;tag=9fxced76sl',
    'to': 'Bob <sip:bob@biloxi.example.com>;tag=8321234356',
    'call-id': '3848276298220188511@atlanta.example.com',
    'cseq': '1 INVITE',
    'contact': '<sip:bob@client.biloxi.example.com;transport=tcp>',
    'content-length': '0'
  },
  body: ''
};


// Request with multiple header values
exports.raw03 = 'INVITE sip:bob@client.biloxi.example.com SIP/2.0\r\n' +
  'Via: SIP/2.0/TCP ss2.biloxi.example.com:5060;branch=z9hG4bK721e4.1\r\n' +
  'Via: SIP/2.0/TCP ss1.atlanta.example.com:5060;branch=z9hG4bK2d4790.1\r\n' +
  ' ;received=192.0.2.111\r\n' +
  'Via: SIP/2.0/TCP client.atlanta.example.com:5060;branch=z9hG4bK74bf9\r\n' +
  ' ;received=192.0.2.101\r\n' +
  'Max-Forwards: 68\r\n' +
  'Record-Route: <sip:ss2.biloxi.example.com;lr>\r\n' +
  'Record-Route: <sip:ss1.atlanta.example.com;lr>\r\n' +
  'From: Alice <sip:alice@atlanta.example.com>;tag=9fxced76sl\r\n' +
  'To: Bob <sip:bob@biloxi.example.com>\r\n' +
  'Call-ID: 3848276298220188511@atlanta.example.com\r\n' +
  'CSeq: 2 INVITE\r\n' +
  'Contact: <sip:alice@client.atlanta.example.com;transport=tcp>\r\n' +
  'Content-Type: application/sdp\r\n' +
  'Content-Length: 151\r\n' +
  '\r\n' +
  'v=0\r\n' +
  'o=alice 2890844526 2890844526 IN IP4 client.atlanta.example.com\r\n' +
  's=-\r\n' +
  'c=IN IP4 192.0.2.101\r\n' +
  't=0 0\r\n' +
  'm=audio 49172 RTP/AVP 0\r\n' +
  'a=rtpmap:0 PCMU/8000';

exports.object03 = {
  'method': 'INVITE',
  'uri': 'sip:bob@client.biloxi.example.com',
  'version': '2.0',
  'headers': {
    'via': [
      'SIP/2.0/TCP ss2.biloxi.example.com:5060;branch=z9hG4bK721e4.1',
      'SIP/2.0/TCP ss1.atlanta.example.com:5060;branch=z9hG4bK2d4790.1;received=192.0.2.111',
      'SIP/2.0/TCP client.atlanta.example.com:5060;branch=z9hG4bK74bf9;received=192.0.2.101'
    ],
    'max-forwards': '68',
    'record-route': [
      '<sip:ss2.biloxi.example.com;lr>',
      '<sip:ss1.atlanta.example.com;lr>'
    ],
    'from': 'Alice <sip:alice@atlanta.example.com>;tag=9fxced76sl',
    'to': 'Bob <sip:bob@biloxi.example.com>',
    'call-id': '3848276298220188511@atlanta.example.com',
    'cseq': '2 INVITE',
    'contact': '<sip:alice@client.atlanta.example.com;transport=tcp>',
    'content-type': 'application/sdp',
    'content-length': '151'
  },
  'body': 'v=0\r\n' +
    'o=alice 2890844526 2890844526 IN IP4 client.atlanta.example.com\r\n' +
    's=-\r\n' +
    'c=IN IP4 192.0.2.101\r\n' +
    't=0 0\r\n' +
    'm=audio 49172 RTP/AVP 0\r\n' +
    'a=rtpmap:0 PCMU/8000'
};

exports.header03_via = [
  {
    'version': '2.0',
    'protocol': 'TCP',
    'host': 'ss2.biloxi.example.com',
    'port': '5060',
    'params': {
      'branch': 'z9hG4bK721e4.1'
    }
  },
  {
    'version': '2.0',
    'protocol': 'TCP',
    'host': 'ss1.atlanta.example.com',
    'port': '5060',
    'params': {
      'branch': 'z9hG4bK2d4790.1',
      'received': '192.0.2.111'
    }
  },
  {
    'version': '2.0',
    'protocol': 'TCP',
    'host': 'client.atlanta.example.com',
    'port': '5060',
    'params': {
      'branch': 'z9hG4bK74bf9',
      'received': '192.0.2.101'
    }
  }
];


// Request with multiple header values in one header entry
exports.raw04 = 'INVITE sip:bob@client.biloxi.example.com SIP/2.0\r\n' +
  'Via: SIP/2.0/TCP ss2.biloxi.example.com:5060;branch=z9hG4bK721e4.1\r\n' +
  ' , SIP/2.0/TCP ss1.atlanta.example.com:5060;branch=z9hG4bK2d4790.1\r\n' +
  ' ;received=192.0.2.111\r\n' +
  'Via: SIP/2.0/TCP client.atlanta.example.com:5060;branch=z9hG4bK74bf9\r\n' +
  ' ;received=192.0.2.101\r\n' +
  'Max-Forwards: 68\r\n' +
  'Record-Route: <sip:ss2.biloxi.example.com;lr>\r\n' +
  ' , <sip:ss1.atlanta.example.com;lr>\r\n' +
  'From: Alice <sip:alice@atlanta.example.com>;tag=9fxced76sl\r\n' +
  'To: Bob <sip:bob@biloxi.example.com>\r\n' +
  'Call-ID: 3848276298220188511@atlanta.example.com\r\n' +
  'CSeq: 2 INVITE\r\n' +
  'Contact: <sip:alice@client.atlanta.example.com;transport=tcp>\r\n' +
  'Content-Type: application/sdp\r\n' +
  'Content-Length: 151\r\n' +
  '\r\n' +
  'v=0\r\n' +
  'o=alice 2890844526 2890844526 IN IP4 client.atlanta.example.com\r\n' +
  's=-\r\n' +
  'c=IN IP4 192.0.2.101\r\n' +
  't=0 0\r\n' +
  'm=audio 49172 RTP/AVP 0\r\n' +
  'a=rtpmap:0 PCMU/8000';

exports.object04 = {
  'method': 'INVITE',
  'uri': 'sip:bob@client.biloxi.example.com',
  'version': '2.0',
  'headers': {
    'via': [
      'SIP/2.0/TCP ss2.biloxi.example.com:5060;branch=z9hG4bK721e4.1',
      'SIP/2.0/TCP ss1.atlanta.example.com:5060;branch=z9hG4bK2d4790.1;received=192.0.2.111',
      'SIP/2.0/TCP client.atlanta.example.com:5060;branch=z9hG4bK74bf9;received=192.0.2.101'
    ],
    'max-forwards': '68',
    'record-route': [
      '<sip:ss2.biloxi.example.com;lr>',
      '<sip:ss1.atlanta.example.com;lr>'
    ],
    'from': 'Alice <sip:alice@atlanta.example.com>;tag=9fxced76sl',
    'to': 'Bob <sip:bob@biloxi.example.com>',
    'call-id': '3848276298220188511@atlanta.example.com',
    'cseq': '2 INVITE',
    'contact': '<sip:alice@client.atlanta.example.com;transport=tcp>',
    'content-type': 'application/sdp',
    'content-length': '151'
  },
  'body': 'v=0\r\n' +
    'o=alice 2890844526 2890844526 IN IP4 client.atlanta.example.com\r\n' +
    's=-\r\n' +
    'c=IN IP4 192.0.2.101\r\n' +
    't=0 0\r\n' +
    'm=audio 49172 RTP/AVP 0\r\n' +
    'a=rtpmap:0 PCMU/8000'
};


// Request with Contact header value that includes comma character in name part
exports.raw05 = 'INVITE sip:bob@client.biloxi.example.com SIP/2.0\r\n' +
  'Via: SIP/2.0/TCP ss2.biloxi.example.com:5060;branch=z9hG4bK721e4.1\r\n' +
  'Max-Forwards: 70\r\n' +
  'From: Alice <sip:alice@atlanta.example.com>;tag=9fxced76sl\r\n' +
  'To: Bob <sip:bob@biloxi.example.com>\r\n' +
  'Call-ID: 3848276298220188511@atlanta.example.com\r\n' +
  'CSeq: 2 INVITE\r\n' +
  'Contact: "Jones, Bob" <sip:alice@client.atlanta.example.com;transport=tcp>\r\n' +
  'Content-Type: application/sdp\r\n' +
  'Content-Length: 151\r\n' +
  '\r\n' +
  'v=0\r\n' +
  'o=alice 2890844526 2890844526 IN IP4 client.atlanta.example.com\r\n' +
  's=-\r\n' +
  'c=IN IP4 192.0.2.101\r\n' +
  't=0 0\r\n' +
  'm=audio 49172 RTP/AVP 0\r\n' +
  'a=rtpmap:0 PCMU/8000';

exports.object05 = {
  'method': 'INVITE',
  'uri': 'sip:bob@client.biloxi.example.com',
  'version': '2.0',
  'headers': {
    'via': 'SIP/2.0/TCP ss2.biloxi.example.com:5060;branch=z9hG4bK721e4.1',
    'max-forwards': '70',
    'from': 'Alice <sip:alice@atlanta.example.com>;tag=9fxced76sl',
    'to': 'Bob <sip:bob@biloxi.example.com>',
    'call-id': '3848276298220188511@atlanta.example.com',
    'cseq': '2 INVITE',
    'contact': '"Jones, Bob" <sip:alice@client.atlanta.example.com;transport=tcp>',
    'content-type': 'application/sdp',
    'content-length': '151'
  },
  'body': 'v=0\r\n' +
    'o=alice 2890844526 2890844526 IN IP4 client.atlanta.example.com\r\n' +
    's=-\r\n' +
    'c=IN IP4 192.0.2.101\r\n' +
    't=0 0\r\n' +
    'm=audio 49172 RTP/AVP 0\r\n' +
    'a=rtpmap:0 PCMU/8000'
};


// Response message with multiline Via header value using horizontal tab
exports.raw06 = 'SIP/2.0 180 Ringing\r\n' +
  'Via: SIP/2.0/TCP client.atlanta.example.com:5060\r\n' +
  '\t\t\t;branch=z9hG4bK74bf9\r\n' +
  '\t;received=192.0.2.101\r\n' +
  'From: Alice <sip:alice@atlanta.example.com>;tag=9fxced76sl\r\n' +
  'To: Bob <sip:bob@biloxi.example.com>;tag=8321234356\r\n' +
  'Call-ID: 3848276298220188511@atlanta.example.com\r\n' +
  'CSeq: 1 INVITE\r\n' +
  'Contact: <sip:bob@client.biloxi.example.com;transport=tcp>\r\n' +
  'Content-Length: 0';

exports.object06 = {
  'status': '180',
  'reason': 'Ringing',
  'version': '2.0',
  'headers': {
    'via': 'SIP/2.0/TCP client.atlanta.example.com:5060;branch=z9hG4bK74bf9;received=192.0.2.101',
    'from': 'Alice <sip:alice@atlanta.example.com>;tag=9fxced76sl',
    'to': 'Bob <sip:bob@biloxi.example.com>;tag=8321234356',
    'call-id': '3848276298220188511@atlanta.example.com',
    'cseq': '1 INVITE',
    'contact': '<sip:bob@client.biloxi.example.com;transport=tcp>',
    'content-length': '0'
  },
  body: ''
};
