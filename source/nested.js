/* eslint-disable no-use-before-define */
import { SPACE_LEVEL, getStringWrap, removeAllChildren } from './utils';

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

  list.forEach((value) => {
    text += space;

    if (typeof value === 'object') {
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

const createUINestedObjectContent = (object, space) => {
  const result = [];
  let text = '\n';

  Object.keys(object).forEach((key) => {
    const value = object[key];
    text += `${space}${key}: `;

    if (typeof value === 'object') {
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

const createUINestedContent = (value, initSpace) => {
  const space = `${SPACE_LEVEL}${initSpace}`;

  if (value instanceof Array) {
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

  wrapper.className = 'ui-console-clickable';

  const drawContents = () => {
    let content;

    removeAllChildren(wrapper);

    wrapper.appendChild(icon);
    wrapper.appendChild(document.createTextNode(pre));

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

  wrapper.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();

    expanded = !expanded;

    setExpandIconSymbol(icon, expanded);
    drawContents();
  });

  drawContents();

  return wrapper;
}
