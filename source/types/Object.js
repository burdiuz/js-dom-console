import { getClassName } from '@actualwave/get-class';

import { setCustomClassNameTo } from '../utils';

export default (value, convertValue, refs) => {
  const result = {};

  Object.keys(value).forEach((key) => {
    result[key] = convertValue(value[key]);
  });

  setCustomClassNameTo(result, getClassName(value));

  return result;
};
