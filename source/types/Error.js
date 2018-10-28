import {
  setCustomClassNameTo,
  createComplexDataStorage,
  addToStorage,
} from '../utils';

export default (value, convertValue) => {
  const { name, message, columnNumber, fileName, lineNumber } = value;

  const result = createComplexDataStorage();

  addToStorage(result, 'name', convertValue(name));
  addToStorage(result, 'message', convertValue(message));
  addToStorage(result, 'columnNumber', convertValue(columnNumber));
  addToStorage(result, 'fileName', convertValue(fileName));
  addToStorage(result, 'lineNumber', convertValue(lineNumber));

  setCustomClassNameTo(result, name || 'Error');

  return result;
};
