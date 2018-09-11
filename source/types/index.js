import { getValueType } from '../utils';
import convertArray from './Array';
import convertBoolean from './Boolean';
import convertDate from './Date';
import convertError from './Error';
import convertFunction from './Function';
import convertMap from './Map';
import convertNumber from './Number';
import convertObject from './Object';
import convertSet from './Set';
import convertString from './String';
import convertSymbol from './Symbol';

// Every value in JS has .constructor property
// use Map to store handlers for every type in this case every
// handler could be replaced and customizable

const types = new Map();

/**
 * Type handler signature func(value:*, convertType:(value:*)): String|Array|Object;
 * @param {*} constructor
 * @param {*} handler
 */
export const addTypeHandler = (constructor, handler) => {
  if (constructor && handler) {
    types.delete(constructor);
    types.set(constructor, handler);
  }
};

export const hasTypeHandler = (constructor) => types.has(constructor);

export const getTypeHandler = (constructor) => types.get(constructor);

export const removeTypeHandler = (constructor) => types.delete(constructor);

export const defaultTypeHandlerSelector = (value) => {
  const type = getValueType(value);

  return type && getTypeHandler(type);
};

let typeHandlerSelector = defaultTypeHandlerSelector;

/*
 * Used to get type handler instead of getTypeHandler(), can be customized.
 * @param {*} value
 */
export const selectTypeHandler = (value) => typeHandlerSelector(value);

/**
 * Used to customize type selection algorythm, by default it just gets current
 * constructor value and looks for its handler.
 * @param {*} newSelector
 */
export const setTypeHandlerSelector = (newSelector) => {
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
