/* eslint-disable no-use-before-define */
import { CLASS_NAME_KEY, MAX_FUNC_STR_LEN, getClassName } from './utils';

export const isString = (value) => {
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

export const toString = (value) => {
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

const stringifyFunction = (value) => {
  const content = String(value);

  if (content.length <= MAX_FUNC_STR_LEN) {
    return content;
  }

  const name = getClassName(value) || 'Function';

  return {
    content,
    [CLASS_NAME_KEY]: `${name}(${content.substr(0, MAX_FUNC_STR_LEN)})`,
  };
};

const stringifyError = (value) => {
  const { name, message, columnNumber, fileName, lineNumber } = value;
  return {
    [CLASS_NAME_KEY]: name || 'Error',
    name: stringifyValue(name),
    message: stringifyValue(message),
    columnNumber: stringifyValue(columnNumber),
    fileName: stringifyValue(fileName),
    lineNumber: stringifyValue(lineNumber),
  };
};

export function stringifyValue(value) {
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
    value.forEach((val) => result.push(stringifyValue(val)));
  } else {
    result = {};
    Object.keys(value).forEach((key) => {
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
