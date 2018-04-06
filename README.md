fluent-style-sheets
===================
`fluent-style-sheets` is a library that lets you define your CSS using JavaScript.
It supports two usage styles: it has a [fluent API](https://en.wikipedia.org/wiki/Fluent_interface) that resembles CSS
as much as possible or you can use it more like an [EDSL](https://en.wikipedia.org/wiki/Embedded_domain-specific_language).

Installation
------------
```
npm i fluent-style-sheets --save-dev
```

Features
--------
* Define CSS rules ([`.rule`](#stylesheetrule) or [`.r`](#stylesheetr))
* Define CSS imports ([`.import`](#stylesheetimport) or [`.i`](#stylesheeti))
* Define nested rules ([`.nest`](#stylesheetnest) or [`.n`](#stylesheetn))

Usage styles
--------------

### Fluent style
```js
const {makeStyleSheet} = require('fluent-style-sheets');

const bodyBackgroundColor = '#ff00ff';

const styleSheet = makeStyleSheet()
    // imports
    .i('https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css')
    // rules
    .r('body', {
        'background-color': bodyBackgroundColor,
        margin: 0,
    })
    // nested rules
    .n('main', (b) => b
        .r('> p', {
            'font-size': '14px',
        })
    );

console.log(styleSheet.renderCSS());
```

### EDSL style
```js
const {makeStyleSheet} = require('fluent-style-sheets');

const bodyBackgroundColor = '#ff00ff';

const styleSheet = makeStyleSheet();
const {i, n, r} = styleSheet;

// imports
i('https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css');

// rules
r('body', {
    'background-color': bodyBackgroundColor,
    margin: 0,
});

// nested rules
n('main', ({r, n}) => {
    r('> p', {
        'font-size': '14px',
    })
});

console.log(styleSheet.renderCSS());
```

Quick reference
---------------

### makeStyleSheet
*Create a new style sheet instance.*

**Type**: `function(): StyleSheet`

```js
const myStyleSheet = makeStyleSheet();
```

### StyleSheet.i
*Alias for [`import`](#stylesheetimport).*

### StyleSheet.import
*Create a new CSS @import.*

**Type**: `function(url: string, mediaQueries: ...string): StyleSheet`

```js
const myStyleSheet = makeStyleSheet();
myStyleSheet
    .import('https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css')
    // using media queries:
    .import('https://cdnjs.cloudflare.com/ajax/libs/normalize/4.2.0/normalize.min.css',
            'screen', 'tv and (orientation:landscape)');
```

### StyleSheet.n
*Alias for [`nest`](#stylesheetnest).*

### StyleSheet.nest
*Create nested ruleset.*

**Type**: `function(selector: string, assembler: function({n, nest, r, rule})): StyleSheet`

```js
const myStyleSheet = makeStyleSheet();
myStyleSheet
    .nest('.container', (_) => _
        .r('.content1', {
            color: 'green',
        })
        .nest('.inner-container', (_) => _
            .r('.content2', {
                color: 'blue',
            })
            .r({  // "global" to nesting
                color: 'yellow',
            })
            .r('.content3', {
                color: 'cyan',
            })
        )
    );

// CSS:
// .container .content1 {
//     color: green;
// }
//
// .container .inner-container .content2 {
//     color: blue;
// }
//
// .container .inner-container {
//     color: yellow;
// }
//
// .container .inner-container .content3 {
//     color: cyan;
// }
```

### StyleSheet.r
*Alias for [`rule`](#stylesheetrule).*

### StyleSheet.renderCSS
*Render the style sheet to string with CSS syntax.*

**Type**: `function(signature: ?string=): string`

```js
const myStyleSheet = makeStyleSheet();
// ... build your style sheet using myStyleSheet ...
const cssWithDefaultSignature = myStyleSheet.renderCSS();  // or .renderCSS(undefined)
const cssWithNoSignature = myStyleSheet.renderCSS(null);
const cssWithCustomSignature = myStyleSheet.renderCSS(`Please don't steal my styles!`);

```

### StyleSheet.rule
*Create a new CSS rule.*

**Type**: `function(selectors: ...string, declarations: (object|object[])): StyleSheet`

```js
const myStyleSheet = makeStyleSheet();
myStyleSheet
    // you can use multiple selectors
    .rule('.my-class', 'p > .my-sub-class', {
        color: '#ff00ff',
        // ...
    })
    // if no selector is specified, the rule will be global
    .rule({
        'background-color': 'red',
        // ...
    })
    .rule('.combined-class', [{
        'font-size': '12px',
        'font-weight': 'bold',
    }, {
        'font-size': '14px',  // overrides previous value
    }]);
```
