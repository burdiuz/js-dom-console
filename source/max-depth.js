import { singleValueFactory } from '@actualwave/closure-value';

export const {
  get: getMaxNesingDepth,
  set: setMaxNesingDepth,
} = singleValueFactory(2);
