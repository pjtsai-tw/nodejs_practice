/**
 *
 * Tag class.
 *
 * The instance of Tag is to match a html tag by given criteria. It can be used to match
 *  1. <img /> by 'new Tag("img")'.
 *  2. <img rel="abc" /> by 'new Tag("img").hasAttribute("rel")'.
 *     Attribute value does not matter in this case. That is, <img rel="def" /> is a match as well.
 *  3. <img rel="abc" /> by 'new Tag("img").hasAttribute("rel", "abc")'.
 *     The difference from 2 is this tag instance does not match <img rel="def" />.
 *  4. <head><title>tt</title></head> by 'new Tag("head").containsChildTag(new Tag("title"))'
 *     Note this only matches child, not descendants. That is, <head><one_more_layer><title /></one_more_layer></head> is not a match.
 *
 *  The tag in containsChildTag() can be chained with other criteria. For example,
 *  'new Tag("head").containsTag(new Tag("meta").hasAttribute("name", "keyword")' matches
 *  <head><meta name="keywords" /></head>.
 *
 *  It also provides a not concatenator to do negative match. For example,
 *  'new Tag("img").not.hasAttribute("src")' matches <img alt="no image" /> which does not
 *  have a src attribute.
 *
 */

module.exports = Tag

const Rule = require("./Rule");
const assert = require('assert');

/**
 * constructor
 * @param {string} tagName This is the tag name to be matched
 */
function Tag(tagName)
{
    assert(typeof tagName === 'string' || tagName instanceof String, "invalid tagName parameter");
    this.tagName = tagName;

    // should do negative match, default false. will be true after "not" concatenator is called
    this.negativeMatch = false;

    // the matcher to do the match. it will be changed according to the target to be matched.
    // default null means do the tag name match only.
    this.matcher = null;
}

/* match
 * @param {Object} obj This is the object instance to be matched.
 * @return {boolean} This returns ture if the obj matched the criteria
 *
 * The function first makes sure the given object is a tag with proper name. Then matches it
 * with setup criteria (has attribute, contains child). It returns ture is all matched.
 *
 * The obj should be the output of domhanler of htmlparser2. Sample below
 *
 * { type: 'tag',
 *   name: 'a',
 *   attribs: { rel: 'this is rel' },
 *   children:
 *     [ { data: 'this is anchor',
 *         type: 'text',
 *       } ],
 *  }
 *
 */
Tag.prototype.match = function(obj) {
    if (obj.type != "tag" || obj.name != this.tagName) {
        return false;
    }

    if (this.matcher != null) {
        var matchResult = this.matcher(obj);
        if (this.negativeMatch) {
            matchResult = !matchResult;
        }
        return matchResult;
    }

    return true;
}

/**
 * Get the description of current Tag and its criteria
 */
Tag.prototype.description = function() {
    var result = "<" + this.tagName + "> tag";
    if (this.matcher == Tag.prototype.hasAttributeMatcher) {
        if (this.negativeMatch == true) {
            result += " without ";
        } else {
            result += " has ";
        }
        result += this.attrName + " attribute";
        if (this.attrValue != "") {
            result += " with value " + this.attrValue;
        }
    } else if (this.matcher == Tag.prototype.containsChildMatcher) {
        result += " has ";
        if (this.negativeMatch == true) {
            result += "no ";
        }
        result += "child " + this.containsTag.description();
    }
    return result;
}

/**
 * matcher for tag attribute
 * @param {Object} obj This is the object instance to be matched.
 * @return {boolean} This returns ture if the obj has the attribute and value to be matched
 */
Tag.prototype.hasAttributeMatcher = function(obj) {
    if (!obj.attribs || !obj.attribs.hasOwnProperty(this.attrName)) {
        return false;
    }

    if (this.attrValue != "" && obj.attribs[this.attrName] != this.attrValue) {
        return false;
    } else {
        return true;
    }
}

/**
 * Has attribute match criteria modifier.
 * @param {string} attrName This is the attribute name to be matched.
 * @param {string} attrValue This is the attribute value to be matched. If not given, only matches attribute name.
 * @return {Tag} Current Tag instance with match criteria changed.
 */
Tag.prototype.hasAttribute = function(attrName, attrValue="") {
    this.attrName = attrName;
    this.attrValue = attrValue;
    this.matcher = Tag.prototype.hasAttributeMatcher;
    return this;
}

/**
 * matcher for contains child
 * @param {Object} obj This is the object instance to be matched.
 * @return {boolean} This returns ture if the obj has the child tag to be matched.
 */
Tag.prototype.containsChildMatcher = function(obj) {
    if (!Array.isArray(obj.children)) {
        return false;
    }

    // only search child, not deeper
    for (var i = 0; i < obj.children.length; i++) {
        if (this.containsTag.match(obj.children[i])) {
            return true;
        }
    }
    return false;
}

/**
 * contains child match criteria modifier.
 * @param {Tag} tag This is the tag object to be contained in current instance
 * @return {Tag} Current Tag instance with match criteria changed.
 */
Tag.prototype.containsChild = function(tag) {
    assert(tag instanceof Tag, "invalid tag parameter");

    this.containsTag = tag;
    this.matcher = Tag.prototype.containsChildMatcher;
    return this;
}

/**
 * not match criteria modifier
 * @return {Tag} Current Tag instance with match criteria changed.
 *
 * For easier read of Tag construction statements. This "function" is written in getter format.
 * Calling this function will make match on criteria returns negative result.
 * Note only the match criteria result was affected. This function does not change match on tag name.
 */
Object.defineProperty(Tag.prototype, "not", {
    get: function() {
        this.negativeMatch = !this.negativeMatch;
        return this;
    }
});
