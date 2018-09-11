import { setCustomClassNameTo, getClassName } from '../utils';

export default (value, convertValue) => {
  const result = value.map(convertValue);

  setCustomClassNameTo(result, getClassName(value));

  return result;
};
