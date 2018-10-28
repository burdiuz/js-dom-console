import { convert } from './data';
import { isNested, canPassAsIs } from './utils';
import { createUINested } from './nested';

const createSimpleValue = (value) => document.createTextNode(`${value} `);

export const buildContent = (content, item) => {
  content.forEach((value) => {
    if (canPassAsIs(value)) {
      // shortcut for log strings to not wrap them with quotes
      item.appendChild(createSimpleValue(value));
      return;
    }

    const result = convert(value);

    if (isNested(result)) {
      item.appendChild(createUINested(result, '', true));
    } else {
      item.appendChild(createSimpleValue(result));
    }
  });

  return item;
};
