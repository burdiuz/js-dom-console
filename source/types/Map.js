import { getClassName } from '@actualwave/get-class';

import {
  setCustomClassNameTo,
  createComplexDataStorage,
  addToStorage,
} from '../utils';

export default (value, convertValue) => {
  const result = createComplexDataStorage();

  value.forEach((item, key) => {
    /*
    Do not use keyNeedsConversion() here, because Map may hold values of
    different types as keys and string should be quoted, otherwise it may be
    unclear -- what you see string true or boolean true as key.
    */
    addToStorage(result, convertValue(key), convertValue(item));
  });

  setCustomClassNameTo(result, getClassName(value));

  return result;
};
