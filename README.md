
# DOMConsole

### TODOs
1. Add display for HTML nodes/elements(via outerHTML).
2. Add proper display for Map keys

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
> It does not dig into prototype chain and displays only own properties for object.

To use on platform like [jsfiddle.net](https://jsfiddle.net/), add these files:
* [https://rawgit.com/burdiuz/js-dom-console/master/console.css](https://rawgit.com/burdiuz/js-dom-console/master/console.css)
* [https://rawgit.com/burdiuz/js-dom-console/master/console.js](https://rawgit.com/burdiuz/js-dom-console/master/console.js)
