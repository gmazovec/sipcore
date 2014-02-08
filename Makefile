
SRC = lib/sip.js lib/common/assert.js lib/common/events.js lib/common/util.js lib/protocol/heap.js


all: min doc

min: assets/js/sipcore.min.js

assets/js/sipcore.min.js: $(SRC) 
	r.js -o build/build-package.js

doc: lib/sip.js
	mkdir -p doc-src/protocol/node
	sed -r ':a; s%(.*)/\*.*\*/\n%\1%; ta; /\/\*/ !b; N; ba' lib/sip.js > doc-src/sip.js
	docco -l classic -o doc doc-src/sip.js

test-all:
	NODE_PATH=./lib qunit -c lib/sip.js -t test/index.js

test-message:
	NODE_PATH=./lib qunit -c lib/sip.js -t test/unit/message.js

test-transport:
	NODE_PATH=./lib qunit -c lib/sip.js -t test/unit/transport.js

test-transaction:
	NODE_PATH=./lib qunit -c lib/sip.js -t test/unit/transaction.js

test-min: min
	NODE_PATH=./lib qunit -c build/sip.min.js -t test/index.js

test-min-message: min
	NODE_PATH=./lib qunit -c build/sip.min.js -t test/unit/message.js

test-min-transport: min
	NODE_PATH=./lib qunit -c build/sip.min.js -t test/unit/transport.js

test-min-transaction: min
	NODE_PATH=./lib qunit -c build/sip.min.js -t test/unit/transaction.js


clean: clean-lib clean-doc

clean-lib:
	rm -rf asserts

clean-doc:
	rm -rf doc doc-src


PHONY: all
