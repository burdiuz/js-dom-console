import { setCustomClassNameTo, getClassName } from '../utils';

export default (value, convertValue) => {
  const result = {};

  Object.keys(value).forEach((key) => {
    result[key] = convertValue(value[key]);
  });

  setCustomClassNameTo(result, getClassName(value));

  return result;
};
