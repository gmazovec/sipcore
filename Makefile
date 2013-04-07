
all: min doc


build:
	if [ ! -d "build" ]; then mkdir build; fi

min: build/sip.min.js

build/sip.min.js: build lib/sip.js
	java -jar node_modules/closure-compiler/lib/vendor/compiler.jar --compilation_level SIMPLE_OPTIMIZATIONS --js lib/sip.js --js_output_file build/sip.min.js
	if [ ! -f "lib/sip.min.js" ]; then ln -sv ../build/sip.min.js lib/sip.min.js; fi

doc: lib/sip.js
	mkdir -p doc-src/protocol/node
	sed -r ':a; s%(.*)/\*.*\*/\n%\1%; ta; /\/\*/ !b; N; ba' lib/sip.js > doc-src/sip.js
	docco -l classic -o doc doc-src/sip.js


test-all:
	qunit -c lib/sip.js -t test/index.js

test-message:
	qunit -c lib/sip.js -t test/unit/message.js

test-transport:
	qunit -c lib/sip.js -t test/unit/transport.js

test-min: min
	qunit -c build/sip.min.js -t test/index.js

test-min-message: min
	qunit -c build/sip.min.js -t test/unit/message.js

test-min-transport: min
	qunit -c build/sip.min.js -t test/unit/transport.js


clean: clean-lib clean-doc

clean-lib:
	unlink lib/sip.min.js
	rm -rf build

clean-doc:
	rm -rf doc doc-src


PHONY: all