import type { Config } from '@jest/types';
import { compilerOptions } from './tsconfig.json';
const { pathsToModuleNameMapper } = require('ts-jest');

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  // transform: {
  //   '^.+\\.(ts|tsx)?$': 'ts-jest',
  // },
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/src' }),
};

export default config;
