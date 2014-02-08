
NFLAGS = NODE_PATH=./lib

UNIT = qunit
UNIT_MAIN = lib/sip.js
UNIT_PATH = test/unit

SRC = lib/sip.js lib/export.js lib/common/assert.js lib/common/events.js lib/common/util.js


all: min doc

deps:
	npm i
	bower i almond#0.2.9
	bower i requirejs#2.1.10

min: assets/js/sipcore.min.js

assets/js/sipcore.min.js: $(SRC) 
	r.js -o build/build-package.js

doc: lib/sip.js
	mkdir -p doc-src
	sed -r ':a; s%(.*)/\*.*\*/\n%\1%; ta; /\/\*/ !b; N; ba' lib/sip.js > doc-src/sip.js
	docco -l classic -o doc doc-src/sip.js

test-all:
	$(NFLAGS) $(UNIT) -c $(UNIT_MAIN) -t test/index.js

test-message:
	$(NFLAGS) $(UNIT) -c $(UNIT_MAIN) -t $(UNIT_PATH)/message.js

test-transport:
	$(NFLAGS) $(UNIT) -c $(UNIT_MAIN) -t $(UNIT_PATH)/transport.js

test-transaction:
	$(NFLAGS) $(UNIT) -c $(UNIT_MAIN) -t $(UNIT_PATH)/transaction.js

clean-all: clean-deps clean

clean-deps:
	rm -rf deps node_modules

clean: clean-lib clean-doc

clean-lib:
	rm -rf assets

clean-doc:
	rm -rf doc doc-src


PHONY: all
