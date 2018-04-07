const assert = require('assert');
const {defaultSignature, makeStyleSheet} = require('./index');

describe('makeStyleSheet', function() {
    it('should return a style sheet', function() {
        const styleSheet = makeStyleSheet();
        assert.notEqual(styleSheet, undefined);
        assert.notEqual(styleSheet.i, undefined);
        assert.notEqual(styleSheet.import, undefined);
        assert.notEqual(styleSheet.r, undefined);
        assert.notEqual(styleSheet.rule, undefined);
    });
});

function getStyleSheet() {
    return makeStyleSheet();
}

function withDefaultSignature(text) {
    return `/* ${defaultSignature} */\n\n${text}`;
}

describe('StyleSheet', function() {
    describe('import', function() {
        const url = `my-resource-url`;
        it('should add an import statement', function() {
            const css = getStyleSheet().import(url).renderCSS();
            assert.equal(css, withDefaultSignature(`@import url("${url}");\n\n`));
        })

        it('should add an import statement with media queries', function() {
            const mediaQueries = ['screen', 'tv and (orientation:landscape)'];
            const css = getStyleSheet().import(url, ...mediaQueries).renderCSS();
            assert.equal(css, withDefaultSignature(`@import url("${url}") ${mediaQueries.join(", ")};\n\n`));
        })
    });

    describe('renderCSS', function() {
        it('should place a generated signature when called without arguments', function() {
            const css = getStyleSheet().renderCSS();
            assert.equal(css, `/* ${defaultSignature} */\n\n\n`);
        });

        it('should place no siganture when called with null', function() {
            const css = getStyleSheet().renderCSS(null);
            assert.equal(css, `\n`);
        })

        it('should place specified signature when provided', function() {
            const signature = `my unique signature`;
            const css = getStyleSheet().renderCSS(signature);
            assert.equal(css, `/* ${signature} */\n\n\n`);
        })
    });

    describe('rule', function() {
        it('should add a wildcard rule without selectors', function() {
            const property = 'some-property';
            const value = 'some-value';
            const css = getStyleSheet().rule({[property]: value}).renderCSS();
            assert.equal(css, withDefaultSignature(`\n*\n{\n\t${property}: ${value};\n}\n\n`));
        });

        it('should add a rule with a single selector', function() {
            const selector = 'some-selector';
            const property = 'some-property';
            const value = 'some-value';
            const css = getStyleSheet().rule(selector, {[property]: value}).renderCSS();
            assert.equal(css, withDefaultSignature(`\n${selector}\n{\n\t${property}: ${value};\n}\n\n`));
        });

        it('should add a rule with multiple selectors', function() {
            const selectors = ['some-selector', 'some-other-selector'];
            const property = 'some-property';
            const value = 'some-value';
            const css = getStyleSheet().rule(...selectors, {[property]: value}).renderCSS();
            assert.equal(css, withDefaultSignature(`\n${selectors.join(',\n')}\n{\n\t${property}: ${value};\n}\n\n`));
        });
    });
});

describe('Subcontext', function() {
    describe('rule', function() {
        it('should add context-global rule without selectors', function() {
            const selector = 'some-selector';
            const property = 'some-property';
            const value = 'some-value';
            const css = getStyleSheet().rule(selector, (ctx) => ctx.rule({[property]: value})).renderCSS();
            assert.equal(css, withDefaultSignature(`\n${selector} \n{\n\t${property}: ${value};\n}\n\n`));
        });

        it('should add a rule with a single selector', function() {
            const selector = 'some-selector';
            const selector2 = 'some-other-selector';
            const property = 'some-property';
            const value = 'some-value';
            const css = getStyleSheet().rule(selector, (ctx) => ctx.rule(selector2, {[property]: value})).renderCSS();
            assert.equal(css, withDefaultSignature(`\n${selector} ${selector2}\n{\n\t${property}: ${value};\n}\n\n`));
        });

        it('should add a rule with a selector for every selector combination', function() {
            const selectors = ['some-selector', 'some-other-selector'];
            const selectors2 = ['some-selector-2', 'some-other-selector-2'];
            const property = 'some-property';
            const value = 'some-value';
            const css = getStyleSheet().rule(...selectors,
                (ctx) => ctx.rule(...selectors2, {[property]: value})
            ).renderCSS();
            const allSelectors = selectors.map(s1 => selectors2.map(s2 => `${s1} ${s2}`).join(',\n')).join(',\n');
            assert.equal(css, withDefaultSignature(`\n${allSelectors}\n{\n\t${property}: ${value};\n}\n\n`));
        });
    });

    describe('spec', function() {
        it('should add context-global rule without selectors', function() {
            const selector = 'some-selector';
            const property = 'some-property';
            const value = 'some-value';
            const css = getStyleSheet().rule(selector, (ctx) => ctx.spec({[property]: value})).renderCSS();
            assert.equal(css, withDefaultSignature(`\n${selector}\n{\n\t${property}: ${value};\n}\n\n`));
        });

        it('should add a rule with a single selector', function() {
            const selector = 'some-selector';
            const selector2 = 'some-other-selector';
            const property = 'some-property';
            const value = 'some-value';
            const css = getStyleSheet().rule(selector, (ctx) => ctx.spec(selector2, {[property]: value})).renderCSS();
            assert.equal(css, withDefaultSignature(`\n${selector}${selector2}\n{\n\t${property}: ${value};\n}\n\n`));
        });

        it('should add a rule with a selector for every selector combination', function() {
            const selectors = ['some-selector', 'some-other-selector'];
            const selectors2 = ['some-selector-2', 'some-other-selector-2'];
            const property = 'some-property';
            const value = 'some-value';
            const css = getStyleSheet().rule(...selectors,
                (ctx) => ctx.spec(...selectors2, {[property]: value})
            ).renderCSS();
            const allSelectors = selectors.map(s1 => selectors2.map(s2 => `${s1}${s2}`).join(',\n')).join(',\n');
            assert.equal(css, withDefaultSignature(`\n${allSelectors}\n{\n\t${property}: ${value};\n}\n\n`));
        });
    });
})