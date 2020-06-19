#!/usr/bin/env node

import arg from 'arg';
import { basename, join } from 'path';
import { getPackageJson } from './index';

const args = arg({
  // Types
  '--help': Boolean,
  '--version': Boolean,
  '--tag': String,

  // Aliases
  '-h': '--help',
  '-v': '--version',
  '-t': '--tag',
});

console.log('args:', args); // TODO: remove DEBUG

const getOwnPackageJson = () => {
  try {
    // while development, __filename is in src/ -> package.json must be one dir up
    return getPackageJson(join(__dirname, '..'));
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }

  try {
    // after build, __filename is in dist/cjs/ -> package.json must be two dirs up
    return getPackageJson(join(__dirname, '..', '..'));
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }

  return {};
};

const getOwnVersionString = (): string => {
  const { name, version } = getOwnPackageJson();
  return `${name} version: ${version}`;
};

const showHelp = (stderr = false): void => {
  const { description } = getOwnPackageJson();
  const help = [
    getOwnVersionString(),
    description,
    '',
    'USAGE:',
    `    ${basename(process.argv[1])} [OPTIONS] PACKAGE_NAME`,
    '',
    'OPTIONS:',
    '    -h, --help',
    '        show this help',
    '',
    '    -v, --version',
    '        show version',
    '',
    '    -t, --tag=<TAG_NAME>',
    '        tag of the package to look for (default: latest)',
    '',
    'ARGS:',
    '    PACKAGE_NAME',
    '        name of the package to look for',
  ].join('\n');

  process[stderr ? 'stderr' : 'stdout'].write(`${help}\n`);
};

const showVersion = (): void => {
  process.stdout.write(`${getOwnVersionString()}\n`);
};

if (args['--help']) {
  showHelp();
} else if (args['--version']) {
  showVersion();
} else {
  const packageName = args._[0];

  if (!packageName) {
    process.stderr.write('missing PACKAGE_NAME\n\n');
    showHelp(true);
    throw new Error();
  }

  // const tag = args['--tag'] ?? 'latest';
}
