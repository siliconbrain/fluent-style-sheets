const package = require('./package.json');

const ZeroArgumentsMessage = `No arguments provided.`;

function parseRule() {
    if (arguments.length < 1) throw new Error(ZeroArgumentsMessage);
    if (arguments.length === 1) {
        if (typeof arguments[0] === 'string') {
            throw new Error("No declarations provided.");
        }
    }

    let selectors = [...arguments].slice(0, -1);

    let declarations = arguments[arguments.length - 1];
    if (Array.isArray(declarations)) {
        declarations = Object.assign({}, ...declarations);
    }
    declarations = Object.keys(declarations).map(property => {
        return ({
            property,
            value: declarations[property],
        });
    });

    return {
        selectors,
        declarations,
    };
}

function makeNestedRuleBuilderCtor(base, rules) {
    return function _makeNestedRuleBuilder(selector, assembler) {
        if (selector === undefined || selector === '') {
            throw new Error(`A selector must be provided for the nested rules.`);
        }

        if (assembler === undefined || typeof assembler !== 'function') {
            throw new Error(`An assembler function must be provided for the nested rules.`);
        }

        const builder = {};
        
        builder.rule = function() {
            const rule = parseRule(...arguments);

            if (rule.selectors.length === 0) {
                rule.selectors = [selector];
            } else {
                rule.selectors = rule.selectors.map((nestedSelector) => `${selector} ${nestedSelector}`);
            }

            rules.push(rule);

            return builder;
        };
        builder.r = builder.rule;

        builder.nest = function(innerSelector, innerAssembler) {
            return makeNestedRuleBuilderCtor(builder, rules)(`${selector} ${innerSelector}`, innerAssembler);
        };
        builder.n = builder.nest;
        
        assembler(builder);

        return base;
    };
}

module.exports.makeStyleSheet = function() {
    let _imports = [];
    let _rules = [];

    const styleSheet = {};

    styleSheet.rule = function() {
        const rule = parseRule(...arguments);

        if (rule.selectors.length === 0) {
            rule.selectors = ['*'];
        }

        _rules.push(rule);

        return styleSheet;
    };
    styleSheet.r = styleSheet.rule;

    styleSheet.import = function() {
        if (arguments.length < 1) throw new Error(ZeroArgumentsMessage);
        
        const url = arguments[0];

        let mediaQueries = [...arguments].slice(1);

        _imports.push({
            url,
            mediaQueries,
        });

        return styleSheet;
    };
    styleSheet.i = styleSheet.import;

    styleSheet.nest = makeNestedRuleBuilderCtor(styleSheet, _rules);
    styleSheet.n = styleSheet.nest;

    styleSheet.renderCSS = function(signature) {
        let result = '';
        const print = function (value) {
            result = result.concat(value);
        }

        if (signature !== null) {
            if (signature === undefined) {
                signature = `Generated with ${package.name} (${package.version}).` 
            }
            print(`/* ${signature} */\n\n`);
        }
        _imports.forEach(importRule => {
            print(`@import url("${importRule.url}")`);
            if (importRule.mediaQueries.length !== 0)
                print(` ${importRule.mediaQueries.join(`, `)}`);
            print(`;\n`);
        });
        print(`\n`);
        _rules.forEach(rule => {
            print(rule.selectors.join(',\n') + '\n{\n');
            rule.declarations.forEach(declaration => {
                print(`\t${declaration.property}: ${declaration.value};\n`)
            });
            print('}\n\n');
        });

        return result;
    }

    return styleSheet;
}
