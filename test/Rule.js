const should = require("should");
const Tag = require("../lib/Tag");
const Rule = require("../lib/Rule");

describe("#Rule", () => {
    it("invalid parameters", done => {
        should(function () {new Rule("this is a tag");}).throw("invalid tag parameter");
        done();
    });

    it("number of tags", done => {
        var rule = new Rule(new Tag("strong")).lessThan(3);
        rule.validate({type:"tag", name:"strong"});
        rule.isViolated().should.equal(false);
        rule.getErrorMessage().should.be.equal("");
        rule.validate({type:"tag", name:"strong"});
        rule.isViolated().should.equal(false);
        rule.getErrorMessage().should.be.equal("");
        rule.validate({type:"tag", name:"not_strong"});
        rule.isViolated().should.equal(false);
        rule.getErrorMessage().should.be.equal("");

        // exceeds limit now
        rule.validate({type:"tag", name:"strong"});
        rule.isViolated().should.equal(true);
        rule.getErrorMessage().should.be.equal("there are 3 <strong> tag (limit:2)");

        done();
    });

    it("tag should has attribute", done => {
        var rule = new Rule(new Tag("img").not.hasAttribute("rel")).notExist();
        rule.validate({type:"tag", name:"img", attribs:{rel:"rel"}});
        rule.isViolated().should.equal(false);
        rule.getErrorMessage().should.be.equal("");
        rule.validate({type:"tag", name:"img", atrrs:{src:"src"}});
        rule.isViolated().should.equal(true);
        rule.getErrorMessage().should.be.equal("there are 1 <img> tag without rel attribute (limit:0)");
        rule.validate({type:"tag", name:"img", atrrs:{src:"src"}});
        rule.isViolated().should.equal(true);
        rule.getErrorMessage().should.be.equal("there are 2 <img> tag without rel attribute (limit:0)");
        done();
    });

    it("tag should contain designated child", done => {
        // contains child tag
        var rule = new Rule(new Tag("head").not.containsChild(new Tag("title"))).notExist();
        rule.validate({type:"tag", name:"html"});
        rule.isViolated().should.equal(false);
        rule.getErrorMessage().should.be.equal("");
        rule.validate({type:"tag", name:"head", children:[{type:"tag", name:"title"}]});
        rule.isViolated().should.equal(false);
        rule.getErrorMessage().should.be.equal("");
        rule.validate({type:"tag", name:"head"});
        rule.isViolated().should.equal(true);
        rule.getErrorMessage().should.be.equal("there are 1 <head> tag has no child <title> tag (limit:0)");

        // contains child tag which has an attribute
        var rule2 = new Rule(new Tag("head").not.containsChild(new Tag("meta").hasAttribute("name", "descriptions"))).notExist();
        rule2.validate({type:"tag", name:"html"});
        rule2.isViolated().should.equal(false);
        rule2.getErrorMessage().should.be.equal("");
        rule2.validate({type:"tag", name:"head", children:[{type:"tag", name:"meta", attribs:{name:"descriptions"}}]});
        rule2.isViolated().should.equal(false);
        rule2.getErrorMessage().should.be.equal("");
        rule2.validate({type:"tag", name:"head", children:[{type:"tag", name:"meta", attribs:{name:"not_descriptions"}}]});
        rule2.isViolated().should.equal(true);
        rule2.getErrorMessage().should.be.equal("there are 1 <head> tag has no child <meta> tag has name attribute with value descriptions (limit:0)");

        done();
    });
});
