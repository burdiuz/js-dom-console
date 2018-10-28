
# DOMConsole

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

### TODOs
1. Add display for HTML nodes/elements(via outerHTML).
