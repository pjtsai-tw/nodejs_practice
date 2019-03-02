# SeoDefectScanner

The scanner to find seo defects by given predefined rules.

# Usage

1. Construct rules by statements like new Rule(new Tag("img")).lessThan(3);
2. Instantiate SeoDefectScanner and set rules built in step 1
3. Call SeoDefectScanner.inputFromFile(), SeoDefectScanner.inputFromStream() to set input source respectively.
4. Call SeoDefectScanner.outputToConsole(), SeoDefectScanner.outputToFile(), SeoDefectScanner.outputToStream() to set scan result output.
5. Call SeoDefectScanner.scan() to start the scan. It returns a promise which can be used to wait for scan complete.

# index.js

index.js is provided with rules defined in the story. Some parameters, like MAX_STRONG_TAG_ALLOWED and TEST_HTML_FILE_NAME can be configured.
There are also some marked out code which shows input/output options of SeoDefectScanner

# unit test

Just run mocha. Please refer to the test code for usages of classes.

# limitation

The module was implemented according to the requirements. In general they can't achieve anything out of scope. Here are some limitations to
the classes.

Tag - Either test hasAttribute() or containsChildTag(), not both. Testing on other html elements, text for example, can't be done
Rule - Test less than given threshold only. Can't test more than the threshold.
SeoDefectScanner - Assumes input content is always valid. If this is not the case, chain a html grammar validator before calling scan

