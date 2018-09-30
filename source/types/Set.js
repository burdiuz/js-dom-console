import { getClassName } from '@actualwave/get-class';

import { setCustomClassNameTo } from '../utils';

export default (value, convertValue) => {
  const result = [];

  value.forEach((item) => result.push(convertValue(item)));

  setCustomClassNameTo(result, getClassName(value));

  return result;
};
