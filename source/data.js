import convertArray from './types/Array';
import convertBoolean from './types/Boolean';
import convertDate from './types/Date';
import convertError from './types/Error';
import convertFunction from './types/Function';
import convertMap from './types/Map';
import convertNumber from './types/Number';
import convertObject from './types/Object';
import convertSet from './types/Set';
import convertString from './types/String';
import convertSymbol from './types/Symbol';

import { getMaxNesingDepth } from './max-depth';

import { selectTypeHandler } from './types';

export const isString = (value) => {
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

export const toString = (value) => {
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

export const convert = (value, level = 1, refs = new Map()) => {
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
  const nextConvert = (propValue) => convert(propValue, level + 1, refs);
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
