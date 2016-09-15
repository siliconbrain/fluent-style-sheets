fluent-style-sheets
===================
`fluent-style-sheets` is a library that lets you define your CSS using JavaScript.
It has both a fluent API that resembles CSS as much as possible, or you can use it as an EDSL (ignoring the fluent style).

Features
--------
* Define CSS rules (`.rule` or `.r`)
* Define CSS imports (`.import` or `.i`)
* Define nested rules (`.nest` or `.n`)

Usage examples
--------------
Fluent API:
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

EDSL:
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
