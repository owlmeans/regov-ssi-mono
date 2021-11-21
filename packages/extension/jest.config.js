/** @type {import('@ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePaths: ['<rootDir>/src/'],
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  "transformIgnorePatterns": [
    "node_modules/(?!@ngrx|(?!deck.gl)|ng-dynamic)"
  ]
};