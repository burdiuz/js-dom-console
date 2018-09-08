import { isString, toString, stringifyValue } from './data';
import { createUINested } from './nested';

const createSimpleValue = (value) => document.createTextNode(`${value} `);

export const buildContent = (content, item) => {
  content.forEach((value) => {
    let result;

    if (isString(value)) {
      result = toString(value);
    } else {
      result = stringifyValue(value);
    }

    if (typeof result === 'object') {
      item.appendChild(createUINested(result, '', true));
    } else {
      item.appendChild(createSimpleValue(result));
    }
  });

  return item;
};
