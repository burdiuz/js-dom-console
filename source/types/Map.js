import {
  setCustomClassNameTo,
  getCustomClassNameFrom,
  getClassName,
} from '../utils';

export default (value, convertValue) => {
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
};
