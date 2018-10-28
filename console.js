(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.DOMConsole = {})));
}(this, (function (exports) { 'use strict';

  // Assigned to an object, when rendering, if exists, will wrap content, like
  // Map{...} or Set[...]
  const CLASS_NAME_KEY = '@class-name';

  const SPACE_LEVEL = '  ';
  const MAX_FUNC_STR_LEN = 30;

  const INFO_TYPE = 'info';
  const LOG_TYPE = 'log';
  const WARNING_TYPE = 'warning';
  const ERROR_TYPE = 'error';
  const SUCCESS_TYPE = 'success';

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

  const canPassAsIs = value => typeof value === 'string';

  const validKeyRgx = /^[\w_$][\w\d_$]*$/i;

  const keyNeedsConversion = key => !(canPassAsIs(key) && validKeyRgx.test(key));

  const isNested = value => typeof value === 'object';

  const createComplexDataStorage = () => new Map();

  const addToStorage = (storage, key, value) => storage.set(key, value);

  const iterateStorage = (storage, handler) => storage.forEach(handler);

  function unwrapExports (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var getClass_1 = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, '__esModule', { value: true });

  const getClass = (target) => {
    if(target === null || target === undefined) {
      return undefined;
    }

    const constructor = target.constructor;

    if(
      typeof constructor === 'function'
      && target instanceof constructor
    ) {
      return target.constructor;
    }

    const proto = Object.getPrototypeOf(target);

    if (proto && typeof proto === 'object') {
      return proto.constructor;
    }

    return proto || Object;
  };

  const getParentClass = (target) => {
    const def = getClass(target);

    return def && Object.getPrototypeOf(def);
  };

  const getClassName = (value) => {
    if (!value) return '';

    const valueClass = getClass(value);

    return valueClass ? valueClass.name : '';
  };

  exports.getClassName = getClassName;
  exports.getParentClass = getParentClass;
  exports.getClass = getClass;
  exports.default = getClass;
  });

  var getClass = unwrapExports(getClass_1);
  var getClass_2 = getClass_1.getClassName;
  var getClass_3 = getClass_1.getParentClass;
  var getClass_4 = getClass_1.getClass;

  var convertArray = ((value, convertValue) => {
    const result = value.map(convertValue);

    setCustomClassNameTo(result, getClass_2(value));

    return result;
  });

  var convertBoolean = (value => `${value}`);

  var convertDate = (value => `Date(${value})`);

  var convertError = ((value, convertValue) => {
    const { name, message, columnNumber, fileName, lineNumber } = value;

    const result = createComplexDataStorage();

    addToStorage(result, 'name', convertValue(name));
    addToStorage(result, 'message', convertValue(message));
    addToStorage(result, 'columnNumber', convertValue(columnNumber));
    addToStorage(result, 'fileName', convertValue(fileName));
    addToStorage(result, 'lineNumber', convertValue(lineNumber));

    setCustomClassNameTo(result, name || 'Error');

    return result;
  });

  var convertFunction = (value => {
    const content = String(value);

    if (content.length <= MAX_FUNC_STR_LEN) {
      return content;
    }

    const type = getClass_2(value) || 'Function';

    let { name } = value;

    if (!name) {
      name = content.substr(content.substr(0, 9) === 'function ' ? 9 : 0, MAX_FUNC_STR_LEN);
    }

    const result = createComplexDataStorage();
    addToStorage(result, 'content', content);

    setCustomClassNameTo(result,
    // FIXME almost every function starts with "function ", remove this from short string
    `${type}(${name})`);

    return result;
  });

  var convertMap = ((value, convertValue) => {
    const result = createComplexDataStorage();

    value.forEach((item, key) => {
      /*
      Do not use keyNeedsConversion() here, because Map may hold values of
      different types as keys and string should be quoted, otherwise it may be
      unclear -- what you see string true or boolean true as key.
      */
      addToStorage(result, convertValue(key), convertValue(item));
    });

    setCustomClassNameTo(result, getClass_2(value));

    return result;
  });

  var convertNumber = (value => `${value}`);

  var convertObject = ((value, convertValue) => {
    const result = createComplexDataStorage();

    Object.keys(value).forEach(key => {
      addToStorage(result, keyNeedsConversion(key) ? convertValue(key) : key, convertValue(value[key]));
    });

    setCustomClassNameTo(result, getClass_2(value));

    return result;
  });

  var convertSet = ((value, convertValue) => {
    const result = [];

    value.forEach(item => result.push(convertValue(item)));

    setCustomClassNameTo(result, getClass_2(value));

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
    const type = getClass(value);

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

  var closureValue = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, '__esModule', { value: true });

  const singleValueFactory = (defaultValue = null, valueFormatter = (value) => value) => {
    let value = defaultValue;

    return {
      getDefault: () => defaultValue,
      get: () => value,
      set: (newValue = defaultValue) => {
        value = valueFormatter(newValue);
      },
    };
  };

  const valuesMapFactory = (defaults = new Map(), valueFormatter = (key, value) => value) => {
    const defaultValues = new Map(defaults);
    const getDefault = () => new Map(defaultValues);

    const values = getDefault();

    return {
      values,
      getDefault,
      copy: () => new Map(values),
      delete: (key) => values.delete(key),
      has: (key) => values.has(key),
      set: (key, value) => values.set(key, valueFormatter(key, value)),
      get: (key) => values.get(key),
    };
  };

  const valuesSetFactory = (defaults = new Set(), valueFormatter = (value) => value) => {
    const defaultValues = new Set(defaults);
    const getDefault = () => new Set(defaultValues);

    const values = getDefault();

    return {
      values,
      getDefault,
      get: () => new Set(values),
      delete: (value) => values.delete(value),
      has: (value) => values.has(value),
      add: (value) => values.add(valueFormatter(value)),
    };
  };

  exports.singleValueFactory = singleValueFactory;
  exports.valuesMapFactory = valuesMapFactory;
  exports.valuesSetFactory = valuesSetFactory;
  });

  unwrapExports(closureValue);
  var closureValue_1 = closureValue.singleValueFactory;
  var closureValue_2 = closureValue.valuesMapFactory;
  var closureValue_3 = closureValue.valuesSetFactory;

  const {
    get: getMaxNesingDepth,
    set: setMaxNesingDepth
  } = closureValue_1(2);

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

  const fallbackConversion = (value, convertValue, refs) => {
    if (isString(value)) {
      return toString(value);
    }

    if (value instanceof Function) {
      return convertFunction(value, convertValue, refs);
    }

    if (value instanceof Error) {
      return convertError(value, convertValue, refs);
    }

    if (value instanceof Map) {
      return convertMap(value, convertValue, refs);
    }

    if (value instanceof Set) {
      return convertSet(value, convertValue, refs);
    }

    if (value instanceof Array) {
      return convertArray(value, convertValue, refs);
    }

    return convertObject(value, convertValue, refs);
  };

  const convert = (value, level = 1, refs = new Map()) => {
    if (value === null || value === undefined) {
      return `${value}`;
    }

    const maxLevel = getMaxNesingDepth();

    if (level > maxLevel) {
      return toString(value);
    }

    const complex = !isString(value);

    if (complex && refs.has(value)) {
      return refs.get(value);
    }

    const handler = selectTypeHandler(value);
    const nextConvert = propValue => convert(propValue, level + 1, refs);
    let result;

    if (handler) {
      result = handler(value, nextConvert, refs);
    }

    result = fallbackConversion(value, nextConvert, refs);

    if (complex) {
      refs.set(value, result);
    }

    return result;
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

      if (isNested(value)) {
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

  const createUINestedObjectContent = (storage, space) => {
    const result = [];
    let text = '\n';

    iterateStorage(storage, (value, key) => {
      text += `${space}`;

      if (isNested(key)) {
        result.push(document.createTextNode(`${text}[`));
        result.push(createUINested(key, space));
        text = ']';
      } else {
        text += key;
      }

      text += ': ';

      if (isNested(value)) {
        result.push(document.createTextNode(text));
        result.push(createUINested(value, space));
        text = '';
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

    wrapper.className = 'ui-console-nested-wrapper';

    const link = document.createElement('span');
    link.className = 'ui-console-clickable';
    link.appendChild(icon);
    link.appendChild(document.createTextNode(pre));

    const drawContents = () => {
      let content;

      removeAllChildren(wrapper);

      wrapper.appendChild(link);

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

    link.addEventListener('click', event => {
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
      if (canPassAsIs(value)) {
        // shortcut for log strings to not wrap them with quotes
        item.appendChild(createSimpleValue(value));
        return;
      }

      const result = convert(value);

      if (isNested(result)) {
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
  exports.getMaxNesingDepth = getMaxNesingDepth;
  exports.setMaxNesingDepth = setMaxNesingDepth;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=console.js.map
