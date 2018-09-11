import {
  INFO_TYPE,
  LOG_TYPE,
  WARNING_TYPE,
  ERROR_TYPE,
  SUCCESS_TYPE,
} from './utils';
import {
  addTypeHandler,
  getTypeHandler,
  hasTypeHandler,
  removeTypeHandler,
  setTypeHandlerSelector,
} from './types';
import { buildContent } from './dom';

export const init = (container, maxItems = Number.MAX_SAFE_INTEGER) => {
  const shiftOverMax = () => {
    while (maxItems > 0 && maxItems < container.childElementCount) {
      const child = container.firstElementChild;
      if (!child) {
        return;
      }

      child.remove();
    }
  };

  const pushItem = (content, type = LOG_TYPE) => {
    const item = document.createElement('div');
    item.className = `ui-console-item ui-console-item-${type}`;

    buildContent(content, item);

    container.appendChild(item);
    shiftOverMax();
  };

  return {
    info: (...content) => pushItem(content, INFO_TYPE),
    log: (...content) => pushItem(content, LOG_TYPE),
    warn: (...content) => pushItem(content, WARNING_TYPE),
    error: (...content) => pushItem(content, ERROR_TYPE),
    success: (...content) => pushItem(content, SUCCESS_TYPE),
  };
};

export const create = (wrapper, maxItems = Number.MAX_SAFE_INTEGER) => {
  const container = document.createElement('div');
  container.className = 'ui-console ui-console-container';
  wrapper.appendChild(container);

  return init(container, maxItems);
};

/*
Customizable type representation
 */
export {
  addTypeHandler,
  getTypeHandler,
  hasTypeHandler,
  removeTypeHandler,
  setTypeHandlerSelector,
};
