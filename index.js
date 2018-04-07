const package = require('./package.json');

function isFunction(value) { return typeof value === 'function'; }
function isObject(value) { return typeof value === 'object'; }
function isString(value) { return typeof value === 'string'; }

function flatten(arrayOfArrays) { return Array.prototype.concat(...arrayOfArrays); }

module.exports.defaultSignature = `Generated with ${package.name} (${package.version}).`;

const ZeroArgumentsMessage = `No arguments provided.`;

function parseRule() {
    const args = [...arguments];

    if (args.length < 1) throw new Error(ZeroArgumentsMessage);

    const selectors = args.slice(0, -1);
    if (!selectors.every(isString)) throw new Error(`Selectors must be strings.`);

    function makeDeclarations(obj) {
        return Object.entries(obj).map(([property, value]) => ({property, value}));
    }

    const lastArg = arguments[arguments.length - 1];
    if (Array.isArray(lastArg)) {
        if (!lastArg.every(isObject)) throw new Error(`Declarations must be objects.`);
        return {
            selectors,
            declarations: makeDeclarations(Object.assign({}, ...lastArg))
        };
    } else if (isObject(lastArg)) {
        return {
            selectors,
            declarations: makeDeclarations(lastArg)
        };
    } else if (isFunction(lastArg)) {
        return {
            selectors,
            assembler: lastArg,
        };
    } else throw new Error(`Last argument must be an array, object or function.`);
}

function makeSubcontext(rules, selectorPrefixes) {
    const subcontext = {};

    subcontext.rule = function() {
        const rule = parseRule(...arguments);

        if (rule.selectors.length === 0) {
            rule.selectors = [''];
        }

        rule.selectors = flatten(
            selectorPrefixes.map(prefix => rule.selectors.map(selector => `${prefix} ${selector}`))
        );

        if (rule.assembler) {
            rule.assembler(makeSubcontext(rules, rule.selectors));
        } else {
            rules.push(rule);
        }
    };
    subcontext.r = subcontext.rule;
    subcontext.spec = function() {
        const rule = parseRule(...arguments);

        if (rule.selectors.length === 0) {
            rule.selectors = [''];
        }

        rule.selectors = flatten(
            selectorPrefixes.map(prefix => rule.selectors.map(selector => `${prefix}${selector}`))
        );

        if (rule.assembler) {
            rule.assembler(makeSubcontext(rules, rule.selectors));
        } else {
            rules.push(rule);
        }
    };
    subcontext.s = subcontext.spec;

    return subcontext;
}

module.exports.makeStyleSheet = function() {
    const _imports = [];
    const _rules = [];

    const styleSheet = {};

    styleSheet.rule = function() {
        const rule = parseRule(...arguments);

        if (rule.selectors.length === 0) {
            rule.selectors = ['*'];
        }

        if (rule.assembler) {
            rule.assembler(makeSubcontext(_rules, rule.selectors));
        } else {
            _rules.push(rule);
        }

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

    styleSheet.renderCSS = function(signature) {
        let result = '';
        const print = function (value) {
            result = result.concat(value);
        }

        if (signature !== null) {
            if (signature === undefined) {
                signature = module.exports.defaultSignature;
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
