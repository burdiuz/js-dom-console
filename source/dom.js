
import convert, { utils } from '@actualwave/log-data-renderer';
import { createUINested } from './nested';

const { isNested, canPassAsIs } = utils;

const createSimpleValue = (value) => document.createTextNode(`${value} `);

export const buildContent = (content, item, converted = false) => {
  content.forEach((value) => {
    if (!converted && canPassAsIs(value)) {
      // shortcut for log strings to not wrap them with quotes
      item.appendChild(createSimpleValue(value));
      return;
    }

    const result = converted ? value : convert(value);

    if (isNested(result)) {
      item.appendChild(createUINested(result, '', true));
    } else {
      item.appendChild(createSimpleValue(result));
    }
  });

  return item;
};
