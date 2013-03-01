

doc: lib/sip.js
	mkdir -p doc-src
	sed -r ':a; s%(.*)/\*.*\*/\n%\1%; ta; /\/\*/ !b; N; ba' lib/sip.js > doc-src/sip.js
	docco -o doc doc-src/*

clean:
	rm -rf doc doc-src