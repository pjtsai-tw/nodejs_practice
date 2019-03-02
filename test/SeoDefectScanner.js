const should = require("should");
const Tag = require("../lib/Tag");
const Rule = require("../lib/Rule");
const SeoDefectScanner = require("../lib/SeoDefectScanner");
const sinon = require("sinon");

var rule1 = new Rule(new Tag("img").not.hasAttribute("alt")).notExist();
var rule2 = new Rule(new Tag("head").not.containsChild(new Tag("title"))).notExist();
var rule3 = new Rule(new Tag("h1")).lessThan(2);

describe("#SeoDefectScanner", () => {
    it("invalid function parameters", done => {
        // input
        var scanner = new SeoDefectScanner();
        should(function() {scanner.scan()}).throw("input not set");

        // output
        scanner.inputFromFile("test.html");
        should(function() {scanner.scan()}).throw("output not set");

        done();
    });

    it("input from file", done => {
        var scanner = new SeoDefectScanner();
        scanner.inputFromFile("test.html");
        scanner.outputToConsole();
        var spy = sinon.spy(scanner.output, "write");
        scanner.rules = [rule1];
        scanner.scan().then(function(data) {
            sinon.assert.calledWith(spy, "there are 1 <img> tag without alt attribute (limit:0)\n");
            spy.restore();

            done();
        });;
    });

    it("input from stram", done => {
        const Readable = require('stream').Readable;
        var s = new Readable;
        s.push('<html><img /></html>');
        s.push(null);

        var scanner = new SeoDefectScanner();
        scanner.inputFromStream(s);
        scanner.outputToConsole();
        var spy = sinon.spy(scanner.output, "write");
        scanner.rules = [rule2];
        scanner.scan().then(function(data) {
            sinon.assert.calledWith(spy, "there is no rule violation\n");
            spy.restore();

            done();
        });;
    });

    it("output to file", done => {
        var scanner = new SeoDefectScanner();
        scanner.inputFromFile("test.html");
        scanner.outputToFile("results.txt");
        scanner.rules = [rule2];
        scanner.scan().then(function(data) {
            var fileContent = require("fs").readFileSync('results.txt');
            fileContent.toString().should.equal("there are 1 <head> tag has no child <title> tag (limit:0)\n");

            require("fs").unlinkSync("results.txt");

            done();
        });;
    });

    it("output to stream", done => {
        var scanner = new SeoDefectScanner();
        scanner.inputFromFile("test.html");
        var stream = require("fs").createWriteStream("results.txt");
        scanner.outputToStream(stream);
        scanner.rules = [rule3];
        scanner.scan().then(function(data) {
            var fileContent = require("fs").readFileSync('results.txt');
            fileContent.toString().should.equal("there are 2 <h1> tag (limit:1)\n");

            require("fs").unlinkSync("results.txt");

            done();
        });;
    });
});

