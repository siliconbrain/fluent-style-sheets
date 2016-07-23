module.exports.RuleSet = function(initialSet=[]) {
    this.set = initialSet;

    this.rule = function() {
        if (arguments.length < 1) throw "Insufficent arguments provided.";

        let selectors = (arguments.length === 2 && Array.isArray(arguments[0])) ? arguments[0] : [...arguments].slice(0, -1);
        if (selectors.length == 0) {
            selectors = ['*'];
        }
        let declarations = arguments[arguments.length - 1];
        declarations = Object.keys(declarations).map(property => {
            return ({
                property,
                value: declarations[property],
            });
        });
        this.set.push({
            selectors,
            declarations,
        });

        return this;
    };

    this.dump = function() {
        return this.set;
    };

    this.getCSSString = function() {
        let result = '';
        const print = function (value) {
            result = result.concat(value);
        }

        print("/* Generated with fluent-style-sheets. */\n\n");
        this.set.forEach(rule => {
            print(rule.selectors.join(',\n') + '\n{\n');
            rule.declarations.forEach(declaration => {
                print(`\t${declaration.property}: ${declaration.value};\n`)
            });
            print('}\n\n');
        });

        return result;
    };
}
