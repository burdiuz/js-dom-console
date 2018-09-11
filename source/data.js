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

export const convert = (value) => {
  if (value === null || value === undefined) {
    return `${value}`;
  }

  const handler = selectTypeHandler(value);

  if (handler) {
    return handler(value, convert);
  }

  return fallbackConversion(value, convert);
};
