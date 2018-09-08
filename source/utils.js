// Assigned to an object, when rendering, if exists, will wrap content, like
// Map{...} or Set[...]
export const CLASS_NAME_KEY = Symbol('class-name');

export const SPACE_LEVEL = '  ';
export const MAX_FUNC_STR_LEN = 50;

export const INFO_TYPE = 'info';
export const LOG_TYPE = 'log';
export const WARNING_TYPE = 'warning';
export const ERROR_TYPE = 'error';
export const SUCCESS_TYPE = 'success';

export const getClassName = (value) => {
  if (!value) return '';

  const match = String(value.constructor).match(/^(?:[\w\s\d_$])+\s+([\w\d_$]+)\s*[^\1]/);
  // .match(/^(?:(?:[\w\s\d_$])+\s+|)([\w\d_$]+)\s*[^\2]/) - returns type if anonymous

  return match ? match[1] : '';
};

export const getStringWrap = (value) => {
  let pre;
  let post;
  const name = value[CLASS_NAME_KEY] || '';

  if (value instanceof Array) {
    pre = '[';
    post = ']';
  } else {
    pre = '{';
    post = '}';
  }

  pre = `${name}${pre}`;

  return { pre, post };
};

export const removeAllChildren = (target) => {
  while (target.firstChild) {
    target.removeChild(target.firstChild);
  }
};
