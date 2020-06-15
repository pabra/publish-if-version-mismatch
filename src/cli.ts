#!/usr/bin/env node

import arg from 'arg';
import { basename } from 'path';

const args = arg({
  // Types
  '--help': Boolean,
  '--version': Boolean,

  // Aliases
  '-h': '--help',
  '-v': '--version',
});

const showHelp = (): void => {
  process.stdout.write(
    `usage ${basename(process.argv[1])} [options]

    Options:
      -h, --help        show this help
      -v, --version     show version
      -d, --debug       log debug output
      -f, --file        path to DNS entries exporting file
      -w, --write       actually "write" entries through INWX API
      -i, --insane      ignore sanity checks
    \n`,
  );
};

const showVersion = (): void => {
  let packageJson: any = {};

  /* eslint-disable node/no-missing-require, @typescript-eslint/no-var-requires */
  try {
    packageJson = require('../package.json');
  } catch (err1) {
    if (err1.code !== 'MODULE_NOT_FOUND') {
      throw err1;
    }
    try {
      packageJson = require('../../package.json');
    } catch (err2) {
      if (err2.code !== 'MODULE_NOT_FOUND') {
        throw err2;
      }
    }
  }
  /* eslint-enable node/no-missing-require, @typescript-eslint/no-var-requires */
  process.stdout.write(`${packageJson.name} version: ${packageJson.version}\n`);
};

if (args['--help']) {
  showHelp();
} else if (args['--version']) {
  showVersion();
} else {
  // TODO: add
}
