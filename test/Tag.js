const should = require("should");
const Tag = require("../lib/Tag");
const Rule = require("../lib/Rule");

describe("#Tag", () => {
    it("invalid function parameters", done => {
        // constructor
        var tag = should(function() {new Tag(1);}).throw("invalid tagName parameter");

        done();
    });

    it("match tag", done => {
        var tag = new Tag("img");
        tag.description().should.equal("<img> tag");
        tag.match({}).should.equal(false);
        tag.match({type:"tag", name:"head"}).should.equal(false);
        tag.match({type:"text", name:"head"}).should.equal(false);
        tag.match({type:"tag", name:"img"}).should.equal(true);
        done();
    });

    it("match hasAttribute", done => {
        // has attribute rel, value doesn't matter
        var tag = new Tag("img").hasAttribute("rel");
        tag.description().should.equal("<img> tag has rel attribute");
        tag.match({type:"tag", name:"head", attribs:{}}).should.equal(false);
        tag.match({type:"text", name:"img", attribs:{}}).should.equal(false);
        tag.match({type:"tag", name:"img", attribs:{}}).should.equal(false);
        tag.match({type:"tag", name:"img", attribs:{rel:"rel"}}).should.equal(true);
        tag.match({type:"tag", name:"body", attribs:{rel:"rel"}}).should.equal(false);
        tag.match({type:"tag", name:"img", attribs:{src:"src"}}).should.equal(false);
        tag.match({type:"text", name:"img", attribs:{rel:"rel"}}).should.equal(false);

        // has attribute rel with value relval
        var tag2 = new Tag("img").hasAttribute("rel", "relval");
        tag2.description().should.equal("<img> tag has rel attribute with value relval");
        tag2.match({type:"tag", name:"img", attribs:{}}).should.equal(false);
        tag2.match({type:"tag", name:"img", attribs:{rel:"relval"}}).should.equal(true);
        tag2.match({type:"tag", name:"img", attribs:{rel:"relval2"}}).should.equal(false);
        tag2.match({type:"tag", name:"img", attribs:{src:"relval"}}).should.equal(false);

        // negative match above 2
        var negTag = new Tag("img").not.hasAttribute("rel");
        negTag.description().should.equal("<img> tag without rel attribute");
        negTag.match({type:"tag", name:"head", attribs:{}}).should.equal(false);
        negTag.match({type:"text", name:"img", attribs:{}}).should.equal(false);
        negTag.match({type:"tag", name:"img", attribs:{}}).should.equal(true);
        negTag.match({type:"tag", name:"img", attribs:{rel:"rel"}}).should.equal(false);
        negTag.match({type:"tag", name:"body", attribs:{rel:"rel"}}).should.equal(false);
        negTag.match({type:"tag", name:"img", attribs:{src:"src"}}).should.equal(true);
        negTag.match({type:"text", name:"img", attribs:{rel:"rel"}}).should.equal(false);

        var negTag2 = new Tag("img").not.hasAttribute("rel", "relval");
        negTag2.description().should.equal("<img> tag without rel attribute with value relval");
        negTag2.match({type:"tag", name:"img", attribs:{}}).should.equal(true);
        negTag2.match({type:"tag", name:"img", attribs:{rel:"relval"}}).should.equal(false);
        negTag2.match({type:"tag", name:"img", attribs:{rel:"relval2"}}).should.equal(true);
        negTag2.match({type:"tag", name:"img", attribs:{src:"relval"}}).should.equal(true);

        done();
    });

    it("match containsChild", done => {
        // contains child tag
        var tag = new Tag("head").containsChild(new Tag("title"));
        tag.match({type:"tag", name:"head", children:[{type:"tag", name:"title"}]}).should.equal(true);
        tag.match({type:"tag", name:"not_head", children:[{type:"tag", name:"title"}]}).should.equal(false);
        tag.match({type:"tag", name:"head", children:[]}).should.equal(false);
        tag.match({type:"tag", name:"head", children:[{type:"tag", name:"not_title"}]}).should.equal(false);
        tag.match({type:"tag", name:"head", children:[{type:"tag", name:"not_title", children:[{type:"tag", name:"title"}]}]}).should.equal(false);

        // negative match above
        var negTag = new Tag("head").not.containsChild(new Tag("title"));
        negTag.match({type:"tag", name:"head", children:[{type:"tag", name:"title"}]}).should.equal(false);
        negTag.match({type:"tag", name:"not_head", children:[{type:"tag", name:"title"}]}).should.equal(false);
        negTag.match({type:"tag", name:"head", children:[]}).should.equal(true);
        negTag.match({type:"tag", name:"head", children:[{type:"tag", name:"not_title"}]}).should.equal(true);
        negTag.match({type:"tag", name:"head", children:[{type:"tag", name:"not_title", children:[{type:"tag", name:"title"}]}]}).should.equal(true);

        // contains child tag with attribute
        var attrTag = new Tag("head").containsChild(new Tag("meta").hasAttribute("name"));
        attrTag.match({type:"tag", name:"head", children:[{type:"tag", name:"meta"}]}).should.equal(false);
        attrTag.match({type:"tag", name:"head", children:[{type:"tag", name:"meta", attribs:{name:"nameval"}}]}).should.equal(true);
        attrTag.match({type:"tag", name:"not_head", children:[{type:"tag", name:"title"}]}).should.equal(false);
        attrTag.match({type:"tag", name:"head", children:[]}).should.equal(false);
        attrTag.match({type:"tag", name:"head", children:[{type:"tag", name:"not_meta"}]}).should.equal(false);
        attrTag.match({type:"tag", name:"head", children:[{type:"tag", name:"not_meta", attribs:{name:"nameval"}}]}).should.equal(false);
        attrTag.match({type:"tag", name:"head", children:[{type:"tag", name:"not_meta", children:[{type:"tag", name:"meta", attribs:{name:"nameval"}}]}]}).should.equal(false);

        // negative match
        var negAttrTag = new Tag("head").not.containsChild(new Tag("meta").hasAttribute("name"));
        negAttrTag.match({type:"tag", name:"head", children:[{type:"tag", name:"meta"}]}).should.equal(true);
        negAttrTag.match({type:"tag", name:"head", children:[{type:"tag", name:"meta", attribs:{name:"nameval"}}]}).should.equal(false);
        negAttrTag.match({type:"tag", name:"not_head", children:[{type:"tag", name:"title"}]}).should.equal(false);
        negAttrTag.match({type:"tag", name:"head", children:[]}).should.equal(true);
        negAttrTag.match({type:"tag", name:"head", children:[{type:"tag", name:"not_meta"}]}).should.equal(true);
        negAttrTag.match({type:"tag", name:"head", children:[{type:"tag", name:"not_meta", attribs:{name:"nameval"}}]}).should.equal(true);
        negAttrTag.match({type:"tag", name:"head", children:[{type:"tag", name:"not_meta", children:[{type:"tag", name:"meta", attribs:{name:"nameval"}}]}]}).should.equal(true);

        done();
    });
});
