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

  const setCustomClassNameTo = (data, className) => data[CLASS_NAME_KEY] = className;

  const getCustomClassNameFrom = data => data[CLASS_NAME_KEY] || '';

  const getStringWrap = value => {
    let pre;
    let post;
    const name = getCustomClassNameFrom(value);

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

  const getValueType = value => {
    if (value === null || value === undefined) {
      return undefined;
    }

    return value.constructor;
  };

  var convertArray = ((value, convertValue) => {
    const result = value.map(convertValue);

    setCustomClassNameTo(result, getClassName(value));

    return result;
  });

  var convertBoolean = (value => `${value}`);

  var convertDate = (value => `Date(${value})`);

  var convertError = ((value, convertValue) => {
    const { name, message, columnNumber, fileName, lineNumber } = value;
    const result = {
      name: convertValue(name),
      message: convertValue(message),
      columnNumber: convertValue(columnNumber),
      fileName: convertValue(fileName),
      lineNumber: convertValue(lineNumber)
    };

    setCustomClassNameTo(result, name || 'Error');

    return result;
  });

  var convertFunction = (value => {
    const content = String(value);

    if (content.length <= MAX_FUNC_STR_LEN) {
      return content;
    }

    const name = getClassName(value) || 'Function';
    const result = { content };

    setCustomClassNameTo(result, `${name}(${content.substr(0, MAX_FUNC_STR_LEN)})`);

    return result;
  });

  var convertMap = ((value, convertValue) => {
    const result = {};

    value.forEach((item, key) => {
      let keyRep = convertValue(key);
      // FIXME keys stringified for now,
      // need different internal structure to represent non string keys
      if (typeof keyRep !== 'string') {
        keyRep = `${getCustomClassNameFrom(keyRep)}(${String(key)})`;
      }

      result[keyRep] = convertValue(item);
    });

    setCustomClassNameTo(result, getClassName(value));

    return result;
  });

  var convertNumber = (value => `${value}`);

  var convertObject = ((value, convertValue) => {
    const result = {};

    Object.keys(value).forEach(key => {
      result[key] = convertValue(value[key]);
    });

    setCustomClassNameTo(result, getClassName(value));

    return result;
  });

  var convertSet = ((value, convertValue) => {
    const result = [];

    value.forEach(item => result.push(convertValue(item)));

    setCustomClassNameTo(result, getClassName(value));

    return result;
  });

  var convertString = (value => JSON.stringify(value));

  var convertSymbol = (value => String(value));

  // Every value in JS has .constructor property
  // use Map to store handlers for every type in this case every
  // handler could be replaced and customizable

  const types = new Map();

  /**
   * Type handler signature func(value:*, convertType:(value:*)): String|Array|Object;
   * @param {*} constructor
   * @param {*} handler
   */
  const addTypeHandler = (constructor, handler) => {
    if (constructor && handler) {
      types.delete(constructor);
      types.set(constructor, handler);
    }
  };

  const hasTypeHandler = constructor => types.has(constructor);

  const getTypeHandler = constructor => types.get(constructor);

  const removeTypeHandler = constructor => types.delete(constructor);

  const defaultTypeHandlerSelector = value => {
    const type = getValueType(value);

    return type && getTypeHandler(type);
  };

  let typeHandlerSelector = defaultTypeHandlerSelector;

  /*
   * Used to get type handler instead of getTypeHandler(), can be customized.
   * @param {*} value
   */
  const selectTypeHandler = value => typeHandlerSelector(value);

  /**
   * Used to customize type selection algorythm, by default it just gets current
   * constructor value and looks for its handler.
   * @param {*} newSelector
   */
  const setTypeHandlerSelector = newSelector => {
    typeHandlerSelector = newSelector;
  };

  addTypeHandler(Array, convertArray);
  addTypeHandler(Boolean, convertBoolean);
  addTypeHandler(Date, convertDate);
  addTypeHandler(Error, convertError);
  addTypeHandler(Function, convertFunction);
  addTypeHandler(Map, convertMap);
  addTypeHandler(Number, convertNumber);
  addTypeHandler(Object, convertObject);
  addTypeHandler(Set, convertSet);
  addTypeHandler(String, convertString);
  addTypeHandler(Symbol, convertSymbol);

  const isString = value => {
    switch (typeof value) {
      case 'symbol':
      case 'string':
      case 'boolean':
      case 'number':
      case 'undefined':
        return true;
      default:
        return value === null || value instanceof Date;
    }
  };

  const toString = value => {
    switch (typeof value) {
      case 'symbol':
        return convertSymbol(value);
      case 'string':
        return convertString(value);
      case 'boolean':
        return convertBoolean(value);
      case 'number':
        return convertNumber(value);
      default:
        if (value instanceof Date) {
          return convertDate(value);
        }

        return `${value}`;
    }
  };

  const fallbackConversion = (value, convertValue) => {
    if (isString(value)) {
      return toString(value);
    }

    if (value instanceof Function) {
      return convertFunction(value, convertValue);
    }

    if (value instanceof Error) {
      return convertError(value, convertValue);
    }

    if (value instanceof Map) {
      return convertMap(value, convertValue);
    }

    if (value instanceof Set) {
      return convertSet(value, convertValue);
    }

    if (value instanceof Array) {
      return convertArray(value, convertValue);
    }

    return convertObject(value, convertValue);
  };

  const convert = value => {
    if (value === null || value === undefined) {
      return `${value}`;
    }

    const handler = selectTypeHandler(value);

    if (handler) {
      return handler(value, convert);
    }

    return fallbackConversion(value, convert);
  };

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
      text += `${space}${convert(key)}: `;

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

      wrapper.appendChild(document.createTextNode(expanded ? `${space}${post}` : post));
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
      const result = convert(value);

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
  exports.addTypeHandler = addTypeHandler;
  exports.getTypeHandler = getTypeHandler;
  exports.hasTypeHandler = hasTypeHandler;
  exports.removeTypeHandler = removeTypeHandler;
  exports.setTypeHandlerSelector = setTypeHandlerSelector;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=console.js.map
