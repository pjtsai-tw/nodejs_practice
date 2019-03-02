/**
 * SeoDefectScanner
 *
 * The instance of this class reads html data from input. Process it with defined Rule. Then write the result to output.
 */

module.exports = SeoDefectScanner;

const Rule = require("./Rule");
const htmlparser = require("htmlparser2");
const domUtils = require("DomUtils");
const assert = require("assert");

/**
 * constructor
 */
function SeoDefectScanner() {
    // html input, should be a readable stream
    this.input = null;

    // result output, should be a writable stream
    this.output = null;

    // rules to be validated with input
    this.rules = [];
}

/**
 * inputFromStream
 * @param {stream} stream This is a readable stream to read html input
 */
SeoDefectScanner.prototype.inputFromStream = function(stream) {
    this.input = stream;
}

/**
 * inputFromStream
 * @param {string} fileName This is the path to the input html file
 */
SeoDefectScanner.prototype.inputFromFile = function(fileName) {
    this.input = require("fs").createReadStream(fileName);
}

/**
 * outputToConsole
 *
 * calling this function will write validation result to console
 */
SeoDefectScanner.prototype.outputToConsole = function() {
    //this.output = process.stdout;
    this.output = new Object();
    this.output.write = (str) => {
        console.log(str);
    };
}

/**
 * outputToStream
 * @param {stream} stream This is a writable stream to write validation result
 */
SeoDefectScanner.prototype.outputToStream = function(stream) {
    this.output = stream;
}

/**
 * outputToFile
 * @param {string} fileName Tis is the path to the output file
 */
SeoDefectScanner.prototype.outputToFile = function(fileName) {
    this.output = require("fs").createWriteStream(fileName);
}

/**
 * scan
 * @return {Promise} for outside the function to wait for scan complete
 *
 * Execcutes the validation process. Call this funtion after the input, output, and rule are set.
 */
SeoDefectScanner.prototype.scan = function() {
    assert(this.input !== null, "input not set");
    assert(this.output !== null, "output not set");
    assert(Array.isArray(this.rules), "rules should be an array");

    var _this = this;
    var handler = new htmlparser.DomHandler((error, dom) => {
        if (error) {
            throw error;
        } else {
            traverseNode(this, dom[0], 0);

            var violations = false;
            //_this.rules.forEach(function(rule) {
            this.rules.forEach((rule) => {
                if (rule instanceof Rule) {
                    if (rule.isViolated()) {
                        violations = true;
                        this.output.write(rule.getErrorMessage() + "\n");
                    }
                }
            });
            if (! violations) {
                this.output.write("there is no rule violation\n");
            }
        }
    });
    var parser = new htmlparser.Parser(handler);

    var promise = new Promise((resolve, reject) => {
        this.input.on("data", (chunk) => {
            parser.write(chunk.toString());
        });
        this.input.on("end", () => {
            parser.end();
            resolve();
        });
    });

    return promise;
}

// internal function to traverse DOM truee
function traverseNode(instance, node, depth) {
    instance.rules.forEach(function(rule) {
        rule.validate(node);
    });
    var children = domUtils.getChildren(node);
    if (Array.isArray(children)) {
        for (var i = 0; i < children.length; i++) {
            traverseNode(instance, children[i], depth+1);
        }
    }
}

