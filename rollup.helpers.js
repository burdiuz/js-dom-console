import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';

export const LIBRARY_FILE_NAME = 'console';
export const LIBRARY_VAR_NAME = 'DOMConsole';

export const plugins = [
  resolve(),
  babel({
    plugins: [
      '@babel/plugin-external-helpers',
      '@babel/plugin-transform-flow-strip-types',
      '@babel/plugin-syntax-object-rest-spread',
      'babel-plugin-transform-class-properties',
    ],
    exclude: 'node_modules/**',
    babelHelpers: 'external',
    babelrc: false,
  }),
  commonjs(),
  json(),
];

const makeUMDConfig = (suffix = '', additionalPlugins = []) => ({
  input: 'source/index.js',
  output: [
    {
      file: `${LIBRARY_FILE_NAME}${suffix}.js`,
      sourcemap: true,
      exports: 'named',
      name: LIBRARY_VAR_NAME,
      format: 'umd',
    },
  ],
  plugins: [...plugins, ...additionalPlugins],
});

export const umdConfig = makeUMDConfig();

export const umdMinConfig = makeUMDConfig('.min', [terser()]);
