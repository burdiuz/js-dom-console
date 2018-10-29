import { utils } from '@actualwave/log-data-renderer';

const { isList, getListSize, getNestedWraps, getCustomClassNameFrom } = utils;

export const SPACE_LEVEL = '  ';

export const INFO_TYPE = 'info';
export const LOG_TYPE = 'log';
export const WARNING_TYPE = 'warning';
export const ERROR_TYPE = 'error';
export const SUCCESS_TYPE = 'success';

export const getStringWrap = (value) => {
  const wraps = getNestedWraps(value);

  const name = getCustomClassNameFrom(value);

  if (isList(value)) {
    wraps.pre = `${name}(${getListSize(value)})${wraps.pre}`;
  } else {
    wraps.pre = `${name}${wraps.pre}`;
  }

  return wraps;
};

export const removeAllChildren = (target) => {
  while (target.firstChild) {
    target.removeChild(target.firstChild);
  }
};
