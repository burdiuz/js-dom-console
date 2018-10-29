/* eslint-disable no-use-before-define */
import { utils } from '@actualwave/log-data-renderer';
import { SPACE_LEVEL, getStringWrap, removeAllChildren } from './utils';

const { iterateStorage, isNested, isList, iterateList } = utils;

const setExpandIconSymbol = (icon, expanded) => {
  icon.innerHTML = expanded ? '-' : '+';
};

const createExpandIcon = (expanded) => {
  const icon = document.createElement('span');
  icon.className = 'ui-console-button-expand';

  setExpandIconSymbol(icon, expanded);

  return icon;
};

const createCollapsedContent = () => [document.createTextNode(' ... ')];

const createUINestedArrayContent = (list, space) => {
  const result = [];
  let text = '\n';

  iterateList(list, (value) => {
    text += space;

    if (isNested(value)) {
      result.push(document.createTextNode(text));
      text = '';
      result.push(createUINested(value, space));
    } else {
      text += value;
    }
    text += ', \n';
  });

  if (text) {
    result.push(document.createTextNode(text));
  }

  return result;
};

const createUINestedObjectContent = (storage, space) => {
  const result = [];
  let text = '\n';

  iterateStorage(storage, (value, key) => {
    text += `${space}`;

    if (isNested(key)) {
      result.push(document.createTextNode(`${text}[`));
      result.push(createUINested(key, space));
      text = ']';
    } else {
      text += key;
    }

    text += ': ';

    if (isNested(value)) {
      result.push(document.createTextNode(text));
      result.push(createUINested(value, space));
      text = '';
    } else {
      text += value;
    }

    text += ', \n';
  });

  if (text) {
    result.push(document.createTextNode(text));
  }

  return result;
};

const createUINestedContent = (value, initSpace) => {
  const space = `${SPACE_LEVEL}${initSpace}`;

  if (isList(value)) {
    return createUINestedArrayContent(value, space);
  }

  return createUINestedObjectContent(value, space);
};

export function createUINested(value, space = '', initExpanded = false) {
  let expanded = initExpanded;
  let contentExpanded;
  const contentCollapsed = createCollapsedContent();

  const { pre, post } = getStringWrap(value);
  const icon = createExpandIcon(expanded);
  const wrapper = document.createElement('span');

  wrapper.className = 'ui-console-nested-wrapper';

  const link = document.createElement('span');
  link.className = 'ui-console-clickable';
  link.appendChild(icon);
  link.appendChild(document.createTextNode(pre));

  const drawContents = () => {
    let content;

    removeAllChildren(wrapper);

    wrapper.appendChild(link);

    if (expanded) {
      if (!contentExpanded) {
        contentExpanded = createUINestedContent(value, space);
      }

      content = contentExpanded;
    } else {
      content = contentCollapsed;
    }

    content.forEach((node) => wrapper.appendChild(node));

    wrapper.appendChild(
      document.createTextNode(expanded ? `${space}${post}` : post),
    );
  };

  link.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();

    expanded = !expanded;

    setExpandIconSymbol(icon, expanded);
    drawContents();
  });

  drawContents();

  return wrapper;
}
