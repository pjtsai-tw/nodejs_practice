/**
 * The Rule class
 *
 * The instance of this class is used to define a rule which limits the count of a kind of tag. The validate
 * process is calling Rule instance multiple times with tags from htmlparser2. The instance will match the tag
 * and, if the matched tags exceed the limit, give error message.
 */

module.exports = Rule

Tag = require("./Tag");

const assert = require("assert");

/**
 * constructor
 * @param {Tag} tag This is the tag to be matched within this rule
 */
function Rule(tag)
{
    assert(tag instanceof Tag, "invalid tag parameter");

    this.tag = tag;

    // match count, will increase if there's a match to this.tag
    this.matchCount = 0;

    // threshold, default to 0 means this.tag should not show up in validate process
    this.threshold = 0;
}

/**
 * validate
 * @param {Object} obj This is the obj to be validated by the rule.
 *
 * If the given obj matches the internal tag criteria, the match count will increase.
 */
Rule.prototype.validate = function(obj) {
    if (this.tag.match(obj) == true) {
        this.matchCount++;
    }
}

/*
 * isViolated
 * @returns {boolean} true if match count through validate() process exceeds the limit
 */
Rule.prototype.isViolated = function() {
    return this.matchCount > this.threshold;
}

/* getErrorMessage
 * @returns {string} if the validate result of the rule is a violation, return a string
 *          of error description. Otherwise return empty string.
 */
Rule.prototype.getErrorMessage = function() {
    if (this.isViolated() == false) {
        return "";
    }

    var result = "there are " + this.matchCount + " " + this.tag.description();
    result += " (limit:" + this.threshold + ")";
    return result;
}

/*
 * set the limit of match count
 * @param {int} threshold
 *
 * Not the threshold is exclusive. That is, calling lessThan(2) means there can be only 1 violation to the rule.
 */
Rule.prototype.lessThan = function(threshold) {
    this.threshold = threshold - 1;
    return this;
}

/* convenient function to set no violation to the rule
 */
Rule.prototype.notExist = function() {
    return this.lessThan(1);
}

