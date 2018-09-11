import { setCustomClassNameTo } from '../utils';

export default (value, convertValue) => {
  const { name, message, columnNumber, fileName, lineNumber } = value;
  const result = {
    name: convertValue(name),
    message: convertValue(message),
    columnNumber: convertValue(columnNumber),
    fileName: convertValue(fileName),
    lineNumber: convertValue(lineNumber),
  };

  setCustomClassNameTo(result, name || 'Error');

  return result;
};
