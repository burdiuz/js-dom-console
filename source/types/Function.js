import { getClassName } from '@actualwave/get-class';

import { MAX_FUNC_STR_LEN, setCustomClassNameTo } from '../utils';

export default (value) => {
  const content = String(value);

  if (content.length <= MAX_FUNC_STR_LEN) {
    return content;
  }

  const name = getClassName(value) || 'Function';
  const result = { content };

  setCustomClassNameTo(
    result,
    `${name}(${content.substr(0, MAX_FUNC_STR_LEN)})`,
  );

  return result;
};
