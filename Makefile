
all: min doc

build:
	mkdir build


min: build lib/sip.js
	java -jar node_modules/closure-compiler/lib/vendor/compiler.jar --compilation_level ADVANCED_OPTIMIZATIONS --externs externs.js --js lib/sip.js --js_output_file build/sip.min.js

doc: lib/sip.js
	mkdir -p doc-src
	sed -r ':a; s%(.*)/\*.*\*/\n%\1%; ta; /\/\*/ !b; N; ba' lib/sip.js > doc-src/sip.js
	docco -o doc doc-src/*
	cat skin.css >> doc/docco.css


clean: clean-lib clean-doc

clean-lib:
	rm -rf build

clean-doc:
	rm -rf doc doc-src


PHONY: all