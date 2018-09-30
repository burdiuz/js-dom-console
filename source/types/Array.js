import { getClassName } from '@actualwave/get-class';

import { setCustomClassNameTo } from '../utils';

export default (value, convertValue) => {
  const result = value.map(convertValue);

  setCustomClassNameTo(result, getClassName(value));

  return result;
};
