
# @actualwave/dom-console

Small UI helper to display console output on the page.
I've made it just to [make nice demos](https://jsfiddle.net/actualwave/wa45vyz8/).
```javascript
// create container for messages in <body/>
const Msg = DOMConsole.create(document.body);

// use its methods to display messages
Msg.info('Something here:', 'anything else');
Msg.log(1, 2, 3, true, Symbol('abc-def'));
Msg.warn(new Date());
Msg.log(window.location);
Msg.error(new Error('Something bad happened'));
```
All the styles in `console.css` file.
> It does not dig into prototype chain and displays only own properties of the object.

DOM Console is based on [Log Data Renderer](https://www.npmjs.com/package/@actualwave/log-data-renderer)
and it uses renderer under the hood to extract from passed values a set of valuable information(JSON-friendly) and then display it.
I needed to display raw data coming from Log Data Renderer as is and added a new method `pushRendered(type, ...content)`
which can be used to display such data. Using it you can render data somewhere else and send to the console in JSON-friendly format.

### Nesting

By default DOMConsole parses objects 2 levels deep, then it will just get their
String representations(which is [object Object] by default). To check or change
maximum level, use functions `getMaxNesingDepth()` and `setMaxNesingDepth()` respectively.

### CDN

To use on platform like [jsfiddle.net](https://jsfiddle.net/), add these files:
Using UNPKG:
* [https://unpkg.com/@actualwave/dom-console@latest/console.css](https://unpkg.com/@actualwave/dom-console@latest/console.css)
* [https://unpkg.com/@actualwave/dom-console@latest/console.js](https://unpkg.com/@actualwave/dom-console@latest/console.js)

Using GitHub as CDN:
* [https://rawgit.com/burdiuz/js-dom-console/master/console.css](https://rawgit.com/burdiuz/js-dom-console/master/console.css)
* [https://rawgit.com/burdiuz/js-dom-console/master/console.js](https://rawgit.com/burdiuz/js-dom-console/master/console.js)

### Install
It can be installed from NPM
```
npm install @actualwave/dom-console
```
using yarn
```
yarn add @actualwave/dom-console
```

### TODOs
1. Add display for HTML nodes/elements(via outerHTML).
