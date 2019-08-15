# Storage Benchmarking Tool for Joystream Network

## Features

- Upload a file to the primary liaison.
- Download a full file from any storage provider.
- Generate random ranges (offsets and base64 hash) based on a full download of a file.
- Download content in random ranges and compare their hashes to previously generated ones.

## Setup

```sh
# Install Node.js dependencies:
yarn

# Run TypeScript compilation:
yarn build

# Alternatively you can run TypeScript compilation in watch mode.
# This will recompile any *.ts files that have been changed.
yarn build:watch
```

## Usage

```sh
# See help on how to use this tool:
./bench.sh -h
```

## Available scripts

+ `clean` - remove coverage data, Jest cache and transpiled files,
+ `build` - transpile TypeScript to ES6,
+ `build:watch` - interactive watch mode to automatically transpile source files,
+ `lint` - lint source files and tests,
+ `test` - run tests,
+ `test:watch` - interactive watch mode to automatically re-run tests

## What's included:

+ [TypeScript][typescript] [3.5][typescript-35],
+ [TSLint][tslint] with [Microsoft rules][tslint-microsoft-contrib],
+ [Jest][jest] unit testing and code coverage,
+ Type definitions for Node.js and Jest,
+ [Prettier][prettier] to enforce a consistent code style,
+ [NPM scripts for common operations](#available-scripts),
+ .editorconfig for consistent file format.

The main code is located in the `src` and unit tests in the `__tests__` directories.

## Unit tests in JavaScript

Writing unit tests in TypeScript can sometimes be troublesome and confusing. Especially when mocking dependencies and using spies.

This is **optional**, but if you want to learn how to write JavaScript tests for TypeScript modules, read the [corresponding wiki page][wiki-js-tests].

## License
Licensed under the GNU GPL v3.

[typescript]: https://www.typescriptlang.org/
[typescript-35]: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-5.html
[jest]: https://facebook.github.io/jest/
[tslint]: https://palantir.github.io/tslint/
[tslint-microsoft-contrib]: https://github.com/Microsoft/tslint-microsoft-contrib
[wiki-js-tests]: https://github.com/jsynowiec/node-typescript-boilerplate/wiki/Unit-tests-in-plain-JavaScript
[prettier]: https://prettier.io
