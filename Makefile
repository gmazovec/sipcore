
all: dist

dist: lib/sip.js
	@echo "building distribution ..."
	@mkdir -p dist
	@echo "var SIPCORE = (function (exports) {" > dist/sipcore.js
	@cat lib/common/*.js >> dist/sipcore.js
	@sed -r "s/require\('(.*)'\)/\1/g" lib/sip.js >> dist/sipcore.js
	@echo "return exports;" >> dist/sipcore.js
	@echo "}({}));" >> dist/sipcore.js

doc: lib/sip.js
	@mkdir -p doc-src
	@sed -r ':a; s%(.*)/\*.*\*/\n%\1%; ta; /\/\*/ !b; N; ba' lib/sip.js > doc-src/sip.js
	@docco -l classic -o doc doc-src/sip.js

clean:
	@rm -rf dist doc doc-src

PHONY: all

