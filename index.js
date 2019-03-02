const SeoDefectScanner = require("./lib/SeoDefectScanner");
const Rule = require("./lib/Rule");
const Tag = require("./lib/Tag");

const MAX_STRONG_TAG_ALLOWED = 15;
const TEST_HTML_FILE_NAME = "test.html";

var rule1 = new Rule(new Tag("img").not.hasAttribute("alt")).notExist();
var rule2 = new Rule(new Tag("a").not.hasAttribute("rel")).notExist();
var rule3 = new Rule(new Tag("head").not.containsChild(new Tag("title"))).notExist();
var rule4 = new Rule(new Tag("head").not.containsChild(new Tag("meta").hasAttribute("name","descriptions"))).notExist();
var rule5 = new Rule(new Tag("head").not.containsChild(new Tag("meta").hasAttribute("name","keywords"))).notExist();
var rule6 = new Rule(new Tag("strong")).lessThan(MAX_STRONG_TAG_ALLOWED + 1);
var rule7 = new Rule(new Tag("h1")).lessThan(2);

var scanner = new SeoDefectScanner();
scanner.rules = [rule1, rule2, rule3, rule4, rule5, rule6, rule7];

// get input from given file
scanner.inputFromFile(TEST_HTML_FILE_NAME);

/*
// get input from stream
var Readable = require('stream').Readable;
var s = new Readable;
s.push('<html><img /></html>');
s.push(null);
scanner.inputFromStream(s);
*/

// output result to console
scanner.outputToConsole();


/*
// output result to file
scanner.outputToFile("output.txt");
*/

/*
// output result to stream
const gzip = require("zlib").createGzip();
gzip.pipe(require("fs").createWriteStream("output.txt.zp"));
scanner.outputToStream(gzip);
*/

scanner.scan().then();


