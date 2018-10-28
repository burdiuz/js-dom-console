import { getClassName } from '@actualwave/get-class';

import {
  MAX_FUNC_STR_LEN,
  setCustomClassNameTo,
  createComplexDataStorage,
  addToStorage,
} from '../utils';

export default (value) => {
  const content = String(value);

  if (content.length <= MAX_FUNC_STR_LEN) {
    return content;
  }

  const type = getClassName(value) || 'Function';

  let { name } = value;

  if (!name) {
    name = content.substr(
      content.substr(0, 9) === 'function ' ? 9 : 0,
      MAX_FUNC_STR_LEN,
    );
  }

  const result = createComplexDataStorage();
  addToStorage(result, 'content', content);

  setCustomClassNameTo(
    result,
    // FIXME almost every function starts with "function ", remove this from short string
    `${type}(${name})`,
  );

  return result;
};
