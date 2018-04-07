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
  * with support for nested rules ([`.rule`](#subcontextrule) or [`.r`](#subcontextr), [`.spec`](#subcontextspec) or [`.s`](#subcontexts))
* Define CSS imports ([`.import`](#stylesheetimport) or [`.i`](#stylesheeti))

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
    .r('main', (_) => _
        .r('> p', {
            'font-size': '14px',
        })
        .s(':hover', {
            color: 'red',
        })
    );

console.log(styleSheet.renderCSS());
```

### EDSL style
```js
const {makeStyleSheet} = require('fluent-style-sheets');

const bodyBackgroundColor = '#ff00ff';

const styleSheet = makeStyleSheet();
const {i, r} = styleSheet;

// imports
i('https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css');

// rules
r('body', {
    'background-color': bodyBackgroundColor,
    margin: 0,
});

// nested rules
r('main', ({r, s}) => {
    r('> p', {
        'font-size': '14px',
    });
    s(':hover', {
        color: 'red',
    });
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
*Alias for [`StyleSheet.import`](#stylesheetimport).*

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

### StyleSheet.r
*Alias for [`StyleSheet.rule`](#stylesheetrule).*

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

**Type**: `function(selectors: ...string, declarationsOrAssembler: (object | object[] | function(subcontext: Subcontext))): StyleSheet`

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

### Subcontext.r
*Alias for [`Subcontext.rule`](#subcontextrule).*

### Subcontext.rule
*Create a new CSS rule embedded in the subcontext.*

**Type**: `function(selectors: ...string, declarationsOrAssembler: (object | object[] | function(subcontext: Subcontext))): Subcontext`

```js
const myStyleSheet = makeStyleSheet();
myStyleSheet
    .r('.my-class', (_) => _
        .rule('.my-class-2', {
            color: '#ff00ff',
            // ...
        })
        .rule('+ .siblings-to-my-class', '> .children-of-my-class', {
            margin: '1px',
            // ...
        })
        .rule('.my-class-3', (_) => _
            .rule('.my-class-4', {
                display: 'none',
            })
        )
    );

/* CSS:
.my-class .my-class-2 {
    color: #ff00ff;
}

.my-class + .siblings-to-my-class,
.my-class > .children-of-my-class {
    margin: 1px;
}

.my-class .my-class-3 .my-class-4 {
    display: none;
}
*/
```

### Subcontext.s
*Alias for [`Subcontext.spec`](#subcontextspec).*

### Subcontext.spec
*Create a rule specialization embedded in the subcontext.*

**Type**: `function(selectors: ...string, declarationsOrAssembler: (object | object[] | function(subcontext: Subcontext))): Subcontext`

```js
const myStyleSheet = makeStyleSheet();
myStyleSheet
    .r('.my-class', (_) => _
        .spec(':hover', '[data-foo="bar"]', {
            color: '#ff00ff',
            // ...
        })
        .spec('.my-other-class', (_) => _
            .r('section', {
                padding: '0px',
            })
        )
    );

/* CSS:
.my-class:hover,
.my-class[data-foo="bar"] {
    color: #ff00ff;
}

.my-class.my-other-class section {
    padding: 0px;
}
*/
```
