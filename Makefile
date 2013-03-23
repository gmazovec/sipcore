
all: min doc


build:
	mkdir build

min: build/sip.min.js

build/sip.min.js: build lib/sip.js
	java -jar node_modules/closure-compiler/lib/vendor/compiler.jar --compilation_level SIMPLE_OPTIMIZATIONS --js lib/sip.js --js_output_file build/sip.min.js

doc: lib/sip.js
	mkdir -p doc-src
	sed -r ':a; s%(.*)/\*.*\*/\n%\1%; ta; /\/\*/ !b; N; ba' lib/sip.js > doc-src/sip.js
	docco -l classic -o doc doc-src/*
	cat skin.css >> doc/docco.css


test-all:
	qunit -c lib/sip.js -t test/index.js

test-message:
	qunit -c lib/sip.js -t test/unit/message.js

test-min: min
	qunit -c build/sip.min.js -t test/index.js

test-min-message: min
	qunit -c build/sip.min.js -t test/unit/message.js


clean: clean-lib clean-doc

clean-lib:
	rm -rf build

clean-doc:
	rm -rf doc doc-src


PHONY: all