(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.DOMConsole = {})));
}(this, (function (exports) { 'use strict';

  // Assigned to an object, when rendering, if exists, will wrap content, like
  // Map{...} or Set[...]
  const CLASS_NAME_KEY = Symbol('class-name');

  const SPACE_LEVEL = '  ';
  const MAX_FUNC_STR_LEN = 50;

  const INFO_TYPE = 'info';
  const LOG_TYPE = 'log';
  const WARNING_TYPE = 'warning';
  const ERROR_TYPE = 'error';
  const SUCCESS_TYPE = 'success';

  const getClassName = value => {
    if (!value) return '';

    const match = String(value.constructor).match(/^(?:[\w\s\d_$])+\s+([\w\d_$]+)\s*[^\1]/);
    // .match(/^(?:(?:[\w\s\d_$])+\s+|)([\w\d_$]+)\s*[^\2]/) - returns type if anonymous

    return match ? match[1] : '';
  };

  const getStringWrap = value => {
    let pre;
    let post;
    const name = value[CLASS_NAME_KEY] || '';

    if (value instanceof Array) {
      pre = '[';
      post = ']';
    } else {
      pre = '{';
      post = '}';
    }

    pre = `${name}${pre}`;

    return { pre, post };
  };

  const removeAllChildren = target => {
    while (target.firstChild) {
      target.removeChild(target.firstChild);
    }
  };

  /* eslint-disable no-use-before-define */

  const isString = value => {
    switch (typeof value) {
      case 'symbol':
      case 'string':
      case 'boolean':
      case 'number':
        return true;
      default:
        return !value || value instanceof Date;
    }
  };

  const toString = value => {
    switch (typeof value) {
      case 'symbol':
        return String(value);
      case 'string':
        return value;
      case 'boolean':
      case 'number':
      default:
        if (value instanceof Date) {
          return `Date(${value})`;
        }

        return `${value}`;
    }
  };

  const stringifyFunction = value => {
    const content = String(value);

    if (content.length <= MAX_FUNC_STR_LEN) {
      return content;
    }

    const name = getClassName(value) || 'Function';

    return {
      content,
      [CLASS_NAME_KEY]: `${name}(${content.substr(0, MAX_FUNC_STR_LEN)})`
    };
  };

  const stringifyError = value => {
    const { name, message, columnNumber, fileName, lineNumber } = value;
    return {
      [CLASS_NAME_KEY]: name || 'Error',
      name: stringifyValue(name),
      message: stringifyValue(message),
      columnNumber: stringifyValue(columnNumber),
      fileName: stringifyValue(fileName),
      lineNumber: stringifyValue(lineNumber)
    };
  };

  function stringifyValue(value) {
    if (typeof value === 'string') {
      return JSON.stringify(value);
    }

    if (isString(value)) {
      return toString(value);
    }

    if (value instanceof Function) {
      return stringifyFunction(value);
    }

    if (value instanceof Error) {
      return stringifyError(value);
    }

    let result;

    if (value instanceof Array) {
      result = value.map(stringifyValue);
    } else if (value instanceof Map) {
      result = {};
      value.forEach((val, key) => {
        result[key] = stringifyValue(val);
      });
    } else if (value instanceof Set) {
      result = [];
      value.forEach(val => result.push(stringifyValue(val)));
    } else {
      result = {};
      Object.keys(value).forEach(key => {
        result[key] = stringifyValue(value[key]);
      });
    }

    if (result) {
      result[CLASS_NAME_KEY] = getClassName(value) || 'Object';
    } else {
      result = `${getClassName(value)}()`;
    }

    return result;
  }

  /* eslint-disable no-use-before-define */

  const setExpandIconSymbol = (icon, expanded) => {
    icon.innerHTML = expanded ? '-' : '+';
  };

  const createExpandIcon = expanded => {
    const icon = document.createElement('span');
    icon.className = 'ui-console-button-expand';

    setExpandIconSymbol(icon, expanded);

    return icon;
  };

  const createCollapsedContent = () => [document.createTextNode(' ... ')];

  const createUINestedArrayContent = (list, space) => {
    const result = [];
    let text = '\n';

    list.forEach(value => {
      text += space;

      if (typeof value === 'object') {
        result.push(document.createTextNode(text));
        text = '';
        result.push(createUINested(value, space));
      } else {
        text += value;
      }
      text += ', \n';
    });

    if (text) {
      result.push(document.createTextNode(text));
    }

    return result;
  };

  const createUINestedObjectContent = (object, space) => {
    const result = [];
    let text = '\n';

    Object.keys(object).forEach(key => {
      const value = object[key];
      text += `${space}${stringifyValue(key)}: `;

      if (typeof value === 'object') {
        result.push(document.createTextNode(text));
        text = '';
        result.push(createUINested(value, space));
      } else {
        text += value;
      }

      text += ', \n';
    });

    if (text) {
      result.push(document.createTextNode(text));
    }

    return result;
  };

  const createUINestedContent = (value, initSpace) => {
    const space = `${SPACE_LEVEL}${initSpace}`;

    if (value instanceof Array) {
      return createUINestedArrayContent(value, space);
    }

    return createUINestedObjectContent(value, space);
  };

  function createUINested(value, space = '', initExpanded = false) {
    let expanded = initExpanded;
    let contentExpanded;
    const contentCollapsed = createCollapsedContent();

    const { pre, post } = getStringWrap(value);
    const icon = createExpandIcon(expanded);
    const wrapper = document.createElement('span');

    wrapper.className = 'ui-console-clickable';

    const drawContents = () => {
      let content;

      removeAllChildren(wrapper);

      wrapper.appendChild(icon);
      wrapper.appendChild(document.createTextNode(pre));

      if (expanded) {
        if (!contentExpanded) {
          contentExpanded = createUINestedContent(value, space);
        }

        content = contentExpanded;
      } else {
        content = contentCollapsed;
      }

      content.forEach(node => wrapper.appendChild(node));

      wrapper.appendChild(document.createTextNode(`${space}${post}`));
    };

    wrapper.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();

      expanded = !expanded;

      setExpandIconSymbol(icon, expanded);
      drawContents();
    });

    drawContents();

    return wrapper;
  }

  const createSimpleValue = value => document.createTextNode(`${value} `);

  const buildContent = (content, item) => {
    content.forEach(value => {
      let result;

      if (isString(value)) {
        result = toString(value);
      } else {
        result = stringifyValue(value);
      }

      if (typeof result === 'object') {
        item.appendChild(createUINested(result, '', true));
      } else {
        item.appendChild(createSimpleValue(result));
      }
    });

    return item;
  };

  const init = (container, maxItems = Number.MAX_SAFE_INTEGER) => {
    const shiftOverMax = () => {
      while (maxItems > 0 && maxItems < container.childElementCount) {
        const child = container.firstElementChild;
        if (!child) {
          return;
        }

        child.remove();
      }
    };

    const pushItem = (content, type = LOG_TYPE) => {
      const item = document.createElement('div');
      item.className = `ui-console-item ui-console-item-${type}`;

      buildContent(content, item);

      container.appendChild(item);
      shiftOverMax();
    };

    return {
      info: (...content) => pushItem(content, INFO_TYPE),
      log: (...content) => pushItem(content, LOG_TYPE),
      warn: (...content) => pushItem(content, WARNING_TYPE),
      error: (...content) => pushItem(content, ERROR_TYPE),
      success: (...content) => pushItem(content, SUCCESS_TYPE)
    };
  };

  const create = (wrapper, maxItems = Number.MAX_SAFE_INTEGER) => {
    const container = document.createElement('div');
    container.className = 'ui-console ui-console-container';
    wrapper.appendChild(container);

    return init(container, maxItems);
  };

  exports.init = init;
  exports.create = create;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=console.js.map
