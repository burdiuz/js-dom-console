import { config } from 'dotenv';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
// import flow from 'rollup-plugin-flow';
import json from 'rollup-plugin-json';
import { uglify } from 'rollup-plugin-uglify';
import { minify } from 'uglify-es';

export const LIBRARY_FILE_NAME = 'console';
export const LIBRARY_VAR_NAME = 'DOMConsole';

config();

export const plugins = [
  resolve(),
  // flow(),
  babel({
    plugins: [
      'babel-plugin-transform-class-properties',
      'babel-plugin-transform-flow-strip-types',
      ['babel-plugin-transform-object-rest-spread', { useBuiltIns: true }],
      'babel-plugin-external-helpers',
    ],
    exclude: 'node_modules/**',
    externalHelpers: true,
    babelrc: false,
  }),
  commonjs(),
  json(),
];

export const baseConfig = {
  input: 'source/index.js',
  output: [
    {
      file: `${LIBRARY_FILE_NAME}.js`,
      sourcemap: true,
      exports: 'named',
      name: LIBRARY_VAR_NAME,
      format: 'umd',
    },
  ],
  plugins,
};

export const minConfig = {
  input: 'source/index.js',
  output: [
    {
      file: `${LIBRARY_FILE_NAME}.min.js`,
      sourcemap: true,
      exports: 'named',
      name: LIBRARY_VAR_NAME,
      format: 'umd',
    },
  ],
  plugins: [...plugins, uglify({}, minify)],
};
